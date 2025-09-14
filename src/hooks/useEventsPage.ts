import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { EventsApiResponse } from '../types/event';
import api from '../services/apiService';

// --- Tipe untuk state filter ---
interface EventFilters {
  categoryId: string;
  plantTypeId: string;
}

// REVISI 1: Buat hook custom untuk mendeteksi lebar layar
const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        // Cleanup listener saat komponen tidak lagi digunakan
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width;
};


// REVISI 2: Fungsi fetchEvents sekarang menerima 'limit' sebagai argumen
const fetchEvents = async (filters: EventFilters, limit: number): Promise<EventsApiResponse> => {
  const params = new URLSearchParams({ limit: String(limit) }); 
  if (filters.categoryId && filters.categoryId !== 'all') {
    params.append('categoryId', filters.categoryId);
  }
  if (filters.plantTypeId && filters.plantTypeId !== 'all') {
    params.append('plantTypeId', filters.plantTypeId);
  }
  
  const { data } = await api.get(`/events?${params.toString()}`);
  return data;
};

export const useEventsPage = () => {
  const [filters, setFilters] = useState<EventFilters>({
    categoryId: 'all',
    plantTypeId: 'all',
  });

  // REVISI 3: Dapatkan lebar layar dan tentukan limit
  const width = useWindowWidth();
  const limit = useMemo(() => {
    if (width < 768) return 6;       // Mobile (< 768px)
    if (width < 1024) return 13;      // Tablet (>= 768px)
    return 31;                      // Desktop (>= 1024px)
  }, [width]);


  // REVISI 4: Tambahkan 'limit' ke queryKey dan panggil fetchEvents dengan limit
  const { data, isLoading, isError } = useQuery<EventsApiResponse, Error>({
    queryKey: ['events', filters, limit],
    queryFn: () => fetchEvents(filters, limit),
  });

  // Logika untuk memisahkan event (tidak berubah)
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

  return {
    isLoading,
    isError,
    filters,
    setFilters,
    ...processedEvents,
  };
};