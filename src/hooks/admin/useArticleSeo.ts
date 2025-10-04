import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/apiService';
import type { Article, ArticleSeo } from '../../types/admin/adminarticleseo.types';

// --- Definisi Fungsi-fungsi API ---

const getArticleById = async (id: number): Promise<Article> => {
  const { data } = await api.get(`/articles/management/analytics/${id}`);
  return data;
};

const updateArticleSeo = async (payload: { articleId: number, seoData: Partial<ArticleSeo> }) => {
  const { data } = await api.put(`/articles/management/${payload.articleId}`, { seo: payload.seoData });
  return data;
};

// --- Hook Utama ---
export const useArticleSeo = () => {
  const { id } = useParams<{ id: string }>();
  const articleId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: articleData, isLoading, isError } = useQuery<Article, Error>({
    queryKey: ['articleSeo', articleId],
    queryFn: () => getArticleById(articleId!),
    enabled: !!articleId,
  });

  const saveSeoMutation = useMutation({
    mutationFn: (seoData: Partial<ArticleSeo>) => updateArticleSeo({ articleId: articleId!, seoData }),
    onSuccess: (updatedArticle) => {
      queryClient.setQueryData(['articleSeo', articleId], updatedArticle);
      queryClient.invalidateQueries({ queryKey: ['allAdminArticles'] });
      
      alert('Pengaturan SEO berhasil disimpan!');
      navigate('/admin/articles');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message;
      alert(`Gagal menyimpan SEO: ${message}`);
      console.error("Save SEO error:", error);
    }
  });

  return {
    articleData,
    isLoading,
    isError,
    isSaving: saveSeoMutation.isPending,
    saveSeo: saveSeoMutation.mutate,
  };
};