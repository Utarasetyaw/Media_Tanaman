// Tipe data dasar untuk teks dalam dua bahasa
export interface LocalizedString {
  id: string;
  en: string;
}

// Tipe untuk data Kategori yang digunakan di dropdown
export interface Category {
  id: number;
  name: LocalizedString;
}

// Tipe untuk data Tipe Tanaman yang digunakan di dropdown
export interface PlantType {
  id: number;
  name: LocalizedString;
}

// Tipe data untuk form di halaman editor artikel jurnalis
export interface JournalistArticleFormData {
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  imageUrl: string;
  categoryId: number;
  plantTypeId: number;
}

// Tipe data lengkap untuk objek Artikel yang diterima dari API
export interface Article {
  id: number;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  imageUrl: string;
  status: string; // Bisa dibuat lebih spesifik jika ada enum
  feedback: string | null;
  category: Category;
  plantType?: PlantType | null;
  createdAt: string;
  updatedAt: string;
}