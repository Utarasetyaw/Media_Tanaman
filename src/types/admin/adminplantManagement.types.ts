export interface LocalizedString {
  id: string;
  en: string;
}

export interface PlantType {
  id: number;
  name: LocalizedString;
}

// ▼▼▼ PERUBAHAN DI SINI ▼▼▼
export interface Store {
  id: number; // Tambahkan ID
  name: string;
  url: string;
  clicks: number; // Tambahkan kolom clicks
}
// ▲▲▲ AKHIR PERUBAHAN ▲▲▲

export interface Plant {
  id: number;
  name: LocalizedString;
  scientificName: string;
  description: LocalizedString;
  imageUrl: string;
  stores: Store[];
  createdAt: string;
  updatedAt: string;
  plantType?: PlantType;
  plantTypeId?: number | null;
}