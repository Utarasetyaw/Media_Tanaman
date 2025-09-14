import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
export type { Article } from '../types/article'; 
import type { Article as ArticleType } from '../types/article';
import api from '../services/apiService';
import { useIsMobile } from './useIsMobile'; // <-- IMPORT HOOK BARU

export interface LocalizedString { id: string; en: string; }
export interface Category { id: number; name: LocalizedString; }
export interface Event { id: number; title: LocalizedString; startDate: string; location: string; imageUrl: string; }
export interface Plant { id: number; name: LocalizedString; description: LocalizedString; imageUrl: string; }
export interface BannerImage { id: number; imageUrl: string; }
export interface HomePageData {
  bannerTagline: LocalizedString; bannerImages: BannerImage[]; plantTypes: Category[]; categories: Category[];
  topHeadlines: { id: number; title: LocalizedString }[]; mostViewedArticle: ArticleType | null; latestArticles: ArticleType[];
  runningEvents: Event[]; plants: Plant[];
}
interface Filters { categoryId?: number | string; plantTypeId?: number | string; }
interface FilteredArticlesApiResponse { data: ArticleType[]; }

// Fungsi Fetching
const fetchHomeData = async (): Promise<HomePageData> => { const { data } = await api.get('/home'); return data; };
const fetchFilteredArticles = async (filters: Filters, limit: number): Promise<FilteredArticlesApiResponse> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (filters.categoryId && filters.categoryId !== 'all') params.append('categoryId', String(filters.categoryId));
    if (filters.plantTypeId && filters.plantTypeId !== 'all') params.append('plantTypeId', String(filters.plantTypeId));
    const { data } = await api.get(`/articles?${params.toString()}`);
    return data;
};

// Hook Utama
export const useHomePage = () => {
  const [filters, setFilters] = useState<Filters>({ categoryId: 'all', plantTypeId: 'all' });
  const [isScrollButtonVisible, setScrollButtonVisible] = useState(false);
  const [articleLimit, setArticleLimit] = useState(16);
  
  const isMobile = useIsMobile(); // <-- GUNAKAN HOOK BARU DI SINI

  const { data: staticData, isLoading: isLoadingStatic, isError: isErrorStatic } = useQuery<HomePageData, Error>({ queryKey: ['homeData'], queryFn: fetchHomeData, staleTime: 1000 * 60 * 5 });
  
  const { data: filteredData, isLoading: isLoadingFiltered, isError: isErrorFiltered } = useQuery({ 
    queryKey: ['filteredArticles', filters, articleLimit], 
    queryFn: () => fetchFilteredArticles(filters, articleLimit),
    enabled: !!articleLimit 
  });

  useEffect(() => {
    const getLimitForScreen = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 1024) return 12; // Desktop
      if (screenWidth >= 768) return 8; // Tablet
      return 4; // Mobile
    };
    const handleResize = () => setArticleLimit(getLimitForScreen());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const toggleVisibility = () => window.pageYOffset > 500 ? setScrollButtonVisible(true) : setScrollButtonVisible(false);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const handleFilterChange = (newFilters: Partial<Filters>) => { setFilters(prev => ({ ...prev, ...newFilters })); };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // --- BAGIAN INI YANG DIPERBAIKI ---
  const articleChunks = useMemo(() => {
    const articles = filteredData?.data || [];
    const chunks = [];
    // Ukuran chunk sekarang responsif: 2 untuk mobile, 4 untuk lainnya
    const chunkSize = isMobile ? 2 : 4; 
    for (let i = 0; i < articles.length; i += chunkSize) { 
      chunks.push(articles.slice(i, i + chunkSize)); 
    }
    return chunks;
  }, [filteredData, isMobile]); // <-- Tambahkan isMobile sebagai dependency

  return {
    staticData, isLoading: isLoadingStatic || isLoadingFiltered, isError: isErrorStatic || isErrorFiltered,
    filters, handleFilterChange, articleChunks, isScrollButtonVisible, scrollToTop,
  };
};