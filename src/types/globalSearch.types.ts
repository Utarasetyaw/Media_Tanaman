// Tipe data dasar untuk teks dalam dua bahasa
export interface LocalizedString {
  id: string;
  en: string;
}

// Tipe untuk item hasil pencarian umum (Artikel & Event)
export interface SearchResultItem {
  id: number;
  title: LocalizedString;
  imageUrl: string;
}

// Tipe spesifik untuk hasil pencarian Tanaman
export interface PlantSearchResultItem {
  id: number;
  name: LocalizedString; // Tanaman menggunakan 'name' bukan 'title'
  imageUrl: string;
}

// Tipe gabungan untuk seluruh hasil pencarian dari API
export interface SearchResult {
  articles: SearchResultItem[];
  plants: PlantSearchResultItem[];
  events: SearchResultItem[];
}