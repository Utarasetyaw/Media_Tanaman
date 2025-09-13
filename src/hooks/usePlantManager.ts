import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/apiService';
import type { Plant, Category, PlantType, Store } from '../types/plantManagement';

// =================================================================
// --- FUNGSI-FUNGSI API ---
// =================================================================
const getPlants = async (): Promise<Plant[]> => {
    const { data } = await api.get('/plants/management');
    return data;
};
const getCategories = async (): Promise<Category[]> => {
    const { data } = await api.get('/categories');
    return data;
};
const getPlantTypes = async (): Promise<PlantType[]> => {
    const { data } = await api.get('/plant-types');
    return data;
};
const createPlant = async (plantData: Partial<Plant>): Promise<Plant> => {
    const { data } = await api.post('/plants/management', plantData);
    return data;
};
const updatePlant = async (id: number, plantData: Partial<Plant>): Promise<Plant> => {
    const { data } = await api.put(`/plants/management/${id}`, plantData);
    return data;
};
const deletePlant = async (id: number): Promise<void> => {
    await api.delete(`/plants/management/${id}`);
};

// REVISI 1: Perbaiki URL upload agar dinamis
const uploadFile = async (folder: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    // URL dinamis, contoh: /upload/plants
    const { data } = await api.post(`/upload/${folder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

// =================================================================
// --- HOOK UTAMA ---
// =================================================================
const initialFormData: Partial<Plant> = {
    name: { id: '', en: '' },
    scientificName: '',
    description: { id: '', en: '' },
    imageUrl: '',
    careLevel: 'Mudah',
    size: 'Sedang',
    stores: [{ name: '', url: '' }],
    categoryId: 0,
    familyId: 0,
};

export const usePlantManager = () => {
    const queryClient = useQueryClient();

    // --- State Management ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
    const [viewingPlant, setViewingPlant] = useState<Plant | null>(null);
    const [formData, setFormData] = useState<Partial<Plant>>(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // --- Data Fetching (Query) ---
    const { data, isLoading, isError } = useQuery({
        queryKey: ['plantManagementData'],
        queryFn: async () => {
            const [plants, categories, plantTypes] = await Promise.all([
                getPlants(),
                getCategories(),
                getPlantTypes(),
            ]);
            return { plants, categories, plantTypes };
        },
    });

    useEffect(() => {
        if (editingPlant && data?.plants) {
            const freshPlantData = data.plants.find(p => p.id === editingPlant.id);
            if (freshPlantData) setEditingPlant(freshPlantData);
        }
    }, [data, editingPlant]);

    // --- Data Manipulation (Mutations) ---
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plantManagementData'] });
            closeEditModal();
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error || error.message || 'Error tidak diketahui';
            console.error("Mutation failed", error);
            alert(`Gagal menyimpan data: ${errorMessage}`);
        },
    };

    const createMutation = useMutation({ mutationFn: createPlant, ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (payload: { id: number, data: Partial<Plant> }) => updatePlant(payload.id, payload.data), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: deletePlant, ...mutationOptions });

    // --- Handlers ---
    const openEditModal = (plant: Plant | null = null) => {
        setImageFile(null);
        if (plant) {
            setEditingPlant(plant);
            setFormData({
              ...plant,
              categoryId: plant.category?.id || 0,
              familyId: plant.family?.id || 0,
            });
        } else {
            setEditingPlant(null);
            setFormData(initialFormData);
        }
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => setIsEditModalOpen(false);

    const openDetailModal = (plant: Plant) => {
        setViewingPlant(plant);
        setIsDetailModalOpen(true);
    };
    const closeDetailModal = () => setIsDetailModalOpen(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleJsonChange = (field: 'name' | 'description', lang: 'id' | 'en', value: string) => {
        setFormData(prev => ({ ...prev, [field]: { ...(prev[field] as object), [lang]: value } }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleStoreChange = (index: number, field: 'name' | 'url', value: string) => {
        const newStores = [...(formData.stores || [])];
        newStores[index] = { ...newStores[index], [field]: value };
        setFormData(prev => ({ ...prev, stores: newStores }));
    };

    const addStoreField = () => {
        setFormData(prev => ({ ...prev, stores: [...(prev.stores || []), { name: '', url: '' }] }));
    };



    const removeStoreField = (index: number) => {
        setFormData(prev => ({ ...prev, stores: (prev.stores || []).filter((_, i) => i !== index) }));
    };

    // REVISI 2: Bersihkan payload sebelum dikirim ke backend
    const handleSave = async () => {
        if (!formData.name?.id || !formData.categoryId || !formData.familyId) {
            alert("Nama (Indonesia), Kategori, dan Tipe Tanaman wajib diisi.");
            return;
        }
        let finalImageUrl = editingPlant?.imageUrl || formData.imageUrl;
        try {
            if (imageFile) {
                // Memanggil fungsi uploadFile yang sudah diperbaiki
                const uploadRes = await uploadFile('plants', imageFile);
                finalImageUrl = uploadRes.imageUrl;
            }
            if (!finalImageUrl) throw new Error("Gambar utama wajib diunggah.");

            const payload: Partial<Plant> = {
                ...formData,
                imageUrl: finalImageUrl,
                categoryId: parseInt(String(formData.categoryId), 10),
                familyId: parseInt(String(formData.familyId), 10),
                stores: (formData.stores || []).filter((store: Store) => store.name && store.url),
            };

            // Hapus properti objek relasi yang tidak dibutuhkan backend untuk update
            delete payload.id;
            delete payload.category;
            delete payload.family;

            if (editingPlant) {
                updateMutation.mutate({ id: editingPlant.id, data: payload });
            } else {
                createMutation.mutate(payload);
            }
        } catch (error) {
            console.error("Failed to save plant", error);
            alert(`Gagal menyimpan data: ${(error as Error).message}`);
        }
    };
    
    const handleDelete = (id: number) => {
        if (window.confirm('Yakin ingin menghapus tanaman ini?')) {
            deleteMutation.mutate(id);
        }
    };

    return {
        plants: data?.plants || [],
        categories: data?.categories || [],
        plantTypes: data?.plantTypes || [],
        isLoading,
        isError,
        isEditModalOpen,
        isDetailModalOpen,
        editingPlant,
        viewingPlant,
        formData,
        imageFile,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
        openEditModal,
        closeEditModal,
        openDetailModal,
        closeDetailModal,
        handleInputChange,
        handleJsonChange,
        handleImageChange,
        handleStoreChange,
        addStoreField,
        removeStoreField,
        handleSave,
        handleDelete
    };
};