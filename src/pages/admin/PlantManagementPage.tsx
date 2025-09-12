import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, PlusCircle } from 'lucide-react'; // <-- Tambahkan PlusCircle untuk toko
import * as api from '../../services/apiAdmin';

// --- Tipe Data ---
interface Category { id: number; name: { id: string; en: string }; }
interface PlantType { id: number; name: { id: string; en: string }; }
interface Store { name: string; url: string; } // <-- Tipe data Store
interface Plant {
  id: number;
  name: { id: string; en: string };
  scientificName: string;
  family: PlantType;
  description: { id: string; en: string };
  imageUrl: string;
  careLevel: 'Mudah' | 'Sedang' | 'Sulit';
  size: 'Kecil' | 'Sedang' | 'Besar';
  stores: Store[]; // <-- Gunakan tipe data Store
  category: Category;
  categoryId: number;
  familyId: number;
}

const initialFormData = {
    name: { id: '', en: '' },
    scientificName: '',
    description: { id: '', en: '' },
    imageUrl: '',
    careLevel: 'Mudah',
    size: 'Sedang',
    stores: [{ name: '', url: '' }], // <-- Default store agar selalu ada 1 field
    categoryId: 0,
    familyId: 0,
};

export const PlantManagementPage: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [plants, setPlants] = useState<Plant[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [plantTypes, setPlantTypes] = useState<PlantType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
    const [formData, setFormData] = useState<any>(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);
    
    // --- DATA FETCHING ---
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [plantsData, categoriesData, plantTypesData] = await Promise.all([
                api.getPlants(),
                api.getCategories(),
                api.getPlantTypes()
            ]);
            setPlants(plantsData);
            setCategories(categoriesData);
            setPlantTypes(plantTypesData);
        } catch (error) {
            console.error("Failed to fetch data", error);
            alert("Gagal memuat data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- MODAL & FORM HANDLERS ---
    const openModal = (plant: Plant | null = null) => {
        setImageFile(null);
        if (plant) {
            setEditingPlant(plant);
            setFormData({
              ...plant,
              categoryId: plant.category.id,
              familyId: plant.family.id,
            });
        } else {
            setEditingPlant(null);
            setFormData(initialFormData);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };
    
    const handleJsonChange = (field: 'name' | 'description', lang: 'id' | 'en', value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: {
                ...prev[field],
                [lang]: value
            }
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    // --- STORE MANAGEMENT ---
    const handleStoreChange = (index: number, field: 'name' | 'url', value: string) => {
        const newStores = [...formData.stores];
        newStores[index] = { ...newStores[index], [field]: value };
        setFormData((prev: any) => ({ ...prev, stores: newStores }));
    };

    const addStoreField = () => {
        setFormData((prev: any) => ({
            ...prev,
            stores: [...prev.stores, { name: '', url: '' }]
        }));
    };

    const removeStoreField = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            stores: prev.stores.filter((_: any, i: number) => i !== index)
        }));
    };
    // --- END STORE MANAGEMENT ---


    const handleSave = async () => {
        if (!formData.name.id || !formData.categoryId || !formData.familyId) {
            alert("Nama (Indonesia), Kategori, dan Tipe Tanaman wajib diisi.");
            return;
        }

        let finalImageUrl = editingPlant?.imageUrl || '';
        
        try {
            if (imageFile) {
                const uploadRes = await api.uploadFile('plants', imageFile);
                finalImageUrl = uploadRes.imageUrl;
            }

            if (!finalImageUrl && !editingPlant?.imageUrl) { // Jika tidak ada gambar dan bukan mode edit (atau edit tapi gambar lama dihapus)
                alert("Gambar utama wajib diunggah.");
                return;
            }

            const payload = {
                ...formData,
                imageUrl: finalImageUrl,
                categoryId: parseInt(formData.categoryId, 10),
                familyId: parseInt(formData.familyId, 10),
                // Filter stores yang kosong sebelum dikirim ke backend
                stores: formData.stores.filter((store: Store) => store.name || store.url),
            };

            if (editingPlant) {
                await api.updatePlant(editingPlant.id, payload);
            } else {
                await api.createPlant(payload);
            }

            closeModal();
            fetchData();
        } catch (error) {
            console.error("Failed to save plant", error);
            alert("Gagal menyimpan data tanaman.");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Yakin ingin menghapus tanaman ini?')) {
            try {
                await api.deletePlant(id);
                fetchData();
            } catch (error) {
                alert("Gagal menghapus tanaman.");
            }
        }
    };

    // --- RENDER ---
    if (isLoading) return <div className="text-center text-gray-300 p-8">Memuat data tanaman...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-lime-200/90">Manajemen Tanaman</h2>
                <button onClick={() => openModal()} className="bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 flex items-center gap-2 transition-colors">
                    <Plus size={20} /> Tambah Tanaman
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plants.map(plant => (
                    <div key={plant.id} className="bg-[#0b5351]/30 border border-lime-400/30 shadow-md rounded-lg overflow-hidden relative">
                        <img src={plant.imageUrl || 'https://placehold.co/600x400/eeeeee/cccccc?text=No+Image'} alt={plant.name.id} className="w-full h-48 object-cover" />
                        <div className="p-4">
                            <h3 className="text-xl font-bold text-gray-200">{plant.name.id || plant.name.en}</h3>
                            <p className="text-sm text-gray-400 italic">{plant.scientificName}</p>
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => openModal(plant)} className="p-2 text-gray-400 hover:text-blue-400 transition-colors" title="Edit"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(plant.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Hapus"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#003938] border-2 border-lime-400/50 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-4 flex justify-between items-center border-b border-lime-400/30">
                            <h3 className="text-2xl font-bold text-gray-200">{editingPlant ? 'Edit Tanaman' : 'Tambah Tanaman Baru'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            {/* Form Fields */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <input type="text" value={formData.name.id} onChange={(e) => handleJsonChange('name', 'id', e.target.value)} placeholder="Nama Tanaman (ID)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                <input type="text" value={formData.name.en} onChange={(e) => handleJsonChange('name', 'en', e.target.value)} placeholder="Nama Tanaman (EN)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                <input type="text" name="scientificName" value={formData.scientificName} onChange={handleInputChange} placeholder="Nama Ilmiah" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                {/* Deskripsi */}
                                <div className='md:col-span-2'>
                                    <textarea value={formData.description.id} onChange={(e) => handleJsonChange('description', 'id', e.target.value)} placeholder="Deskripsi (ID)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" rows={3}></textarea>
                                </div>
                                <div className='md:col-span-2'>
                                    <textarea value={formData.description.en} onChange={(e) => handleJsonChange('description', 'en', e.target.value)} placeholder="Deskripsi (EN)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" rows={3}></textarea>
                                </div>
                                
                                {/* Kategori & Tipe Tanaman */}
                                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200">
                                    <option value={0} disabled>Pilih Kategori</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name.id}</option>)}
                                </select>
                                <select name="familyId" value={formData.familyId} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200">
                                    <option value={0} disabled>Pilih Tipe Tanaman (Family)</option>
                                    {plantTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name.id}</option>)}
                                </select>
                                
                                {/* Care Level & Size */}
                                <select name="careLevel" value={formData.careLevel} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"><option value="Mudah">Perawatan: Mudah</option><option value="Sedang">Perawatan: Sedang</option><option value="Sulit">Perawatan: Sulit</option></select>
                                <select name="size" value={formData.size} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"><option value="Kecil">Ukuran: Kecil</option><option value="Sedang">Ukuran: Sedang</option><option value="Besar">Ukuran: Besar</option></select>
                                
                                {/* Gambar Utama */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Gambar Utama</label>
                                    {(editingPlant?.imageUrl && !imageFile) && ( // Tampilkan gambar lama jika ada dan belum ada gambar baru di-upload
                                        <div className="mb-2">
                                            <img src={editingPlant.imageUrl} alt="Current Plant" className="w-32 h-32 object-cover rounded-md border border-lime-400/50 p-1" />
                                        </div>
                                    )}
                                    {imageFile && ( // Tampilkan pratinjau gambar baru jika ada
                                        <div className="mb-2">
                                            <img src={URL.createObjectURL(imageFile)} alt="New Plant Preview" className="w-32 h-32 object-cover rounded-md border border-lime-400/50 p-1" />
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-200/20 file:text-lime-300 hover:file:bg-lime-200/30 cursor-pointer"/>
                                </div>

                                {/* Toko Penjual */}
                                <div className="md:col-span-2">
                                    <h4 className="text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2 mb-3">Toko Penjual</h4>
                                    {formData.stores.map((store: Store, index: number) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={store.name}
                                                onChange={(e) => handleStoreChange(index, 'name', e.target.value)}
                                                placeholder="Nama Toko"
                                                className="w-1/2 px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"
                                            />
                                            <input
                                                type="text"
                                                value={store.url}
                                                onChange={(e) => handleStoreChange(index, 'url', e.target.value)}
                                                placeholder="URL Toko"
                                                className="w-1/2 px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"
                                            />
                                            {formData.stores.length > 1 && ( // Hanya tampilkan tombol hapus jika ada lebih dari 1 toko
                                                <button onClick={() => removeStoreField(index)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={18}/></button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={addStoreField} className="mt-2 flex items-center gap-2 text-sm font-semibold text-lime-300 hover:text-lime-200">
                                        <PlusCircle size={16}/> Tambah Toko
                                    </button>
                                </div>
                            </div> {/* End of grid */}
                        </div>
                        <div className="p-4 flex justify-end gap-3 border-t border-lime-400/30">
                            <button onClick={closeModal} className="bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Batal</button>
                            <button onClick={handleSave} className="bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500">Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};