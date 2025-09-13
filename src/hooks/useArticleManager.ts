import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/apiService';
import type { Article, ArticleStatus } from '../types';

// --- Definisi Fungsi-fungsi API (Self-contained) ---

const getArticles = async (): Promise<Article[]> => {
  const { data } = await api.get('/articles/management/all');
  return data;
};

const updateArticleStatus = async (payload: { articleId: number; status: ArticleStatus; feedback?: string }) => {
  const { data } = await api.put(`/articles/management/${payload.articleId}/status`, { 
    status: payload.status, 
    feedback: payload.feedback 
  });
  return data;
};

const deleteArticle = async (articleId: number) => {
  return api.delete(`/articles/management/${articleId}`);
};

const requestAdminEditAccess = async (articleId: number) => {
  // URL ini salah, kurang '/management'
  const { data } = await api.post(`/articles/management/${articleId}/request-edit`);
  return data;
};

const cancelAdminEditRequest = async (articleId: number) => {
  const { data } = await api.put(`/articles/management/${articleId}/cancel-request`);
  return data;
};

const revertAdminEditApproval = async (articleId: number) => {
  const { data } = await api.put(`/articles/management/${articleId}/revert-approval`);
  return data;
};


// --- Hook Utama ---
export const useArticleManager = () => {
  const queryClient = useQueryClient();

  // Query utama untuk mengambil semua artikel
  const { data: articles = [], isLoading, isError } = useQuery<Article[]>({
    queryKey: ['adminArticles'],
    queryFn: getArticles,
  });

  // Opsi umum untuk semua mutasi agar tidak duplikat kode
  const mutationOptions = {
    onSuccess: () => {
      // Refresh daftar artikel setelah aksi berhasil
      queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
    },
    onError: (err: any) => {
      const message = err.response?.data?.error || "Terjadi kesalahan.";
      alert(message);
      console.error(err);
    },
  };

  // Kumpulan semua mutasi
  const statusUpdateMutation = useMutation({ mutationFn: updateArticleStatus, ...mutationOptions });
  const deleteMutation = useMutation({ mutationFn: deleteArticle, ...mutationOptions });
  const requestEditMutation = useMutation({ mutationFn: requestAdminEditAccess, ...mutationOptions });
  const cancelRequestMutation = useMutation({ mutationFn: cancelAdminEditRequest, ...mutationOptions });
  const revertApprovalMutation = useMutation({ mutationFn: revertAdminEditApproval, ...mutationOptions });

  // Gabungkan status 'isPending' dari semua mutasi untuk loading indicator
  const isMutating = 
    statusUpdateMutation.isPending ||
    deleteMutation.isPending ||
    requestEditMutation.isPending ||
    cancelRequestMutation.isPending ||
    revertApprovalMutation.isPending;

  return {
    articles,
    isLoading,
    isError,
    isMutating,
    // Ekspor fungsi yang sudah siap pakai untuk komponen
    updateStatus: statusUpdateMutation.mutate,
    deleteArticle: deleteMutation.mutate,
    requestEdit: requestEditMutation.mutate,
    cancelRequest: cancelRequestMutation.mutate,
    revertApproval: revertApprovalMutation.mutate,
  };
};