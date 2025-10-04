// Tipe data dasar untuk teks dalam dua bahasa
export interface LocalizedString {
  id: string;
  en: string;
}

// Tipe untuk data Kategori
export interface Category {
  id: number;
  name: LocalizedString;
}

// Tipe untuk data Penulis (Author)
export interface Author {
    name: string;
}

// Tipe data utama untuk objek Artikel di halaman detail
export interface Article {
  id: number;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  imageUrl: string;
  author: Author;
  category: Category;
  createdAt: string;
  viewCount: number;
  likeCount: number;
}