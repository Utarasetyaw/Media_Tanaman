import axios from "axios";

// Menggunakan environment variable untuk base URL, dengan fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3009/api";

const api = axios.create({
	baseURL: API_URL,
	withCredentials: true, // Opsional: jika Anda menggunakan cookie
});

export const setAuthHeader = (token: string | null) => {
	if (token) {
		api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	} else {
		delete api.defaults.headers.common["Authorization"];
	}
};

// --- FUNGSI LOGIN ---
export const loginAdmin = (credentials: any) =>
	api.post("/auth/login/admin", credentials);
export const loginJournalist = (credentials: any) =>
	api.post("/auth/login/journalist", credentials);
export const loginParticipant = (credentials: any) =>
	api.post("/auth/login/user", credentials); // Endpoint disesuaikan

// --- FUNGSI REGISTRASI ---
export const registerParticipant = (userData: any) =>
	api.post("/auth/register/user", userData); // Endpoint disesuaikan
export const registerJournalist = (userData: any) =>
	api.post("/auth/register/journalist", userData);

// --- FUNGSI LAINNYA ---
export const getMyProfile = async () => {
	// Endpoint ini harus sesuai dengan API Anda untuk mendapatkan data pengguna yang sedang login
	const response = await api.get("/auth/me");
	return response.data;
};
export const logoutUser = () => api.post("/auth/logout");

// Jangan lupa untuk mengekspor 'api' jika digunakan di tempat lain
export default api;
