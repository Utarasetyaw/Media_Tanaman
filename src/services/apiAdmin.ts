// src/services/apiAdmin.ts

import api from './apiService';

// --- Tipe Data untuk Konsistensi ---
export type ArticleStatus = 
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'NEEDS_REVISION'
  | 'JOURNALIST_REVISING'
  | 'REVISED'
  | 'PUBLISHED'
  | 'REJECTED';
  
interface MultilingualName {
  id: string;
  en: string;
}

interface UserData {
  name: string;
  email: string;
  role: 'ADMIN' | 'JOURNALIST';
  password?: string;
}


// =================================================================
// --- Site Settings & Banner ---
// =================================================================

export const getSiteSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSiteSettings = async (data: any) => {
  const response = await api.put('/settings', data);
  return response.data;
};

// =================================================================
// --- File Upload ---
// =================================================================

export const uploadFile = async (type: 'settings' | 'banners' | 'artikel' | 'events' | 'plants', file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post(`/upload/${type}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data; 
};

// =================================================================
// --- User Management ---
// =================================================================

export const getUsers = async (role?: 'ADMIN' | 'JOURNALIST' | 'USER') => {
  const params = role ? { role } : {};
  const response = await api.get('/users', { params });
  return response.data;
};

export const getUserById = async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
}

export const createUser = async (userData: UserData) => {
    const response = await api.post('/users', userData);
    return response.data;
}

export const updateUser = async (id: number, userData: Partial<UserData>) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
}

export const deleteUser = async (id: number) => {
    await api.delete(`/users/${id}`);
}

// =================================================================
// --- Category Management ---
// =================================================================

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (name: MultilingualName) => {
  const response = await api.post('/categories', { name });
  return response.data;
};

export const updateCategory = async (id: number, name: MultilingualName) => {
  const response = await api.put(`/categories/${id}`, { name });
  return response.data;
};

export const deleteCategory = async (id: number) => {
  await api.delete(`/categories/${id}`);
};

// =================================================================
// --- Plant Type Management ---
// =================================================================

export const getPlantTypes = async () => {
  const response = await api.get('/plant-types');
  return response.data;
};

export const createPlantType = async (name: MultilingualName) => {
  const response = await api.post('/plant-types', { name });
  return response.data;
};

export const updatePlantType = async (id: number, name: MultilingualName) => {
  const response = await api.put(`/plant-types/${id}`, { name });
  return response.data;
};

export const deletePlantType = async (id: number) => {
  await api.delete(`/plant-types/${id}`);
};

// =================================================================
// --- Plant Management ---
// =================================================================

export const getPlants = async () => {
  const response = await api.get('/plants');
  return response.data;
};

export const createPlant = async (data: any) => {
  const response = await api.post('/plants', data);
  return response.data;
};

export const updatePlant = async (id: number, data: any) => {
  const response = await api.put(`/plants/${id}`, data);
  return response.data;
};

export const deletePlant = async (id: number) => {
  await api.delete(`/plants/${id}`);
};

// =================================================================
// --- Event Management ---
// =================================================================

export const getEvents = async () => {
  const response = await api.get('/events');
  return response.data;
};

export const createEvent = async (data: any) => {
  const response = await api.post('/events', data);
  return response.data;
};

export const updateEvent = async (id: number, data: any) => {
  const response = await api.put(`/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id: number) => {
  await api.delete(`/events/${id}`);
};

export const getEventById = async (id: number) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
};

export const setSubmissionPlacement = async (submissionId: number, placement: number | null) => {
    const response = await api.put(`/events/submissions/${submissionId}/placement`, { placement });
    return response.data;
};

// =================================================================
// --- Article Management (Admin) ---
// =================================================================

export const getAllAdminArticles = async () => {
    const { data } = await api.get('/articles/management/all');
    return data;
};

export const updateArticleStatus = async ({ articleId, status, feedback }: { articleId: number; status: ArticleStatus; feedback?: string }) => {
    return api.put(`/articles/management/${articleId}/status`, { status, feedback });
};

export const deleteAdminArticle = async (id: number) => {
    return api.delete(`/articles/management/${id}`);
};

export const requestAdminEditAccess = async (articleId: number) => {
    return api.post(`/articles/management/${articleId}/request-edit`);
};

/**
 * BARU: Membatalkan permintaan edit yang dikirim oleh admin.
 * @param articleId - ID artikel yang permintaannya akan dibatalkan.
 */
export const cancelAdminEditRequest = async (articleId: number) => {
    return api.put(`/articles/management/${articleId}/cancel-request`);
};

export const revertAdminEditApproval = async (articleId: number) => {
    return api.put(`/articles/management/${articleId}/revert-approval`);
};