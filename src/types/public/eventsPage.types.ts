// Tipe data dasar untuk teks dalam dua bahasa
export interface LocalizedString {
  id: string;
  en: string;
}

// Tipe data untuk objek Event di halaman daftar event
export interface Event {
    id: number;
    title: LocalizedString;
    description: LocalizedString;
    imageUrl: string;
    location: string;
    organizer: string;
    startDate: string;
    endDate: string;
    eventType: 'INTERNAL' | 'EXTERNAL';
    externalUrl?: string | null;
}

// Tipe untuk informasi paginasi dari API
export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
}

// Tipe untuk keseluruhan respons API dari endpoint /events
export interface EventsApiResponse {
    data: Event[];
    pagination: Pagination;
}