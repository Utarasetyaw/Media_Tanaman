// src/services/apiAdmin.ts

import api from './apiService';

// --- Site Settings ---
export const getSiteSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSiteSettings = async (data: any) => {
  const response = await api.put('/settings', data);
  return response.data;
};

// --- Category Management ---
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (name: { id: string, en: string }) => {
  const response = await api.post('/categories', { name });
  return response.data;
};

export const updateCategory = async (id: number, name: { id: string, en: string }) => {
  const response = await api.put(`/categories/${id}`, { name });
  return response.data;
};

export const deleteCategory = async (id: number) => {
  await api.delete(`/categories/${id}`);
};

// --- Plant Type Management ---
export const getPlantTypes = async () => {
  const response = await api.get('/plant-types');
  return response.data;
};

export const createPlantType = async (name: { id: string, en: string }) => {
  const response = await api.post('/plant-types', { name });
  return response.data;
};

export const updatePlantType = async (id: number, name: { id: string, en: string }) => {
  const response = await api.put(`/plant-types/${id}`, { name });
  return response.data;
};

export const deletePlantType = async (id: number) => {
  await api.delete(`/plant-types/${id}`);
};