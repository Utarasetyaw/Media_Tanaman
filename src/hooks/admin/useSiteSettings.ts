import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/apiService'; 
import type { SiteSettings, BannerImage, AnnouncementSettings } from '../../types/admin/adminsettings';
import { toast } from 'react-hot-toast';

// --- FUNGSI API ---

const getSiteSettings = async (): Promise<SiteSettings> => {
  const { data } = await api.get('/settings');
  return data;
};

// Fungsi ini kembali menjadi helper internal
const uploadFile = async (folder: string, file: File, isFavicon: boolean = false): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const endpoint = isFavicon ? '/upload/favicon' : `/upload/${folder}`;
    const { data } = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

const addBannerApi = async (file: File): Promise<SiteSettings> => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post('/settings/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}

interface UpdateSettingsPayload {
  settingsData: Partial<SiteSettings>;
  logoFile?: File | null;
  faviconFile?: File | null;
}

const getAnnouncements = async (): Promise<AnnouncementSettings> => {
  const { data } = await api.get('/settings/announcements');
  return data;
};

// --- HOOK UTAMA ---
export const useSiteSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading: isLoadingSettings, isError: isErrorSettings } = useQuery<SiteSettings, Error>({
    queryKey: ['siteSettings'],
    queryFn: getSiteSettings,
  });

  const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery<AnnouncementSettings, Error>({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
  });

  // --- MUTATIONS ---
  const updateSettingsMutation = useMutation({
    mutationFn: async ({ settingsData, logoFile, faviconFile }: UpdateSettingsPayload) => {
      const dataToSave = { ...settingsData };
      delete dataToSave.bannerImages;

      // Proses upload terjadi di dalam mutasi
      if (logoFile) {
        toast.loading('Mengunggah logo...');
        const res = await uploadFile('settings', logoFile, false);
        dataToSave.logoUrl = res.imageUrl;
        toast.dismiss();
      }
      if (faviconFile) {
        toast.loading('Mengunggah favicon...');
        const res = await uploadFile('settings', faviconFile, true);
        dataToSave.faviconUrl = res.imageUrl;
        toast.dismiss();
      }
      
      const { data } = await api.put('/settings', dataToSave);
      return data;
    },
    onSuccess: (savedData) => {
      queryClient.setQueryData(['siteSettings'], savedData);
      toast.success('Pengaturan berhasil disimpan!');
    },
    onError: (error) => {
      toast.dismiss(); // Hapus toast loading jika ada error
      console.error("Failed to save settings:", error);
      toast.error('Gagal menyimpan pengaturan.');
    }
  });

  const addBannerMutation = useMutation({
    mutationFn: addBannerApi,
    onSuccess: (updatedSettings) => {
        queryClient.setQueryData(['siteSettings'], updatedSettings);
        toast.success('Banner baru berhasil ditambahkan!');
    },
    onError: (error) => {
        console.error('Failed to add banner:', error);
        toast.error('Gagal menambahkan banner.');
    }
  });

  const deleteBannerMutation = useMutation({
      mutationFn: (bannerId: number) => api.delete(`/settings/banners/${bannerId}`),
      onSuccess: (_data, bannerId) => {
          queryClient.setQueryData<SiteSettings | undefined>(['siteSettings'], (oldData) => {
              if (!oldData) return oldData;
              return {
                  ...oldData,
                  bannerImages: oldData.bannerImages.filter((banner: BannerImage) => banner.id !== bannerId),
              };
          });
          toast.success('Banner berhasil dihapus!');
      },
      onError: (error) => {
          console.error('Failed to delete banner:', error);
          toast.error('Gagal menghapus banner.');
      }
  });

  const updateAnnouncementsMutation = useMutation({
    mutationFn: (dataToSave: Partial<AnnouncementSettings>) => api.put('/settings/announcements', dataToSave).then(res => res.data),
    onSuccess: (savedData) => {
      queryClient.setQueryData(['announcements'], savedData);
      toast.success('Pengumuman berhasil disimpan!');
    },
    onError: (error) => {
      toast.error('Gagal menyimpan pengumuman.');
      console.error("Failed to save announcements:", error);
    }
  });

  return { 
    settings, 
    isLoadingSettings, 
    isErrorSettings,
    updateSettings: updateSettingsMutation.mutate, 
    isSavingSettings: updateSettingsMutation.isPending,
    
    addBanner: addBannerMutation.mutate,
    isAddingBanner: addBannerMutation.isPending,
    deleteBanner: deleteBannerMutation.mutate,
    isDeletingBanner: deleteBannerMutation.isPending,

    announcements,
    isLoadingAnnouncements,
    updateAnnouncements: updateAnnouncementsMutation.mutate,
    isSavingAnnouncements: updateAnnouncementsMutation.isPending,
  };
};