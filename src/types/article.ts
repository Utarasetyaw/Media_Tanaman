// Definisikan tipe data dasar yang sering digunakan
export interface LocalizedString {
  id: string;
  en: string;
}

// Definisikan struktur objek Artikel sesuai dengan data dari API
export interface Article {
  id: number;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString; // <-- REVISI: Gunakan tipe LocalizedString yang sudah ada
  imageUrl: string;
  viewCount: number;
  createdAt: string;
  author: {
    name: string;
    role: string;
  };
  category: {
    id: number;
    name: LocalizedString;
  };
  plantType: {
    id: number;
    name: LocalizedString;
  } | null; // plantType bisa jadi null
  _count: {
    likes: number;
  };
}

// Definisikan struktur objek Pagination
export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}