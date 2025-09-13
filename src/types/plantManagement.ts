// Tipe data ini spesifik untuk kebutuhan halaman manajemen tanaman

export interface LocalizedString { id: string; en: string; }
export interface Category { id: number; name: LocalizedString; }
export interface PlantType { id: number; name: LocalizedString; }
export interface Store { name: string; url: string; }

export interface Plant {
  id: number;
  name: LocalizedString;
  scientificName: string;
  family: PlantType;
  description: LocalizedString;
  imageUrl: string;
  careLevel: 'Mudah' | 'Sedang' | 'Sulit';
  size: 'Kecil' | 'Sedang' | 'Besar';
  stores: Store[];
  category: Category;
  categoryId: number;
  familyId: number;
}