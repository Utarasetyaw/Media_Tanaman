import type { FC } from 'react';
import { Plus, Edit, Trash2, X, PlusCircle, Eye } from 'lucide-react';
import { usePlantManager } from '../../hooks/usePlantManager';

const lang: 'id' | 'en' = 'id';

export const PlantManagementPage: FC = () => {
    // Panggil hook untuk mendapatkan semua state dan logika
    const {
        plants,
        categories,
        plantTypes,
        isLoading,
        isError,
        isEditModalOpen,
        isDetailModalOpen,
        editingPlant,
        viewingPlant,
        formData,
        imageFile,
        isMutating,
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
    } = usePlantManager();

    if (isLoading) return <div className="text-center text-gray-300 p-8">Memuat data tanaman...</div>;
    if (isError) return <div className="text-center text-red-400 p-8">Gagal memuat data.</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-lime-200/90">Manajemen Tanaman</h2>
                <button onClick={() => openEditModal()} className="bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 flex items-center gap-2 transition-colors">
                    <Plus size={20} /> Tambah Tanaman
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plants.map(plant => (
                    <div key={plant.id} className="bg-[#0b5351]/30 border border-lime-400/30 shadow-md rounded-lg overflow-hidden relative">
                        <img src={plant.imageUrl || 'https://placehold.co/600x400/eeeeee/cccccc?text=No+Image'} alt={plant.name[lang]} className="w-full h-48 object-cover" />
                        <div className="p-4">
                            <h3 className="text-xl font-bold text-gray-200">{plant.name[lang] || plant.name.en}</h3>
                            <p className="text-sm text-gray-400 italic">{plant.scientificName}</p>
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => openDetailModal(plant)} className="p-2 text-gray-400 hover:text-lime-400 transition-colors" title="Lihat Detail"><Eye size={18} /></button>
                                <button onClick={() => openEditModal(plant)} className="p-2 text-gray-400 hover:text-blue-400 transition-colors" title="Edit"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(plant.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Hapus"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Edit/Tambah */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#003938] border-2 border-lime-400/50 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-4 flex justify-between items-center border-b border-lime-400/30">
                            <h3 className="text-2xl font-bold text-gray-200">{editingPlant ? 'Edit Tanaman' : 'Tambah Tanaman Baru'}</h3>
                            <button onClick={closeEditModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <input type="text" value={formData.name?.id || ''} onChange={(e) => handleJsonChange('name', 'id', e.target.value)} placeholder="Nama Tanaman (ID)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                <input type="text" value={formData.name?.en || ''} onChange={(e) => handleJsonChange('name', 'en', e.target.value)} placeholder="Nama Tanaman (EN)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                <input type="text" name="scientificName" value={formData.scientificName || ''} onChange={handleInputChange} placeholder="Nama Ilmiah" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                <div className='md:col-span-2'>
                                    <textarea value={formData.description?.id || ''} onChange={(e) => handleJsonChange('description', 'id', e.target.value)} placeholder="Deskripsi (ID)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" rows={3}></textarea>
                                </div>
                                <div className='md:col-span-2'>
                                    <textarea value={formData.description?.en || ''} onChange={(e) => handleJsonChange('description', 'en', e.target.value)} placeholder="Deskripsi (EN)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" rows={3}></textarea>
                                </div>
                                <select name="categoryId" value={formData.categoryId || 0} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200">
                                    <option value={0} disabled>Pilih Kategori</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name[lang]}</option>)}
                                </select>
                                <select name="familyId" value={formData.familyId || 0} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200">
                                    <option value={0} disabled>Pilih Tipe Tanaman (Family)</option>
                                    {plantTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name[lang]}</option>)}
                                </select>
                                <select name="careLevel" value={formData.careLevel || 'Mudah'} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"><option value="Mudah">Perawatan: Mudah</option><option value="Sedang">Perawatan: Sedang</option><option value="Sulit">Perawatan: Sulit</option></select>
                                <select name="size" value={formData.size || 'Sedang'} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"><option value="Kecil">Ukuran: Kecil</option><option value="Sedang">Ukuran: Sedang</option><option value="Besar">Ukuran: Besar</option></select>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Gambar Utama</label>
                                    {(editingPlant?.imageUrl && !imageFile) ? (
                                        <div className="mb-2"><img src={editingPlant.imageUrl} alt="Current Plant" className="w-32 h-32 object-cover rounded-md border border-lime-400/50 p-1" /></div>
                                    ) : imageFile && (
                                        <div className="mb-2"><img src={URL.createObjectURL(imageFile)} alt="New Plant Preview" className="w-32 h-32 object-cover rounded-md border border-lime-400/50 p-1" /></div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-200/20 file:text-lime-300 hover:file:bg-lime-200/30 cursor-pointer"/>
                                </div>
                                <div className="md:col-span-2">
                                    <h4 className="text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2 mb-3">Toko Penjual</h4>
                                    {formData.stores && formData.stores.map((store: { name: string, url: string }, index: number) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
                                            <input type="text" value={store.name || ''} onChange={(e) => handleStoreChange(index, 'name', e.target.value)} placeholder="Nama Toko" className="w-1/2 px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                            <input type="text" value={store.url || ''} onChange={(e) => handleStoreChange(index, 'url', e.target.value)} placeholder="URL Toko" className="w-1/2 px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                            {formData.stores && formData.stores.length > 1 && (<button onClick={() => removeStoreField(index)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={18}/></button>)}
                                        </div>
                                    ))}
                                    <button onClick={addStoreField} className="mt-2 flex items-center gap-2 text-sm font-semibold text-lime-300 hover:text-lime-200">
                                        <PlusCircle size={16}/> Tambah Toko
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 flex justify-end gap-3 border-t border-lime-400/30">
                            <button onClick={closeEditModal} className="bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Batal</button>
                            <button onClick={handleSave} disabled={isMutating} className="bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 disabled:bg-gray-500 disabled:cursor-wait">
                                {isMutating ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal untuk Lihat Detail Tanaman */}
            {isDetailModalOpen && viewingPlant && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#003938] border-2 border-lime-400/50 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-4 flex justify-between items-center border-b border-lime-400/30">
                            <h3 className="text-2xl font-bold text-gray-200">{viewingPlant.name[lang]}</h3>
                            <button onClick={closeDetailModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <img src={viewingPlant.imageUrl} alt={viewingPlant.name[lang]} className="w-full h-64 object-cover rounded-lg mb-4" />
                            <div><strong className="text-lime-400">Nama Ilmiah:</strong> <span className="text-gray-300">{viewingPlant.scientificName}</span></div>
                            <div><strong className="text-lime-400">Kategori:</strong> <span className="text-gray-300">{viewingPlant.category.name[lang]}</span></div>
                            <div><strong className="text-lime-400">Tipe Tanaman:</strong> <span className="text-gray-300">{viewingPlant.family.name[lang]}</span></div>
                            <div><strong className="text-lime-400">Tingkat Perawatan:</strong> <span className="text-gray-300">{viewingPlant.careLevel}</span></div>
                            <div><strong className="text-lime-400">Ukuran:</strong> <span className="text-gray-300">{viewingPlant.size}</span></div>
                            <div className="pt-2">
                                <strong className="text-lime-400 block mb-2">Deskripsi (ID):</strong>
                                <p className="text-gray-300 whitespace-pre-wrap">{viewingPlant.description[lang]}</p>
                            </div>
                            {viewingPlant.stores && viewingPlant.stores.length > 0 && (
                                <div className="pt-2">
                                    <strong className="text-lime-400 block mb-2">Toko Penjual:</strong>
                                    <ul className="list-disc list-inside text-gray-300">
                                        {viewingPlant.stores.map((store, index) => (
                                            <li key={index}><a href={store.url} target="_blank" rel="noopener noreferrer" className="hover:text-lime-300 underline">{store.name}</a></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex justify-end gap-3 border-t border-lime-400/30">
                            <button onClick={closeDetailModal} className="bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlantManagementPage;