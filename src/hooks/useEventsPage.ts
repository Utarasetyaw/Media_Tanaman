import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { EventsApiResponse } from '../types/event';
import api from '../services/apiService';

// DIHAPUS: Tipe untuk state filter tidak lagi diperlukan
// interface EventFilters {
//   categoryId: string;
//   plantTypeId: string;
// }

// Hook custom untuk mendeteksi lebar layar (tidak ada perubahan)
const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width;
};


// DIUBAH: Fungsi fetchEvents tidak lagi menerima 'filters'
const fetchEvents = async (limit: number): Promise<EventsApiResponse> => {
  // Hanya menggunakan parameter 'limit'
  const params = new URLSearchParams({ limit: String(limit) }); 
  
  // DIHAPUS: Logika untuk menambahkan filter ke parameter URL
  
  const { data } = await api.get(`/events?${params.toString()}`);
  return data;
};

export const useEventsPage = () => {
  // DIHAPUS: State untuk filter tidak lagi digunakan
  // const [filters, setFilters] = useState<EventFilters>({ ... });

  // Dapatkan lebar layar dan tentukan limit (tidak ada perubahan)
  const width = useWindowWidth();
  const limit = useMemo(() => {
    if (width < 768) return 6;       // Mobile (< 768px)
    if (width < 1024) return 13;      // Tablet (>= 768px)
    return 31;                      // Desktop (>= 1024px)
  }, [width]);


  // DIUBAH: 'filters' dihapus dari queryKey dan pemanggilan queryFn
  const { data, isLoading, isError } = useQuery<EventsApiResponse, Error>({
    queryKey: ['events', limit],
    queryFn: () => fetchEvents(limit),
  });

  // Logika untuk memisahkan event (tidak ada perubahan)
  const processedEvents = useMemo(() => {
    const allEvents = data?.data || [];
    if (allEvents.length === 0) {
      return { featuredEvent: null, otherUpcomingEvents: [], pastEvents: [] };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = allEvents
      .filter(event => new Date(event.endDate) >= today)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const past = allEvents
      .filter(event => new Date(event.endDate) < today)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    const featured = upcoming.length > 0 ? upcoming[0] : null;
    const others = upcoming.slice(1);
    return { featuredEvent: featured, otherUpcomingEvents: others, pastEvents: past };
  }, [data]);

  // DIUBAH: 'filters' dan 'setFilters' dihapus dari return object
  return {
    isLoading,
    isError,
    ...processedEvents,
  };
};