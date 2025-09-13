import { useQuery } from '@tanstack/react-query';
import api from '../services/apiService';

// --- Definisikan Tipe Data dari API /api/home ---
// REVISI: Pastikan semua tipe data di-export
export interface LocalizedString {
  id: string;
  en: string;
}

export interface Category {
  id: number;
  name: LocalizedString;
}

export interface Article {
  id: number;
  title: LocalizedString;
  excerpt: LocalizedString;
  imageUrl: string;
  category: { name: LocalizedString };
  viewCount?: number;
  _count?: { likes: number };
}

export interface Event {
  id: number;
  title: LocalizedString;
  startDate: string;
  location: string;
  imageUrl: string;
}

export interface Plant {
    id: number;
    name: LocalizedString;
    description: LocalizedString;
    imageUrl: string;
}

export interface BannerImage {
    id: number;
    imageUrl: string;
}

export interface HomePageData {
  bannerTagline: LocalizedString;
  bannerImages: BannerImage[];
  plantTypes: Category[];
  categories: Category[];
  topHeadlines: { id: number; title: LocalizedString }[];
  mostViewedArticle: Article | null;
  latestArticles: Article[];
  runningEvents: Event[];
  plants: Plant[];
}

const fetchHomeData = async (): Promise<HomePageData> => {
  const { data } = await api.get('/home');
  return data;
};

export const useHomeData = () => {
  return useQuery<HomePageData, Error>({
    queryKey: ['homeData'],
    queryFn: fetchHomeData,
    staleTime: 1000 * 60 * 5,
  });
};