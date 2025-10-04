// Tipe data ini bisa diimpor dari file lain jika sudah ada,
// atau didefinisikan di sini agar file ini mandiri.
export interface LocalizedString {
  id: string;
  en: string;
}

export interface ArticleSeo {
  metaTitle?: LocalizedString;
  metaDescription?: LocalizedString;
  keywords?: string;
  canonicalUrl?: string;
  metaRobots?: string;
  ogTitle?: LocalizedString;
  ogDescription?: LocalizedString;
  ogImageUrl?: string;
}

// Tipe data utama untuk halaman Analitik Artikel
export interface ArticleAnalyticsData {
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
  seo: ArticleSeo | null;
  _count: {
    likes: number;
  };
}