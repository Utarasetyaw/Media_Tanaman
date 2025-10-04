// Tipe data dasar untuk teks dalam dua bahasa
export interface LocalizedString {
    id: string;
    en: string;
}

// Tipe untuk item FAQ
export interface FaqItem {
    q: LocalizedString;
    a: LocalizedString;
}

// Tipe untuk informasi kontak
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

// Tipe untuk setiap item Nilai Perusahaan
export interface CompanyValue {
    title: LocalizedString;
    description: LocalizedString;
}

// Tipe utama untuk data halaman "About"
export interface AboutData {
    name: string;
    logoUrl: string;
    businessDescription: LocalizedString;
    contactInfo: ContactInfo;
    faqs: FaqItem[];
    companyValues: CompanyValue[];
    privacyPolicy: LocalizedString | null;
}