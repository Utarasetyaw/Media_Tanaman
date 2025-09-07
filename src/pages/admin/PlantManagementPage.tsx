import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Eye, EyeOff, PlusCircle, Image as ImageIcon } from 'lucide-react';

// Tipe data untuk Toko dan Tanaman
interface Store {
    name: string;
    url: string;
}

interface Plant {
    id: number;
    name: string;
    scientificName: string;
    family: string;
    description: string;
    imageUrls: string[]; // Mengganti imageUrl tunggal dengan array
    careLevel: 'Mudah' | 'Sedang' | 'Sulit';
    size: 'Kecil' | 'Sedang' | 'Besar';
    stores: Store[];
    isVisible: boolean;
}

// Data awal sebagai contoh
const initialPlants: Plant[] = [
    {
        id: 1,
        name: "Lidah Mertua",
        scientificName: "Sansevieria trifasciata",
        family: "Asparagaceae",
        description: "Tanaman sukulen yang sangat populer karena perawatannya yang mudah dan kemampuannya membersihkan udara. Tahan terhadap berbagai kondisi, menjadikannya pilihan ideal untuk pemula.",
        imageUrls: ["https://placehold.co/600x400/a2e1a2/4a5568?text=Lidah+Mertua+1", "https://placehold.co/600x400/a2e1a2/4a5568?text=Lidah+Mertua+2"],
        careLevel: 'Mudah',
        size: 'Sedang',
        stores: [
          { name: 'Urban Gardening', url: 'https://gardening.id/' },
          { name: 'Lucknow Nursery', url: 'https://lucknownursery.com/' },
        ],
        isVisible: true,
    },
    {
        id: 2,
        name: "Monstera Deliciosa",
        scientificName: "Monstera deliciosa",
        family: "Araceae",
        description: "Dikenal juga sebagai tanaman keju Swiss, tanaman ini memiliki daun besar yang unik dan berlubang. Populer sebagai tanaman hias indoor yang memberikan nuansa tropis.",
        imageUrls: ["https://placehold.co/600x400/a2e1a2/4a5568?text=Monstera"],
        careLevel: 'Sedang',
        size: 'Besar',
        stores: [
          { name: 'Toko Tanaman Hijau', url: 'https://example.com' },
        ],
        isVisible: false,
    },
];

export const PlantManagementPage: React.FC = () => {
    const [plants, setPlants] = useState<Plant[]>(initialPlants);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
    
    // State untuk form di dalam modal
    const [formData, setFormData] = useState<Omit<Plant, 'id'>>({
        name: '', scientificName: '', family: '', description: '', imageUrls: [],
        careLevel: 'Mudah', size: 'Sedang', stores: [{ name: '', url: '' }], isVisible: true
    });
    // State untuk file gambar yang baru diupload
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

    const openModal = (plant: Plant | null = null) => {
        setNewImageFiles([]); // Selalu reset file baru saat modal dibuka
        if (plant) {
            setEditingPlant(plant);
            setFormData(plant);
        } else {
            setEditingPlant(null);
            setFormData({
                name: '', scientificName: '', family: '', description: '', imageUrls: [],
                careLevel: 'Mudah', size: 'Sedang', stores: [{ name: '', url: '' }], isVisible: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeExistingImage = (urlToRemove: string) => {
        setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter(url => url !== urlToRemove) }));
    };

    const removeNewImage = (fileToRemove: File) => {
        setNewImageFiles(prev => prev.filter(file => file !== fileToRemove));
    };

    const handleStoreChange = (index: number, field: 'name' | 'url', value: string) => {
        const newStores = [...formData.stores];
        newStores[index][field] = value;
        setFormData(prev => ({ ...prev, stores: newStores }));
    };

    const addStoreField = () => setFormData(prev => ({ ...prev, stores: [...prev.stores, { name: '', url: '' }] }));
    const removeStoreField = (index: number) => setFormData(prev => ({ ...prev, stores: prev.stores.filter((_, i) => i !== index) }));

    const handleSave = () => {
        // Di aplikasi nyata, Anda akan mengunggah file ke server dan mendapatkan URL
        // Untuk contoh ini, kita gunakan blob URL untuk pratinjau
        const newImageUrls = newImageFiles.map(file => URL.createObjectURL(file));
        const updatedFormData = { ...formData, imageUrls: [...formData.imageUrls, ...newImageUrls] };

        if (editingPlant) {
            setPlants(plants.map(p => p.id === editingPlant.id ? { ...updatedFormData, id: p.id } : p));
        } else {
            const newPlant: Plant = { ...updatedFormData, id: Date.now() };
            setPlants([...plants, newPlant]);
        }
        closeModal();
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Yakin ingin menghapus tanaman ini?')) {
            setPlants(plants.filter(p => p.id !== id));
        }
    };

    const toggleVisibility = (id: number) => {
        setPlants(plants.map(p => p.id === id ? { ...p, isVisible: !p.isVisible } : p));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Manajemen Tanaman</h2>
                <button onClick={() => openModal()} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <Plus size={20} /> Tambah Tanaman
                </button>
            </div>

            {/* Grid Kartu Tanaman */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plants.map(plant => (
                    <div key={plant.id} className="bg-white shadow-md rounded-lg overflow-hidden relative">
                        {!plant.isVisible && <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center"><span className="text-white font-bold bg-black bg-opacity-60 px-3 py-1 rounded">Disembunyikan</span></div>}
                        <img src={plant.imageUrls[0] || 'https://placehold.co/600x400/eeeeee/cccccc?text=No+Image'} alt={plant.name} className="w-full h-48 object-cover" />
                        {plant.imageUrls.length > 1 && <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><ImageIcon size={12}/> {plant.imageUrls.length}</div>}
                        <div className="p-4">
                            <h3 className="text-xl font-bold">{plant.name}</h3>
                            <p className="text-sm text-gray-500 italic">{plant.scientificName}</p>
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => toggleVisibility(plant.id)} className="p-2 text-gray-500 hover:text-blue-600" title={plant.isVisible ? 'Sembunyikan' : 'Tampilkan'}>{plant.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                                <button onClick={() => openModal(plant)} className="p-2 text-gray-500 hover:text-indigo-600" title="Edit"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(plant.id)} className="p-2 text-gray-500 hover:text-red-600" title="Hapus"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Tambah/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 sticky top-0 bg-white border-b z-10"><button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X size={24} /></button><h3 className="text-2xl font-bold">{editingPlant ? 'Edit Tanaman' : 'Tambah Tanaman Baru'}</h3></div>
                        <div className="p-6 space-y-4">
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nama Tanaman" className="w-full border p-2 rounded"/>
                            <input type="text" name="scientificName" value={formData.scientificName} onChange={handleInputChange} placeholder="Nama Ilmiah" className="w-full border p-2 rounded"/>
                            <input type="text" name="family" value={formData.family} onChange={handleInputChange} placeholder="Keluarga (Family)" className="w-full border p-2 rounded"/>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Deskripsi" className="w-full border p-2 rounded" rows={4}></textarea>
                            
                            <div>
                                <h4 className="font-semibold mb-2">Gambar Tanaman</h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-2 p-2 border rounded-md min-h-[8rem]">
                                    {formData.imageUrls.map((url, index) => (
                                        <div key={index} className="relative"><img src={url} className="w-full h-24 object-cover rounded"/><button onClick={() => removeExistingImage(url)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button></div>
                                    ))}
                                    {newImageFiles.map((file, index) => (
                                        <div key={index} className="relative"><img src={URL.createObjectURL(file)} className="w-full h-24 object-cover rounded"/><button onClick={() => removeNewImage(file)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button></div>
                                    ))}
                                </div>
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <select name="careLevel" value={formData.careLevel} onChange={handleInputChange} className="w-full border p-2 rounded"><option value="Mudah">Perawatan: Mudah</option><option value="Sedang">Perawatan: Sedang</option><option value="Sulit">Perawatan: Sulit</option></select>
                                <select name="size" value={formData.size} onChange={handleInputChange} className="w-full border p-2 rounded"><option value="Kecil">Ukuran: Kecil</option><option value="Sedang">Ukuran: Sedang</option><option value="Besar">Ukuran: Besar</option></select>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Toko Penjual</h4>
                                {formData.stores.map((store, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2"><input type="text" value={store.name} onChange={(e) => handleStoreChange(index, 'name', e.target.value)} placeholder="Nama Toko" className="w-1/2 border p-2 rounded"/><input type="text" value={store.url} onChange={(e) => handleStoreChange(index, 'url', e.target.value)} placeholder="URL Toko" className="w-1/2 border p-2 rounded"/><button onClick={() => removeStoreField(index)} className="text-red-500"><Trash2 size={18}/></button></div>
                                ))}
                                <button onClick={addStoreField} className="text-sm text-green-600 flex items-center gap-1"><PlusCircle size={16}/> Tambah Toko</button>
                            </div>
                        </div>
                        <div className="p-6 flex justify-end gap-3 sticky bottom-0 bg-white border-t"><button onClick={closeModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Batal</button><button onClick={handleSave} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Simpan</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};
