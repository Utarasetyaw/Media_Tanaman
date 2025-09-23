// useLayoutData.ts

import { useQuery } from '@tanstack/react-query';
import api from '../services/apiService';

// --- Tipe Data Umum ---
interface LocalizedString {
  id: string;
  en: string;
}

export interface Category {
  id: number;
  name: LocalizedString;
}

// Interface untuk data SEO umum dari backend
interface SiteSeo {
  id: number;
  metaTitle?: LocalizedString | null;
  metaDescription?: LocalizedString | null;
  metaKeywords?: string | null;
  ogDefaultTitle?: LocalizedString | null;
  ogDefaultDescription?: LocalizedString | null;
  ogDefaultImageUrl?: string | null;
  twitterSite?: string | null;
  googleSiteVerificationId?: string | null;
}

// Interface untuk data settings utama
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
  googleAdsId?: string | null;
  seo: SiteSeo | null; 
}

// Tipe data utama dari API /api/layout
export interface LayoutData {
  settings: SiteSettings;
  categories: Category[];
  plantTypes: Category[];
}

// --- Fungsi Fetching & Custom Hook ---

const fetchLayoutData = async (): Promise<LayoutData> => {
  const { data } = await api.get('/layout');
  return data;
};

export const useLayoutData = () => {
  return useQuery<LayoutData, Error>({
    queryKey: ['layoutData'],
    queryFn: fetchLayoutData,
    staleTime: 1000 * 60 * 5, // 5 menit
    refetchOnWindowFocus: false,
  });
};