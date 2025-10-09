import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/apiService';
import type { DashboardData, UserProfile } from '../../types/user/userDashboard.types';
import type { AnnouncementSettings } from '../../types/admin/adminsettings';
import { toast } from 'react-hot-toast';

// --- API Functions ---

const getDashboardData = async (): Promise<DashboardData> => {
    const { data } = await api.get('/users/me/dashboard');
    return data;
};

const getAnnouncements = async (): Promise<AnnouncementSettings> => {
    const { data } = await api.get('/settings/announcements');
    return data;
};

const updateUserProfile = async (profileData: Partial<UserProfile>) => {
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

    const { data: dashboardData, isLoading: isLoadingDashboard, isError, error } = useQuery<DashboardData, Error>({
        queryKey: ['userDashboard'],
        queryFn: getDashboardData,
    });

    const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery<AnnouncementSettings, Error>({
        queryKey: ['announcements'],
        queryFn: getAnnouncements,
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

            return submitOrUpdateEvent({ 
                eventId: variables.eventId, 
                submissionUrl: finalImageUrl,
                submissionNotes: variables.caption 
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userDashboard'] });
            toast.success("Karya berhasil dikirim/diperbarui!");
        },
        onError: (err: any) => {
            const errorMessage = err.response?.data?.error || err.message;
            console.error("Submission Error:", errorMessage);
            toast.error(`Gagal mengirim karya: ${errorMessage}`);
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userDashboard'] });
            toast.success("Profil berhasil diperbarui!");
        },
        onError: (err: any) => {
            const errorMessage = err.response?.data?.error || err.message;
            console.error("Profile Update Error:", errorMessage);
            toast.error(`Gagal memperbarui profil: ${errorMessage}`);
        }
    });

    return {
        dashboardData,
        announcements,
        isLoading: isLoadingDashboard || isLoadingAnnouncements,
        isError,
        error,
        submitMutation,
        updateProfileMutation,
    };
};