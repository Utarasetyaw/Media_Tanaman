// src/services/apiAuth.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.narapatiflora.com/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor untuk menambahkan token ke header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- FUNGSI LOGIN ---
export const loginAdmin = (credentials: any) => api.post('/auth/login/admin', credentials);
export const loginJournalist = (credentials: any) => api.post('/auth/login/journalist', credentials);
export const loginParticipant = (credentials: any) => api.post('/auth/login/participant', credentials);

// --- FUNGSI REGISTRASI ---
export const registerParticipant = (userData: any) => api.post('/auth/register/participant', userData);
export const registerJournalist = (userData: any) => api.post('/auth/register/journalist', userData);

// --- FUNGSI LAINNYA ---
export const getMyProfile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};
export const logoutUser = () => api.post('/auth/logout');