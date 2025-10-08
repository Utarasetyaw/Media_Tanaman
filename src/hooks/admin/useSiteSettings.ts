import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/apiService'; 
import type { SiteSettings, BannerImage, AnnouncementSettings } from '../../types/admin/adminsettings';
import { toast } from 'react-hot-toast';

// --- FUNGSI API PENGATURAN UMUM ---

const getSiteSettings = async (): Promise<SiteSettings> => {
  const { data } = await api.get('/settings');
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

interface UpdateSettingsPayload {
  settingsData: Partial<SiteSettings>;
  logoFile?: File | null;
  faviconFile?: File | null;
  newBannerFile?: File | null;
}

// --- FUNGSI API PENGUMUMAN ---

const getAnnouncements = async (): Promise<AnnouncementSettings> => {
  const { data } = await api.get('/settings/announcements');
  return data;
};


// --- HOOK UTAMA ---

export const useSiteSettings = () => {
  const queryClient = useQueryClient();

  // --- QUERIES (PENGAMBILAN DATA) ---

  // Query untuk Pengaturan Umum
  const { data: settings, isLoading: isLoadingSettings, isError: isErrorSettings } = useQuery<SiteSettings, Error>({
    queryKey: ['siteSettings'],
    queryFn: getSiteSettings,
  });

  // Query untuk Pengumuman
  const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery<AnnouncementSettings, Error>({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
  });


  // --- MUTATIONS (UPDATE DATA) ---

  // Mutasi untuk Pengaturan Umum
  const updateSettingsMutation = useMutation({
    mutationFn: async ({ settingsData, logoFile, faviconFile, newBannerFile }: UpdateSettingsPayload) => {
      let dataToSave = { ...settingsData };
      delete dataToSave.bannerImages;

      if (logoFile) {
        const res = await uploadFile('settings', logoFile);
        dataToSave.logoUrl = res.imageUrl;
      }
      if (faviconFile) {
        const res = await uploadFile('settings', faviconFile);
        dataToSave.faviconUrl = res.imageUrl;
      }
      if (newBannerFile) {
        const formData = new FormData();
        formData.append('image', newBannerFile);
        const { data: bannerResponse } = await api.post('/settings/banners', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        dataToSave = { ...bannerResponse, ...dataToSave };
      }
      const { data } = await api.put('/settings', dataToSave);
      return data;
    },
    onSuccess: (savedData) => {
      queryClient.setQueryData(['siteSettings'], savedData);
      toast.success('Pengaturan berhasil disimpan!');
    },
    onError: (error) => {
      console.error("Failed to save settings:", error);
      toast.error('Gagal menyimpan pengaturan.');
    }
  });

  // Mutasi untuk menghapus Banner
  const deleteBannerMutation = useMutation({
      mutationFn: async (bannerId: number) => {
          return api.delete(`/settings/banners/${bannerId}`);
      },
      onSuccess: (_data, bannerId) => {
          queryClient.setQueryData(['siteSettings'], (oldData: SiteSettings | undefined) => {
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

  // Mutasi untuk Pengumuman
  const updateAnnouncementsMutation = useMutation({
    mutationFn: async (dataToSave: Partial<AnnouncementSettings>) => {
      const { data } = await api.put('/settings/announcements', dataToSave);
      return data;
    },
    onSuccess: (savedData) => {
      queryClient.setQueryData(['announcements'], savedData);
      toast.success('Pengumuman berhasil disimpan!');
    },
    onError: (error) => {
      toast.error('Gagal menyimpan pengumuman.');
      console.error("Failed to save announcements:", error);
    }
  });

  // --- RETURN SEMUA DATA DAN FUNGSI ---

  return { 
    // Data & Status Pengaturan Umum
    settings, 
    isLoadingSettings, 
    isErrorSettings,
    updateSettings: updateSettingsMutation.mutate, 
    isSavingSettings: updateSettingsMutation.isPending,
    
    // Fungsi Hapus Banner
    deleteBanner: deleteBannerMutation.mutate,
    isDeletingBanner: deleteBannerMutation.isPending,

    // Data & Status Pengumuman
    announcements,
    isLoadingAnnouncements,
    updateAnnouncements: updateAnnouncementsMutation.mutate,
    isSavingAnnouncements: updateAnnouncementsMutation.isPending,
  };
};