import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Article } from '../types/article';
import api from '../services/apiService';

// Tipe Data yang dibutuhkan oleh hook
export interface LocalizedString { id: string; en: string; }
export interface Category { id: number; name: LocalizedString; }
export interface Event { id: number; title: LocalizedString; startDate: string; location: string; imageUrl: string; }
export interface Plant { id: number; name: LocalizedString; description: LocalizedString; imageUrl: string; }
export interface BannerImage { id: number; imageUrl: string; }
export interface HomePageData {
  bannerTagline: LocalizedString; bannerImages: BannerImage[]; plantTypes: Category[]; categories: Category[];
  topHeadlines: { id: number; title: LocalizedString }[]; mostViewedArticle: Article | null; latestArticles: Article[];
  runningEvents: Event[]; plants: Plant[];
}
interface Filters { categoryId?: number | string; plantTypeId?: number | string; }
interface FilteredArticlesApiResponse { data: Article[]; }

// Fungsi Fetching
const fetchHomeData = async (): Promise<HomePageData> => { const { data } = await api.get('/home'); return data; };
const fetchFilteredArticles = async (filters: Filters): Promise<FilteredArticlesApiResponse> => {
    const params = new URLSearchParams({ limit: '16' });
    if (filters.categoryId && filters.categoryId !== 'all') params.append('categoryId', String(filters.categoryId));
    if (filters.plantTypeId && filters.plantTypeId !== 'all') params.append('plantTypeId', String(filters.plantTypeId));
    const { data } = await api.get(`/articles?${params.toString()}`);
    return data;
};

// Hook Utama
export const useHomePage = () => {
  const [filters, setFilters] = useState<Filters>({ categoryId: 'all', plantTypeId: 'all' });
  const [isScrollButtonVisible, setScrollButtonVisible] = useState(false);

  const { data: staticData, isLoading: isLoadingStatic, isError: isErrorStatic } = useQuery<HomePageData, Error>({ queryKey: ['homeData'], queryFn: fetchHomeData, staleTime: 1000 * 60 * 5 });
  const { data: filteredData, isLoading: isLoadingFiltered, isError: isErrorFiltered } = useQuery({ queryKey: ['filteredArticles', filters], queryFn: () => fetchFilteredArticles(filters) });

  useEffect(() => {
    const toggleVisibility = () => window.pageYOffset > 500 ? setScrollButtonVisible(true) : setScrollButtonVisible(false);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const handleFilterChange = (newFilters: Partial<Filters>) => { setFilters(prev => ({ ...prev, ...newFilters })); };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const articleChunks = useMemo(() => {
    const articles = filteredData?.data || [];
    const chunks = [];
    for (let i = 0; i < articles.length; i += 4) { chunks.push(articles.slice(i, i + 4)); }
    return chunks;
  }, [filteredData]);

  return {
    staticData, isLoading: isLoadingStatic || isLoadingFiltered, isError: isErrorStatic || isErrorFiltered,
    filters, handleFilterChange, articleChunks, isScrollButtonVisible, scrollToTop,
  };
};