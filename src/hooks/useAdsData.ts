// src/hooks/useAdsData.ts

import { useQuery } from '@tanstack/react-query';
import api from '../services/apiService';

// Tipe untuk konten iklan individual
export interface Ad {
  imageUrl: string;
  linkUrl: string;
}

// Tipe untuk parameter hook
type AdType = 'vertical' | 'horizontal' | 'banner';

// Fungsi untuk mengambil data dari API
const fetchAds = async (type: AdType): Promise<Ad[]> => {
  // Panggil endpoint dinamis berdasarkan tipe yang diberikan
  const { data } = await api.get(`/ads/${type}`);
  return data;
};

// Custom hook utama yang akan digunakan di semua komponen iklan
export const useAdsData = (type: AdType) => {
  return useQuery<Ad[], Error>({
    // Gunakan 'type' sebagai bagian dari queryKey agar cache-nya terpisah
    queryKey: ['ads', type],
    queryFn: () => fetchAds(type),
    staleTime: 1000 * 60 * 10, // Cache selama 10 menit
    refetchOnWindowFocus: false,
  });
};