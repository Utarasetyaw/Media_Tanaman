import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/apiService';

// --- Type Definitions ---

interface SubmissionInfo {
    id: number;
    submissionUrl: string;
    submissionNotes?: string | null;
    placement?: number | null;
}

export interface EventDashboard {
    id: number;
    title: { id: string; en: string };
    imageUrl: string;
    startDate: string;
    endDate: string;
    submission?: SubmissionInfo | null;
}

interface UserProfile {
    address: string | null;
    phoneNumber: string | null;
    socialMedia?: string | null;
}

interface DashboardData {
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


// --- API Functions ---

const getDashboardData = async (): Promise<DashboardData> => {
    const { data } = await api.get('/users/me/dashboard');
    return data;
};

const updateUserProfile = async (profileData: UserProfile) => {
    const { data } = await api.put('/users/me/profile', profileData);
    return data;
};

const submitOrUpdateEvent = async ({ eventId, submissionUrl, submissionNotes }: { eventId: number; submissionUrl: string; submissionNotes?: string }) => {
    const { data } = await api.post(`/events/${eventId}/submissions`, { submissionUrl, submissionNotes });
    return data;
};

const uploadFile = async (folder: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post(`/upload/${folder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};


// --- Main Custom Hook ---
export const useUserDashboard = () => {
    const queryClient = useQueryClient();
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const { data, isLoading, isError, error } = useQuery<DashboardData, Error>({
        queryKey: ['userDashboard'],
        queryFn: getDashboardData,
    });

    const submitMutation = useMutation({
        mutationFn: async (variables: { eventId: number; file?: File | null; caption?: string; currentImageUrl?: string }) => {
            let finalImageUrl = variables.currentImageUrl;

            if (variables.file) {
                const uploadRes = await uploadFile('submissions', variables.file);
                finalImageUrl = uploadRes.imageUrl;
            }

            if (!finalImageUrl) {
                throw new Error("Gambar wajib diunggah untuk pengiriman pertama.");
            }

            // REVISI: Ubah kembali menjadi path relatif sebelum dikirim ke backend
            let relativeImageUrl = finalImageUrl;
            if (relativeImageUrl.startsWith(API_BASE_URL)) {
                // Ini akan menghapus "http://localhost:5000" dari URL
                relativeImageUrl = relativeImageUrl.substring(API_BASE_URL.length);
            }

            return submitOrUpdateEvent({ 
                eventId: variables.eventId, 
                submissionUrl: relativeImageUrl, // Kirim path relatif
                submissionNotes: variables.caption 
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userDashboard'] });
            alert("Karya berhasil dikirim/diperbarui!");
        },
        onError: (err: any) => {
            const errorMessage = err.response?.data?.error || err.message;
            console.error("Submission Error:", errorMessage);
            alert(`Gagal mengirim karya: ${errorMessage}`);
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userDashboard'] });
            alert("Profil berhasil diperbarui!");
        },
        onError: (err: any) => {
            const errorMessage = err.response?.data?.error || err.message;
            console.error("Profile Update Error:", errorMessage);
            alert(`Gagal memperbarui profil: ${errorMessage}`);
        }
    });

    return {
        dashboardData: data,
        isLoading,
        isError,
        error,
        submitMutation,
        updateProfileMutation,
    };
};