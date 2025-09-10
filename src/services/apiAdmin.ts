// src/services/apiAdmin.ts

import api from './apiService';

// --- Tipe Data untuk Konsistensi ---
interface MultilingualName {
  id: string;
  en: string;
}

interface UserData {
  name: string;
  email: string;
  role: 'ADMIN' | 'JOURNALIST';
  password?: string; // Opsional, hanya untuk membuat user baru
}


// =================================================================
// --- Site Settings & Banner ---
// =================================================================

/**
 * Mengambil semua pengaturan situs.
 */
export const getSiteSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

/**
 * Mengupdate pengaturan situs.
 * @param data - Objek lengkap berisi semua data pengaturan.
 */
export const updateSiteSettings = async (data: any) => {
  const response = await api.put('/settings', data);
  return response.data;
};

// =================================================================
// --- File Upload ---
// =================================================================

/**
 * Mengunggah satu file gambar ke subfolder tertentu.
 * @param type - Subfolder tujuan ('settings', 'banners', 'artikel', dll.).
 * @param file - Objek File yang akan diunggah.
 * @returns {Promise<{imageUrl: string}>} Objek berisi path relatif gambar.
 */
export const uploadFile = async (type: 'settings' | 'banners' | 'artikel' | 'events' | 'plants', file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post(`/upload/${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data; 
};

// =================================================================
// --- User Management ---
// =================================================================

/**
 * Mengambil daftar pengguna, bisa difilter berdasarkan peran.
 * @param role - Peran pengguna yang ingin ditampilkan (opsional).
 */
export const getUsers = async (role?: 'ADMIN' | 'JOURNALIST' | 'USER') => {
  const params = role ? { role } : {};
  const response = await api.get('/users', { params });
  return response.data;
};

/**
 * Mengambil detail satu pengguna berdasarkan ID.
 * @param id - ID pengguna.
 */
export const getUserById = async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
}

/**
 * Membuat pengguna baru (Admin atau Jurnalis).
 * @param userData - Data pengguna baru.
 */
export const createUser = async (userData: UserData) => {
    const response = await api.post('/users', userData);
    return response.data;
}

/**
 * Mengupdate data pengguna berdasarkan ID.
 * @param id - ID pengguna yang akan diupdate.
 * @param userData - Data pengguna yang ingin diubah.
 */
export const updateUser = async (id: number, userData: Partial<UserData>) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
}

/**
 * Menghapus pengguna berdasarkan ID.
 * @param id - ID pengguna yang akan dihapus.
 */
export const deleteUser = async (id: number) => {
    await api.delete(`/users/${id}`);
}


// =================================================================
// --- Category Management ---
// =================================================================

/**
 * Mengambil semua kategori.
 */
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

/**
 * Membuat kategori baru.
 * @param name - Objek nama multibahasa.
 */
export const createCategory = async (name: MultilingualName) => {
  const response = await api.post('/categories', { name });
  return response.data;
};

/**
 * Mengupdate kategori berdasarkan ID.
 * @param id - ID kategori.
 * @param name - Objek nama multibahasa baru.
 */
export const updateCategory = async (id: number, name: MultilingualName) => {
  const response = await api.put(`/categories/${id}`, { name });
  return response.data;
};

/**
 * Menghapus kategori berdasarkan ID.
 * @param id - ID kategori.
 */
export const deleteCategory = async (id: number) => {
  await api.delete(`/categories/${id}`);
};

// =================================================================
// --- Plant Type Management ---
// =================================================================

/**
 * Mengambil semua tipe tanaman.
 */
export const getPlantTypes = async () => {
  const response = await api.get('/plant-types');
  return response.data;
};

/**
 * Membuat tipe tanaman baru.
 * @param name - Objek nama multibahasa.
 */
export const createPlantType = async (name: MultilingualName) => {
  const response = await api.post('/plant-types', { name });
  return response.data;
};

/**
 * Mengupdate tipe tanaman berdasarkan ID.
 * @param id - ID tipe tanaman.
 * @param name - Objek nama multibahasa baru.
 */
export const updatePlantType = async (id: number, name: MultilingualName) => {
  const response = await api.put(`/plant-types/${id}`, { name });
  return response.data;
};

/**
 * Menghapus tipe tanaman berdasarkan ID.
 * @param id - ID tipe tanaman.
 */
export const deletePlantType = async (id: number) => {
  await api.delete(`/plant-types/${id}`);
};