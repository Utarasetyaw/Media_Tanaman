// Tipe data dasar untuk teks dalam dua bahasa
export interface LocalizedString {
  id: string;
  en: string;
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