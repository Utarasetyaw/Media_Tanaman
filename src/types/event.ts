// File: src/types/event.ts

/**
 * Tipe dasar untuk teks yang mendukung multi-bahasa.
 * Pola ini sangat baik untuk konsistensi.
 */
export interface LocalizedString {
	id: string;
	en: string;
}

/**
 * Tipe utama yang mendefinisikan semua properti sebuah Event.
 * Sudah lengkap dan mencakup berbagai kasus (seperti event eksternal).
 */
export interface Event {
	id: number;
	title: LocalizedString;
	description: LocalizedString;
	imageUrl: string;
	location: string;
	organizer: string;
	startDate: string; // ISO String date
	endDate: string; // ISO String date
	eventType: "INTERNAL" | "EXTERNAL";
	externalUrl?: string | null; // Properti opsional, ini bagus!
}

/**
 * Tipe standar untuk data paginasi dari API.
 */
export interface Pagination {
	totalItems: number;
	totalPages: number;
	currentPage: number;
	itemsPerPage: number;
}

/**
 * Tipe yang membungkus respons API untuk daftar event.
 * Menggabungkan data dan paginasi adalah praktik yang umum dan benar.
 */
export interface EventsApiResponse {
	data: Event[];
	pagination: Pagination;
}
