import { useQuery } from '@tanstack/react-query';
import api from '../services/apiService';

// Tipe Data
export interface LocalizedString {
  id: string;
  en: string;
}

export interface FaqItem {
  question: LocalizedString;
  answer: LocalizedString;
}

export interface CompanyValue {
  question: LocalizedString;
  answer: LocalizedString;
}

// REVISI: Tambahkan socialMedia ke dalam tipe ContactInfo
export interface ContactInfo {
    email?: string;
    phone?: string;
    address?: string;
    socialMedia?: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
    }
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

// Fungsi Fetch
const fetchAboutData = async (): Promise<AboutData> => {
  const { data } = await api.get('/about');
  return data;
};

// Custom Hook
export const useAboutData = () => {
  return useQuery<AboutData, Error>({
    queryKey: ['aboutData'],
    queryFn: fetchAboutData,
    staleTime: Infinity,
  });
};