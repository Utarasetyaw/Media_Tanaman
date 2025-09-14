import { useParams } from 'react-router-dom';
// REVISI: Impor useMutation
import { useQuery, useMutation } from '@tanstack/react-query';
import type { Event } from '../types/event';
import api from '../services/apiService';

// Fungsi untuk mengambil detail event
const fetchEventById = async (id: string): Promise<Event> => {
  const { data } = await api.get(`/events/${id}`);
  return data;
};

// REVISI: Fungsi baru untuk melacak klik
const trackEventClick = async (eventId: string): Promise<void> => {
  await api.post(`/events/${eventId}/track-click`);
};

// Hook utama untuk halaman detail event
export const useEventDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: event, isLoading, isError } = useQuery<Event, Error>({
    queryKey: ['event', id],
    queryFn: () => fetchEventById(id!),
    enabled: !!id,
  });

  // REVISI: Buat mutation untuk melacak klik
  const trackClickMutation = useMutation({
    mutationFn: trackEventClick,
    onError: (error) => {
      // Jika gagal, cukup catat di konsol tanpa menghentikan pengguna
      console.error("Gagal melacak klik:", error);
    },
  });

  // REVISI: Buat fungsi handler untuk dipanggil dari komponen
  const handleExternalLinkClick = () => {
    if (event && event.externalUrl) {
      // Panggil API untuk melacak klik di latar belakang
      trackClickMutation.mutate(event.id.toString());
      // Langsung buka link di tab baru agar pengguna tidak menunggu
      window.open(event.externalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return {
    event,
    isLoading,
    isError,
    // Ekspor fungsi handler
    handleExternalLinkClick,
  };
};