// src/contexts/AuthContext.tsx

import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useCallback,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
    setAuthHeader,
    loginAdmin,
    loginJournalist,
    loginParticipant,
    getMyProfile,
    logoutUser,
} from "../services/apiAuth";
import { toast } from "react-toastify";

// --- Tipe Data & Interface ---
interface User {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "JOURNALIST" | "USER";
}
type LoginCredentials = { email: string; password:string };
type LoginRole = "admin" | "journalist" | "user";

interface AuthContextType {
    user: User | null;
    login: (credentials: LoginCredentials, role: LoginRole) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
    availableSessions: LoginRole[];
    switchSession: (role: LoginRole) => Promise<void>;
}

// --- Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Komponen Splash Screen ---
const SplashScreen: React.FC = () => (
    <div className="flex items-center justify-center h-screen bg-[#003938] text-white">
        <div className="text-center">
            <h2 className="font-serif text-3xl font-bold">Narapati Flora</h2>
            <p className="text-gray-300 animate-pulse">Memverifikasi sesi...</p>
        </div>
    </div>
);

// --- Kunci localStorage ---
const ACTIVE_ROLE_KEY = 'narapati_active_role';

// ▼▼▼ PERUBAHAN UTAMA DI SINI ▼▼▼
const TOKEN_KEYS: { [key in LoginRole]: string } = {
    admin: 'admintoken',
    journalist: 'jurnalisttoken',
    user: 'usertoken',
};
// ▲▲▲ AKHIR PERUBAHAN ▲▲▲

// --- Provider Utama ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [availableSessions, setAvailableSessions] = useState<LoginRole[]>([]);
    const navigate = useNavigate();

    const initializeSession = useCallback(async () => {
        setIsLoading(true);
        const sessions: LoginRole[] = [];
        // Cek semua kemungkinan token
        for (const role of Object.keys(TOKEN_KEYS) as LoginRole[]) {
            if (localStorage.getItem(TOKEN_KEYS[role])) {
                sessions.push(role);
            }
        }
        setAvailableSessions(sessions);

        const activeRole = localStorage.getItem(ACTIVE_ROLE_KEY) as LoginRole | null;
        if (activeRole && sessions.includes(activeRole)) {
            const storedToken = localStorage.getItem(TOKEN_KEYS[activeRole]);
            if (storedToken) {
                try {
                    setAuthHeader(storedToken);
                    const profileResponse = await getMyProfile();
                    setUser(profileResponse.data);
                } catch (error) {
                    console.error("Sesi aktif tidak valid, membersihkan...", error);
                    localStorage.removeItem(TOKEN_KEYS[activeRole]);
                    localStorage.removeItem(ACTIVE_ROLE_KEY);
                    setAuthHeader(null);
                    setAvailableSessions(prev => prev.filter(r => r !== activeRole));
                }
            }
        } else {
            setUser(null);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        initializeSession();
    }, [initializeSession]);

    const switchSession = async (role: LoginRole) => {
        const token = localStorage.getItem(TOKEN_KEYS[role]);
        if (!token) {
            toast.error("Sesi tidak ditemukan, silakan login kembali.");
            return;
        }

        setIsLoading(true);
        try {
            localStorage.setItem(ACTIVE_ROLE_KEY, role);
            setAuthHeader(token);
            const profile = await getMyProfile();
            setUser(profile.data);
            
            if (profile.data.role === "ADMIN") navigate("/admin");
            if (profile.data.role === "JOURNALIST") navigate("/jurnalis");
            if (profile.data.role === "USER") navigate("/dashboard");

        } catch (error) {
            toast.error("Gagal berganti sesi.");
            initializeSession();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials, role: LoginRole) => {
        let response;
        switch (role) {
            case "admin": response = await loginAdmin(credentials); break;
            case "journalist": response = await loginJournalist(credentials); break;
            case "user": response = await loginParticipant(credentials); break;
            default: throw new Error("Peran login tidak valid");
        }
        const { user: loggedInUser, token: newToken } = response.data;
        
        localStorage.setItem(TOKEN_KEYS[role], newToken);
        localStorage.setItem(ACTIVE_ROLE_KEY, role);
        setAuthHeader(newToken);
        setUser(loggedInUser);

        setAvailableSessions(prev => [...new Set([...prev, role])]);

        if (loggedInUser.role === "ADMIN") navigate("/admin");
        if (loggedInUser.role === "JOURNALIST") navigate("/jurnalis");
        if (loggedInUser.role === "USER") navigate("/dashboard");
    };
    
    const logout = useCallback(async () => {
        if (!user) return;
        const roleToLogout = user.role.toLowerCase() as LoginRole;

        try {
            await logoutUser();
        } catch (err) {
            console.error("API logout gagal", err);
        } finally {
            localStorage.removeItem(TOKEN_KEYS[roleToLogout]);
            localStorage.removeItem(ACTIVE_ROLE_KEY);
            setAuthHeader(null);
            setUser(null);
            
            const remainingSessions = availableSessions.filter(r => r !== roleToLogout);
            setAvailableSessions(remainingSessions);
            if (remainingSessions.length > 0) {
                const nextActiveRole = remainingSessions[0];
                const nextToken = localStorage.getItem(TOKEN_KEYS[nextActiveRole]);
                localStorage.setItem(ACTIVE_ROLE_KEY, nextActiveRole);
                if (nextToken) {
                   setAuthHeader(nextToken);
                   // Inisialisasi ulang untuk memuat profil pengguna berikutnya
                   initializeSession(); 
                }
            }
            
            navigate("/");
        }
    }, [user, navigate, availableSessions, initializeSession]);

    if (isLoading) {
        return <SplashScreen />;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isLoading,
                isAuthenticated: !!user,
                availableSessions,
                switchSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth harus digunakan di dalam AuthProvider");
    }
    return context;
};