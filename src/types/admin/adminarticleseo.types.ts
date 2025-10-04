// Tipe data dasar untuk teks dalam dua bahasa
export interface LocalizedString {
  id: string;
  en: string;
}

// Tipe data untuk SEO Artikel, sesuai dengan model Prisma
export interface ArticleSeo {
  id?: number;
  articleId?: number;

  metaTitle?: LocalizedString;
  metaDescription?: LocalizedString;
  keywords?: string;
  canonicalUrl?: string;
  metaRobots?: string;
  
  ogTitle?: LocalizedString;
  ogDescription?: LocalizedString;
  ogImageUrl?: string;
  ogType?: string;
  ogUrl?: string;
  ogSiteName?: string;

  twitterCard?: string;
  twitterTitle?: LocalizedString;
  twitterDescription?: LocalizedString;
  twitterImageUrl?: string;
  twitterSite?: string;
  twitterCreator?: string;

  structuredData?: any;
}

// ▼▼▼ TIPE 'Article' DITAMBAHKAN DI SINI ▼▼▼
// Tipe ini mendefinisikan data artikel yang dibutuhkan oleh halaman SEO
export interface Article {
  id: number;
  title: LocalizedString;
  seo: ArticleSeo | null;
}