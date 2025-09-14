import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// REVISI: Impor ikon CheckCircle dan Clock
import { ArrowLeft, Users, ExternalLink, Image as ImageIcon, X, User as UserIcon, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useEventManager } from '../../hooks/useEventManager';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Definisikan tipe data yang lebih detail
interface UserProfile {
    id: number;
    name: string;
    email: string;
    address?: string | null;
    phoneNumber?: string | null;
    socialMedia?: string | null;
}
interface Submission {
    id: number;
    submissionUrl: string;
    submissionNotes?: string | null;
    user: UserProfile;
    placement: number | null;
}

// Komponen Kartu Statistik Baru untuk tampilan yang konsisten
const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number; color: string; valueColor?: string; }> = ({ icon: Icon, title, value, color, valueColor }) => (
    <div className="bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
        <div className={`p-3 rounded-full bg-${color}-500/20`}>
            <Icon className={`text-${color}-400 shrink-0`} size={28} />
        </div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className={`text-2xl font-bold ${valueColor || `text-white`}`}>{value}</p>
        </div>
    </div>
);

const lang: 'id' | 'en' = 'id';

export const EventDetailPage: React.FC = () => {
    const { event, isLoadingDetail, isErrorDetail, handleSetPlacement } = useEventManager();

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    const openViewModal = (submission: Submission) => { setSelectedSubmission(submission); setIsViewModalOpen(true); };
    const closeViewModal = () => { setSelectedSubmission(null); setIsViewModalOpen(false); };
    const openProfileModal = (user: UserProfile) => { setSelectedUser(user); setIsProfileModalOpen(true); };
    const closeProfileModal = () => { setSelectedUser(null); setIsProfileModalOpen(false); };

    if (isLoadingDetail) return <div className="text-center text-gray-300 p-8">Memuat detail event...</div>;
    if (isErrorDetail || !event) return (
        <div className="text-center text-red-400 p-8">
            <p>Event tidak ditemukan atau gagal dimuat.</p>
            <Link to="/admin/events" className="text-lime-300 hover:underline mt-4 inline-block">Kembali</Link>
        </div>
    );
    
    const isEventFinished = new Date(event.endDate) < new Date();

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <Link to="/admin/events" className="inline-flex items-center gap-2 text-lime-300 hover:text-lime-200 transition-colors">
                <ArrowLeft size={18} /> Kembali ke Manajemen Event
            </Link>
            
            <div className="bg-[#0b5351]/30 p-4 sm:p-6 rounded-lg border border-lime-400/50">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    <img src={event.imageUrl} alt={event.title[lang]} className="w-full md:w-1/3 h-64 md:h-auto object-cover rounded-md self-start" />
                    <div className="flex-1 space-y-4">
                        <div>
                            <p className="font-semibold text-lime-300">{event.category.name[lang]}</p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">{event.title[lang]}</h2>
                            <h3 className="text-lg sm:text-xl font-normal text-gray-300">{event.title.en}</h3>
                        </div>

                        <div className="text-sm text-gray-400 flex items-center gap-2"><Calendar size={16} /><span>{format(new Date(event.startDate), 'd MMM yyyy', { locale: id })} - {format(new Date(event.endDate), 'd MMM yyyy', { locale: id })}</span></div>

                        {/* REVISI: Menggunakan komponen StatCard agar konsisten */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-lime-400/20">
                            {event.eventType === 'EXTERNAL' ? (
                                <StatCard icon={ExternalLink} title="Jumlah Klik Link" value={event.externalLinkClicks || 0} color="lime" />
                            ) : (
                                <StatCard icon={Users} title="Jumlah Peserta" value={event.submissions?.length || 0} color="lime" />
                            )}
                             <StatCard
                                icon={isEventFinished ? CheckCircle : Clock}
                                title="Status"
                                value={isEventFinished ? 'Selesai' : 'Berlangsung'}
                                color={isEventFinished ? 'green' : 'yellow'}
                                valueColor={isEventFinished ? 'text-green-400' : 'text-yellow-400'}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {event.eventType === 'INTERNAL' && (
                <div>
                    <h3 className="text-2xl font-bold text-lime-200/90 mb-4">Karya Peserta</h3>
                    {event.submissions && event.submissions.length > 0 ? (
                        <>
                            <div className="hidden md:block bg-[#0b5351]/30 p-4 rounded-lg border border-lime-400/50 overflow-x-auto">
                               <table className="w-full text-left text-gray-300 min-w-[600px]">
                                    <thead><tr className="border-b border-lime-400/30"><th className="p-3 font-semibold">Peserta</th><th className="p-3 font-semibold">Karya</th><th className="p-3 font-semibold">Pemenang</th></tr></thead>
                                    <tbody>
                                        {event.submissions.map(sub => (
                                            <tr key={sub.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                                                <td className="p-3 font-medium"><div className="flex items-center gap-3"><span>{sub.user.name}</span><button onClick={() => openProfileModal(sub.user)} title="Lihat Profil Peserta"><UserIcon size={16} className="text-lime-400/70 hover:text-lime-300" /></button></div></td>
                                                <td className="p-3"><button onClick={() => openViewModal(sub)} className="flex items-center gap-2 text-blue-400 hover:underline"><ImageIcon size={16} /> Lihat Karya</button></td>
                                                <td className="p-3"><select value={sub.placement || 0} onChange={(e) => handleSetPlacement(sub.id, e.target.value)} disabled={isEventFinished} className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-lime-400 disabled:opacity-50 disabled:cursor-not-allowed"><option value={0}>-</option><option value={1}>Juara 1</option><option value={2}>Juara 2</option><option value={3}>Juara 3</option></select></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="md:hidden space-y-4">
                                {event.submissions.map(sub => (
                                    <div key={sub.id} className="bg-[#0b5351]/30 p-4 rounded-lg border border-lime-400/50 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3 font-semibold text-white"><span>{sub.user.name}</span><button onClick={() => openProfileModal(sub.user)} title="Lihat Profil Peserta"><UserIcon size={16} className="text-lime-400/70 hover:text-lime-300" /></button></div>
                                            <button onClick={() => openViewModal(sub)} className="flex items-center gap-2 text-blue-400 hover:underline text-sm"><ImageIcon size={16} /> Lihat Karya</button>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-lime-400/20 pt-3">
                                            <label className="font-semibold text-gray-300">Pemenang:</label>
                                            <select value={sub.placement || 0} onChange={(e) => handleSetPlacement(sub.id, e.target.value)} disabled={isEventFinished} className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-lime-400 disabled:opacity-50"><option value={0}>-</option><option value={1}>Juara 1</option><option value={2}>Juara 2</option><option value={3}>Juara 3</option></select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                       ) : (
                           <div className="bg-[#0b5351]/30 p-4 rounded-lg border border-lime-400/50"><p className="text-center text-gray-400 p-4">Belum ada peserta yang mengirimkan karya.</p></div>
                       )}
                </div>
            )}

            {isViewModalOpen && selectedSubmission && (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"><div className="bg-[#073f3d] text-gray-200 rounded-lg shadow-xl w-full max-w-lg border border-green-400/50"><div className="p-4 flex justify-between items-center border-b border-gray-700"><h3 className="text-xl font-bold text-white">Detail Karya: {selectedSubmission.user.name}</h3><button onClick={closeViewModal} className="text-gray-400 hover:text-white"><X /></button></div><div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"><div className="w-full h-72 rounded-md bg-black/20 flex items-center justify-center"><img src={selectedSubmission.submissionUrl} alt={`Karya oleh ${selectedSubmission.user.name}`} className="max-w-full max-h-full object-contain"/></div><div><label className="block text-sm font-medium text-gray-400 mb-1">Caption:</label><p className="w-full bg-black/20 border border-gray-600 rounded-md p-3 whitespace-pre-wrap">{selectedSubmission.submissionNotes || <span className="italic text-gray-500">Tidak ada caption.</span>}</p></div></div></div></div>)}
            {isProfileModalOpen && selectedUser && (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"><div className="bg-[#073f3d] text-gray-200 rounded-lg shadow-xl w-full max-w-md border border-lime-400/50"><div className="p-4 flex justify-between items-center border-b border-gray-700"><h3 className="text-xl font-bold text-white">Profil Peserta</h3><button onClick={closeProfileModal} className="text-gray-400 hover:text-white"><X /></button></div><div className="p-6 space-y-3"><div className="flex flex-col"><span className="text-sm text-gray-400">Nama</span><span className="font-semibold text-lg">{selectedUser.name}</span></div><div className="flex flex-col"><span className="text-sm text-gray-400">Email</span><span className="font-semibold">{selectedUser.email}</span></div><div className="flex flex-col"><span className="text-sm text-gray-400">No. Telepon</span><span className="font-semibold">{selectedUser.phoneNumber || '-'}</span></div><div className="flex flex-col"><span className="text-sm text-gray-400">Instagram</span><span className="font-semibold">{selectedUser.socialMedia || '-'}</span></div><div className="flex flex-col"><span className="text-sm text-gray-400">Alamat</span><p className="font-semibold whitespace-pre-wrap">{selectedUser.address || '-'}</p></div></div></div></div>)}
        </div>
    );
};