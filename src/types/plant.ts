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
 * Tipe untuk paginasi dari API.
 */
export interface Pagination {
	totalItems: number;
	totalPages: number;
	currentPage: number;
	itemsPerPage: number;
}

// =================================================================
// Tipe Data Spesifik Plant (SUDAH DIPERBARUI)
// =================================================================

/**
 * Tipe untuk Tipe Tanaman (menggantikan PlantFamily).
 */
export interface PlantType {
	id: number;
	name: LocalizedString;
}

/**
 * Tipe untuk informasi toko online.
 */
export interface OnlineStore {
	name: string;
	link: string;
}

/**
 * Tipe untuk informasi toko offline.
 */
export interface OfflineStore {
	name: string;
	location: string;
}

/**
 * Tipe utama yang mendefinisikan struktur data satu tanaman.
 * Sudah disesuaikan dengan respons API terbaru.
 */
export interface Plant {
	id: number;
	name: LocalizedString;
	scientificName: string;
	description: LocalizedString;
	imageUrl: string;
	stores: {
		online: OnlineStore[];
		offline: OfflineStore[];
	};
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
