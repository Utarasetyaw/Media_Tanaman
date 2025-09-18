import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/apiService';
import type { Article, Category, PlantType } from '../types';

// --- Definisi Fungsi-fungsi API (Tidak Berubah) ---

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

const uploadFile = async (folder: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post(`/upload/${folder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

const createArticle = async (payload: any): Promise<Article> => {
    const { data } = await api.post('/articles/management', payload);
    return data;
};

const updateArticle = async (payload: any): Promise<Article> => {
    const { id, ...dataToUpdate } = payload;
    const { data } = await api.put(`/articles/management/${id}`, dataToUpdate);
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

// --- Tipe Data untuk Payload ---
interface SavePayload {
  formData: any;
  imageFile: File | null;
  action: 'save' | 'submit';
}

// --- Hook Utama ---
export const useJournalistArticleEditor = () => {
  const { id } = useParams<{ id: string }>();
  const articleId = id ? Number(id) : undefined;
  const isEditMode = Boolean(articleId);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- Data Fetching ---
  const { data: articleData, isLoading: isLoadingArticle } = useQuery<Article>({
    queryKey: ['journalistArticle', articleId],
    queryFn: () => getArticleById(articleId!),
    enabled: isEditMode,
  });

  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ['allCategories'], queryFn: getCategories });
  const { data: plantTypes = [] } = useQuery<PlantType[]>({ queryKey: ['allPlantTypes'], queryFn: getPlantTypes });

  // --- REVISI 1: Sederhanakan Mutation ---
  const articleMutation = useMutation({
    mutationFn: async ({ formData, imageFile, action }: SavePayload) => {
        let finalImageUrl = formData.imageUrl || '';
        if (imageFile) {
            const uploadRes = await uploadFile('artikel', imageFile);
            finalImageUrl = uploadRes.imageUrl;
        }

        if (!finalImageUrl && action === 'submit') {
            throw new Error('Gambar utama wajib diunggah sebelum mengirim artikel.');
        }

        const payload = { ...formData, imageUrl: finalImageUrl };
        
        const savedArticleResponse = isEditMode
            ? await updateArticle({ id: articleId, ...payload })
            : await createArticle(payload);
        
        const savedArticle = savedArticleResponse;

        if (action === 'submit') {
            await submitForReview(savedArticle.id);
        }

        return savedArticle;
    },
    // REVISI 2: Hapus alert dan navigasi dari onSuccess. Cukup invalidasi query.
    onSuccess: (savedArticle) => {
        queryClient.invalidateQueries({ queryKey: ['myArticles'] });
        queryClient.invalidateQueries({ queryKey: ['journalistArticle', savedArticle.id] });
    },
    onError: (error: any) => {
        const message = error.response?.data?.error || error.message;
        alert(`Gagal: ${message}`);
        console.error("Save/Submit error:", error);
    }
  });

  const finishRevisionMutation = useMutation({
      mutationFn: finishRevisionApi,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['myArticles'] });
          alert('Revisi berhasil dikirim kembali ke admin!');
          navigate('/jurnalis/articles');
      },
      onError: (error: any) => {
          alert(`Gagal menyelesaikan revisi: ${error.response?.data?.error || error.message}`);
      }
  });

  return {
    articleData,
    categories,
    plantTypes,
    isLoading: isLoadingArticle,
    isSaving: articleMutation.isPending || finishRevisionMutation.isPending,
    // Pastikan `mutateAsync` yang diekspor agar bisa di `await`
    saveArticleAsync: articleMutation.mutateAsync,
    finishRevision: finishRevisionMutation.mutate,
  };
};