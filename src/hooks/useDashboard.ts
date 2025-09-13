import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext'; // Sesuaikan path jika perlu
import api from '../services/apiService';

// --- Tipe Data untuk Respons API ---
export interface TopArticle {
  id: number;
  title: { id: string };
  viewCount: number;
  _count?: { likes: number };
}

export interface AdminDashboardData {
  stats: {
    publishedArticles: number;
    journalistRequests: number;

    runningEvents: number;
  };
  performanceChart: {
    totalViews: number;
    totalLikes: number;
  };
  topArticles: TopArticle[];
}

export interface JournalistDashboardData {
  stats: {
    published: number;
    needsRevision: number;
    totalViews: number;
    totalLikes: number;
  };
  performanceChart: {
    totalViews: number;
    totalLikes: number;
  };
  topArticles: TopArticle[];
}

// --- Fungsi API ---
const getAdminDashboardData = (): Promise<AdminDashboardData> => api.get('/dashboard/admin').then(res => res.data);
const getJournalistDashboardData = (): Promise<JournalistDashboardData> => api.get('/dashboard/journalist').then(res => res.data);


// --- Hook Utama ---
export const useDashboard = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  // useQuery akan secara dinamis memilih fungsi dan kunci berdasarkan peran user
  const { data, isLoading, isError } = useQuery<AdminDashboardData | JournalistDashboardData>({
    queryKey: ['dashboard', user?.role], // Kunci query yang berbeda untuk setiap peran
    queryFn: () => isAdmin ? getAdminDashboardData() : getJournalistDashboardData(),
    enabled: !!user, // Hanya jalankan query jika user sudah terautentikasi
  });

  return {
    data,
    isLoading,
    isError,
    isAdmin,
  };
};