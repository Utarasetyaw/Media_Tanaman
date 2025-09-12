import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as api from '../../services/apiAdmin';
import { format } from 'date-fns';

// --- Tipe Data ---
interface Category { id: number; name: { id: string; en: string }; }
interface PlantType { id: number; name: { id: string; en: string }; }
interface Event {
  id: number;
  title: { id: string; en: string };
  description: { id: string; en: string };
  imageUrl: string;
  location: string;
  organizer: string;
  startDate: string;
  endDate: string;
  eventType: 'INTERNAL' | 'EXTERNAL';
  externalUrl?: string;
  category: Category;
  categoryId: number;
  plantType?: PlantType;
  plantTypeId?: number;
}
type EventFilter = 'ALL' | 'INTERNAL' | 'EXTERNAL';

const initialFormData = {
    title: { id: '', en: '' },
    description: { id: '', en: '' },
    imageUrl: '',
    location: '',
    organizer: '',
    startDate: '',
    endDate: '',
    eventType: 'EXTERNAL',
    externalUrl: '',
    categoryId: 0,
    plantTypeId: 0,
};

export const EventManagementPage: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [events, setEvents] = useState<Event[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [plantTypes, setPlantTypes] = useState<PlantType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [formData, setFormData] = useState<any>(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [filter, setFilter] = useState<EventFilter>('ALL');

    // --- DATA FETCHING ---
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [eventsData, categoriesData, plantTypesData] = await Promise.all([
                api.getEvents(),
                api.getCategories(),
                api.getPlantTypes()
            ]);
            setEvents(eventsData);
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
    const openModal = (event: Event | null = null) => {
        setImageFile(null);
        if (event) {
            setEditingEvent(event);
            setFormData({
              ...event,
              startDate: format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"),
              endDate: format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm"),
              categoryId: event.category.id,
              plantTypeId: event.plantType?.id || 0,
            });
        } else {
            setEditingEvent(null);
            setFormData(initialFormData);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };
    
    const handleJsonChange = (field: 'title' | 'description', lang: 'id' | 'en', value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: { ...prev[field], [lang]: value }
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        if (!formData.title.id || !formData.categoryId || !formData.startDate || !formData.endDate) {
            alert("Judul (Indonesia), Kategori, Tanggal Mulai, dan Tanggal Selesai wajib diisi.");
            return;
        }

        let finalImageUrl = editingEvent?.imageUrl || '';
        
        try {
            if (imageFile) {
                const uploadRes = await api.uploadFile('events', imageFile);
                finalImageUrl = uploadRes.imageUrl;
            }

            if (!finalImageUrl) {
                alert("Gambar utama wajib diunggah.");
                return;
            }

            const payload = {
                ...formData,
                imageUrl: finalImageUrl,
                categoryId: parseInt(formData.categoryId, 10),
                plantTypeId: formData.plantTypeId ? parseInt(formData.plantTypeId, 10) : null,
            };

            if (editingEvent) {
                await api.updateEvent(editingEvent.id, payload);
            } else {
                await api.createEvent(payload);
            }

            closeModal();
            fetchData();
        } catch (error) {
            console.error("Failed to save event", error);
            alert("Gagal menyimpan data event.");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Yakin ingin menghapus event ini? Semua data pendaftaran terkait akan ikut terhapus.')) {
            try {
                await api.deleteEvent(id);
                fetchData();
            } catch (error) {
                alert("Gagal menghapus event.");
            }
        }
    };

    // --- RENDER LOGIC ---
    const filteredEvents = events.filter(event => {
        if (filter === 'ALL') return true;
        return event.eventType === filter;
    });

    const formatDateRange = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return `${startDate.toLocaleDateString('id-ID', options)} - ${endDate.toLocaleDateString('id-ID', options)}`;
    };

    if (isLoading) return <div className="text-center text-gray-300 p-8">Memuat data event...</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold text-lime-200/90">Manajemen Event</h2>
                <button onClick={() => openModal()} className="bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 flex items-center gap-2 transition-colors self-start sm:self-center">
                    <Plus size={20} /> Tambah Event
                </button>
            </div>

            <div className="flex space-x-2 mb-6 border-b border-lime-400/30 pb-3">
                {(['ALL', 'INTERNAL', 'EXTERNAL'] as EventFilter[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === tab ? 'bg-lime-400 text-gray-900' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'}`}
                    >
                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
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
                                {/* --- TAMBAHAN: Link ke Halaman Detail --- */}
                                <Link to={`/admin/events/${event.id}`} className="p-2 text-gray-400 hover:text-green-400 transition-colors" title="Lihat Detail & Peserta">
                                    <Users size={18} />
                                </Link>
                                <button onClick={() => openModal(event)} className="p-2 text-gray-400 hover:text-blue-400 transition-colors" title="Edit"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Hapus"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    </div>
                ))}
                 {filteredEvents.length === 0 && (
                    <p className="text-gray-400 md:col-span-3 text-center">Tidak ada event pada filter ini.</p>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#003938] border-2 border-lime-400/50 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-4 flex justify-between items-center border-b border-lime-400/30">
                            <h3 className="text-2xl font-bold text-gray-200">{editingEvent ? 'Edit Event' : 'Tambah Event Baru'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <input type="text" value={formData.title.id} onChange={(e) => handleJsonChange('title', 'id', e.target.value)} placeholder="Judul Event (ID)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                <input type="text" value={formData.title.en} onChange={(e) => handleJsonChange('title', 'en', e.target.value)} placeholder="Judul Event (EN)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                <div className='md:col-span-2'><textarea value={formData.description.id} onChange={(e) => handleJsonChange('description', 'id', e.target.value)} placeholder="Deskripsi (ID)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" rows={3}></textarea></div>
                                <div className='md:col-span-2'><textarea value={formData.description.en} onChange={(e) => handleJsonChange('description', 'en', e.target.value)} placeholder="Deskripsi (EN)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" rows={3}></textarea></div>
                                
                                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Lokasi" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                <input type="text" name="organizer" value={formData.organizer} onChange={handleInputChange} placeholder="Penyelenggara" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                                
                                <div><label className='text-xs text-gray-400 ml-1'>Tanggal Mulai</label><input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" /></div>
                                <div><label className='text-xs text-gray-400 ml-1'>Tanggal Selesai</label><input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" /></div>
                                
                                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200">
                                    <option value={0} disabled>Pilih Kategori</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name.id}</option>)}
                                </select>
                                <select name="plantTypeId" value={formData.plantTypeId} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200">
                                    <option value={0}>Pilih Tipe Tanaman (Opsional)</option>
                                    {plantTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name.id}</option>)}
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
                            <button onClick={closeModal} className="bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Batal</button>
                            <button onClick={handleSave} className="bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500">Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};