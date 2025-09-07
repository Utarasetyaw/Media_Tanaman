import { useState, createContext, useContext } from 'react';
import type { FC, ReactNode } from 'react';

// Tipe data untuk pengguna
interface User {
  name: string;
  email: string;
  role: 'admin' | 'jurnalis';
}

// Tipe untuk konteks
interface AuthContextType {
  user: User | null;
  login: (role: 'admin' | 'jurnalis') => void;
  logout: () => void;
}

// Membuat konteks
const AuthContext = createContext<AuthContextType>(null!);

// Membuat provider
export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: 'admin' | 'jurnalis') => {
    const userData = {
      name: role === 'admin' ? 'Admin Utama' : 'Budi Santoso',
      email: `${role}@example.com`,
      role,
    };
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook untuk menggunakan konteks
export const useAuth = () => useContext(AuthContext);
