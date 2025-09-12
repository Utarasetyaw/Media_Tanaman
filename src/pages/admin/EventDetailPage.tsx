// src/pages/admin/EventDetailPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../services/apiAdmin';
// --- REVISI: Hapus 'Award' dan 'format' karena tidak digunakan ---
import { ArrowLeft, Users, ExternalLink, Image as ImageIcon } from 'lucide-react';

// ... (sisa kode Anda tidak perlu diubah) ...
interface User { id: number; name: string; email: string; }
interface Submission { id: number; submissionUrl: string; placement: number | null; user: User; }
interface Category { name: { id: string; en: string }; }
interface PlantType { name: { id: string; en: string }; }
interface Event {
  id: number;
  title: { id: string; en: string };
  imageUrl: string;
  eventType: 'INTERNAL' | 'EXTERNAL';
  externalLinkClicks: number;
  submissions: Submission[];
  category: Category;
  plantType?: PlantType;
}

export const EventDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const eventId = Number(id);

    const fetchData = useCallback(async () => {
        if (!eventId) return;
        setIsLoading(true);
        try {
            const eventData = await api.getEventById(eventId);
            setEvent(eventData);
        } catch (error) {
            console.error("Failed to fetch event details", error);
            setEvent(null);
        } finally {
            setIsLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSetPlacement = async (submissionId: number, placement: number | null) => {
        try {
            await api.setSubmissionPlacement(submissionId, placement);
            fetchData();
        } catch (error) {
            alert("Gagal mengatur pemenang.");
        }
    };

    if (isLoading) return <div className="text-center text-gray-300 p-8">Memuat detail event...</div>;
    if (!event) return <div className="text-center text-red-400 p-8">Event tidak ditemukan atau gagal dimuat.</div>;
    
    return (
        <div className="space-y-8">
            <Link to="/admin/events" className="inline-flex items-center gap-2 text-lime-300 hover:text-lime-200 transition-colors">
                <ArrowLeft size={18} /> Kembali ke Manajemen Event
            </Link>
            
            <div className="bg-[#0b5351]/30 p-6 rounded-lg border border-lime-400/50">
                <div className="flex flex-col md:flex-row gap-8">
                    <img src={event.imageUrl} alt={event.title.id} className="w-full md:w-1/3 h-auto object-cover rounded-md self-start" />
                    <div className="flex-1 space-y-4">
                        <div>
                            <p className="font-semibold text-lime-300">{event.category.name.id}</p>
                            <h2 className="text-3xl font-bold text-gray-100">{event.title.id}</h2>
                            <h3 className="text-xl font-normal text-gray-300">{event.title.en}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-lime-400/20">
                            {event.eventType === 'EXTERNAL' ? (
                                <div className="bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
                                    <ExternalLink className="text-lime-400 shrink-0" size={32} />
                                    <div>
                                        <p className="text-gray-400 text-sm">Jumlah Klik Link</p>
                                        <p className="text-2xl font-bold text-white">{event.externalLinkClicks}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
                                    <Users className="text-lime-400 shrink-0" size={32} />
                                    <div>
                                        <p className="text-gray-400 text-sm">Jumlah Peserta</p>
                                        <p className="text-2xl font-bold text-white">{event.submissions.length}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {event.eventType === 'INTERNAL' && (
                <div>
                    <h3 className="text-2xl font-bold text-lime-200/90 mb-4">Karya Peserta</h3>
                    <div className="bg-[#0b5351]/30 p-4 rounded-lg border border-lime-400/50 overflow-x-auto">
                       {event.submissions.length > 0 ? (
                           <table className="w-full text-left text-gray-300 min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-lime-400/30">
                                        <th className="p-3 font-semibold">Peserta</th>
                                        <th className="p-3 font-semibold">Karya</th>
                                        <th className="p-3 font-semibold">Pemenang</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {event.submissions.map(sub => (
                                        <tr key={sub.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                                            <td className="p-3 font-medium">{sub.user.name}</td>
                                            <td className="p-3">
                                                <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline">
                                                    <ImageIcon size={16} /> Lihat Karya
                                                </a>
                                            </td>
                                            <td className="p-3">
                                                <select
                                                    value={sub.placement || 0}
                                                    onChange={(e) => handleSetPlacement(sub.id, e.target.value === '0' ? null : Number(e.target.value))}
                                                    className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-lime-400"
                                                >
                                                    <option value={0}>-</option>
                                                    <option value={1}>Juara 1</option>
                                                    <option value={2}>Juara 2</option>
                                                    <option value={3}>Juara 3</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                       ) : (
                           <p className="text-center text-gray-400 p-4">Belum ada peserta yang mengirimkan karya.</p>
                       )}
                    </div>
                </div>
            )}
        </div>
    );
};