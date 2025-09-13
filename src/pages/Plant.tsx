import { useState } from 'react';
import type { FC } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';

// Impor hook dan tipe data yang sudah ada
import { useLayoutData } from '../hooks/useLayoutData';
import type { PlantsApiResponse } from '../types/plant';
import api from '../services/apiService';

// Impor komponen UI
import PlantCard from '../components/PlantCard';
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';

// Tipe untuk state filter
interface PlantFilters {
  categoryId: string;
  familyId: string; // familyId di backend adalah plantTypeId
}

// Fungsi untuk mengambil data tanaman dari API dengan filter
const fetchPlants = async (page: number, filters: PlantFilters): Promise<PlantsApiResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: '12',
  });
  if (filters.categoryId) {
    params.append('categoryId', filters.categoryId);
  }
  if (filters.familyId) {
    params.append('familyId', filters.familyId);
  }
  
  const { data } = await api.get(`/plants?${params.toString()}`);
  return data;
};

const PlantPage: FC = () => {
  const { t } = useTranslation();
  const lang: 'id' | 'en' = 'id';
  
  // REVISI: State untuk pagination dan filter dropdown
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PlantFilters>({
    categoryId: '',
    familyId: '',
  });

  // Ambil data untuk mengisi dropdown filter (kategori & jenis tanaman)
  const { data: layoutData, isLoading: isLoadingLayout } = useLayoutData();
  const categories = layoutData?.categories || [];
  const plantTypes = layoutData?.plantTypes || [];

  // Gunakan Tanstack Query untuk mengambil data tanaman berdasarkan filter
  const { data, isLoading, isError, isFetching } = useQuery<PlantsApiResponse, Error>({
    queryKey: ['plants', page, filters], // Otomatis fetch ulang saat page atau filters berubah
    queryFn: () => fetchPlants(page, filters),
    placeholderData: keepPreviousData,
  });
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Kembali ke halaman pertama setiap kali filter diubah
  };

  const plants = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="bg-[#003938] min-h-screen relative">
      <VerticalAd position="left" />
      <VerticalAd position="right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-lime-400 mb-4">{t('plantPage.title')}</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">{t('plantPage.description')}</p>
        </div>
        
        {/* REVISI: Ganti Search Bar dengan Filter Dropdown */}
        <div className="mb-12 p-4 bg-[#004A49]/60 border-2 border-lime-400 rounded-lg flex flex-col sm:flex-row justify-center items-center gap-4">
          <SlidersHorizontal className="text-lime-400 hidden sm:block" size={24} />
          <select 
            name="familyId"
            value={filters.familyId}
            onChange={handleFilterChange}
            className="w-full sm:w-auto bg-[#003938] border border-lime-500 text-white rounded-md px-4 py-2 focus:ring-lime-400 focus:border-lime-400"
          >
            <option value="">Semua Jenis Tanaman</option>
            {plantTypes.map(pt => (
              <option key={pt.id} value={pt.id}>{pt.name[lang]}</option>
            ))}
          </select>
          <select 
            name="categoryId"
            value={filters.categoryId}
            onChange={handleFilterChange}
            className="w-full sm:w-auto bg-[#003938] border border-lime-500 text-white rounded-md px-4 py-2 focus:ring-lime-400 focus:border-lime-400"
          >
            <option value="">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name[lang]}</option>
            ))}
          </select>
        </div>

        <div className="mb-12">
            <HorizontalAd />
        </div>

        {isLoading || isLoadingLayout ? (
          <p className="text-center text-gray-300">Loading plants...</p>
        ) : isError ? (
          <p className="text-center text-red-400">Failed to load plants.</p>
        ) : plants.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {plants.map(plant => <PlantCard key={plant.id} plant={plant} />)}
            </div>

            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => setPage(old => Math.max(old - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-lime-400 text-gray-900 font-bold rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {t('pagination.previous')}
              </button>
              
              <span className="text-white font-medium">
                Halaman {pagination?.currentPage} dari {pagination?.totalPages}
              </span>

              <button
                onClick={() => setPage(old => (pagination && old < pagination.totalPages ? old + 1 : old))}
                disabled={!pagination || page === pagination.totalPages}
                className="px-4 py-2 bg-lime-400 text-gray-900 font-bold rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {t('pagination.next')}
              </button>
            </div>
            {isFetching && <span className="block text-center text-sm text-gray-400 mt-2">Fetching...</span>}
          </>
        ) : (
          <p className="text-center text-gray-400 text-lg py-16">
            Tidak ada tanaman yang cocok dengan filter Anda.
          </p>
        )}
      </div>
    </div>
  );
};

export default PlantPage;