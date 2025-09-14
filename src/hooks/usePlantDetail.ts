import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Plant } from '../types/plant'; // Pastikan path tipe data sudah benar
import api from '../services/apiService';   // Pastikan path API service sudah benar

// Fungsi untuk mengambil detail satu tanaman dari API
const fetchPlantById = async (id: string): Promise<Plant> => {
  const { data } = await api.get(`/plants/${id}`);
  return data;
};

// Hook utama untuk halaman detail tanaman
export const usePlantDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: plant, isLoading, isError } = useQuery<Plant, Error>({
    queryKey: ['plant', id],
    queryFn: () => fetchPlantById(id!),
    enabled: !!id,
  });

  return {
    plant,
    isLoading,
    isError,
  };
};