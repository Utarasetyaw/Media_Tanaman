export interface LocalizedString {
  id: string;
  en: string;
}

// Definisikan tipe untuk 'family' dan 'store'
interface PlantFamily {
    id: number;
    name: LocalizedString;
}

interface PlantStore {
    name: string;
    url: string;
}

export interface Plant {
  id: number;
  name: LocalizedString;
  scientificName: string;
  description: LocalizedString;
  imageUrl: string;
  careLevel: 'Mudah' | 'Sedang' | 'Sulit';
  size: 'Kecil' | 'Sedang' | 'Besar';
  family: PlantFamily;   // <-- REVISI: Tambahkan properti ini
  stores: PlantStore[];  // <-- REVISI: Tambahkan properti ini
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface PlantsApiResponse {
  data: Plant[];
  pagination: Pagination;
}