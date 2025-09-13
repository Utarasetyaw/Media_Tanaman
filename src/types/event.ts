export interface LocalizedString {
  id: string;
  en: string;
}

export interface Event {
  id: number;
  title: LocalizedString;
  description: LocalizedString;
  imageUrl: string;
  location: string;
  organizer: string;
  startDate: string; // ISO String date
  endDate: string;   // ISO String date
  eventType: 'INTERNAL' | 'EXTERNAL';
  externalUrl?: string | null;
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface EventsApiResponse {
  data: Event[];
  pagination: Pagination;
}