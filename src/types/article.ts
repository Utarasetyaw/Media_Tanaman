// src/types/article.ts

// =================================================================
// Tipe Data Dasar & Bersama (Reusable)
// =================================================================

/**
 * Tipe untuk teks yang mendukung multi-bahasa (Indonesia & Inggris).
 */
export interface LocalizedString {
	id: string;
	en: string;
}

/**
 * Tipe untuk Author.
 */
export interface Author {
	name: string;
	role: string;
}

/**
 * Tipe untuk Category.
 */
export interface Category {
	id: number;
	name: LocalizedString;
}

/**
 * Tipe untuk PlantType.
 */
export interface PlantType {
	id: number;
	name: LocalizedString;
}

// =================================================================
// Tipe Data Entitas Utama
// =================================================================

/**
 * --- REVISI KUNCI ---
 * Mendefinisikan struktur objek Artikel sesuai dengan respons API.
 * Properti 'likeCount' ditambahkan langsung, dan '_count' dihapus.
 */
export interface Article {
	id: number;
	title: LocalizedString;
	excerpt: LocalizedString;
	content: LocalizedString;
	imageUrl: string;
	viewCount: number;
	likeCount: number; // <-- DITAMBAHKAN SESUAI API
	createdAt: string;
	author: Author;
	category: Category;
	plantType: PlantType | null;
}

/**
 * Mendefinisikan struktur objek Pagination.
 */
export interface Pagination {
	totalItems: number;
	totalPages: number;
	currentPage: number;
	itemsPerPage: number;
}
