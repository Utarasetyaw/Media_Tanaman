// Tipe-tipe ini bisa diimpor dari file tipe umum jika ada
export interface LocalizedString {
  id: string;
  en: string;
}

// Tipe data yang dibutuhkan oleh halaman Analitik Artikel Jurnalis
export interface JournalistArticleAnalyticsData {
  id: number;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  imageUrl: string;
  status: string;
  feedback: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
  };
  category: {
    name: LocalizedString;
  };
  plantType: {
    name: LocalizedString;
  } | null;
  // Jurnalis tidak perlu melihat detail SEO
  // seo: ArticleSeo | null; 
  _count: {
    likes: number;
  };
}