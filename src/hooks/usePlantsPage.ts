import { useState, useMemo, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '../services/apiService';

// Mengimpor tipe terpusat dari file types/plant.ts
import type { PlantsApiResponse, PlantFilters } from '../types/plant';

// =================================================================
// --- Helper Hook (Digabung di sini sesuai permintaan) ---
// =================================================================

/**
 * Hook custom untuk mendeteksi lebar layar secara real-time.
 */
const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
};

// =================================================================
// --- Fungsi Fetching Data ---
// =================================================================

/**
 * Mengambil data tanaman dari API dengan parameter paginasi dan filter.
 */
const fetchPlants = async (page: number, filters: PlantFilters, limit: number): Promise<PlantsApiResponse> => {
  const params = new URLSearchParams({ 
    page: String(page), 
    limit: String(limit) 
  });

  // --- PERBAIKAN: Ganti filter dari 'familyId' menjadi 'plantTypeId' ---
  if (filters.plantTypeId && filters.plantTypeId !== 'all') {
    params.append('plantTypeId', String(filters.plantTypeId));
  }

  const { data } = await api.get(`/plants?${params.toString()}`);
  return data;
};

// =================================================================
// --- Hook Utama Halaman Tanaman ---
// =================================================================

export const usePlantsPage = () => {
  const [page, setPage] = useState(1);
  // --- PERBAIKAN: Ganti state filter menjadi 'plantTypeId' ---
  const [filters, setFilters] = useState<PlantFilters>({
    plantTypeId: 'all',
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

  const handleFilterChange = (filterType: keyof PlantFilters, value: string | number) => {
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