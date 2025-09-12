// src/services/apiAuth.ts

import api from './apiService'; // Import instance axios yang sudah dikonfigurasi

// Fungsi untuk login
export const loginUser = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Fungsi untuk register (jika Anda butuh di frontend)
export const registerUser = async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

// Fungsi untuk mendapatkan profil pengguna yang sedang login
export const getMyProfile = async () => {
    // --- PERBAIKAN PENTING ---
    // Endpoint di backend sudah kita ubah dari /users/me menjadi /auth/profile
    const response = await api.get('/auth/profile');
    return response.data;
};

// Fungsi untuk memanggil endpoint logout
export const logoutUser = async () => {
    await api.post('/auth/logout');
};

export const getMySubmissionHistory = async () => {
  const response = await api.get('/users/me/submissions');
  return response.data;
};