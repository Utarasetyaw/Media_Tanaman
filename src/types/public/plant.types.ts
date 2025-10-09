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
 * Tipe untuk paginasi dari API.
 */
export interface Pagination {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
}

/**
 * Tipe untuk Kategori, digabungkan di sini untuk simplisitas impor.
 */
export interface Category {
    id: number;
    name: LocalizedString;
}

// =================================================================
// Tipe Data Spesifik Plant
// =================================================================

/**
 * Tipe untuk Tipe Tanaman.
 */
export interface PlantType {
    id: number;
    name: LocalizedString;
}

/**
 * Tipe baru untuk data toko penjual.
 */
export interface Store {
    id: number;
    name: string;
    url: string;
    clicks: number;
    plantId: number;
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
    stores: Store[]; // <-- Perubahan di sini
    plantTypeId: number;
    plantType: PlantType;
}

/**
 * Tipe untuk filter di halaman tanaman.
 */
export interface PlantFilters {
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