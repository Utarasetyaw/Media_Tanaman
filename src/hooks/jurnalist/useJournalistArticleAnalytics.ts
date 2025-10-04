import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../../services/apiService';
import type { JournalistArticleAnalyticsData } from '../../types/jurnalist/journalistArticleAnalytics.types'; // <-- Gunakan tipe baru

// Definisikan fungsi API
const getMyArticleAnalytics = async (id: number): Promise<JournalistArticleAnalyticsData> => {
  const { data } = await api.get(`/articles/management/analytics/${id}`);
  return data;
};

// Hook utama
export const useJournalistArticleAnalytics = () => {
  const { id } = useParams<{ id: string }>();
  const articleId = id ? Number(id) : undefined;

  const { data: article, isLoading, error } = useQuery<JournalistArticleAnalyticsData, Error>({
    queryKey: ['myArticleAnalytics', articleId],
    queryFn: () => getMyArticleAnalytics(articleId!),
    enabled: !!articleId,
  });

  return {
    article,
    isLoading,
    error,
  };
};