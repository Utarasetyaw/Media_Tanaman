import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../services/apiService';
import type { Article } from '../types';

// Definisikan fungsi API di sini
const getArticleById = async (id: number): Promise<Article> => {
  // REVISI: Tambahkan '/management' agar cocok dengan server.js
  const { data } = await api.get(`/articles/management/analytics/${id}`);
  return data;
};

// Hook utama
export const useArticleAnalytics = () => {
  const { id } = useParams<{ id: string }>();
  const articleId = id ? Number(id) : undefined;

  // Query untuk mengambil data artikel tunggal
  const { data: article, isLoading, error } = useQuery<Article, Error>({
    // Query key diubah agar tidak bentrok dengan cache jurnalis
    queryKey: ['articleAnalytics', articleId],
    queryFn: () => getArticleById(articleId!),
    // Query hanya akan berjalan jika articleId ada (valid)
    enabled: !!articleId,
  });

  return {
    article,
    isLoading,
    error,
  };
};