import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/apiService';
import type { Article } from '../../types';
import type { ArticleSeo } from '../../types/admin/adminarticleseo.types'; // <-- Perbarui impor ini

// --- Definisi Fungsi-fungsi API (Self-contained) ---

// Nama tipe diubah dari SEO menjadi ArticleSeo
const getArticleById = async (id: number): Promise<Article> => {
  // Endpoint ini sudah benar, karena /management ditambahkan di server.js
  const { data } = await api.get(`/articles/management/analytics/${id}`);
  return data;
};

// Nama tipe diubah dari SEO menjadi ArticleSeo
const updateArticleSeo = async (payload: { articleId: number, seoData: Partial<ArticleSeo> }) => {
  // Endpoint ini sudah benar, karena /management ditambahkan di server.js
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
    // Nama tipe diubah dari SEO menjadi ArticleSeo
    mutationFn: (seoData: Partial<ArticleSeo>) => updateArticleSeo({ articleId: articleId!, seoData }),
    onSuccess: (updatedArticle) => {
      // Perbarui cache untuk query ini dengan data yang baru saja disimpan
      queryClient.setQueryData(['articleSeo', articleId], updatedArticle);
      
      // Invalidate query lain agar data di halaman daftar juga diperbarui
      queryClient.invalidateQueries({ queryKey: ['allAdminArticles'] });
      
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