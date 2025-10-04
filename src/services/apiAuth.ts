// src/services/apiAuth.ts

import api from './apiService';

// ▼▼▼ FUNGSI YANG HILANG SUDAH DITAMBAHKAN DI SINI ▼▼▼
/**
 * Mengatur atau menghapus header Otorisasi global untuk semua permintaan API.
 * @param {string | null} token - Token JWT untuk otentikasi. Jika null, header akan dihapus.
 */
export const setAuthHeader = (token: string | null) => {
    if (token) {
        // Atur header Authorization dengan Bearer token jika token ada
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        // Hapus header Authorization jika token null (saat logout)
        delete api.defaults.headers.common['Authorization'];
    }
};

// --- FUNGSI LOGIN ---
export const loginAdmin = (credentials: any) =>
    api.post("/auth/login/admin", credentials);
export const loginJournalist = (credentials: any) =>
    api.post("/auth/login/journalist", credentials);
export const loginParticipant = (credentials: any) =>
    api.post("/auth/login/user", credentials);

// --- FUNGSI REGISTRASI ---
export const registerParticipant = (userData: any) =>
    api.post("/auth/register/user", userData);
export const registerJournalist = (userData: any) =>
    api.post("/auth/register/journalist", userData);

// --- FUNGSI LAINNYA ---
export const getMyProfile = () => {
    return api.get("/auth/me");
};
export const logoutUser = () => api.post("/auth/logout");