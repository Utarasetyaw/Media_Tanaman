import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/apiService';
import type { Article } from '../../types/jurnalist/journalistArticleManagement.types'; // <-- Gunakan tipe baru

// --- Definisi Fungsi-fungsi API ---

const getMyArticles = async (): Promise<Article[]> => {
  const { data } = await api.get('/articles/management/my-articles');
  return data;
};

const deleteMyArticle = async (articleId: number) => {
  await api.delete(`/articles/management/${articleId}`);
  return articleId; // Kembalikan ID untuk pembaruan cache
};

const submitArticleForReview = async (articleId: number): Promise<Article> => {
  const { data } = await api.post(`/articles/management/${articleId}/submit`);
  return data.article;
};

const startRevision = async (articleId: number): Promise<Article> => {
  const { data } = await api.post(`/articles/management/${articleId}/start-revision`);
  return data.article;
};

const finishRevision = async (articleId: number): Promise<Article> => {
  const { data } = await api.post(`/articles/management/${articleId}/finish-revision`);
  return data.article;
};

const respondToEditRequest = async (payload: { articleId: number; response: "APPROVED" | "DENIED" }): Promise<Article> => {
  const { data } = await api.put(`/articles/management/${payload.articleId}/respond-edit`, { response: payload.response });
  return data.article;
};

// --- Hook Utama ---
export const useJournalistArticleManager = () => {
  const queryClient = useQueryClient();
  const queryKey = ['myArticles'];

  const { data: articles = [], isLoading, isError } = useQuery<Article[]>({
    queryKey,
    queryFn: getMyArticles,
  });

  const mutationErrorOptions = {
    onError: (err: any) => {
      const message = err.response?.data?.error || "Terjadi kesalahan.";
      alert(message);
      console.error(err);
    },
  };

  const articleUpdateMutation = useMutation({
      mutationFn: (updateFn: () => Promise<Article>) => updateFn(),
      onSuccess: (updatedArticle) => {
          queryClient.setQueryData<Article[]>(queryKey, (oldData = []) => 
              oldData.map(article => article.id === updatedArticle.id ? updatedArticle : article)
          );
      },
      ...mutationErrorOptions
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMyArticle,
    onSuccess: (deletedArticleId) => {
      queryClient.setQueryData<Article[]>(queryKey, (oldData = []) =>
        oldData.filter(article => article.id !== deletedArticleId)
      );
    },
    ...mutationErrorOptions
  });

  const isMutating = articleUpdateMutation.isPending || deleteMutation.isPending;

  return {
    articles,
    isLoading,
    isError,
    isMutating,
    deleteArticle: deleteMutation.mutate,
    submitArticle: (articleId: number) => articleUpdateMutation.mutate(() => submitArticleForReview(articleId)),
    startRevision: (articleId: number) => articleUpdateMutation.mutate(() => startRevision(articleId)),
    finishRevision: (articleId: number) => articleUpdateMutation.mutate(() => finishRevision(articleId)),
    respondToRequest: (payload: { articleId: number; response: "APPROVED" | "DENIED" }) => articleUpdateMutation.mutate(() => respondToEditRequest(payload)),
  };
};