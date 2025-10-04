import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Journalist, Article } from '../../types/admin/adminjournalist';
import api from '../../services/apiService'; // Kita tetap butuh 'api' dasar

type ArticleStatus = Article['status'];

// =================================================================
// --- FUNGSI-FUNGSI API (Sekarang ada di dalam file ini) ---
// =================================================================

const fetchJournalists = async (): Promise<Journalist[]> => {
    const { data } = await api.get('/users?role=JOURNALIST');
    return data;
};

const fetchJournalistDetail = async (id: number): Promise<Journalist> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
};

const createJournalist = async (journalistData: Partial<Journalist>): Promise<Journalist> => {
    const { data } = await api.post('/users', journalistData);
    return data;
};

const updateJournalist = async (journalistData: Partial<Journalist> & { id: number }): Promise<Journalist> => {
    const { id, ...updateData } = journalistData;
    const { data } = await api.put(`/users/${id}`, updateData);
    return data;
};

const deleteJournalist = async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
};

const updateArticleStatus = async (
    { articleId, status, feedback }: { articleId: number; status: ArticleStatus; feedback?: string }
): Promise<any> => {
    const { data } = await api.put(`/articles/management/${articleId}/status`, { status, feedback });
    return data;
};


// =================================================================
// --- HOOK UTAMA ---
// =================================================================
export const useJournalistManager = () => {
    const queryClient = useQueryClient();

    // --- State Management ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
    const [selectedJournalistId, setSelectedJournalistId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    // --- Data Fetching (Queries) ---
    const { data: journalists, isLoading, error } = useQuery<Journalist[]>({
        queryKey: ['journalists'],
        queryFn: fetchJournalists, // Memanggil fungsi lokal
    });
    
    const { data: viewingJournalist, isLoading: isLoadingDetail } = useQuery<Journalist>({
        queryKey: ['journalistDetail', selectedJournalistId],
        queryFn: () => fetchJournalistDetail(selectedJournalistId!),
        enabled: !!selectedJournalistId && isArticleModalOpen,
    });

    // --- Data Manipulation (Mutations) ---
    const createMutation = useMutation({
        mutationFn: createJournalist, // Memanggil fungsi lokal
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journalists'] });
            closeModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateJournalist, // Memanggil fungsi lokal
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journalists'] });
            queryClient.invalidateQueries({ queryKey: ['journalistDetail', selectedJournalistId] });
            closeModal();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteJournalist, // Memanggil fungsi lokal
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journalists'] });
        },
    });

    const statusUpdateMutation = useMutation({
        mutationFn: updateArticleStatus, // Memanggil fungsi lokal
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journalistDetail', selectedJournalistId] });
            queryClient.invalidateQueries({ queryKey: ['journalists'] });
        }
    });

    // --- Handlers ---
    const openModal = (journalist: Journalist | null = null) => {
        setSelectedJournalistId(journalist ? journalist.id : null);
        setFormData({ name: journalist?.name || '', email: journalist?.email || '', password: '' });
        setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);
    
    const openArticleModal = (id: number) => {
        setSelectedJournalistId(id);
        setIsArticleModalOpen(true);
    };
    const closeArticleModal = () => setIsArticleModalOpen(false);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = () => {
        const dataToSave: any = { ...formData };
        if (!dataToSave.password) delete dataToSave.password;

        if (selectedJournalistId) {
            updateMutation.mutate({ id: selectedJournalistId, ...dataToSave });
        } else {
            createMutation.mutate({ ...dataToSave, role: 'JOURNALIST' });
        }
    };
    
    const handleDelete = (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus jurnalis ini? Semua artikelnya juga akan terhapus.')) {
            deleteMutation.mutate(id);
        }
    };

    const handleStatusChange = (articleId: number, newStatus: ArticleStatus) => {
        let feedback = '';
        if (newStatus === 'NEEDS_REVISION' || newStatus === 'REJECTED') {
            feedback = prompt(`Berikan feedback untuk status '${newStatus}':`) || 'Tidak ada feedback.';
        }
        statusUpdateMutation.mutate({ articleId, status: newStatus, feedback });
    };

    // --- Return values ---
    return {
        journalists,
        isLoading,
        error,
        viewingJournalist,
        isLoadingDetail,
        isModalOpen,
        isArticleModalOpen,
        selectedJournalistId,
        formData,
        openModal,
        closeModal,
        openArticleModal,
        closeArticleModal,
        handleInputChange,
        handleSave,
        handleDelete,
        handleStatusChange,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || statusUpdateMutation.isPending,
    };
};