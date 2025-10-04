import { useQuery } from "@tanstack/react-query";
import api from "../services/apiService";

// --- Tipe Data (Disesuaikan dengan API) ---

export interface LocalizedString {
    id: string;
    en: string;
}

export interface FaqItem {
    q: LocalizedString;
    a: LocalizedString;
}

export interface ContactInfo {
    email?: string;
    phone?: string;
    address?: string;
    socialMedia?: {
        instagram?: string;
        facebook?: string;
        tiktok?: string;
    };
}

// ▼▼▼ PERUBAHAN DI SINI ▼▼▼

// Tipe baru untuk setiap item Nilai Perusahaan
export interface CompanyValue {
    title: LocalizedString;
    description: LocalizedString;
}

/**
 * Tipe utama untuk data halaman "About", disesuaikan dengan API.
 */
export interface AboutData {
    name: string;
    logoUrl: string;
    businessDescription: LocalizedString;
    contactInfo: ContactInfo;
    faqs: FaqItem[];
    // Tipe companyValues diubah menjadi array dari objek CompanyValue
    companyValues: CompanyValue[];
    privacyPolicy: LocalizedString | null;
}

// ▲▲▲ AKHIR PERUBAHAN ▲▲▲

// --- Fungsi Fetch & Hook ---

const fetchAboutData = async (): Promise<AboutData> => {
    const { data } = await api.get("/about");
    return data;
};

/**
 * Hook untuk mengambil dan mengelola data untuk halaman "About Us".
 */
export const useAboutData = () => {
    return useQuery<AboutData, Error>({
        queryKey: ["aboutData"],
        queryFn: fetchAboutData,
        staleTime: Infinity,
    });
};