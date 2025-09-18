import { useState, useMemo, Fragment } from 'react';
import type { FC } from 'react';
import { Plus, Trash2, X, PlusCircle, ChevronDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { usePlantManager } from '../../hooks/usePlantManager';

const lang: 'id' | 'en' = 'id';

// Komponen Dropdown Custom (tidak ada perubahan)
const CustomDropdown: FC<{
    options: { id: string | number; name: string }[];
    selectedValue: string;
    onSelect: (value: string) => void;
    placeholder: string;
}> = ({ options, selectedValue, onSelect, placeholder }) => {
    const selectedLabel = options.find(opt => opt.id.toString() === selectedValue)?.name || placeholder;

    return (
        <Menu as="div" className="relative inline-block text-left w-full">
            <div>
                <Menu.Button className="inline-flex w-full justify-between items-center rounded-lg bg-transparent border border-lime-400/60 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-[#004A49]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400">
                    {selectedLabel}
                    <ChevronDown className="ml-2 -mr-1 h-5 w-5 text-lime-200/70" aria-hidden="true" />
                </Menu.Button>
            </div>
            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute left-0 mt-2 w-full origin-top-right divide-y divide-gray-600 rounded-md bg-[#003938] border-2 border-lime-400/50 shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                    <div className="px-1 py-1 max-h-60 overflow-y-auto">
                        <Menu.Item>
                            {({ active }) => (
                                <button onClick={() => onSelect('all')} className={`${active ? 'bg-[#004A49] text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}>
                                    {placeholder}
                                </button>
                            )}
                        </Menu.Item>
                        {options.map((option) => (
                            <Menu.Item key={option.id}>
                                {({ active }) => (
                                    <button onClick={() => onSelect(option.id.toString())} className={`${active ? 'bg-[#004A49] text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}>
                                        {option.name}
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};


export const PlantManagementPage: FC = () => {
    const {
        // DIUBAH: categories dihapus
        plants, plantTypes, isLoading, isError,
        isEditModalOpen, isDetailModalOpen, editingPlant, viewingPlant,
        formData, imageFile, isMutating,
        openEditModal, closeEditModal, openDetailModal, closeDetailModal,
        handleInputChange, handleJsonChange, handleImageChange,
        handleStoreChange, addStoreField, removeStoreField,
        handleSave, handleDelete
    } = usePlantManager();

    const [searchTerm, setSearchTerm] = useState('');
    // DIHAPUS: state untuk selectedCategory
    const [selectedPlantType, setSelectedPlantType] = useState('all');

    const filteredPlants = useMemo(() => {
        return plants.filter(plant => {
            const searchMatch = searchTerm.trim() === '' ||
                plant.name[lang].toLowerCase().includes(searchTerm.toLowerCase()) ||
                plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
            // DIHAPUS: filter categoryMatch
            const plantTypeMatch = selectedPlantType === 'all' || plant.family.id.toString() === selectedPlantType;
            return searchMatch && plantTypeMatch;
        });
    }, [plants, searchTerm, selectedPlantType]);

    if (isLoading) return <div className="text-center text-gray-300 p-8">Memuat data tanaman...</div>;
    if (isError) return <div className="text-center text-red-400 p-8">Gagal memuat data.</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90">Manajemen Tanaman</h2>
                <button onClick={() => openEditModal()} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 transition-colors">
                    <Plus size={20} /> Tambah Tanaman
                </button>
            </div>

            <div className="mb-6 p-4 bg-[#0b5351]/30 border border-lime-400/30 rounded-lg">
                {/* DIUBAH: Grid disesuaikan menjadi 2 kolom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Cari nama tanaman..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                    {/* DIHAPUS: Dropdown untuk Kategori */}
                    <CustomDropdown
                        placeholder="Semua Tipe Tanaman"
                        selectedValue={selectedPlantType}
                        onSelect={setSelectedPlantType}
                        options={plantTypes.map(pt => ({ id: pt.id, name: pt.name[lang] }))}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPlants.map(plant => (
                    <div key={plant.id} className="bg-[#0b5351]/30 border border-lime-400/30 shadow-md rounded-lg overflow-hidden flex flex-col">
                        <img src={plant.imageUrl || 'https://placehold.co/600x400/eeeeee/cccccc?text=Gambar+Tidak+Tersedia'} alt={plant.name[lang]} className="w-full h-48 object-cover" />
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="text-xl font-bold text-gray-200">{plant.name[lang] || plant.name.en}</h3>
                            <p className="text-sm text-gray-400 italic mb-2">{plant.scientificName}</p>
                            <div className="flex justify-end items-center gap-3 mt-auto pt-2">
                                <button onClick={() => openDetailModal(plant)} className="text-xs bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded">Lihat</button>
                                <button onClick={() => openEditModal(plant)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">Ubah</button>
                                <button onClick={() => handleDelete(plant.id)} className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">Hapus</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {plants.length > 0 && filteredPlants.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400 bg-[#0b5351]/30 rounded-lg">
                    <p className="text-lg">Tidak Ditemukan</p>
                    <p>Tidak ada tanaman yang cocok dengan kriteria filter Anda.</p>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#003938] border-2 border-lime-400/50 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-4 flex justify-between items-center border-b border-lime-400/30">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-200">{editingPlant ? 'Ubah Data Tanaman' : 'Tambah Tanaman Baru'}</h3>
                            <button onClick={closeEditModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <input type="text" value={formData.name?.id || ''} onChange={(e) => handleJsonChange('name', 'id', e.target.value)} placeholder="Nama Tanaman (Indonesia)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                <input type="text" value={formData.name?.en || ''} onChange={(e) => handleJsonChange('name', 'en', e.target.value)} placeholder="Nama Tanaman (Bahasa Inggris)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                <input type="text" name="scientificName" value={formData.scientificName || ''} onChange={handleInputChange} placeholder="Nama Ilmiah" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                <div className='md:col-span-2'>
                                    <textarea value={formData.description?.id || ''} onChange={(e) => handleJsonChange('description', 'id', e.target.value)} placeholder="Deskripsi (Indonesia)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" rows={3}></textarea>
                                </div>
                                <div className='md:col-span-2'>
                                    <textarea value={formData.description?.en || ''} onChange={(e) => handleJsonChange('description', 'en', e.target.value)} placeholder="Deskripsi (Bahasa Inggris)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" rows={3}></textarea>
                                </div>
                                {/* DIHAPUS: Select untuk Kategori */}
                                <select name="familyId" value={formData.familyId || 0} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"><option value={0} disabled>Pilih Tipe Tanaman</option>{plantTypes.map(pt => <option key={pt.id} value={pt.id} className="bg-[#003938] text-white">{pt.name[lang]}</option>)}</select>
                                <select name="careLevel" value={formData.careLevel || 'Mudah'} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"><option className="bg-[#003938] text-white" value="Mudah">Tingkat Perawatan: Mudah</option><option className="bg-[#003938] text-white" value="Sedang">Tingkat Perawatan: Sedang</option><option className="bg-[#003938] text-white" value="Sulit">Tingkat Perawatan: Sulit</option></select>
                                <select name="size" value={formData.size || 'Sedang'} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"><option className="bg-[#003938] text-white" value="Kecil">Ukuran Tumbuh: Kecil</option><option className="bg-[#003938] text-white" value="Sedang">Ukuran Tumbuh: Sedang</option><option className="bg-[#003938] text-white" value="Besar">Ukuran Tumbuh: Besar</option></select>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Gambar Utama</label>
                                    {(editingPlant?.imageUrl && !imageFile) ? (<div className="mb-2"><img src={editingPlant.imageUrl} alt="Gambar saat ini" className="w-32 h-32 object-cover rounded-md border border-lime-400/50 p-1" /></div>) : imageFile && (<div className="mb-2"><img src={URL.createObjectURL(imageFile)} alt="Pratinjau gambar baru" className="w-32 h-32 object-cover rounded-md border border-lime-400/50 p-1" /></div>)}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-200/20 file:text-lime-300 hover:file:bg-lime-200/30 cursor-pointer"/>
                                </div>
                                <div className="md:col-span-2">
                                    <h4 className="text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2 mb-3">Toko Penjual</h4>
                                    {formData.stores?.map((store: { name: string, url: string }, index: number) => (
                                        <div key={index} className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                                            <input type="text" value={store.name || ''} onChange={(e) => handleStoreChange(index, 'name', e.target.value)} placeholder="Nama Toko" className="w-full sm:w-1/2 px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                            <input type="text" value={store.url || ''} onChange={(e) => handleStoreChange(index, 'url', e.target.value)} placeholder="URL Toko" className="w-full sm:w-1/2 px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                            <button onClick={() => removeStoreField(index)} className="text-red-500 hover:text-red-400 p-1 flex-shrink-0"><Trash2 size={18}/></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addStoreField} className="mt-2 flex items-center gap-2 text-sm font-semibold text-lime-300 hover:text-lime-200"><PlusCircle size={16}/> Tambah Toko</button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-lime-400/30">
                            <button onClick={closeEditModal} className="w-full sm:w-auto bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Batal</button>
                            <button onClick={handleSave} disabled={isMutating} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 disabled:bg-gray-500 disabled:cursor-wait">{isMutating ? 'Menyimpan...' : 'Simpan'}</button>
                        </div>
                    </div>
                </div>
            )}

            {isDetailModalOpen && viewingPlant && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#003938] border-2 border-lime-400/50 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-4 flex justify-between items-center border-b border-lime-400/30">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-200">{viewingPlant.name[lang]}</h3>
                            <button onClick={closeDetailModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                            <img src={viewingPlant.imageUrl} alt={viewingPlant.name[lang]} className="w-full h-auto max-h-64 object-cover rounded-lg mb-4" />
                            <div><strong className="text-lime-400">Nama Ilmiah:</strong> <span className="text-gray-300">{viewingPlant.scientificName}</span></div>
                            {/* DIHAPUS: Tampilan Kategori */}
                            <div><strong className="text-lime-400">Tipe Tanaman:</strong> <span className="text-gray-300">{viewingPlant.family.name[lang]}</span></div>
                            <div><strong className="text-lime-400">Tingkat Perawatan:</strong> <span className="text-gray-300">{viewingPlant.careLevel}</span></div>
                            <div><strong className="text-lime-400">Ukuran:</strong> <span className="text-gray-300">{viewingPlant.size}</span></div>
                            <div className="pt-2"><strong className="text-lime-400 block mb-2">Deskripsi (ID):</strong><p className="text-gray-300 whitespace-pre-wrap">{viewingPlant.description[lang]}</p></div>
                            {viewingPlant.stores && viewingPlant.stores.length > 0 && (
                                <div className="pt-2">
                                    <strong className="text-lime-400 block mb-2">Toko Penjual:</strong>
                                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                                        {viewingPlant.stores.map((store, index) => (<li key={index}><a href={store.url} target="_blank" rel="noopener noreferrer" className="hover:text-lime-300 underline">{store.name}</a></li>))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex flex-col sm:flex-row justify-end border-t border-lime-400/30">
                            <button onClick={closeDetailModal} className="w-full sm:w-auto bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};