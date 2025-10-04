export interface LocalizedString {
  id: string;
  en: string;
}

export interface PlantType {
  id: number;
  name: LocalizedString;
}

export interface Store {
  name: string;
  url: string;
}

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