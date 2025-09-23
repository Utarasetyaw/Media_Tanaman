import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    loginAdmin, 
    loginJournalist, 
    loginParticipant, 
    getMyProfile, 
    logoutUser 
} from '../services/apiAuth';

// --- (Tidak ada perubahan di bagian interface) ---
interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'JOURNALIST' | 'USER';
}

type LoginRole = 'admin' | 'journalist' | 'user';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: any, role: LoginRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SplashScreen: React.FC = () => (
    <div className="flex items-center justify-center h-screen bg-[#003938] text-white">
        <div className="text-center">
            <h2 className="font-serif text-3xl font-bold">Narapati Flora</h2>
            <p className="text-gray-300 animate-pulse">Memeriksa sesi...</p>
        </div>
    </div>
);


// --- PERUBAIKAN: Definisikan kunci penyimpanan yang baru ---
const TOKEN_KEY_PREFIX = 'narapati_token_';
const ACTIVE_ROLE_KEY = 'narapati_active_role';


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // --- PERUBAIKAN: State token tidak lagi mengambil langsung dari localStorage di sini ---
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- PERUBAIKAN: Logika inisialisasi sesi diubah total ---
  useEffect(() => {
    const initializeSession = async () => {
      // 1. Cek peran yang terakhir aktif
      const activeRole = localStorage.getItem(ACTIVE_ROLE_KEY);
      if (!activeRole) {
        setIsLoading(false);
        return;
      }

      // 2. Buat nama kunci token berdasarkan peran aktif
      const tokenKey = `${TOKEN_KEY_PREFIX}${activeRole}`;
      const storedToken = localStorage.getItem(tokenKey);

      if (storedToken) {
        try {
          // 3. Validasi token dan ambil profil pengguna
          const profile = await getMyProfile(); // Ambil profil tanpa argumen
          setUser(profile);
          setToken(storedToken);
        } catch (error) {
          console.error("Sesi tidak valid atau kedaluwarsa.", error);
          // Bersihkan jika token tidak valid
          localStorage.removeItem(tokenKey);
          localStorage.removeItem(ACTIVE_ROLE_KEY);
        }
      }
      setIsLoading(false);
    };

    initializeSession();
  }, []);

  const login = async (credentials: any, role: LoginRole) => {
    let response;
    switch (role) {
      case 'admin':
        response = await loginAdmin(credentials);
        break;
      case 'journalist':
        response = await loginJournalist(credentials);
        break;
      case 'user':
        response = await loginParticipant(credentials);
        break;
      default:
        throw new Error('Peran login tidak valid');
    }
    
    const data = response.data;
    const loggedInUser: User = data.user;
    const newTtoken: string = data.token;

    // --- PERUBAIKAN: Simpan token dan peran aktif menggunakan kunci dinamis ---
    const tokenKey = `${TOKEN_KEY_PREFIX}${loggedInUser.role}`;
    localStorage.setItem(tokenKey, newTtoken);
    localStorage.setItem(ACTIVE_ROLE_KEY, loggedInUser.role);
    
    setToken(newTtoken);
    setUser(loggedInUser);
  };

  const logout = async () => {
    // Simpan role sebelum state user di-reset
    const roleToLogout = user?.role;

    try {
        await logoutUser();
    } catch (err) {
        console.error("Panggilan API logout gagal, tetap logout di sisi klien.", err);
    }
    
    // --- PERUBAIKAN: Hapus kunci dinamis dari localStorage ---
    if (roleToLogout) {
        const tokenKey = `${TOKEN_KEY_PREFIX}${roleToLogout}`;
        localStorage.removeItem(tokenKey);
    }
    localStorage.removeItem(ACTIVE_ROLE_KEY); // Selalu hapus penanda peran aktif
    
    setToken(null);
    setUser(null);
  };
  
  if (isLoading) {
      return <SplashScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};