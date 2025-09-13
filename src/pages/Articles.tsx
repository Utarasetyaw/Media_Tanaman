import { useState } from 'react';
import type { FC } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useLayoutData } from '../hooks/useLayoutData';
import type { Article, Pagination } from '../types/article';
import api from '../services/apiService';

import ArticleCard from '../components/ArticlesCard';
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';

interface ArticlesApiResponse {
  data: Article[];
  pagination: Pagination;
}

// Tipe untuk state filter
interface ArticleFilters {
  categoryId: string;
  plantTypeId: string;
}

const lang: 'id' | 'en' = 'id';

// REVISI: Fungsi fetch sekarang menerima objek filters
const fetchArticles = async (page: number, filters: ArticleFilters): Promise<ArticlesApiResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: '12',
  });
  if (filters.categoryId && filters.categoryId !== 'All') {
    params.append('categoryId', filters.categoryId);
  }
  if (filters.plantTypeId && filters.plantTypeId !== 'All') {
    params.append('plantTypeId', filters.plantTypeId);
  }
  
  const { data } = await api.get(`/articles?${params.toString()}`);
  return data;
};

const ArticlePage: FC = () => {
  const { t } = useTranslation();
  
  const [page, setPage] = useState(1);
  // REVISI: Gunakan satu state object untuk semua filter
  const [filters, setFilters] = useState<ArticleFilters>({
    categoryId: 'All',
    plantTypeId: 'All',
  });

  const { data: layoutData, isLoading: isLoadingLayout } = useLayoutData();
  // Siapkan data untuk kedua baris filter
  const categories = [{ id: 'All', name: { [lang]: t('articlePage.allCategory'), en: 'All Categories' } }, ...(layoutData?.categories || [])];
  const plantTypes = [{ id: 'All', name: { [lang]: 'Semua Jenis', en: 'All Types' } }, ...(layoutData?.plantTypes || [])];

  const { data, isLoading, isError, isFetching } = useQuery<ArticlesApiResponse, Error>({
    // REVISI: queryKey sekarang bergantung pada objek filters
    queryKey: ['articles', page, filters], 
    queryFn: () => fetchArticles(page, filters),
    placeholderData: keepPreviousData,
  });

  const handleFilterChange = (filterType: keyof ArticleFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [filterType]: String(value) }));
    setPage(1);
  };

  const articles = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="bg-[#003938] min-h-screen relative">
      <VerticalAd position="left" />
      <VerticalAd position="right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-lime-400 mb-4">{t('articlePage.title')}</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">{t('articlePage.description')}</p>
        </div>
        
        {/* REVISI: Buat dua baris filter */}
        <div className="flex flex-col items-center gap-4 mb-12">
          {/* Filter Jenis Tanaman */}
          <div className="flex justify-center flex-wrap gap-3">
            {isLoadingLayout ? <p className="text-gray-400">Loading types...</p> : 
              plantTypes.map(pt => (
                <button 
                  key={pt.id} 
                  onClick={() => handleFilterChange('plantTypeId', pt.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors duration-300 border-2 ${
                    filters.plantTypeId === String(pt.id) 
                      ? 'bg-lime-300 text-lime-900 border-lime-300' 
                      : 'bg-[#004A49]/60 text-gray-200 border-lime-400 hover:bg-[#004A49]/90'
                  }`}
                >
                  {pt.name[lang]}
                </button>
              ))
            }
          </div>
          {/* Filter Kategori */}
          <div className="flex justify-center flex-wrap gap-3">
            {isLoadingLayout ? <p className="text-gray-400">Loading categories...</p> : 
              categories.map(category => (
                <button 
                  key={category.id} 
                  onClick={() => handleFilterChange('categoryId', category.id)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 border-2 ${
                    filters.categoryId === String(category.id) 
                      ? 'bg-lime-300 text-lime-900 border-lime-300' 
                      : 'bg-[#004A49]/60 text-gray-200 border-lime-400 hover:bg-[#004A49]/90'
                  }`}
                >
                  {category.name[lang]}
                </button>
              ))
            }
          </div>
        </div>

        <div className="mb-12">
            <HorizontalAd />
        </div>

        {isLoading ? (
          <p className="text-center text-gray-300">Loading articles...</p>
        ) : isError ? (
           <p className="text-center text-red-400">Failed to load articles.</p>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {articles.map(article => <ArticleCard key={article.id} article={article} />)}
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
          <div className="text-center text-gray-400 py-16">
            <h3 className="text-2xl font-semibold mb-2 text-white">{t('articlePage.noArticles')}</h3>
            <p>Tidak ada artikel yang cocok dengan filter yang dipilih.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlePage;