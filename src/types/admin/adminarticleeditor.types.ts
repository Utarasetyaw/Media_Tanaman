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

// Tipe data untuk form di halaman editor artikel admin
export interface AdminArticleFormData {
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
  status: string;
  category: Category;
  plantType?: PlantType | null;
  // Tambahkan properti lain yang mungkin ada dari API jika diperlukan
  author: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}