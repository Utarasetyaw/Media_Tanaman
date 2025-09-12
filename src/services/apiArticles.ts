// src/services/apiArticles.ts
import api from './apiService';
import type { Article } from '../types';

/**
 * Mengambil satu artikel berdasarkan ID.
 * Endpoint ini bisa digunakan oleh admin atau jurnalis pemilik artikel.
 */
export const getArticleById = async (id: number): Promise<Article> => {
    // Kita gunakan endpoint 'getMyArticleAnalytics' karena ini aman dan mengembalikan data lengkap
    const { data } = await api.get(`/articles/my-articles/analytics/${id}`);
    return data;
};

/**
 * Membuat artikel baru.
 */
export const createArticle = (articleData: Partial<Article>) => {
    return api.post('/articles', articleData);
};

/**
 * Mengupdate artikel yang sudah ada.
 */
export const updateArticle = ({ id, ...articleData }: { id: number; [key: string]: any }) => {
    return api.put(`/articles/${id}`, articleData);
};