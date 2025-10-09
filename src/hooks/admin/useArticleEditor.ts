import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/apiService';
import type { Article, Category, PlantType, AdminArticleFormData } from '../../types/admin/adminarticleeditor.types';
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

const updateArticle = async (payload: { id: number, data: FormData }): Promise<Article> => {
    const { id, data: formData } = payload;
    const { data } = await api.put(`/articles/management/${id}`, formData);
    return data;
};

interface SaveArticlePayload {
  formData: AdminArticleFormData;
  imageFile: File | null;
  action: 'save' | 'publish';
}

// --- Hook Utama (Khusus Admin) ---
export const useArticleEditor = (id?: string) => {
  const queryClient = useQueryClient();
  const articleId = id ? Number(id) : undefined;
  const isEditMode = Boolean(articleId);

  // --- Data Fetching ---
  const { data: articleData, isLoading: isLoadingArticle } = useQuery<Article>({
    queryKey: ['articleEditor', articleId],
    queryFn: () => getArticleById(articleId!),
    enabled: isEditMode,
  });

  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ['allCategories'], queryFn: getCategories });
  const { data: plantTypes = [] } = useQuery<PlantType[]>({ queryKey: ['allPlantTypes'], queryFn: getPlantTypes });

  // --- Mutation untuk Menyimpan (Create/Update) ---
  const saveMutation = useMutation({
    mutationFn: async ({ formData, imageFile, action }: SaveArticlePayload): Promise<Article> => {
        if (!imageFile && !formData.imageUrl && action === 'publish') {
            throw new Error('Gambar utama wajib diunggah untuk publikasi.');
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

        if (isEditMode) {
            if (action === 'publish') fd.append('status', 'PUBLISHED');
            return updateArticle({ id: articleId!, data: fd });
        } else {
            const status = action === 'publish' ? 'PUBLISHED' : 'DRAFT';
            fd.append('status', status);
            return createArticle(fd);
        }
    },
    onSuccess: (savedArticle) => {
        queryClient.invalidateQueries({ queryKey: ['allAdminArticles'] });
        queryClient.setQueryData(['articleEditor', savedArticle.id], savedArticle);
    },
    onError: (error: any) => {
        const message = error.response?.data?.error || error.message || "Gagal menyimpan artikel.";
        toast.error(message);
        console.error("Save article error:", error);
    }
  });

  const isLoading = isEditMode ? isLoadingArticle : false;

  return {
    articleData,
    categories,
    plantTypes,
    isLoading,
    isSaving: saveMutation.isPending,
    handleSaveAction: saveMutation.mutateAsync,
  };
};