// Tipe data dasar untuk teks dalam dua bahasa
export interface LocalizedString {
  id: string;
  en: string;
}

// Tipe untuk item FAQ
export interface FaqItem {
  question: LocalizedString;
  answer: LocalizedString;
}

// REVISI: Menggunakan satu definisi yang konsisten untuk CompanyValue
export interface CompanyValue {
  title: LocalizedString;
  text: LocalizedString;
}

// Tipe untuk gambar banner
export interface BannerImage {
  id?: number;
  imageUrl: string;
}

// Tipe data lengkap untuk objek SiteSettings
export interface SiteSettings {
  id: number;
  name: string;
  logoUrl: string;
  faviconUrl: string;
  businessDescription: LocalizedString;
  contactInfo: any; // Bisa didefinisikan lebih detail jika perlu
  faqs: FaqItem[];
  companyValues: CompanyValue[];
  privacyPolicy: LocalizedString;
  seo: any; // Bisa didefinisikan lebih detail jika perlu
  googleAnalyticsId: string;
  googleAdsId: string;
  metaPixelId: string;
  bannerTagline: LocalizedString;
  bannerImages: BannerImage[];
}