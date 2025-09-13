import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/apiService';
import type { Article } from '../types';

// --- Definisi Fungsi-fungsi API (Self-contained) ---

const getMyArticles = async (): Promise<Article[]> => {
  // REVISI: Tambahkan '/management' agar cocok dengan server.js
  const { data } = await api.get('/articles/management/my-articles');
  return data;
};

const deleteMyArticle = async (articleId: number) => {
  // REVISI: Tambahkan '/management'
  return api.delete(`/articles/management/${articleId}`);
};

const submitArticleForReview = async (articleId: number) => {
  // REVISI: Tambahkan '/management'
  return api.post(`/articles/management/${articleId}/submit`);
};

const startRevision = async (articleId: number) => {
  // REVISI: Tambahkan '/management'
  return api.post(`/articles/management/${articleId}/start-revision`);
};

const finishRevision = async (articleId: number) => {
  // REVISI: Tambahkan '/management'
  return api.post(`/articles/management/${articleId}/finish-revision`);
};

const respondToEditRequest = async (payload: { articleId: number; response: "APPROVED" | "DENIED" }) => {
  // REVISI: Tambahkan '/management'
  return api.put(`/articles/management/${payload.articleId}/respond-edit`, { response: payload.response });
};


// --- Hook Utama ---
export const useJournalistArticleManager = () => {
  const queryClient = useQueryClient();

  // Query untuk mengambil semua artikel milik jurnalis
  const { data: articles = [], isLoading, isError } = useQuery<Article[]>({
    queryKey: ['myArticles'],
    queryFn: getMyArticles,
  });

  // Opsi umum untuk semua mutasi
  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myArticles'] });
    },
    onError: (err: any) => {
      const message = err.response?.data?.error || "Terjadi kesalahan.";
      alert(message);
      console.error(err);
    },
  };

  // Kumpulan mutasi untuk setiap aksi
  const deleteMutation = useMutation({ mutationFn: deleteMyArticle, ...mutationOptions });
  const submitMutation = useMutation({ mutationFn: submitArticleForReview, ...mutationOptions });
  const startRevisionMutation = useMutation({ mutationFn: startRevision, ...mutationOptions });
  const finishRevisionMutation = useMutation({ mutationFn: finishRevision, ...mutationOptions });
  const respondRequestMutation = useMutation({ mutationFn: respondToEditRequest, ...mutationOptions });

  // Flag loading gabungan
  const isMutating = 
    deleteMutation.isPending ||
    submitMutation.isPending ||
    startRevisionMutation.isPending ||
    finishRevisionMutation.isPending ||
    respondRequestMutation.isPending;

  return {
    articles,
    isLoading,
    isError,
    isMutating,
    // Ekspor fungsi siap pakai
    deleteArticle: deleteMutation.mutate,
    submitArticle: submitMutation.mutate,
    startRevision: startRevisionMutation.mutate,
    finishRevision: finishRevisionMutation.mutate,
    respondToRequest: respondRequestMutation.mutate,
  };
};