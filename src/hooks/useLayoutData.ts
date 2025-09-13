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
        twitter?: string;
    }
  };
}

interface Ad {
    imageUrl: string;
    linkUrl: string;
}

export interface LayoutData {
  settings: SiteSettings;
  categories: any[];
  plantTypes: any[];
  // PENTING: Asumsi data 'ads' ada di response. Sesuaikan backend jika perlu.
  ads?: {
    banner?: Ad[];
    vertical?: Ad[];
    horizontal?: Ad[];
  }
}

// Fungsi untuk mengambil data dari API
const fetchLayoutData = async (): Promise<LayoutData> => {
  // REVISI: Hapus '/page' dari URL agar sesuai dengan server.js
  const { data } = await api.get('/layout');
  return data;
};

// --- Custom Hook ---
export const useLayoutData = () => {
  return useQuery<LayoutData, Error>({
    queryKey: ['layoutData'], // Kunci unik untuk query ini
    queryFn: fetchLayoutData,
    staleTime: 1000 * 60 * 5, // Data dianggap fresh selama 5 menit
    refetchOnWindowFocus: false, // Tidak fetch ulang saat window di-fokus
  });
};