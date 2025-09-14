import { useState, useMemo, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { Article, Pagination } from '../types/article';
import api from '../services/apiService';

// --- Tipe Data ---
interface ArticleFilters {
  categoryId: string;
  plantTypeId: string;
}
interface ArticlesApiResponse {
  data: Article[];
  pagination: Pagination;
}

// REVISI 1: Hook custom untuk mendeteksi lebar layar
const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
};

// REVISI 2: Fungsi fetch sekarang menerima 'limit' sebagai argumen
const fetchArticles = async (page: number, filters: ArticleFilters, limit: number): Promise<ArticlesApiResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (filters.categoryId && filters.categoryId !== 'all') {
    params.append('categoryId', filters.categoryId);
  }
  if (filters.plantTypeId && filters.plantTypeId !== 'all') {
    params.append('plantTypeId', filters.plantTypeId);
  }
  
  const { data } = await api.get(`/articles?${params.toString()}`);
  return data;
};

export const useArticlesPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ArticleFilters>({
    categoryId: 'all',
    plantTypeId: 'all',
  });

  // REVISI 3: Dapatkan lebar layar dan tentukan limit berdasarkan ukurannya
  const width = useWindowWidth();
  const limit = useMemo(() => {
    if (width < 768) return 6;       // Mobile (< 768px)
    if (width < 1024) return 8;       // Tablet (>= 768px)
    return 12;                      // Desktop (>= 1024px)
  }, [width]);

  // REVISI 4: Tambahkan 'limit' ke queryKey dan panggil fetchArticles dengan limit
  const { data, isLoading, isError, isFetching } = useQuery<ArticlesApiResponse, Error>({
    queryKey: ['articles', page, filters, limit], 
    queryFn: () => fetchArticles(page, filters, limit),
    placeholderData: keepPreviousData,
  });

  const handleFilterChange = (filterType: keyof ArticleFilters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPage(1);
  };

  return {
    page,
    setPage,
    filters,
    handleFilterChange,
    articles: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError,
    isFetching,
  };
};