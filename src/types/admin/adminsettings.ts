// Tipe data dasar untuk teks dalam dua bahasa
export interface LocalizedString {
  id: string;
  en: string;
}

// Tipe untuk item FAQ (disesuaikan dengan data API)
export interface FaqItem {
  id?: number;
  q: LocalizedString;
  a: LocalizedString;
}

// Tipe untuk Nilai Perusahaan (disesuaikan dengan komponen)
export interface CompanyValue {
  id?: number;
  title: LocalizedString;
  description: LocalizedString;
}

// Tipe untuk gambar banner
export interface BannerImage {
  id: number;
  imageUrl: string;
}

// Tipe untuk data SEO (dibuat lebih spesifik)
export interface SiteSeo {
  metaTitle?: LocalizedString;
  metaDescription?: LocalizedString;
  metaKeywords?: string;
  ogDefaultTitle?: LocalizedString;
  ogDefaultDescription?: LocalizedString;
  ogDefaultImageUrl?: string;
  twitterSite?: string;
  googleSiteVerificationId?: string;
}

// Tipe untuk Info Kontak (dibuat lebih spesifik)
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

// Tipe data lengkap untuk objek SiteSettings
export interface SiteSettings {
  id: number;
  name: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  shortDescription: LocalizedString;
  businessDescription: LocalizedString;
  contactInfo: ContactInfo;
  faqs: FaqItem[];
  companyValues: CompanyValue[];
  privacyPolicy: LocalizedString;
  seo: SiteSeo;
  googleAnalyticsId: string | null;
  googleAdsId: string | null;
  metaPixelId: string | null;
  bannerTagline: LocalizedString;
  bannerImages: BannerImage[];
}

// ▼▼▼ TAMBAHKAN INTERFACE BARU INI ▼▼▼
export interface AnnouncementSettings {
  id: number;
  journalistAnnouncement: LocalizedString;
  userAnnouncement: LocalizedString;
  journalistRules: LocalizedString;
  userRules: LocalizedString;
}