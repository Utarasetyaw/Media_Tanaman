import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../services/apiService';
import { toast } from 'react-hot-toast';
import type { Event, EventFilter } from '../../types/admin/adminEventManagement.types';

// ▼▼▼ PERBAIKAN DI SEMUA PATH API DI BAWAH INI ▼▼▼

const getEvents = (): Promise<Event[]> => api.get('/events/management').then(res => res.data);
const getEventById = (id: number): Promise<Event> => api.get(`/events/management/${id}`).then(res => res.data);
const createEvent = (data: FormData): Promise<Event> => api.post('/events/management', data).then(res => res.data);
const updateEvent = (id: number, data: FormData): Promise<Event> => api.put(`/events/management/${id}`, data).then(res => res.data);
const deleteEvent = (id: number): Promise<void> => api.delete(`/events/management/${id}`);
const setSubmissionPlacement = (submissionId: number, placement: number | null): Promise<any> => 
    api.put(`/events/management/submissions/${submissionId}/placement`, { placement });
    
const initialFormData: Omit<Event, 'id' | 'submissions' | 'externalLinkClicks' | 'createdAt' | 'updatedAt'> = {
    title: { id: '', en: '' },
    description: { id: '', en: '' },
    imageUrl: '',
    location: '',
    organizer: '',
    startDate: '',
    endDate: '',
    eventType: 'EXTERNAL',
    externalUrl: '',
};

export const useEventManager = (eventIdParam?: string) => {
    const navigate = useNavigate();
    const eventId = eventIdParam ? parseInt(eventIdParam, 10) : undefined;
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<any>(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [filter, setFilter] = useState<EventFilter>('ALL');

    const { data: eventsList, isLoading: isLoadingList } = useQuery<Event[], Error>({
        queryKey: ['adminEventsList'],
        queryFn: getEvents,
        enabled: !eventId,
    });

    const { data: detailEvent, isLoading: isLoadingDetail } = useQuery<Event, Error>({
        queryKey: ['adminEventDetail', eventId],
        queryFn: () => getEventById(eventId!),
        enabled: !!eventId,
    });
    
    useEffect(() => {
        if (detailEvent && eventId) {
            setFormData({
              ...detailEvent,
              startDate: format(new Date(detailEvent.startDate), "yyyy-MM-dd'T'HH:mm"),
              endDate: format(new Date(detailEvent.endDate), "yyyy-MM-dd'T'HH:mm"),
            });
        }
    }, [detailEvent, eventId]);

    const commonMutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminEventsList'] });
            if (eventId) {
                queryClient.invalidateQueries({ queryKey: ['adminEventDetail', eventId] });
            }
            navigate('/admin/events');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error || error.message || 'Gagal memproses permintaan.';
            toast.error(`Terjadi kesalahan: ${errorMessage}`);
        },
    };
    
    const createMutation = useMutation({ 
        mutationFn: createEvent, 
        ...commonMutationOptions,
        onSuccess: () => {
            commonMutationOptions.onSuccess();
            toast.success("Event berhasil ditambahkan!");
        }
    });

    const updateMutation = useMutation({ 
        mutationFn: ({ id, data }: { id: number; data: FormData }) => updateEvent(id, data), 
        ...commonMutationOptions,
        onSuccess: () => {
            commonMutationOptions.onSuccess();
            toast.success("Event berhasil diperbarui!");
        }
    });

    const deleteMutation = useMutation({ 
        mutationFn: deleteEvent, 
        ...commonMutationOptions,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminEventsList'] });
            toast.success("Event berhasil dihapus!");
        }
    });

    const setPlacementMutation = useMutation({
        mutationFn: ({ submissionId, placement }: { submissionId: number; placement: number | null }) => setSubmissionPlacement(submissionId, placement),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminEventDetail', eventId] });
            toast.success("Pemenang berhasil diatur!");
        },
        onError: () => toast.error("Gagal mengatur pemenang."),
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleJsonChange = (field: 'title' | 'description', lang: 'id' | 'en', value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
    };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setImageFile(e.target.files[0]);
    };
    const handleRemoveImage = () => {
        setImageFile(null);
        setFormData((prev: any) => ({ ...prev, imageUrl: '' }));
        const fileInput = document.getElementById('event-image-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSave = async (currentId?: string) => {
        if (!formData.title.id || !formData.startDate || !formData.endDate) {
            toast.error("Judul (ID), Tanggal Mulai, dan Tanggal Selesai wajib diisi.");
            return;
        }
        
        const isEditing = !!currentId;
        if (!isEditing && !imageFile) {
            toast.error("Gambar utama wajib diunggah untuk event baru.");
            return;
        }
        
        const fd = new FormData();
        fd.append('title', JSON.stringify(formData.title));
        fd.append('description', JSON.stringify(formData.description));
        fd.append('location', formData.location);
        fd.append('organizer', formData.organizer);
        fd.append('startDate', formData.startDate);
        fd.append('endDate', formData.endDate);
        fd.append('eventType', formData.eventType);
        if (formData.externalUrl) fd.append('externalUrl', formData.externalUrl);
        if (imageFile) fd.append('image', imageFile);

        if (isEditing) {
            updateMutation.mutate({ id: parseInt(currentId!), data: fd });
        } else {
            createMutation.mutate(fd);
        }
    };
    
    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleSetPlacement = (submissionId: number, placementValue: string) => {
        const placement = placementValue === '0' ? null : Number(placementValue);
        setPlacementMutation.mutate({ submissionId, placement });
    };

    const filteredEvents = useMemo(() => {
        if (Array.isArray(eventsList)) {
            return eventsList.filter(event => {
                if (filter === 'ALL') return true;
                return event.eventType === filter;
            });
        }
        return [];
    }, [eventsList, filter]);
    
    const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    return {
        events: filteredEvents,
        isLoadingList,
        filter,
        setFilter,
        handleDelete,
        
        formData, 
        imageFile,
        handleInputChange, 
        handleJsonChange, 
        handleImageChange, 
        handleRemoveImage,
        handleSave,
        isMutating,

        event: detailEvent, 
        isLoadingDetail, 
        handleSetPlacement
    };
};