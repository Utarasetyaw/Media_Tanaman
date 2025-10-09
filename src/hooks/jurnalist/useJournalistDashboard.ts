import { useQuery } from '@tanstack/react-query';
import api from '../../services/apiService';
import type { DashboardData } from '../../types/jurnalist/journalistDashboard.types';
import type { AnnouncementSettings } from '../../types/admin/adminsettings'; // <-- 1. Import tipe baru

// --- Fungsi API ---
const fetchDashboardData = async (): Promise<DashboardData> => {
    const { data } = await api.get('/articles/management/my-dashboard-stats');
    return data;
};

// ▼▼▼ 2. Tambahkan fungsi API baru untuk mengambil pengumuman ▼▼▼
const getAnnouncements = async (): Promise<AnnouncementSettings> => {
    const { data } = await api.get('/settings/announcements');
    return data;
};


// --- Hook Utama ---
export const useJournalistDashboard = () => {
  // Query untuk statistik dashboard
  const { data: dashboardData, isLoading: isLoadingDashboard, isError, error } = useQuery<DashboardData, Error>({
    queryKey: ['journalistDashboard'],
    queryFn: fetchDashboardData,
  });

  // ▼▼▼ 3. Tambahkan query baru untuk mengambil pengumuman ▼▼▼
  const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery<AnnouncementSettings, Error>({
        queryKey: ['announcements'],
        queryFn: getAnnouncements,
    });

  return {
    data: dashboardData,
    announcements, // <-- 4. Ekspor data pengumuman
    isLoading: isLoadingDashboard || isLoadingAnnouncements, // Gabungkan status loading
    isError,
    error,
  };
};