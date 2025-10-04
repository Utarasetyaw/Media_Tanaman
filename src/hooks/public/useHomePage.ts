import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/apiService';
import { useIsMobile } from '../useIsMobile';

// Impor semua tipe data yang dibutuhkan dari file terpusat
import type { Article, HomePageData, HomeFilters } from '../../types/public/home.types';

// Tipe ini spesifik untuk respons API artikel, jadi bisa tetap di sini
interface FilteredArticlesApiResponse {
  data: Article[];
}

// Fungsi untuk mengambil data utama halaman home
const fetchHomeData = async (): Promise<HomePageData> => {
  const { data } = await api.get('/home');
  return data;
};

// Fungsi untuk mengambil daftar artikel yang bisa difilter
const fetchFilteredArticles = async (filters: HomeFilters, limit: number): Promise<FilteredArticlesApiResponse> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (filters.categoryId && filters.categoryId !== 'all') {
      params.append('categoryId', String(filters.categoryId));
    }
    if (filters.plantTypeId && filters.plantTypeId !== 'all') {
      params.append('plantTypeId', String(filters.plantTypeId));
    }
    const { data } = await api.get(`/articles?${params.toString()}`);
    return data;
};

export const useHomePage = () => {
  const [filters, setFilters] = useState<HomeFilters>({ categoryId: 'all', plantTypeId: 'all' });
  const [isScrollButtonVisible, setScrollButtonVisible] = useState(false);
  const [articleLimit, setArticleLimit] = useState(12); // Default ke 12
  
  const isMobile = useIsMobile();

  // Query untuk data statis (banner, artikel terpopuler, dll)
  const { data: staticData, isLoading: isLoadingStatic, isError: isErrorStatic } = useQuery<HomePageData, Error>({ 
    queryKey: ['homeData'], 
    queryFn: fetchHomeData, 
    staleTime: 1000 * 60 * 5 // Cache selama 5 menit
  });
  
  // Query untuk daftar artikel utama ("More for you")
  const { data: filteredData, isLoading: isLoadingFiltered, isError: isErrorFiltered } = useQuery({ 
    queryKey: ['filteredArticles', filters, articleLimit], 
    queryFn: () => fetchFilteredArticles(filters, articleLimit),
    enabled: !!articleLimit 
  });

  // Efek untuk mengatur limit artikel berdasarkan lebar layar
  useEffect(() => {
    const getLimitForScreen = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 1024) return 12; // lg
      if (screenWidth >= 768) return 8;  // md
      return 4; // sm
    };
    const handleResize = () => setArticleLimit(getLimitForScreen());
    handleResize(); // Panggil sekali saat inisialisasi
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Efek untuk tombol "kembali ke atas"
  useEffect(() => {
    const toggleVisibility = () => window.pageYOffset > 500 ? setScrollButtonVisible(true) : setScrollButtonVisible(false);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Proses data artikel untuk menghilangkan duplikasi
  const { moreForYouChunks, allArticlesLoaded } = useMemo(() => {
    const latestArticles = staticData?.latestArticles || [];
    const filteredArticles = filteredData?.data || [];

    const latestArticleIds = new Set(latestArticles.map(a => a.id));
    const moreArticles = filteredArticles.filter(article => !latestArticleIds.has(article.id));
    
    const chunks = [];
    const chunkSize = isMobile ? 2 : 4; 
    for (let i = 0; i < moreArticles.length; i += chunkSize) { 
      chunks.push(moreArticles.slice(i, i + chunkSize)); 
    }

    return { moreForYouChunks: chunks, allArticlesLoaded: !!staticData && !!filteredData };
  }, [staticData, filteredData, isMobile]); 

  const handleFilterChange = (newFilters: Partial<HomeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    staticData, 
    isLoadingStatic, 
    isLoadingFiltered,
    isError: isErrorStatic || isErrorFiltered,
    filters, 
    handleFilterChange, 
    moreForYouChunks,
    allArticlesLoaded,
    isScrollButtonVisible, 
    scrollToTop,
  };
};