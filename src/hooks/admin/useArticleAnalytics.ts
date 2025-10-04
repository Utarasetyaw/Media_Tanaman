import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../services/apiService';
import type { ArticleAnalyticsData } from '../../types/admin/adminarticleanalytics.types'; // <-- Gunakan tipe baru

// Definisikan fungsi API
const getArticleById = async (id: number): Promise<ArticleAnalyticsData> => {
  const { data } = await api.get(`/articles/management/analytics/${id}`);
  return data;
};

// Hook utama
export const useArticleAnalytics = () => {
  const { id } = useParams<{ id: string }>();
  const articleId = id ? Number(id) : undefined;

  // Query untuk mengambil data artikel tunggal
  const { data: article, isLoading, error } = useQuery<ArticleAnalyticsData, Error>({
    queryKey: ['articleAnalytics', articleId],
    queryFn: () => getArticleById(articleId!),
    enabled: !!articleId,
  });

  return {
    article,
    isLoading,
    error,
  };
};