// src/services/apiJournalist.ts

import api from './apiService';
import type { Article } from '../types';

/**
 * Mengambil semua artikel yang ditulis oleh jurnalis yang sedang login.
 */
export const getMyArticles = async (): Promise<Article[]> => {
    const { data } = await api.get('/articles/my-articles');
    return data;
};

/**
 * Menghapus artikel milik jurnalis yang sedang login.
 * @param id - ID artikel yang akan dihapus.
 */
export const deleteMyArticle = async (id: number) => {
    return api.delete(`/articles/${id}`);
};

/**
 * Mengirim artikel untuk ditinjau oleh admin.
 * @param id - ID artikel yang akan dikirim.
 */
export const submitArticleForReview = async (id: number) => {
    const { data } = await api.post(`/articles/${id}/submit`);
    return data;
};

/**
 * Jurnalis mulai merevisi artikel yang dikembalikan oleh admin.
 * @param id - ID artikel yang akan direvisi.
 */
export const startRevision = async (id: number) => {
    const { data } = await api.post(`/articles/${id}/start-revision`);
    return data;
};

/**
 * Jurnalis selesai merevisi artikel.
 * @param id - ID artikel yang sudah selesai direvisi.
 */
export const finishRevision = async (id: number) => {
    const { data } = await api.post(`/articles/${id}/finish-revision`);
    return data;
};

/**
 * Merespon permintaan edit dari admin.
 * @param id - ID artikel.
 * @param response - 'APPROVED' atau 'DENIED'.
 */
export const respondToEditRequest = async (id: number, response: 'APPROVED' | 'DENIED') => {
    const { data } = await api.put(`/articles/${id}/respond-edit`, { response });
    return data;
};

/**
 * Mengambil statistik untuk dasbor jurnalis.
 */
export const getJournalistDashboardStats = async () => {
    const { data } = await api.get('/articles/my-dashboard-stats');
    return data;
};