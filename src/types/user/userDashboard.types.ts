// Tipe data dasar yang bisa dipakai ulang
export interface LocalizedString {
  id: string;
  en: string;
}

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    address: string | null;
    phoneNumber: string | null;
    socialMedia?: string | null;
}

export interface Submission {
    id: number;
    submissionUrl: string;
    submissionNotes?: string | null;
    placement?: number | null;
    user?: UserProfile;
}

export interface EventDashboard {
    id: number;
    title: LocalizedString;
    imageUrl: string;
    startDate: string;
    endDate: string;
    submission?: Submission | null;
}

export interface DashboardData {
    stats: {
        participated: number;
        open: number;
        upcoming: number;
    };
    openForSubmission: EventDashboard[];
    upcomingEvents: EventDashboard[];
    pastEventsHistory: EventDashboard[];
    isProfileComplete: boolean;
    currentUserProfile: UserProfile;
}