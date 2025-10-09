import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/apiService';
import type { Article, ArticleStatus } from '../../types/admin/adminarticlemanagement.types';
import { toast } from 'react-hot-toast';

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
  return data.article; 
};

const deleteArticle = async (articleId: number) => {
  await api.delete(`/articles/management/${articleId}`);
  return articleId;
};

const requestAdminEditAccess = async (articleId: number): Promise<Article> => {
  const { data } = await api.post(`/articles/management/${articleId}/request-edit`);
  return data.article;
};

const cancelAdminEditRequest = async (articleId: number): Promise<Article> => {
  const { data } = await api.put(`/articles/management/${articleId}/cancel-request`);
  return data.article;
};

const revertAdminEditApproval = async (articleId: number): Promise<Article> => {
  const { data } = await api.put(`/articles/management/${articleId}/revert-approval`);
  return data.article;
};


// --- Hook Utama ---
export const useArticleManager = () => {
  const queryClient = useQueryClient();
  const queryKey = ['allAdminArticles'];

  const { data: articles = [], isLoading, isError } = useQuery<Article[]>({
    queryKey,
    queryFn: getArticles,
  });

  const updateArticleInCache = (updatedArticle: Article) => {
    queryClient.setQueryData<Article[]>(queryKey, (oldData = []) => 
      oldData.map(article => article.id === updatedArticle.id ? updatedArticle : article)
    );
  };

  const mutationErrorOptions = {
    onError: (err: any) => {
      const message = err.response?.data?.error || "Terjadi kesalahan.";
      toast.error(message);
      console.error(err);
    },
  };

  const articleUpdateMutation = useMutation({
    mutationFn: (updateFn: () => Promise<Article>) => updateFn(),
    onSuccess: (updatedArticle) => {
        updateArticleInCache(updatedArticle);
        toast.success("Status artikel berhasil diperbarui!");
    },
    ...mutationErrorOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: (deletedArticleId) => {
      queryClient.setQueryData<Article[]>(queryKey, (oldData = []) =>
        oldData.filter(article => article.id !== deletedArticleId)
      );
      toast.success("Artikel berhasil dihapus.");
    },
    ...mutationErrorOptions,
  });

  const isMutating = articleUpdateMutation.isPending || deleteMutation.isPending;

  return {
    articles,
    isLoading,
    isError,
    isMutating,
    
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