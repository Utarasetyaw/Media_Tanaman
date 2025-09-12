// =================================================================
// --- Tipe Data Dasar & Bantuan ---
// =================================================================

/**
 * Struktur untuk field yang mendukung multibahasa (Indonesia & Inggris).
 */
export interface MultilingualName {
  id: string;
  en: string;
}

/**
 * Tipe untuk semua kemungkinan status artikel.
 */
export type ArticleStatus = 
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'NEEDS_REVISION'
  | 'JOURNALIST_REVISING'
  | 'REVISED';

/**
 * Tipe untuk status permintaan edit dari Admin.
 */
export type AdminEditRequestStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'DENIED';

/**
 * Tipe untuk peran pengguna.
 */
export type UserRole = 'ADMIN' | 'JOURNALIST' | 'USER';


// =================================================================
// --- Tipe Data Model Utama ---
// =================================================================

/**
 * Struktur untuk data Pengguna (User).
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  address?: string;
  phoneNumber?: string;
  socialMedia?: any; // Bisa dibuat lebih spesifik jika perlu
}

/**
 * Struktur untuk Kategori.
 */
export interface Category {
    id: number;
    name: MultilingualName;
}

/**
 * Struktur untuk Tipe Tanaman.
 */
export interface PlantType {
    id: number;
    name: MultilingualName;
}


export interface Backlink {
  id: number; // Untuk key di React
  sourceUrl: string;
  anchorText: string;
  status: 'Live' | 'Pending' | 'Broken';
}

// --- PERBARUI INTERFACE SEO ---
export interface SEO {
  metaTitle?: MultilingualName;
  metaDescription?: MultilingualName;
  keywords?: string;
  metaRobots?: string;
  structuredData?: string;
  metaViewport?: string;
  canonicalURL?: string;
  
  // Open Graph & Twitter
  ogTitle?: MultilingualName;
  ogDescription?: MultilingualName;
  ogImageUrl?: string;
  twitterHandle?: string;

  // --- TAMBAHAN UNTUK BACKLINK ---
  backlinks?: Backlink[];
}
/**
 * Struktur data lengkap untuk sebuah Artikel.
 */
export interface Article {
  id: number;
  title: MultilingualName;
  excerpt: MultilingualName;
  content: MultilingualName;
  imageUrl: string;
  author: {
    name: string;
    role: UserRole; // <-- Tambahkan role
  };
  authorId: number;
  status: ArticleStatus;
  adminEditRequest: AdminEditRequestStatus;
  feedback?: string | null;
  seo?: any | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  
  // Relasi yang diperbarui
  category: Category;
  plantType?: PlantType | null;

  // Data tambahan dari _count
  _count?: {
    likes: number;
  }
}

/**
 * Struktur data lengkap untuk sebuah Tanaman.
 */
export interface Plant {
  id: number;
  name: MultilingualName;
  scientificName: string;
  description: MultilingualName;
  imageUrl: string;
  careLevel: 'Mudah' | 'Sedang' | 'Sulit';
  size: 'Kecil' | 'Sedang' | 'Besar';
  stores: { name: string; url: string }[];
  createdAt: string;
  updatedAt: string;
  
  // Relasi
  category: Category;
  family: PlantType;
  categoryId: number;
  familyId: number;
}

/**
 * Struktur data untuk submission event.
 */
export interface EventSubmission {
  id: number;
  submissionUrl: string;
  placement: number | null;
  user: User;
}

/**
 * Struktur data lengkap untuk sebuah Event.
 */
export interface Event {
  id: number;
  title: MultilingualName;
  description: MultilingualName;
  imageUrl: string;
  location: string;
  organizer: string;
  startDate: string; // ISO Date String
  endDate: string; // ISO Date String
  eventType: 'INTERNAL' | 'EXTERNAL';
  externalUrl?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relasi
  category: Category;
  plantType?: PlantType;
  submissions: EventSubmission[];

  // Statistik
  externalLinkClicks: number;
}

/**
 * Struktur untuk gambar banner.
 */
export interface BannerImage {
  id: number;
  imageUrl: string;
}

/**
 * Struktur data lengkap untuk Pengaturan Situs (Site Settings).
 */
export interface SiteSettings {
  id: number;
  name?: string;
  logoUrl?: string;
  faviconUrl?: string;
  businessDescription?: MultilingualName;
  bannerTagline?: MultilingualName;
  contactInfo?: any;
  faqs?: { question: MultilingualName; answer: MultilingualName }[];
  companyValues?: { title: MultilingualName; description: MultilingualName }[];
  privacyPolicy?: MultilingualName;
  seo?: any;
  googleAnalyticsId?: string;
  googleAdsId?: string;
  metaPixelId?: string;
  bannerImages: BannerImage[];
}