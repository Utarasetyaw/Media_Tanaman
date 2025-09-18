import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// REVISI: Hapus 'useNavigate' karena tidak akan digunakan lagi di sini
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

// Fungsi ini tidak lagi dipakai di hook admin, tapi kita biarkan untuk referensi
// (submitForReview function removed because it is unused)


// --- Tipe Data untuk Payload ---
interface SaveArticlePayload {
  formData: any;
  imageFile: File | null;
  action: 'save' | 'publish';
}

// --- Hook Utama ---
export const useArticleEditor = (id?: string) => {
  const queryClient = useQueryClient();
  const articleId = id ? Number(id) : undefined;
  const isEditMode = Boolean(articleId);

  // --- Data Fetching (Tidak Berubah) ---
  const { data: articleData, isLoading: isLoadingArticle } = useQuery<Article>({
    queryKey: ['articleEditor', articleId],
    queryFn: () => getArticleById(articleId!),
    enabled: isEditMode,
  });

  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ['allCategories'], queryFn: getCategories });
  const { data: plantTypes = [] } = useQuery<PlantType[]>({ queryKey: ['allPlantTypes'], queryFn: getPlantTypes });

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

        // REVISI 1: Tambahkan logika untuk mengubah status saat 'publish' di mode edit
        if (isEditMode) {
            if (action === 'publish') {
                payload.status = 'PUBLISHED';
            }
            return updateArticle({ id: articleId, ...payload });
        } else {
            payload.status = action === 'publish' ? 'PUBLISHED' : 'DRAFT';
            return createArticle(payload);
        }
    },
    // REVISI 2: Sederhanakan onSuccess. Hapus semua alert dan navigasi.
    onSuccess: (savedArticle) => {
        queryClient.invalidateQueries({ queryKey: ['allAdminArticles'] });
        queryClient.invalidateQueries({ queryKey: ['myArticles'] });
        queryClient.invalidateQueries({ queryKey: ['articleEditor', savedArticle.id] });
        queryClient.invalidateQueries({ queryKey: ['journalistArticle', savedArticle.id] }); // Untuk konsistensi
    },
    onError: (error: any) => {
        const message = error.response?.data?.error || error.message;
        alert(`Gagal menyimpan: ${message}`);
        console.error("Save article error:", error);
    }
  });

  // Kami tidak menggunakan finishRevisionMutation di editor Admin, jadi bisa dihapus jika mau
  // ...

  const isLoading = isEditMode && isLoadingArticle;

  return {
    articleData,
    categories,
    plantTypes,
    isLoading,
    isSaving: saveMutation.isPending,
    // REVISI 3: Ganti `mutate` menjadi `mutateAsync` agar bisa di-await di komponen
    handleSaveAction: saveMutation.mutateAsync,
  };
};