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

// Tipe data yang lebih spesifik untuk artikel di dasbor
export interface RecentArticle {
  id: number;
  title: LocalizedString;
  status: ArticleStatus;
  adminEditRequest?: AdminEditRequestStatus;
  feedback?: string | null;
}

// Tipe untuk data statistik di dasbor jurnalis
export interface DashboardStats {
  published: number;
  inReview: number;
  needsRevision: number;
  adminRequest: number;
  rejected: number;
  draft: number; // <-- Penambahan field untuk draf
}

// Tipe data lengkap untuk respons API dasbor jurnalis
export interface DashboardData {
  stats: DashboardStats;
  recentArticles: RecentArticle[];
}