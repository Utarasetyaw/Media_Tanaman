// src/types/eventManagement.ts
export interface LocalizedString { id: string; en: string; }
export interface Category { id: number; name: LocalizedString; }
export interface PlantType { id: number; name: LocalizedString; }
export interface User { id: number; name: string; email: string; }
export interface Submission { id: number; submissionUrl: string; placement: number | null; user: User; }

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
  externalLinkClicks?: number;
  category: Category;
  plantType?: PlantType | null;
  submissions?: Submission[];
}