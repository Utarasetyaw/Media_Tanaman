import React from 'react';
import { Plus, Edit, Trash2, X, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEventManager } from '../../hooks/useEventManager';

// Define PlantType type if not imported from elsewhere
type PlantType = {
    id: number;
    name: {
        id: string;
        en?: string;
    };
};

const formatDateRange = (start: string, end: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return `${new Date(start).toLocaleDateString('id-ID', options)} - ${new Date(end).toLocaleDateString('id-ID', options)}`;
};

export const EventManagementPage: React.FC = () => {
    // Ambil semua state dan logika dari satu hook
    const {
        events,
        categories,
        plantTypes,
        isLoadingList,
        filter,
        setFilter,
        isModalOpen,
        editingEvent,
        formData,
        imageFile,
        openModal,
        closeModal,
        handleInputChange,
        handleJsonChange,
        handleImageChange,
        handleSave,
        handleDelete,
        isMutating,
    } = useEventManager();

    if (isLoadingList) return <div className="text-center text-gray-300 p-8">Memuat data event...</div>;

    return (
        <div>
            {/* Header dan Tombol Tambah */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold text-lime-200/90">Manajemen Event</h2>
                <button onClick={() => openModal()} className="bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 flex items-center gap-2 transition-colors self-start sm:self-center">
                    <Plus size={20} /> Tambah Event
                </button>
            </div>

            {/* Tombol Filter */}
            <div className="flex space-x-2 mb-6 border-b border-lime-400/30 pb-3">
                {(['ALL', 'INTERNAL', 'EXTERNAL'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === tab ? 'bg-lime-400 text-gray-900' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'}`}
                    >
                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Daftar Event (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                    <div key={event.id} className="bg-[#0b5351]/30 border border-lime-400/30 shadow-md rounded-lg overflow-hidden relative">
                        <img src={event.imageUrl} alt={event.title.id} className="w-full h-48 object-cover"/>
                        <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full ${event.eventType === 'INTERNAL' ? 'bg-blue-200 text-blue-800' : 'bg-yellow-200 text-yellow-800'}`}>
                            {event.eventType === 'INTERNAL' ? 'Internal' : 'Eksternal'}
                        </span>
                        <div className="p-4">
                            <p className="text-sm font-semibold text-lime-300">{formatDateRange(event.startDate, event.endDate)}</p>
                            <h3 className="text-lg font-bold mt-1 text-gray-200 line-clamp-2">{event.title.id || event.title.en}</h3>
                            <p className="text-sm text-gray-400 mt-1">oleh {event.organizer}</p>
                            <div className="flex justify-end gap-2 mt-4">
                                <Link to={`/admin/events/${event.id}`} className="p-2 text-gray-400 hover:text-green-400 transition-colors" title="Lihat Detail & Peserta">
                                    <Users size={18} />
                                </Link>
                                <button onClick={() => openModal(event)} className="p-2 text-gray-400 hover:text-blue-400 transition-colors" title="Edit"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Hapus"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    </div>
                ))}
                 {events.length === 0 && (
                    <p className="text-gray-400 md:col-span-3 text-center">Tidak ada event pada filter ini.</p>
                )}
            </div>

            {/* Modal Tambah/Edit Event */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#003938] border-2 border-lime-400/50 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-4 flex justify-between items-center border-b border-lime-400/30">
                            <h3 className="text-2xl font-bold text-gray-200">{editingEvent ? 'Edit Event' : 'Tambah Event Baru'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <input type="text" value={formData.title.id} onChange={(e) => handleJsonChange('title', 'id', e.target.value)} placeholder="Judul Event (ID)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" required />
                                <input type="text" value={formData.title.en} onChange={(e) => handleJsonChange('title', 'en', e.target.value)} placeholder="Judul Event (EN)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                <div className='md:col-span-2'><textarea value={formData.description.id} onChange={(e) => handleJsonChange('description', 'id', e.target.value)} placeholder="Deskripsi (ID)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" rows={3}></textarea></div>
                                <div className='md:col-span-2'><textarea value={formData.description.en} onChange={(e) => handleJsonChange('description', 'en', e.target.value)} placeholder="Deskripsi (EN)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" rows={3}></textarea></div>
                                
                                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Lokasi" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                <input type="text" name="organizer" value={formData.organizer} onChange={handleInputChange} placeholder="Penyelenggara" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                
                                <div><label className='text-xs text-gray-400 ml-1'>Tanggal Mulai</label><input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" required /></div>
                                <div><label className='text-xs text-gray-400 ml-1'>Tanggal Selesai</label><input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" required /></div>
                                
                                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" required>
                                    <option value={0} disabled>Pilih Kategori</option>
                                    {categories.map((cat: { id: number; name: { id: string } }) => <option key={cat.id} value={cat.id}>{cat.name.id}</option>)}                                </select>
                                <select name="plantTypeId" value={formData.plantTypeId || 0} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200">
                                    <option value={0}>Pilih Tipe Tanaman (Opsional)</option>
                                    {plantTypes.map((pt: PlantType) => <option key={pt.id} value={pt.id}>{pt.name.id}</option>)}
                                </select>
                                <select name="eventType" value={formData.eventType} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200">
                                    <option value="EXTERNAL">Tipe: Eksternal</option>
                                    <option value="INTERNAL">Tipe: Internal (Dengan Pendaftaran)</option>
                                </select>
                                
                                {formData.eventType === 'EXTERNAL' && <div className='md:col-span-2'><input type="text" name="externalUrl" value={formData.externalUrl || ''} onChange={handleInputChange} placeholder="URL Pendaftaran Eksternal (jika ada)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" /></div>}
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Gambar Utama</label>
                                    <div className='mb-4'>
                                        {imageFile ? (
                                            <img src={URL.createObjectURL(imageFile)} alt="Pratinjau" className="max-h-40 w-auto rounded-md border border-lime-400/50 p-1" />
                                        ) : (
                                            editingEvent?.imageUrl && (
                                                <img src={editingEvent.imageUrl} alt="Gambar saat ini" className="max-h-40 w-auto rounded-md border border-lime-400/50 p-1" />
                                            )
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-200/20 file:text-lime-300 hover:file:bg-lime-200/30 cursor-pointer"/>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 flex justify-end gap-3 border-t border-lime-400/30">
                            <button onClick={closeModal} disabled={isMutating} className="bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-600 disabled:opacity-50">Batal</button>
                            <button onClick={handleSave} disabled={isMutating} className="bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 disabled:opacity-50">
                                {isMutating ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};