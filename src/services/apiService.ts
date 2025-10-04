// src/services/apiService.ts
import axios from "axios";
import type {
	AdminDashboardData,
	JournalistDashboardData,
} from "../hooks/admin/useDashboard";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:3009/api",
	withCredentials: true,
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("narapati_auth_token");
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// --- KUMPULAN FUNGSI API SPESIFIK (Non-GET-List) ---

// Autentikasi
export const loginAdmin = (credentials: any) =>
	api.post("/auth/login/admin", credentials);
// ... dan fungsi spesifik lainnya

// Dashboard
export const getAdminDashboardData = (): Promise<AdminDashboardData> =>
	api.get("/dashboard/admin").then((res) => res.data);
export const getJournalistDashboardData =
	(): Promise<JournalistDashboardData> =>
		api.get("/dashboard/journalist").then((res) => res.data);

// ❌ HAPUS: Fungsi `fetchData` yang general kita hapus dari sini
// dan logikanya dipindahkan ke dalam hook yang relevan.

export default api;
