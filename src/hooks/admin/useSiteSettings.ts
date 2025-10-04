import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/apiService'; 
import type { SiteSettings } from '../../types/admin/settings';
// Fungsi upload file kita definisikan di sini agar hook ini mandiri
const uploadFile = async (folder: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post(`/upload/${folder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

// Fungsi API untuk mengambil data
const getSiteSettings = async (): Promise<SiteSettings> => {
  const { data } = await api.get('/settings');
  return data;
};

// Tipe data baru untuk payload mutasi agar bisa menerima file
interface UpdateSettingsPayload {
  settingsData: Partial<SiteSettings>;
  logoFile?: File | null;
  faviconFile?: File | null;
  newBannerFile?: File | null;
}

// --- Fungsi hook utama ---
export const useSiteSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, isError } = useQuery<SiteSettings, Error>({
    queryKey: ['siteSettings'],
    queryFn: getSiteSettings,
  });

  // REVISI: Mutation sekarang menangani logika upload file
  const updateSettingsMutation = useMutation({
    mutationFn: async ({ settingsData, logoFile, faviconFile, newBannerFile }: UpdateSettingsPayload) => {
      // Salin data form agar tidak mengubah state asli secara langsung
      let dataToSave = { ...settingsData };

      // 1. Proses upload file jika ada file yang dikirim
      if (logoFile) {
        const res = await uploadFile('settings', logoFile);
        dataToSave.logoUrl = res.imageUrl;
      }
      if (faviconFile) {
        const res = await uploadFile('settings', faviconFile);
        dataToSave.faviconUrl = res.imageUrl;
      }
      if (newBannerFile) {
        const res = await uploadFile('banners', newBannerFile);
        // Tambahkan banner baru ke dalam daftar yang sudah ada
        const existingBanners = settingsData.bannerImages || [];
        dataToSave.bannerImages = [...existingBanners, { imageUrl: res.imageUrl }];
      }

      // 2. Kirim data final (yang sudah berisi URL gambar baru) ke server
      const { data } = await api.put('/settings', dataToSave);
      return data;
    },
    onSuccess: (savedData) => {
      // 3. Update cache React Query dengan data terbaru dari server
      queryClient.setQueryData(['siteSettings'], savedData);
      alert('Pengaturan berhasil disimpan!');
    },
    onError: (error) => {
      console.error("Failed to save settings:", error);
      alert(`Gagal menyimpan pengaturan: ${error.message}`);
    }
  });

  return { 
    settings, 
    isLoading, 
    isError, 
    updateSettings: updateSettingsMutation.mutate, 
    isSaving: updateSettingsMutation.isPending 
  };
};