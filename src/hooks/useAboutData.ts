import { useQuery } from '@tanstack/react-query';
import api from '../services/apiService';

// --- Definisikan Tipe Data dari API /api/about ---
export interface LocalizedString {
  id: string;
  en: string;
}

export interface FaqItem {
  q: LocalizedString;
  a: LocalizedString;
}

export interface CompanyValue {
  title: LocalizedString;
  text: LocalizedString;
}

export interface ContactInfo {
    email?: string;
    phone?: string;
    address?: string;
    // Anda bisa menambahkan info kontak lain di sini
}

export interface AboutData {
  name: string;
  logoUrl: string;
  businessDescription: LocalizedString;
  contactInfo: ContactInfo;
  faqs: FaqItem[];
  companyValues: CompanyValue[];
  privacyPolicy: LocalizedString;
}

// Fungsi untuk mengambil data dari API
const fetchAboutData = async (): Promise<AboutData> => {
  const { data } = await api.get('/about');
  return data;
};

// --- Custom Hook ---
export const useAboutData = () => {
  return useQuery<AboutData, Error>({
    queryKey: ['aboutData'], // Kunci unik untuk query ini
    queryFn: fetchAboutData,
    staleTime: Infinity, // Data 'About' jarang berubah, jadi bisa disimpan selamanya
  });
};