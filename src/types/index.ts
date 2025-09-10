// src/types/index.ts

// --- Tipe Data Dasar & Bantuan ---

/**
 * Struktur untuk field yang mendukung multibahasa (Indonesia & Inggris).
 */
export interface MultilangString {
  id: string;
  en: string;
}

/**
 * Tipe untuk semua kemungkinan status artikel.
 */
export type ArticleStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'NEEDS_REVISION' | 'JOURNALIST_REVISING' | 'REVISED';
/**
 * PERUBAHAN: Tipe baru untuk status permintaan edit dari Admin.
 */
export type AdminEditRequestStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'DENIED';

/**
 * Tipe untuk role pengguna.
 */
export type UserRole = 'ADMIN' | 'JOURNALIST';

/**
 * Struktur untuk data SEO yang bisa digunakan di Artikel atau Pengaturan Situs.
 */
export interface SEO {
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  twitterHandle?: string;
}

// --- Tipe Data Model Utama ---

/**
 * Struktur untuk data Pengguna (User), terutama yang diterima setelah login.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

/**
 * Struktur data lengkap untuk sebuah Artikel.
 */
export interface Article {
  id: number;
  title: MultilangString;
  excerpt: MultilangString;
  content: MultilangString;
  imageUrl: string;
  category: string;
  author: {
    name: string;
  };
  authorId: number;
  status: ArticleStatus;
  adminEditRequest: AdminEditRequestStatus; // PERUBAHAN: Properti baru ditambahkan
  feedback?: string | null;
  seo?: SEO | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Struktur data lengkap untuk sebuah Tanaman.
 */
export interface Plant {
  id: number;
  name: MultilangString;
  scientificName: string;
  family: MultilangString;
  description: MultilangString;
  imageUrl: string;
  category: MultilangString;
  careLevel: 'Mudah' | 'Sedang' | 'Sulit';
  size: 'Kecil' | 'Sedang' | 'Besar';
  stores: { name: string; url: string }[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Struktur data lengkap untuk sebuah Event.
 */
export interface Event {
  id: number;
  title: MultilangString;
  description: MultilangString;
  imageUrl: string;
  location: string;
  organizer: string;
  startDate: string; // ISO Date String
  endDate: string; // ISO Date String
  eventType: 'INTERNAL' | 'EXTERNAL';
  externalUrl?: string | null;
  submissions?: EventSubmission[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Struktur data untuk submission event/lomba.
 */
export interface EventSubmission {
  id: number;
  eventId: number;
  participantName: string;
  participantEmail: string;
  submissionUrl: string;
  submissionNotes?: string | null;
  createdAt: string;
}


// --- Tipe Data untuk Halaman Spesifik ---

/**
 * Struktur data untuk statistik artikel per jurnalis.
 */
export interface ArticleStats {
  published: number;
  needsRevision: number;
  rejected: number;
  inReview: number;
  draft: number;
}

/**
 * Struktur data untuk Jurnalis di halaman manajemen,
 * menggabungkan data User dengan statistik artikelnya.
 */
export interface Journalist extends User {
  articleStats: ArticleStats;
  articles?: Article[]; // Opsional, hanya ada di halaman detail
}

/**
 * Struktur data lengkap untuk Pengaturan Situs (Site Settings).
 */
export interface SiteSettings {
  id: number;
  name?: string;
  logoUrl?: string;
  faviconUrl?: string;
  businessDescription?: MultilangString;
  bannerVideoUrl?: string;
  tagline?: MultilangString;
  contactInfo?: {
    email: string;
    phone: string;
    address: string;
  };
  faqs?: { q: MultilangString; a: MultilangString }[];
  companyValues?: { point: MultilangString; description: MultilangString }[];
  privacyPolicy?: MultilangString;
  seo?: SEO;
  googleAnalyticsId?: string;
  googleAdsId?: string;
  metaPixelId?: string;
}