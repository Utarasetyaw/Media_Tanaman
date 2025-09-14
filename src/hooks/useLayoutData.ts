import { useQuery } from '@tanstack/react-query';
import api from '../services/apiService';

// --- Definisikan Tipe Data dari API /api/layout ---
interface LocalizedString {
  id: string;
  en: string;
}

interface SiteSettings {
  name: string;
  logoUrl: string;
  faviconUrl: string;
  businessDescription: LocalizedString;
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
    socialMedia?: {
        instagram?: string;
        facebook?: string;
        tiktok?: string;
    }
  };
  // REVISI: Tambahkan properti yang hilang di sini
  googleAnalyticsId?: string | null;
  googleAdsId?: string | null;
  metaPixelId?: string | null;
}

interface Ad {
    imageUrl: string;
    linkUrl: string;
}

export interface LayoutData {
  settings: SiteSettings;
  categories: any[];
  plantTypes: any[];
  ads?: {
    banner?: Ad[];
    vertical?: Ad[];
    horizontal?: Ad[];
  }
}

// Fungsi untuk mengambil data dari API
const fetchLayoutData = async (): Promise<LayoutData> => {
  const { data } = await api.get('/layout');
  return data;
};

// --- Custom Hook ---
export const useLayoutData = () => {
  return useQuery<LayoutData, Error>({
    queryKey: ['layoutData'],
    queryFn: fetchLayoutData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};