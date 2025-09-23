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
 * --- BARU: Tipe untuk Author dipisahkan ---
 * Mendefinisikan struktur objek Author.
 */
export interface Author {
  name: string;
  role: string;
}

/**
 * --- BARU: Tipe untuk Category dipisahkan ---
 * Mendefinisikan struktur objek Category.
 */
export interface Category {
  id: number;
  name: LocalizedString;
}

/**
 * --- BARU: Tipe untuk PlantType dipisahkan ---
 * Mendefinisikan struktur objek PlantType.
 */
export interface PlantType {
  id: number;
  name: LocalizedString;
}

// =================================================================
// Tipe Data Entitas Utama
// =================================================================

/**
 * --- DIREVISI: Menggunakan tipe-tipe baru yang sudah dipisah ---
 * Mendefinisikan struktur objek Artikel sesuai dengan data dari API.
 * Kini lebih bersih dan mudah dibaca.
 */
export interface Article {
  id: number;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  imageUrl: string;
  viewCount: number;
  createdAt: string;
  author: Author;       // <-- Menggunakan tipe Author
  category: Category;     // <-- Menggunakan tipe Category
  plantType: PlantType | null; // <-- Menggunakan tipe PlantType, bisa null
  _count: {
    likes: number;
  };
}

/**
 * Mendefinisikan struktur objek Pagination.
 * (Tidak ada perubahan di sini, sudah bagus)
 */
export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}