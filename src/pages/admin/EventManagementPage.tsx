import React, { useState, useMemo, Fragment } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, ChevronDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useEventManager } from '../../hooks/useEventManager';

// Tipe data yang dibutuhkan (tidak perlu diubah)

// Helper untuk format tanggal (tidak perlu diubah)
const formatDateRange = (start: string, end: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const startDate = new Date(start).toLocaleDateString('id-ID', options);
    const endDate = new Date(end).toLocaleDateString('id-ID', options);
    return `${startDate} - ${endDate}`;
};

// Komponen Dropdown Custom (tidak perlu diubah)
const CustomDropdown: FC<{
    options: { value: string | number; label: string }[];
    selectedValue: string | number;
    onSelect: (value: any) => void;
    placeholder: string;
    name?: string;
}> = ({ options, selectedValue, onSelect, placeholder, name }) => {
    const selectedLabel = options.find(opt => opt.value.toString() === selectedValue.toString())?.label || placeholder;

    return (
        <Menu as="div" className="relative inline-block text-left w-full">
            <div>
                <Menu.Button name={name} className="inline-flex w-full justify-between items-center rounded-lg bg-transparent border border-lime-400/60 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-[#004A49]/50 focus:outline-none">
                    {selectedLabel}
                    <ChevronDown className="ml-2 -mr-1 h-5 w-5 text-lime-200/70" aria-hidden="true" />
                </Menu.Button>
            </div>
            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute left-0 mt-2 w-full origin-top-right divide-y divide-gray-600 rounded-md bg-[#003938] border-2 border-lime-400/50 shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                    <div className="px-1 py-1 max-h-60 overflow-y-auto">
                        <Menu.Item>
                            {({ active }) => (
                                <button type="button" onClick={() => onSelect('all')} className={`${active ? 'bg-[#004A49] text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}>
                                    {placeholder}
                                </button>
                            )}
                        </Menu.Item>
                        {options.map((option) => (
                            <Menu.Item key={option.value}>
                                {({ active }) => (
                                    <button type="button" onClick={() => onSelect(option.value)} className={`${active ? 'bg-[#004A49] text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}>
                                        {option.label}
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

export const EventManagementPage: React.FC = () => {
    const {
        // DIUBAH: 'categories' dan 'plantTypes' mungkin tidak lagi dibutuhkan di sini, tapi kita biarkan hook yang mengelolanya
        events, isLoadingList, filter, setFilter,
        isModalOpen, editingEvent, formData, imageFile, openModal, closeModal,
        handleInputChange, handleJsonChange, handleImageChange, handleSave, handleDelete, isMutating, // Tetap diimpor jika hook membutuhkannya, tapi tidak dipakai di filter
    } = useEventManager();
    
    const [searchTerm, setSearchTerm] = useState('');
    // DIHAPUS: State untuk filter kategori dan tipe tanaman
    // const [selectedCategory, setSelectedCategory] = useState('all');
    // const [selectedPlantType, setSelectedPlantType] = useState('all');

    const finalFilteredEvents = useMemo(() => {
        return events.filter(event => {
            const searchMatch = searchTerm.trim() === '' ||
                event.title.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
            
            // DIHAPUS: Logika filter untuk kategori dan tipe tanaman
            // const categoryMatch = selectedCategory === 'all' || event.category.id.toString() === selectedCategory;
            // const plantTypeMatch = selectedPlantType === 'all' || (event.plantType && event.plantType.id.toString() === selectedPlantType);
            
            return searchMatch; // Hanya mengembalikan searchMatch
        });
    }, [events, searchTerm]); // Dependensi yang tidak perlu dihapus

    if (isLoadingList) return <div className="text-center text-gray-300 p-8">Memuat data event...</div>;

    const inputClassName = "w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-lime-400";

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90">Manajemen Event</h2>
                <button onClick={() => openModal()} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 transition-colors">
                    <Plus size={20} /> Tambah Event
                </button>
            </div>
            
            <div className="mb-6 p-4 bg-[#0b5351]/30 border border-lime-400/30 rounded-lg">
                {/* DIUBAH: Layout grid disederhanakan hanya untuk pencarian */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <input type="text" placeholder="Cari event berdasarkan judul atau penyelenggara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputClassName} md:col-span-2 lg:col-span-3`} />
                     {/* DIHAPUS: Dropdown untuk kategori dan tipe tanaman */}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 border-b border-lime-400/30 pb-3">
                {(['ALL', 'INTERNAL', 'EXTERNAL'] as const).map(tab => (
                    <button key={tab} onClick={() => setFilter(tab)} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === tab ? 'bg-lime-400 text-gray-900' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'}`}>
                        {tab === 'ALL' ? 'Semua' : (tab === 'INTERNAL' ? 'Internal' : 'Eksternal')}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {finalFilteredEvents.map(event => (
                    <div key={event.id} className="bg-[#0b5351]/30 border border-lime-400/30 shadow-md rounded-lg overflow-hidden flex flex-col">
                        <div className="relative">
                            <img src={event.imageUrl} alt={event.title.id} className="w-full h-48 object-cover"/>
                            <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full ${event.eventType === 'INTERNAL' ? 'bg-blue-200 text-blue-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                {event.eventType === 'INTERNAL' ? 'Internal' : 'Eksternal'}
                            </span>
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <p className="text-sm font-semibold text-lime-300">{formatDateRange(event.startDate, event.endDate)}</p>
                            <h3 className="text-lg font-bold mt-1 text-gray-200 line-clamp-2 flex-grow">{event.title.id || event.title.en}</h3>
                            <p className="text-sm text-gray-400 mt-1">oleh {event.organizer}</p>
                            <div className="flex justify-end gap-2 mt-4 pt-2">
                                <Link to={`/admin/events/${event.id}`} className="text-xs bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded">Detail</Link>
                                <button onClick={() => openModal(event)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">Ubah</button>
                                <button onClick={() => handleDelete(event.id)} className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">Hapus</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {finalFilteredEvents.length === 0 && (<div className="text-center py-12 text-gray-400 bg-[#0b5351]/30 rounded-lg mt-6"><p className="text-lg">Tidak Ditemukan</p><p>Tidak ada event yang cocok dengan kriteria filter Anda.</p></div>)}
            
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                     <div className="bg-[#003938] border-2 border-lime-400/50 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-4 flex justify-between items-center border-b border-lime-400/30">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-200">{editingEvent ? 'Ubah Event' : 'Tambah Event Baru'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Judul Event (Indonesia)</label>
                                    <input type="text" value={formData.title.id} onChange={(e) => handleJsonChange('title', 'id', e.target.value)} className={inputClassName} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Judul Event (Bahasa Inggris)</label>
                                    <input type="text" value={formData.title.en} onChange={(e) => handleJsonChange('title', 'en', e.target.value)} className={inputClassName} />
                                </div>
                                <div className='md:col-span-2'>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Deskripsi (Indonesia)</label>
                                    <textarea value={formData.description.id} onChange={(e) => handleJsonChange('description', 'id', e.target.value)} className={inputClassName} rows={3}></textarea>
                                </div>
                                <div className='md:col-span-2'>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Deskripsi (Bahasa Inggris)</label>
                                    <textarea value={formData.description.en} onChange={(e) => handleJsonChange('description', 'en', e.target.value)} className={inputClassName} rows={3}></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Lokasi</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} className={inputClassName} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Penyelenggara</label>
                                    <input type="text" name="organizer" value={formData.organizer} onChange={handleInputChange} className={inputClassName} />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-300 mb-1'>Tanggal Mulai</label>
                                    <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleInputChange} className={inputClassName} required />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-300 mb-1'>Tanggal Selesai</label>
                                    <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleInputChange} className={inputClassName} required />
                                </div>
                                
                                {/* DIHAPUS: Input untuk Kategori dan Tipe Tanaman */}
                                
                                <div className='md:col-span-2'>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Tipe Event</label>
                                    <CustomDropdown name="eventType" placeholder="Pilih Tipe Event" selectedValue={formData.eventType} onSelect={(val) => handleInputChange({ target: { name: 'eventType', value: val } } as any)} options={[{value: 'EXTERNAL', label: 'Eksternal'}, {value: 'INTERNAL', label: 'Internal (Dengan Pendaftaran)'}]} />
                                </div>
                                {formData.eventType === 'EXTERNAL' && <div className='md:col-span-2'>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">URL Pendaftaran Eksternal</label>
                                    <input type="url" name="externalUrl" value={formData.externalUrl || ''} onChange={handleInputChange} className={inputClassName} />
                                </div>}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Gambar Utama</label>
                                    <div className='mb-4 min-h-[1rem]'>
                                        {imageFile ? <img src={URL.createObjectURL(imageFile)} alt="Pratinjau" className="max-h-40 w-auto rounded-md border border-lime-400/50 p-1" />
                                        : (editingEvent?.imageUrl && <img src={editingEvent.imageUrl} alt="Gambar saat ini" className="max-h-40 w-auto rounded-md border border-lime-400/50 p-1" />)}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-200/20 file:text-lime-300 hover:file:bg-lime-200/30 cursor-pointer"/>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-lime-400/30">
                            <button onClick={closeModal} disabled={isMutating} className="w-full sm:w-auto bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-600 disabled:opacity-50">Batal</button>
                            <button onClick={handleSave} disabled={isMutating} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 disabled:opacity-50">
                                {isMutating ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};