import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, getMyProfile, logoutUser } from '../services/apiAuth';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'JOURNALIST' | 'USER';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Komponen untuk layar loading
const SplashScreen: React.FC = () => (
    <div className="flex items-center justify-center h-screen bg-[#003938] text-white">
        <div className="text-center">
            <h2 className="font-serif text-3xl font-bold">Narapati Flora</h2>
            <p className="text-gray-300 animate-pulse">Memeriksa sesi...</p>
        </div>
    </div>
);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const profile = await getMyProfile();
          setUser(profile);
        } catch (error) {
          console.error("Session expired or invalid.", error);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, [token]);

  const login = async (credentials: any) => {
    const data = await loginUser(credentials);
    localStorage.setItem('authToken', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    logoutUser().catch(err => {
        console.error("Logout API call failed, but logging out client-side anyway.", err);
    });
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };
  
  // --- REVISI: Gunakan SplashScreen ---
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};