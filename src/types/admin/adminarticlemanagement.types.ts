// Tipe data dasar untuk teks dalam dua bahasa
export interface LocalizedString {
  id: string;
  en: string;
}

// Tipe untuk semua kemungkinan status artikel
export type ArticleStatus = 
  | 'PUBLISHED'
  | 'IN_REVIEW'
  | 'NEEDS_REVISION'
  | 'JOURNALIST_REVISING'
  | 'REVISED'
  | 'REJECTED'
  | 'DRAFT';

// Tipe untuk semua kemungkinan status permintaan edit dari admin
export type AdminEditRequestStatus = 
  | 'NONE'
  | 'PENDING'
  | 'APPROVED'
  | 'DENIED';

// Tipe data utama untuk objek Artikel yang digunakan di halaman manajemen
export interface Article {
  id: number;
  title: LocalizedString;
  author: {
    name: string;
    role: string;
  };
  status: ArticleStatus;
  adminEditRequest?: AdminEditRequestStatus;
  feedback?: string | null;
  updatedAt: string; 
}