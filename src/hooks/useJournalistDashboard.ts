import { useQuery } from '@tanstack/react-query';
import api from '../services/apiService'; // Pastikan path ini benar
import type { Article } from '../types';

// --- Tipe Data untuk Respons API ---
export interface DashboardStats {
    published: number;
    inReview: number;
    needsRevision: number;
    adminRequest: number;
    rejected: number;
}

export interface DashboardData {
    stats: DashboardStats;
    recentArticles: Article[];
}

// --- Fungsi API ---
const fetchDashboardData = async (): Promise<DashboardData> => {
    // Endpoint ini sudah ada di backend Anda
    const { data } = await api.get('/articles/management/my-dashboard-stats');
    return data;
};

// --- Hook Utama ---
export const useJournalistDashboard = () => {
  const { data, isLoading, isError, error } = useQuery<DashboardData, Error>({
    queryKey: ['journalistDashboard'],
    queryFn: fetchDashboardData,
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};