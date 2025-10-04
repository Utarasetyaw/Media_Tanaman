import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/apiService';
import type { Article, Category, PlantType } from '../../types';
import type { AdminArticleFormData } from '../../types/admin/adminarticleeditor.types'; // <-- Gunakan tipe spesifik

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

const uploadFile = async (folder: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post(`/upload/${folder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

// Gunakan tipe yang lebih spesifik
const createArticle = async (payload: AdminArticleFormData & { status: string }): Promise<Article> => {
    const { data } = await api.post('/articles/management', payload);
    return data;
};

// Gunakan tipe yang lebih spesifik
const updateArticle = async (payload: { id: number } & Partial<AdminArticleFormData> & { status?: string }): Promise<Article> => {
    const { id, ...dataToUpdate } = payload;
    const { data } = await api.put(`/articles/management/${id}`, dataToUpdate);
    return data;
};


// --- Tipe Data untuk Payload ---
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
        let finalImageUrl = formData.imageUrl || '';
        if (imageFile) {
            const uploadRes = await uploadFile('artikel', imageFile);
            finalImageUrl = uploadRes.imageUrl;
        }

        // Validasi gambar jika ingin mempublikasikan
        if (!finalImageUrl && action === 'publish') {
            throw new Error('Gambar utama wajib diunggah untuk publikasi.');
        }

        const payload = { ...formData, imageUrl: finalImageUrl };

        if (isEditMode) {
            // Untuk mode edit, selalu kirim status jika 'publish'
            const dataToUpdate: { id: number } & Partial<AdminArticleFormData> & { status?: string } = { id: articleId!, ...payload };
            if (action === 'publish') {
                dataToUpdate.status = 'PUBLISHED';
            }
            return updateArticle(dataToUpdate);
        } else {
            // Untuk mode buat baru, status ditentukan oleh aksi
            const status = action === 'publish' ? 'PUBLISHED' : 'DRAFT';
            return createArticle({ ...payload, status });
        }
    },
    onSuccess: (savedArticle) => {
        // Hapus cache lama agar data baru selalu diambil dari server
        queryClient.invalidateQueries({ queryKey: ['allAdminArticles'] });

        // Secara proaktif perbarui cache untuk halaman editor ini
        // Ini membuat data langsung ter-update jika pengguna tidak langsung redirect
        queryClient.setQueryData(['articleEditor', savedArticle.id], savedArticle);
    },
    onError: (error: any) => {
        // Biarkan komponen yang menangani alert, hook hanya melempar error
        const message = error.response?.data?.error || error.message;
        console.error("Save article error:", error);
        // Melempar kembali error agar bisa ditangkap oleh .catch() di komponen
        throw new Error(message || "Gagal menyimpan artikel.");
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