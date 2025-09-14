import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext'; // Sesuaikan path jika perlu
import api from '../services/apiService';

// --- Tipe Data untuk Respons API ---

// Tipe data untuk titik-titik pada grafik, bisa dipakai ulang
interface ChartDataPoint {
  name: string;
  views: number;
  likes: number;
}

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
    // REVISI: Tambahkan properti chartData sebagai opsional agar tipenya cocok
    chartData?: ChartDataPoint[]; 
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
    // REVISI: Dibuat opsional agar konsisten dan lebih aman
    chartData?: ChartDataPoint[];
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

  const { data, isLoading, isError } = useQuery<AdminDashboardData | JournalistDashboardData>({
    queryKey: ['dashboard', user?.role],
    queryFn: () => isAdmin ? getAdminDashboardData() : getJournalistDashboardData(),
    enabled: !!user,
  });

  return {
    data,
    isLoading,
    isError,
    isAdmin,
  };
};