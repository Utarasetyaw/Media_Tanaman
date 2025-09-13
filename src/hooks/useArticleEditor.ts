import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/apiService';
import type { Article, Category, PlantType } from '../types';

// --- Definisi Fungsi-fungsi API ---

const getArticleById = async (id: number): Promise<Article> => {
  // Endpoint analytics tidak memiliki '/management' jadi ini sudah benar
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

// REVISI: Tambahkan '/management' pada endpoint
const createArticle = async (payload: any): Promise<Article> => {
    const { data } = await api.post('/articles/management', payload);
    return data;
};

// REVISI: Tambahkan '/management' pada endpoint
const updateArticle = async (payload: any): Promise<Article> => {
    const { id, ...dataToUpdate } = payload;
    const { data } = await api.put(`/articles/management/${id}`, dataToUpdate);
    return data;
};

// Tipe untuk payload yang dikirim dari komponen
interface SaveArticlePayload {
    formData: any;
    imageFile: File | null;
    action: 'save' | 'publish';
}

// --- Hook Utama ---
export const useArticleEditor = (id?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const articleId = id ? Number(id) : undefined;
  const isEditMode = Boolean(articleId);

  // --- Data Fetching ---
  const { data: articleData, isLoading: isLoadingArticle } = useQuery<Article>({
    queryKey: ['articleEditor', articleId],
    queryFn: () => getArticleById(articleId!),
    enabled: isEditMode,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['allCategories'],
    queryFn: getCategories,
  });

  const { data: plantTypes = [] } = useQuery<PlantType[]>({
    queryKey: ['allPlantTypes'],
    queryFn: getPlantTypes,
  });

  // --- Mutation untuk Menyimpan (Create/Update) ---
  const saveMutation = useMutation({
    mutationFn: async ({ formData, imageFile, action }: SaveArticlePayload) => {
        let finalImageUrl = formData.imageUrl || '';
        if (imageFile) {
            const uploadRes = await uploadFile('artikel', imageFile);
            finalImageUrl = uploadRes.imageUrl;
        }

        if (!finalImageUrl && action === 'publish') {
            throw new Error('Gambar utama wajib diunggah untuk publikasi.');
        }

        const payload = { ...formData, imageUrl: finalImageUrl };

        if (isEditMode) {
            return updateArticle({ id: articleId, ...payload });
        } else {
            payload.status = action === 'publish' ? 'PUBLISHED' : 'DRAFT';
            return createArticle(payload);
        }
    },
    onSuccess: (savedArticle) => {
        queryClient.invalidateQueries({ queryKey: ['allAdminArticles'] });
        queryClient.invalidateQueries({ queryKey: ['myArticles'] });
        
        alert(`Artikel berhasil ${savedArticle.status === 'PUBLISHED' ? 'dipublikasikan' : 'disimpan sebagai draf'}!`);
        
        if (!isEditMode) {
            const destination = window.location.pathname.includes('/admin') 
                ? `/admin/articles/edit/${savedArticle.id}` 
                : `/jurnalis/articles/edit/${savedArticle.id}`;
            navigate(destination);
        }
    },
    onError: (error: any) => {
        const message = error.response?.data?.error || error.message;
        alert(`Gagal menyimpan: ${message}`);
        console.error("Save article error:", error);
    }
  });

  const isLoading = isEditMode && isLoadingArticle;

  return {
    articleData,
    categories,
    plantTypes,
    isLoading,
    isSaving: saveMutation.isPending,
    handleSaveAction: saveMutation.mutate,
  };
};