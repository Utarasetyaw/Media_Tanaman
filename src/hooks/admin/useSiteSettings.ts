import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/apiService'; 
import type { SiteSettings, BannerImage, AnnouncementSettings } from '../../types/admin/adminsettings';
import { toast } from 'react-hot-toast';

// --- FUNGSI API PENGATURAN UMUM ---

const getSiteSettings = async (): Promise<SiteSettings> => {
  const { data } = await api.get('/settings');
  return data;
};

// ▼▼▼ FUNGSI INI DIPERBARUI ▼▼▼
const uploadFile = async (folder: string, file: File, isFavicon: boolean = false): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    // Gunakan endpoint yang berbeda untuk favicon agar tidak dikonversi ke WebP
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

// --- FUNGSI API PENGUMUMAN ---

const getAnnouncements = async (): Promise<AnnouncementSettings> => {
  const { data } = await api.get('/settings/announcements');
  return data;
};


// --- HOOK UTAMA ---

export const useSiteSettings = () => {
  const queryClient = useQueryClient();

  // --- QUERIES (PENGAMBILAN DATA) ---

  const { data: settings, isLoading: isLoadingSettings, isError: isErrorSettings } = useQuery<SiteSettings, Error>({
    queryKey: ['siteSettings'],
    queryFn: getSiteSettings,
  });

  const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery<AnnouncementSettings, Error>({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
  });


  // --- MUTATIONS (UPDATE DATA) ---

  // ▼▼▼ MUTASI INI DIPERBARUI ▼▼▼
  const updateSettingsMutation = useMutation({
    mutationFn: async ({ settingsData, logoFile, faviconFile }: UpdateSettingsPayload) => {
      let dataToSave = { ...settingsData };
      // Hapus properti yang tidak seharusnya dikirim saat update teks
      delete dataToSave.bannerImages;

      if (logoFile) {
        // Logo akan dikonversi ke WebP via endpoint umum
        const res = await uploadFile('settings', logoFile, false);
        dataToSave.logoUrl = res.imageUrl;
      }
      if (faviconFile) {
        // Favicon TIDAK akan dikonversi ke WebP via endpoint khusus
        const res = await uploadFile('settings', faviconFile, true); // <-- 'true' untuk menandakan ini favicon
        dataToSave.faviconUrl = res.imageUrl;
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

  // ▼▼▼ MUTASI BARU UNTUK MENAMBAH BANNER ▼▼▼
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
    settings, 
    isLoadingSettings, 
    isErrorSettings,
    updateSettings: updateSettingsMutation.mutate, 
    isSavingSettings: updateSettingsMutation.isPending,
    
    // ▼▼▼ EXPORT FUNGSI BANNER YANG BARU ▼▼▼
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