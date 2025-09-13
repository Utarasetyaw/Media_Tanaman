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

// 1. Definisikan tipe untuk data profil pengguna
interface UserProfile {
    address: string | null;
    phoneNumber: string | null;
    socialMedia?: string | null;
}

// 2. Perbarui interface DashboardData
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
    currentUserProfile: UserProfile; // Data untuk pre-fill form di modal
}


// --- API Functions ---

const getDashboardData = async (): Promise<DashboardData> => {
    const { data } = await api.get('/users/me/dashboard');
    return data;
};

// 3. Buat fungsi API baru untuk update profil
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

    // Query untuk fetching semua data dashboard
    const { data, isLoading, isError, error } = useQuery<DashboardData, Error>({
        queryKey: ['userDashboard'],
        queryFn: getDashboardData,
    });

    // Mutation untuk submit/update karya event
    const submitMutation = useMutation({
        mutationFn: async (variables: { eventId: number; file?: File | null; caption?: string; currentImageUrl?: string }) => {
            let finalImageUrl = variables.currentImageUrl;
            if (variables.file) {
                const uploadRes = await uploadFile('submissions', variables.file);
                finalImageUrl = uploadRes.imageUrl;
            }
            if (!finalImageUrl) {
                throw new Error("A file must be uploaded for the first submission.");
            }
            return submitOrUpdateEvent({ 
                eventId: variables.eventId, 
                submissionUrl: finalImageUrl, 
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

    // 4. Tambahkan mutation baru untuk update profil
    const updateProfileMutation = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            // Setelah berhasil, refetch data dashboard agar notifikasi hilang & tombol aktif
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
        updateProfileMutation, // <-- 5. Ekspor mutation baru
    };
};