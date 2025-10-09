// Tipe data dasar untuk teks dalam dua bahasa
export interface LocalizedString {
  id: string;
  en: string;
}

// Tipe untuk data user yang melakukan submission
export interface SubmissionUser {
    id: number;
    name: string;
    email: string;
    // ▼▼▼ TAMBAHKAN DETAIL INI ▼▼▼
    phoneNumber: string | null;
    address: string | null;
    socialMedia: string | null;
}

// Tipe untuk setiap item submission dalam sebuah event
export interface EventSubmission {
    id: number;
    submissionUrl: string;
    submissionNotes: string | null;
    placement: number | null;
    createdAt: string;
    user: SubmissionUser;
}

// Tipe data utama untuk sebuah Event
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
    externalUrl: string | null;
    submissions: EventSubmission[];
    externalLinkClicks: number;
    createdAt: string;
    updatedAt: string;
}

// Tipe untuk filter di halaman manajemen event
export type EventFilter = 'ALL' | 'INTERNAL' | 'EXTERNAL';