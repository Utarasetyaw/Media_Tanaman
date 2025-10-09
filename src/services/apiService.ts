import axios from 'axios';

// ▼▼▼ TAMBAHKAN 'export' DI SINI ▼▼▼
export const API_BASE_URL = "https://backend.narapatiflora.com//api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// Interceptor ini akan secara otomatis menambahkan token ke setiap permintaan
// yang menggunakan instance 'api' ini.
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

export default api;