import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../services/apiService';

// ... TIPE DATA DAN FUNGSI API (tidak ada perubahan) ...
export interface Event {
    id: number;
    title: { id: string; en: string };
    description: { id: string; en: string };
    imageUrl: string;
    location: string;
    organizer: string;
    startDate: string;
    endDate: string;
    eventType: 'INTERNAL' | 'EXTERNAL';
    externalUrl: string;
    submissions?: any[];
    externalLinkClicks?: number;
    createdAt: string;
    updatedAt: string;
}
type EventFilter = 'ALL' | 'INTERNAL' | 'EXTERNAL';
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

const getEvents = (): Promise<Event[]> => api.get('/events/management').then(res => res.data);
const getEventById = (id: number): Promise<Event> => api.get(`/events/management/${id}`).then(res => res.data);
const createEvent = (data: Partial<Event>): Promise<Event> => api.post('/events/management', data).then(res => res.data);
const updateEvent = (id: number, data: Partial<Event>): Promise<Event> => api.put(`/events/management/${id}`, data).then(res => res.data);
const deleteEvent = (id: number): Promise<void> => api.delete(`/events/management/${id}`);
const uploadFile = async (folder: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post(`/upload/${folder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};
const setSubmissionPlacement = (submissionId: number, placement: number | null): Promise<any> => 
    api.put(`/events/management/submissions/${submissionId}/placement`, { placement });


// =================================================================
// HOOK UTAMA
// =================================================================
export const useEventManager = () => {
    const { id } = useParams<{ id: string }>();
    const eventId = id ? parseInt(id, 10) : undefined;
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [formData, setFormData] = useState<any>(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [filter, setFilter] = useState<EventFilter>('ALL');

    const { data: eventsList, isLoading: isLoadingList, isError: isErrorList } = useQuery<Event[], Error>({
        queryKey: ['adminEventsList'],
        queryFn: getEvents,
        enabled: !eventId,
    });

    const { data: detailEvent, isLoading: isLoadingDetail, isError: isErrorDetail } = useQuery<Event, Error>({
        queryKey: ['adminEventDetail', eventId],
        queryFn: () => getEventById(eventId!),
        enabled: !!eventId,
    });

    const commonMutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminEventsList'] });
            if (eventId) {
                queryClient.invalidateQueries({ queryKey: ['adminEventDetail', eventId] });
            }
            closeModal();
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error || error.message || 'Gagal memproses permintaan.';
            console.error(error);
            alert(`Terjadi kesalahan: ${errorMessage}`);
        },
    };
    
    const createMutation = useMutation({ mutationFn: createEvent, ...commonMutationOptions });
    const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<Event> }) => updateEvent(id, data), ...commonMutationOptions });
    const deleteMutation = useMutation({ mutationFn: deleteEvent, ...commonMutationOptions });
    const setPlacementMutation = useMutation({
        mutationFn: ({ submissionId, placement }: { submissionId: number; placement: number | null }) => setSubmissionPlacement(submissionId, placement),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminEventDetail', eventId] });
        },
        onError: () => alert("Gagal mengatur pemenang."),
    });

    const openModal = (event: Event | null = null) => {
        setImageFile(null);
        if (event) {
            setEditingEvent(event);
            setFormData({
              ...event,
              startDate: format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"),
              endDate: format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm"),
            });
        } else {
            setEditingEvent(null);
            setFormData(initialFormData);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleJsonChange = (field: 'title' | 'description', lang: 'id' | 'en', value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
    };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setImageFile(e.target.files[0]);
    };

    const handleSave = async () => {
        if (!formData.title.id || !formData.startDate || !formData.endDate) {
            alert("Judul (ID), Tanggal Mulai, dan Tanggal Selesai wajib diisi.");
            return;
        }
        
        try {
            // REVISI LOGIKA PENENTUAN URL GAMBAR
            let imageUrlForPayload = '';

            if (imageFile) {
                // Jika ada file baru, unggah dan dapatkan path relatifnya.
                const uploadRes = await uploadFile('events', imageFile);
                imageUrlForPayload = uploadRes.imageUrl;
            } else if (editingEvent) {
                // Jika tidak ada file baru saat mengedit, ambil path relatif dari URL yang sudah ada.
                try {
                    const url = new URL(editingEvent.imageUrl);
                    imageUrlForPayload = url.pathname; // Mengambil path seperti "/uploads/events/namafile.webp"
                } catch (e) {
                    console.error("URL gambar tidak valid, menggunakan URL lama:", editingEvent.imageUrl);
                    imageUrlForPayload = editingEvent.imageUrl; // fallback jika parsing gagal
                }
            }

            if (!imageUrlForPayload && !editingEvent) {
                alert("Gambar utama wajib diunggah untuk event baru.");
                return;
            }

            const payload = {
                ...formData,
                imageUrl: imageUrlForPayload, // Gunakan URL yang sudah pasti relatif
            };

            const fieldsToDelete = ['id', 'submissions', 'createdAt', 'updatedAt', 'externalLinkClicks'];
            fieldsToDelete.forEach(field => delete payload[field]);

            if (editingEvent) {
                updateMutation.mutate({ id: editingEvent.id, data: payload });
            } else {
                createMutation.mutate(payload);
            }
        } catch (error) {
            alert(`Gagal menyimpan data: ${(error as Error).message}`);
        }
    };
    
    const handleDelete = (id: number) => {
        if (window.confirm('Yakin ingin menghapus event ini?')) {
            deleteMutation.mutate(id);
        }
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
        isLoadingList, isErrorList, filter, setFilter, isModalOpen,
        editingEvent, formData, imageFile, openModal, closeModal,
        handleInputChange, handleJsonChange, handleImageChange, handleSave, handleDelete,
        event: detailEvent, isLoadingDetail, isErrorDetail, handleSetPlacement, isMutating,
    };
};