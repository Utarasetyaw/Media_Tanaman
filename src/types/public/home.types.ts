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

// Tipe untuk data Artikel yang ditampilkan di halaman publik
export interface Article {
  id: number;
  title: LocalizedString;
  excerpt: LocalizedString;
  imageUrl: string;
  createdAt: string;
  category: Category;
  viewCount: number;
  likeCount: number; // atau _count: { likes: number } tergantung API Anda
}

// Tipe untuk data gambar banner di hero section
export interface BannerImage {
  id: number;
  imageUrl: string;
  siteSettingsId: number;
}

// Tipe untuk data event yang ditampilkan di halaman utama
export interface Event {
  id: number;
  title: LocalizedString;
  startDate: string;
  location: string;
  imageUrl: string;
}

// Tipe untuk data tanaman unggulan
export interface Plant {
  id: number;
  name: LocalizedString;
  scientificName: string;
  description: LocalizedString;
  imageUrl: string;
}

// Tipe utama untuk respons API endpoint /api/home
export interface HomePageData {
  bannerImages: BannerImage[];
  mostViewedArticle: Article | null;
  latestArticles: Article[];
  topHeadlines: {
    id: number;
    title: LocalizedString;
  }[];
  runningEvents: Event[];
  plants: Plant[];
}

// Tipe untuk state filter di halaman utama
export interface HomeFilters {
  categoryId?: number | string;
  plantTypeId?: number | string;
}