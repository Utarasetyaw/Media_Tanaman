import { useState, useMemo, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { Plant, Pagination } from '../types/plant'; // Pastikan path tipe data benar
import api from '../services/apiService';

// Tipe data yang dibutuhkan
interface PlantFilters {
  categoryId: string;
  familyId: string;
}
interface PlantsApiResponse {
  data: Plant[];
  pagination: Pagination;
}

// Hook custom untuk mendeteksi lebar layar
const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
};

// Fungsi untuk mengambil data tanaman dari API
const fetchPlants = async (page: number, filters: PlantFilters, limit: number): Promise<PlantsApiResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.categoryId && filters.categoryId !== 'all') {
    params.append('categoryId', filters.categoryId);
  }
  if (filters.familyId && filters.familyId !== 'all') {
    params.append('familyId', filters.familyId);
  }
  const { data } = await api.get(`/plants?${params.toString()}`);
  return data;
};

export const usePlantsPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PlantFilters>({
    categoryId: 'all',
    familyId: 'all',
  });

  const width = useWindowWidth();
  const limit = useMemo(() => {
    if (width < 768) return 6;   // Mobile
    if (width < 1024) return 8;  // Tablet
    return 12;                   // Desktop
  }, [width]);

  const { data, isLoading, isError, isFetching } = useQuery<PlantsApiResponse, Error>({
    queryKey: ['plants', page, filters, limit], 
    queryFn: () => fetchPlants(page, filters, limit),
    placeholderData: keepPreviousData,
  });

  const handleFilterChange = (filterType: keyof PlantFilters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPage(1);
  };

  return {
    page,
    setPage,
    filters,
    handleFilterChange,
    plants: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError,
    isFetching,
  };
};