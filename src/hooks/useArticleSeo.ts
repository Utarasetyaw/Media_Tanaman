import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/apiService';
import type { Article, SEO } from '../types';

// --- Definisi Fungsi-fungsi API (Self-contained) ---

const getArticleById = async (id: number): Promise<Article> => {
  // REVISI: Tambahkan '/management'
  const { data } = await api.get(`/articles/management/analytics/${id}`);
  return data;
};

const updateArticleSeo = async (payload: { articleId: number, seoData: Partial<SEO> }) => {
  // REVISI: Tambahkan '/management'
  const { data } = await api.put(`/articles/management/${payload.articleId}`, { seo: payload.seoData });
  return data;
};

// --- Hook Utama ---
export const useArticleSeo = () => {
  const { id } = useParams<{ id: string }>();
  const articleId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query untuk mengambil data artikel (termasuk SEO)
  const { data: articleData, isLoading, isError } = useQuery<Article, Error>({
    queryKey: ['articleSeo', articleId],
    queryFn: () => getArticleById(articleId!),
    enabled: !!articleId,
  });

  // Mutation untuk menyimpan perubahan data SEO
  const saveSeoMutation = useMutation({
    mutationFn: (seoData: Partial<SEO>) => updateArticleSeo({ articleId: articleId!, seoData }),
    onSuccess: () => {
      // Invalidate query agar data di halaman lain (seperti list) juga update
      queryClient.invalidateQueries({ queryKey: ['allAdminArticles'] });
      queryClient.invalidateQueries({ queryKey: ['articleSeo', articleId] });
      alert('Pengaturan SEO berhasil disimpan!');
      navigate('/admin/articles'); // Arahkan kembali ke halaman manajemen
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