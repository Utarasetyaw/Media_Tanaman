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
// ▼▼▼ PERUBAHAN 1: Impor dari `apiAuth` dan tambahkan `setAuthHeader` ▼▼▼
import {
	setAuthHeader,
	loginAdmin,
	loginJournalist,
	loginParticipant,
	getMyProfile,
	logoutUser,
} from "../services/apiAuth"; // Diarahkan ke file baru

// --- Tipe Data & Interface ---
interface User {
	id: number;
	name: string;
	email: string;
	role: "ADMIN" | "JOURNALIST" | "USER";
}
type LoginCredentials = { email: string; password: string };
type LoginRole = "admin" | "journalist" | "user";
interface AuthContextType {
	user: User | null;
	login: (credentials: LoginCredentials, role: LoginRole) => Promise<void>;
	logout: () => void;
	isLoading: boolean;
	isAuthenticated: boolean;
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

const TOKEN_KEY = "narapati_auth_token";

// --- Provider Utama ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	// Efek untuk inisialisasi sesi saat aplikasi dimuat
	useEffect(() => {
		const initializeSession = async () => {
			const storedToken = localStorage.getItem(TOKEN_KEY);
			if (storedToken) {
				try {
					// ▼▼▼ PERUBAHAN 2: Set header terlebih dahulu sebelum membuat request ▼▼▼
					setAuthHeader(storedToken);
					const profile = await getMyProfile();
					setUser(profile);
				} catch (error) {
					console.error("Sesi tidak valid, membersihkan token...", error);
					localStorage.removeItem(TOKEN_KEY);
					setAuthHeader(null); // Pastikan header juga dibersihkan
				}
			}
			setIsLoading(false);
		};

		initializeSession();
	}, []);

	// Fungsi untuk login
	const login = async (credentials: LoginCredentials, role: LoginRole) => {
		let response;
		// ... (switch case untuk login tetap sama)
		switch (role) {
			case "admin":
				response = await loginAdmin(credentials);
				break;
			case "journalist":
				response = await loginJournalist(credentials);
				break;
			case "user":
				response = await loginParticipant(credentials);
				break;
			default:
				throw new Error("Peran login tidak valid");
		}

		const { user: loggedInUser, token: newToken } = response.data;

		localStorage.setItem(TOKEN_KEY, newToken);
		// ▼▼▼ PERUBAHAN 3: Set header setelah berhasil login ▼▼▼
		setAuthHeader(newToken);
		setUser(loggedInUser);

		// ... (navigasi berdasarkan peran tetap sama)
		if (loggedInUser.role === "ADMIN") navigate("/admin");
		if (loggedInUser.role === "JOURNALIST") navigate("/jurnalis");
		if (loggedInUser.role === "USER") navigate("/dashboard");
	};

	// Fungsi untuk logout
	const logout = useCallback(async () => {
		try {
			await logoutUser();
		} catch (err) {
			console.error(
				"Panggilan API logout gagal, tetap logout di sisi klien.",
				err
			);
		} finally {
			localStorage.removeItem(TOKEN_KEY);
			// ▼▼▼ PERUBAHAN 4: Hapus header saat logout ▼▼▼
			setAuthHeader(null);
			setUser(null);
			navigate("/");
		}
	}, [navigate]);

	// Tampilkan splash screen saat sesi sedang diverifikasi
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
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

// --- Hook Custom ---
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth harus digunakan di dalam AuthProvider");
	}
	return context;
};
