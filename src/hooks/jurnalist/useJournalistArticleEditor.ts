import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/apiService';
import type { Article, Category, PlantType, JournalistArticleFormData } from '../../types/jurnalist/journalistArticleEditor.types';
import { toast } from 'react-hot-toast';

// --- Definisi Fungsi-fungsi API ---

const getArticleById = async (id: number): Promise<Article> => {
  const { data } = await api.get(`/articles/management/analytics/${id}`);
  return data;
};
const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get('/categories');
  return data;
};
const getPlantTypes = async (): Promise<PlantType[]> => {
  const { data } = await api.get('/plant-types');
  return data;
};

const createArticle = async (payload: FormData): Promise<Article> => {
    const { data } = await api.post('/articles/management', payload);
    return data;
};

const updateArticle = async (payload: {id: number, data: FormData}): Promise<Article> => {
    const { id, data: formData } = payload;
    const { data } = await api.put(`/articles/management/${id}`, formData);
    return data;
};

const submitForReview = async (articleId: number) => {
    const { data } = await api.post(`/articles/management/${articleId}/submit`);
    return data;
};

const finishRevisionApi = async (articleId: number) => {
    const { data } = await api.post(`/articles/management/${articleId}/finish-revision`);
    return data;
};

// Tipe Data untuk Payload
interface SavePayload {
  formData: JournalistArticleFormData;
  imageFile: File | null;
  action: 'save' | 'submit';
}

// Hook Utama
export const useJournalistArticleEditor = () => {
  const { id } = useParams<{ id: string }>();
  const articleId = id ? Number(id) : undefined;
  const isEditMode = Boolean(articleId);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: articleData, isLoading: isLoadingArticle } = useQuery<Article>({
    queryKey: ['journalistArticle', articleId],
    queryFn: () => getArticleById(articleId!),
    enabled: isEditMode,
  });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ['allCategories'], queryFn: getCategories });
  const { data: plantTypes = [] } = useQuery<PlantType[]>({ queryKey: ['allPlantTypes'], queryFn: getPlantTypes });

  const articleMutation = useMutation({
    mutationFn: async ({ formData, imageFile, action }: SavePayload): Promise<Article> => {
        if (!imageFile && !formData.imageUrl && action === 'submit') {
            throw new Error('Gambar utama wajib diunggah sebelum mengirim artikel.');
        }

        const fd = new FormData();
        fd.append('title', JSON.stringify(formData.title));
        fd.append('excerpt', JSON.stringify(formData.excerpt));
        fd.append('content', JSON.stringify(formData.content));
        fd.append('categoryId', String(formData.categoryId));
        if (formData.plantTypeId) {
            fd.append('plantTypeId', String(formData.plantTypeId));
        }
        if (imageFile) {
            fd.append('image', imageFile);
        }
        
        const savedArticle = isEditMode
            ? await updateArticle({ id: articleId!, data: fd })
            : await createArticle(fd);
        
        if (action === 'submit') {
            await submitForReview(savedArticle.id);
        }

        return savedArticle;
    },
    onSuccess: (savedArticle) => {
        queryClient.invalidateQueries({ queryKey: ['myArticles'] });
        queryClient.invalidateQueries({ queryKey: ['journalistDashboard'] });
        queryClient.setQueryData(['journalistArticle', savedArticle.id], savedArticle);
    },
    onError: (error: any) => {
        const message = error.response?.data?.error || error.message;
        toast.error(message || 'Gagal memproses permintaan.');
        console.error("Save/Submit error:", error);
    }
  });

  const finishRevisionMutation = useMutation({
      mutationFn: finishRevisionApi,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['myArticles'] });
          queryClient.invalidateQueries({ queryKey: ['journalistDashboard'] });
          toast.success('Revisi berhasil dikirim kembali ke admin!');
          navigate('/jurnalis/articles');
      },
      onError: (error: any) => {
          toast.error(`Gagal menyelesaikan revisi: ${error.response?.data?.error || error.message}`);
      }
  });

  return {
    articleData,
    categories,
    plantTypes,
    isLoading: isLoadingArticle,
    isSaving: articleMutation.isPending || finishRevisionMutation.isPending,
    saveArticleAsync: articleMutation.mutateAsync,
    finishRevision: finishRevisionMutation.mutate,
  };
};