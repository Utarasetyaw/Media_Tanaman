import React, { useState } from 'react';
import { Plus, Edit, Trash2, X} from 'lucide-react';

// --- Tipe Data ---
interface ExternalEvent {
    id: number;
    title: string;
    date: string;
    displayDate: string;
    time: string;
    location: string;
    organizer: string;
    description: string;
    imageUrl: string;
    url: string;
}

interface InternalCampaign {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    campaignUrl: string; // URL khusus untuk halaman pendaftaran/detail
    isActive: boolean;
}

// --- Data Awal (Contoh) ---
const initialExternalEvents: ExternalEvent[] = [
    {
        id: 1,
        title: 'Seminar Hidroponik Modern',
        date: '2024-08-10',
        displayDate: '10 Agustus 2024',
        time: '09:00 - 12:00 WIB',
        location: 'Universitas Gadjah Mada, Yogyakarta',
        organizer: 'Fakultas Pertanian UGM',
        description: 'Seminar yang membahas teknik-teknik terbaru dalam budidaya hidroponik.',
        imageUrl: 'https://placehold.co/600x400/a2e1a2/4a5568?text=Seminar+Hidroponik',
        url: '#'
    }
];

const initialInternalCampaigns: InternalCampaign[] = [
    {
        id: 101,
        title: 'Lomba Foto Tanaman Online',
        description: 'Abadikan momen terbaik tanaman kesayanganmu dan menangkan hadiah menarik!',
        imageUrl: 'https://placehold.co/600x400/e1a2a2/4a5568?text=Lomba+Foto',
        campaignUrl: '/lomba/foto-tanaman-2024',
        isActive: true,
    }
];

export const EventManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'external' | 'internal'>('external');
    
    const [externalEvents, setExternalEvents] = useState<ExternalEvent[]>(initialExternalEvents);
    const [internalCampaigns, setInternalCampaigns] = useState<InternalCampaign[]>(initialInternalCampaigns);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ExternalEvent | InternalCampaign | null>(null);

    const openModal = (item: ExternalEvent | InternalCampaign | null = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleDelete = (id: number) => {
        if (activeTab === 'external') {
            if (window.confirm('Yakin ingin menghapus event ini?')) {
                setExternalEvents(externalEvents.filter(e => e.id !== id));
            }
        } else {
            if (window.confirm('Yakin ingin menghapus campaign ini?')) {
                setInternalCampaigns(internalCampaigns.filter(c => c.id !== id));
            }
        }
    };

    const TabButton: React.FC<{ tabName: 'external' | 'internal'; label: string; }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tabName ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            {label}
        </button>
    );
    
    // Placeholder untuk form modals
    const ExternalEventForm = () => (
        <div>Form untuk Event Eksternal akan ada di sini.</div>
    );
    const InternalCampaignForm = () => (
        <div>Form untuk Campaign Internal akan ada di sini.</div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Manajemen Event & Campaign</h2>
                <button onClick={() => openModal()} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <Plus size={20} /> {activeTab === 'external' ? 'Tambah Event Eksternal' : 'Buat Campaign Baru'}
                </button>
            </div>

            {/* Navigasi Tab */}
            <div className="mb-6 flex gap-3">
                <TabButton tabName="external" label="Event Eksternal" />
                <TabButton tabName="internal" label="Campaign Internal" />
            </div>
            
            {/* Konten Tab */}
            {activeTab === 'external' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {externalEvents.map(event => (
                        <div key={event.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                            <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover"/>
                            <div className="p-4">
                                <p className="text-sm font-semibold text-green-600">{event.displayDate}</p>
                                <h3 className="text-lg font-bold mt-1">{event.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">oleh {event.organizer}</p>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button onClick={() => openModal(event)} className="p-2 text-gray-500 hover:text-indigo-600" title="Edit"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-500 hover:text-red-600" title="Hapus"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {internalCampaigns.map(campaign => (
                        <div key={campaign.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                            <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-48 object-cover"/>
                            <div className="p-4">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${campaign.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {campaign.isActive ? 'Aktif' : 'Selesai'}
                                </span>
                                <h3 className="text-lg font-bold mt-2">{campaign.title}</h3>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{campaign.description}</p>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button onClick={() => openModal(campaign)} className="p-2 text-gray-500 hover:text-indigo-600" title="Edit"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(campaign.id)} className="p-2 text-gray-500 hover:text-red-600" title="Hapus"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                     <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 sticky top-0 bg-white border-b z-10">
                            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X size={24} /></button>
                            <h3 className="text-2xl font-bold">
                                {editingItem ? 'Edit' : 'Tambah'} {activeTab === 'external' ? 'Event Eksternal' : 'Campaign Internal'}
                            </h3>
                        </div>
                        <div className="p-6">
                            {activeTab === 'external' ? <ExternalEventForm /> : <InternalCampaignForm />}
                        </div>
                         <div className="p-6 flex justify-end gap-3 sticky bottom-0 bg-white border-t">
                            <button onClick={closeModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Batal</button>
                            <button className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
