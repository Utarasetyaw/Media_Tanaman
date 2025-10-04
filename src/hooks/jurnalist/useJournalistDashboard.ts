import { useQuery } from '@tanstack/react-query';
import api from '../../services/apiService';
// ▼▼▼ Gunakan tipe data dari file baru ▼▼▼
import type { DashboardData } from '../../types/jurnalist/journalistDashboard.types';

// --- Fungsi API ---
const fetchDashboardData = async (): Promise<DashboardData> => {
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