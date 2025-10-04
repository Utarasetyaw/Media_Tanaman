// Tipe data dasar untuk teks dalam dua bahasa
export interface LocalizedString {
  id: string;
  en: string;
}

// Tipe data utama untuk objek Event di halaman detail publik
export interface Event {
  id: number;
  title: LocalizedString;
  description: LocalizedString;
  imageUrl: string;
  location: string;
  organizer: string;
  startDate: string;
  endDate: string;
  eventType: 'INTERNAL' | 'EXTERNAL';
  externalUrl?: string | null;
}