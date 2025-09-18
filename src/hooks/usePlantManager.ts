import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/apiService';
// DIUBAH: Hapus 'Category' dari import
import type { Plant, PlantType, Store } from '../types/plantManagement';

// =================================================================
// --- FUNGSI-FUNGSI API ---
// =================================================================
const getPlants = async (): Promise<Plant[]> => {
    const { data } = await api.get('/plants/management');
    return data;
};
// DIHAPUS: Fungsi getCategories tidak diperlukan lagi
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
const uploadFile = async (folder: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
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
    // DIHAPUS: categoryId
    familyId: 0,
};

export const usePlantManager = () => {
    const queryClient = useQueryClient();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
    const [viewingPlant, setViewingPlant] = useState<Plant | null>(null);
    const [formData, setFormData] = useState<Partial<Plant>>(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['plantManagementData'],
        queryFn: async () => {
            // DIUBAH: Hanya fetch plants dan plantTypes
            const [plants, plantTypes] = await Promise.all([
                getPlants(),
                getPlantTypes(),
            ]);
            // DIUBAH: Kembalikan data tanpa categories
            return { plants, plantTypes };
        },
    });

    useEffect(() => {
        if (editingPlant && data?.plants) {
            const freshPlantData = data.plants.find(p => p.id === editingPlant.id);
            if (freshPlantData) setEditingPlant(freshPlantData);
        }
    }, [data, editingPlant]);

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

    const openEditModal = (plant: Plant | null = null) => {
        setImageFile(null);
        if (plant) {
            setEditingPlant(plant);
            const storesAsArray = Array.isArray(plant.stores) ? plant.stores : [{ name: '', url: '' }];
            setFormData({
              ...plant,
              stores: storesAsArray,
              // DIHAPUS: categoryId
              familyId: plant.family?.id || 0,
            });
        } else {
            setEditingPlant(null);
            setFormData(initialFormData);
        }
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => setIsEditModalOpen(false);
    const openDetailModal = (plant: Plant) => { setViewingPlant(plant); setIsDetailModalOpen(true); };
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

    const handleSave = async () => {
        // DIUBAH: Hapus validasi untuk categoryId
        if (!formData.name?.id || !formData.familyId) {
            alert("Nama (Indonesia) dan Tipe Tanaman wajib diisi.");
            return;
        }
        
        let imageUrlForPayload = '';
        try {
            if (imageFile) {
                const uploadRes = await uploadFile('plants', imageFile);
                imageUrlForPayload = uploadRes.imageUrl;
            } else if (editingPlant?.imageUrl) {
                const url = new URL(editingPlant.imageUrl);
                imageUrlForPayload = url.pathname;
            }

            if (!imageUrlForPayload) throw new Error("Gambar utama wajib diunggah.");

            const payload: Partial<Plant> = {
                ...formData,
                imageUrl: imageUrlForPayload,
                // DIHAPUS: categoryId
                familyId: parseInt(String(formData.familyId), 10),
                stores: (formData.stores || []).filter((store: Store) => store.name && store.url),
            };

            // DIHAPUS: category dan categoryId dari payload
            delete payload.id;
            delete payload.category;
            delete payload.categoryId;
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
        // DIHAPUS: categories tidak lagi diekspor
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