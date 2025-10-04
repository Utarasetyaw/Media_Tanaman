import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/apiService';
// ▼▼▼ Gunakan tipe data yang baru ▼▼▼
import type { Article, ArticleStatus } from '../../types/admin/adminarticlemanagement.types';

// --- Definisi Fungsi-fungsi API ---

const getArticles = async (): Promise<Article[]> => {
  const { data } = await api.get('/articles/management/all');
  return data;
};

const updateArticleStatus = async (payload: { articleId: number; status: ArticleStatus; feedback?: string }) => {
  const { data } = await api.put(`/articles/management/${payload.articleId}/status`, { 
    status: payload.status, 
    feedback: payload.feedback 
  });
  // Pastikan backend mengembalikan data artikel yang sudah diupdate
  return data.article; 
};

const deleteArticle = async (articleId: number) => {
  await api.delete(`/articles/management/${articleId}`);
  return articleId; // Kembalikan ID untuk proses di onSuccess
};

const requestAdminEditAccess = async (articleId: number): Promise<Article> => {
  // ▼▼▼ URL diperbaiki ▼▼▼
  const { data } = await api.post(`/articles/management/${articleId}/request-edit`);
  return data.article;
};

// Fungsi-fungsi ini seharusnya juga mengembalikan artikel yang diperbarui dari backend
const cancelAdminEditRequest = async (articleId: number): Promise<Article> => {
  const { data } = await api.put(`/articles/management/${articleId}/cancel-request`);
  return data;
};

const revertAdminEditApproval = async (articleId: number): Promise<Article> => {
  const { data } = await api.put(`/articles/management/${articleId}/revert-approval`);
  return data;
};


// --- Hook Utama ---
export const useArticleManager = () => {
  const queryClient = useQueryClient();
  const queryKey = ['allAdminArticles']; // Standarisasi query key

  const { data: articles = [], isLoading, isError } = useQuery<Article[]>({
    queryKey,
    queryFn: getArticles,
  });

  // Fungsi helper untuk update cache artikel tunggal
  const updateArticleInCache = (updatedArticle: Article) => {
    queryClient.setQueryData<Article[]>(queryKey, (oldData = []) => 
      oldData.map(article => article.id === updatedArticle.id ? updatedArticle : article)
    );
  };

  // Opsi error handler yang bisa dipakai ulang
  const mutationErrorOptions = {
    onError: (err: any) => {
      const message = err.response?.data?.error || "Terjadi kesalahan.";
      alert(message);
      console.error(err);
    },
  };

  // Mutasi untuk update status atau data artikel
  const articleUpdateMutation = useMutation({
    // Fungsi ini akan menangani semua jenis update yang mengembalikan objek artikel
    mutationFn: (updateFn: () => Promise<Article>) => updateFn(),
    onSuccess: updateArticleInCache, // Langsung update cache
    ...mutationErrorOptions,
  });

  // Mutasi untuk menghapus artikel
  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: (deletedArticleId) => {
      // Hapus artikel dari cache secara manual
      queryClient.setQueryData<Article[]>(queryKey, (oldData = []) =>
        oldData.filter(article => article.id !== deletedArticleId)
      );
    },
    ...mutationErrorOptions,
  });

  const isMutating = articleUpdateMutation.isPending || deleteMutation.isPending;

  return {
    articles,
    isLoading,
    isError,
    isMutating,
    
    // Bungkus fungsi asli dengan mutation.mutate
    updateStatus: (payload: { articleId: number; status: ArticleStatus; feedback?: string }) => 
      articleUpdateMutation.mutate(() => updateArticleStatus(payload)),
      
    deleteArticle: deleteMutation.mutate,

    requestEdit: (articleId: number) => 
      articleUpdateMutation.mutate(() => requestAdminEditAccess(articleId)),

    cancelRequest: (articleId: number) => 
      articleUpdateMutation.mutate(() => cancelAdminEditRequest(articleId)),

    revertApproval: (articleId: number) => 
      articleUpdateMutation.mutate(() => revertAdminEditApproval(articleId)),
  };
};