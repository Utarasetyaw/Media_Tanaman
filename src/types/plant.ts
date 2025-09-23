// File: src/types/plant.ts

// =================================================================
// Tipe Data Umum & Bersama
// =================================================================

/**
 * Tipe untuk teks yang mendukung multi-bahasa (Indonesia & Inggris).
 */
export interface LocalizedString {
  id: string;
  en: string;
}

/**
 * Tipe untuk famili tanaman.
 */
export interface PlantFamily {
  id: number;
  name: LocalizedString;
}

/**
 * Tipe untuk data paginasi.
 */
export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}


// =================================================================
// Tipe Data Spesifik Plant
// =================================================================

/**
 * Tipe untuk informasi toko online tempat tanaman dijual.
 */
export interface PlantStore {
    name: string;
    url: string;
}

/**
 * Tipe utama yang mendefinisikan struktur data satu tanaman.
 */
export interface Plant {
  id: number;
  name: LocalizedString;
  scientificName: string;
  description: LocalizedString;
  imageUrl: string;
  careLevel: 'Mudah' | 'Sedang' | 'Sulit';
  size: 'Kecil' | 'Sedang' | 'Besar';
  family: PlantFamily;
  stores: PlantStore[];
}

/**
 * Tipe untuk filter di halaman tanaman.
 */
export interface PlantFilters {
  // --- PERBAIKAN: Diubah dari 'familyId' agar konsisten ---
  plantTypeId: string | number;
}


// =================================================================
// Tipe Data Respons API
// =================================================================

/**
 * Tipe untuk struktur data lengkap dari respons API endpoint /api/plants.
 */
export interface PlantsApiResponse {
  data: Plant[];
  pagination: Pagination;
}