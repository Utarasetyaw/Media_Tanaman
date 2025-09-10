// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
// --- REVISI: Import dari file apiAuth.ts yang baru ---
import { loginUser, getMyProfile, logoutUser } from '../services/apiAuth';

interface User {
  id: number;
  name: string;
  email: string;
  // --- REVISI: Tambahkan role 'USER' ---
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
  
  if (isLoading) {
      return <div>Loading session...</div>;
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