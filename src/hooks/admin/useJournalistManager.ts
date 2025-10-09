import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Journalist, Article } from '../../types/admin/adminjournalist';
import api from '../../services/apiService';
import { toast } from 'react-hot-toast';

type ArticleStatus = Article['status'];

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

export const useJournalistManager = () => {
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
    const [selectedJournalistId, setSelectedJournalistId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const { data: journalists, isLoading, error } = useQuery<Journalist[]>({
        queryKey: ['journalists'],
        queryFn: fetchJournalists,
    });
    
    const { data: viewingJournalist, isLoading: isLoadingDetail } = useQuery<Journalist>({
        queryKey: ['journalistDetail', selectedJournalistId],
        queryFn: () => fetchJournalistDetail(selectedJournalistId!),
        enabled: !!selectedJournalistId && isArticleModalOpen,
    });

    const createMutation = useMutation({
        mutationFn: createJournalist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journalists'] });
            closeModal();
            toast.success("Jurnalis baru berhasil ditambahkan!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Gagal menambahkan jurnalis.");
        }
    });

    const updateMutation = useMutation({
        mutationFn: updateJournalist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journalists'] });
            queryClient.invalidateQueries({ queryKey: ['journalistDetail', selectedJournalistId] });
            closeModal();
            toast.success("Data jurnalis berhasil diperbarui!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Gagal memperbarui data.");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteJournalist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journalists'] });
            toast.success("Jurnalis berhasil dihapus.");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Gagal menghapus jurnalis.");
        }
    });

    const statusUpdateMutation = useMutation({
        mutationFn: updateArticleStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journalistDetail', selectedJournalistId] });
            queryClient.invalidateQueries({ queryKey: ['journalists'] });
            toast.success("Status artikel berhasil diubah.");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Gagal mengubah status.");
        }
    });

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
        if (!formData.name.trim() || !formData.email.trim()) {
            toast.error("Nama dan Email wajib diisi.");
            return;
        }
        if (!selectedJournalistId && !formData.password.trim()) {
            toast.error("Kata sandi wajib diisi untuk jurnalis baru.");
            return;
        }

        const dataToSave: any = { ...formData };
        if (!dataToSave.password) delete dataToSave.password;

        if (selectedJournalistId) {
            updateMutation.mutate({ id: selectedJournalistId, ...dataToSave });
        } else {
            createMutation.mutate({ ...dataToSave, role: 'JOURNALIST' });
        }
    };
    
    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleStatusChange = (articleId: number, newStatus: ArticleStatus) => {
        let feedback = '';
        if (newStatus === 'NEEDS_REVISION' || newStatus === 'REJECTED') {
            const response = prompt(`Berikan feedback untuk status '${newStatus}':`);
            if (response === null) return; // User membatalkan prompt
            feedback = response || 'Tidak ada feedback.';
        }
        statusUpdateMutation.mutate({ articleId, status: newStatus, feedback });
    };

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