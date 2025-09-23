// Impor tipe dasar 'Article' dari sumber aslinya
import type { Article } from './article';

// =================================================================
// Tipe Dasar & Bersama
// =================================================================

/**
 * Tipe untuk teks yang mendukung multi-bahasa (Indonesia & Inggris).
 */
export interface LocalizedString {
  id: string;
  en: string;
}

/**
 * Tipe dasar untuk kategori, baik untuk artikel maupun tanaman.
 */
export interface Category {
  id: number;
  name: LocalizedString;
}

/**
 * Tipe untuk data gambar banner di hero section.
 */
export interface BannerImage {
  id: number;
  imageUrl: string;
  siteSettingsId: number;
}

/**
 * Tipe untuk data event yang ditampilkan di halaman utama.
 */
export interface Event {
  id: number;
  title: LocalizedString;
  startDate: string;
  location: string;
  imageUrl: string;
}

/**
 * Tipe untuk data tanaman unggulan (Plant of the Week).
 */
export interface Plant {
  id: number;
  name: LocalizedString;
  scientificName: string;
  description: LocalizedString;
  imageUrl: string;
}


// =================================================================
// Tipe Utama untuk API Response & Props Komponen
// =================================================================

/**
 * Mendefinisikan struktur lengkap dari respons API endpoint `/api/home`.
 * Ini adalah tipe utama yang akan digunakan oleh hook `useHomePage`.
 */
export interface HomePageData {
  bannerImages: BannerImage[];
  mostViewedArticle: Article | null;
  latestArticles: Article[];
  topHeadlines: {
    id: number;
    title: LocalizedString;
  }[];
  runningEvents: Event[];
  plants: Plant[];
}

/**
 * Tipe untuk state filter di halaman utama.
 */
export interface HomeFilters {
  categoryId?: number | string;
  plantTypeId?: number | string;
}