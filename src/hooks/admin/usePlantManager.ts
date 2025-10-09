import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/apiService';
import type { Plant, PlantType, Store } from '../../types/admin/adminplantManagement.types';
import { toast } from 'react-hot-toast';

// --- FUNGSI-FUNGSI API ---
const getPlants = async (): Promise<Plant[]> => api.get('/plants/management').then(res => res.data);
const getPlantById = async (id: number): Promise<Plant> => api.get(`/plants/management/${id}`).then(res => res.data);
const getPlantTypes = async (): Promise<PlantType[]> => api.get('/plant-types').then(res => res.data);
const createPlant = async (plantData: FormData): Promise<Plant> => api.post('/plants/management', plantData).then(res => res.data);
const updatePlant = async (id: number, plantData: FormData): Promise<Plant> => api.put(`/plants/management/${id}`, plantData).then(res => res.data);
const deletePlant = async (id: number): Promise<void> => api.delete(`/plants/management/${id}`);

// --- HOOK UTAMA ---
const initialFormData: Partial<Plant> = {
    name: { id: '', en: '' },
    scientificName: '',
    description: { id: '', en: '' },
    imageUrl: '',
    stores: [{ id: 0, name: '', url: '', clicks: 0 }],
    plantTypeId: 0,
};

export const usePlantManager = (plantId?: string) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const id = plantId ? parseInt(plantId) : undefined;

    const [formData, setFormData] = useState<Partial<Plant>>(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const { data: listData, isLoading: isLoadingList } = useQuery({
        queryKey: ['plantManagementList'],
        queryFn: async () => {
            const [plants, plantTypes] = await Promise.all([ getPlants(), getPlantTypes() ]);
            return { plants, plantTypes };
        },
        enabled: !id,
    });

    const { data: editorData, isLoading: isLoadingEditor } = useQuery({
        queryKey: ['plantManagementEditor', id],
        queryFn: async () => {
            const [plant, plantTypes] = await Promise.all([ getPlantById(id!), getPlantTypes() ]);
            return { plant, plantTypes };
        },
        enabled: !!id,
    });
    
    const { data: viewingPlant, isLoading: isLoadingDetail } = useQuery({
        queryKey: ['plantDetail', id],
        queryFn: () => getPlantById(id!),
        enabled: !!id,
    });

    useEffect(() => {
        if (editorData?.plant) {
            setFormData({
                ...editorData.plant,
                stores: Array.isArray(editorData.plant.stores) && editorData.plant.stores.length > 0 ? editorData.plant.stores : [{ id: 0, name: '', url: '', clicks: 0 }],
                plantTypeId: editorData.plant.plantType?.id || 0,
            });
        }
    }, [editorData]);

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plantManagementList'] });
            navigate('/admin/plants');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error || error.message || 'Error tidak diketahui';
            toast.error(`Gagal: ${errorMessage}`);
        },
    };

    const createMutation = useMutation({ mutationFn: createPlant, ...mutationOptions, onSuccess: () => { mutationOptions.onSuccess(); toast.success('Tanaman berhasil ditambahkan!'); }});
    const updateMutation = useMutation({ mutationFn: (payload: { id: number, data: FormData }) => updatePlant(payload.id, payload.data), ...mutationOptions, onSuccess: () => { mutationOptions.onSuccess(); toast.success('Tanaman berhasil diperbarui!'); }});
    const deleteMutation = useMutation({ mutationFn: deletePlant, ...mutationOptions, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['plantManagementList'] }); toast.success('Tanaman berhasil dihapus!'); }});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleJsonChange = (field: 'name' | 'description', lang: 'id' | 'en', value: string) => setFormData(prev => ({ ...prev, [field]: { ...(prev[field] as object), [lang]: value } }));
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); };
    
    const handleStoreChange = (index: number, field: 'name' | 'url', value: string) => {
        const newStores = [...(formData.stores || [])];
        newStores[index] = { ...newStores[index], id: newStores[index]?.id || 0, clicks: newStores[index]?.clicks || 0, [field]: value };
        setFormData(prev => ({ ...prev, stores: newStores }));
    };

    const addStoreField = () => setFormData(prev => ({ ...prev, stores: [...(prev.stores || []), { id: 0, name: '', url: '', clicks: 0 }] }));
    const removeStoreField = (index: number) => setFormData(prev => ({ ...prev, stores: (prev.stores || []).filter((_, i) => i !== index) }));

    const handleSave = async (currentId?: string) => {
        if (!formData.name?.id || !formData.plantTypeId) {
            toast.error("Nama (Indonesia) dan Tipe Tanaman wajib diisi.");
            return;
        }
        if (!currentId && !imageFile) {
            toast.error("Gambar utama wajib diunggah untuk tanaman baru.");
            return;
        }
        
        const fd = new FormData();
        fd.append('name', JSON.stringify(formData.name));
        fd.append('scientificName', formData.scientificName || '');
        fd.append('description', JSON.stringify(formData.description || { id: '', en: '' }));
        fd.append('plantTypeId', String(formData.plantTypeId));

        const validStores = (formData.stores || [])
            .filter((store: Store) => store.name && store.url)
            .map(({ name, url }) => ({ name, url }));
        
        fd.append('stores', JSON.stringify(validStores));
        if (imageFile) fd.append('image', imageFile);

        if (currentId) {
            updateMutation.mutate({ id: parseInt(currentId), data: fd });
        } else {
            createMutation.mutate(fd);
        }
    };
    
    const handleDelete = (id: number) => deleteMutation.mutate(id);

    return {
        plants: listData?.plants || [],
        isLoading: isLoadingList || isLoadingEditor || isLoadingDetail,
        handleDelete,
        formData, 
        imageFile,
        plantTypes: listData?.plantTypes || editorData?.plantTypes || [],
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
        handleInputChange, 
        handleJsonChange, 
        handleImageChange,
        handleStoreChange, 
        addStoreField, 
        removeStoreField,
        handleSave,
        viewingPlant
    };
};