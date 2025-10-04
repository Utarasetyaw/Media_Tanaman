import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserDashboard } from '../../hooks/user/useUserDashboard';
import type { EventDashboard, UserProfile } from '../../types/user/userDashboard.types';
import { Award, Calendar, CheckCircle, Clock, Upload, X, Image as ImageIcon, AlertTriangle, User, Phone, Globe, Edit, Download } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// --- Helper Functions ---
const formatDate = (dateString: string) => format(new Date(dateString), "d MMMM yyyy", { locale: id });
const formatRemainingTime = (endDate: string) => {
    const diff = new Date(endDate).getTime() - new Date().getTime();
    if (diff <= 0) return "Waktu pengiriman telah berakhir";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} hari tersisa`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours} jam tersisa`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes} menit tersisa`;
};

// --- Sub-Komponen ---
const StatCard: React.FC<{ count: number; label: string; icon: React.ElementType }> = ({ count, label, icon: Icon }) => (
    // ▼▼▼ PERUBAHAN DI SINI ▼▼▼
    <div className="bg-black/20 p-4 rounded-lg border border-green-400/20 flex items-center gap-4 transition-colors hover:border-green-400/50">
        <Icon className="w-8 h-8 text-green-400 shrink-0" />
        <div>
            {/* Ukuran teks diubah agar responsif */}
            <p className="text-2xl md:text-xl lg:text-3xl font-bold text-white">{count}</p>
            <p className="text-sm md:text-xs lg:text-sm text-gray-400">{label}</p>
        </div>
    </div>
);
// ▲▲▲ AKHIR PERUBAHAN ▲▲▲


const EventCard: React.FC<{ 
    event: EventDashboard; 
    type: 'open' | 'past' | 'upcoming'; 
    onUploadClick: (event: EventDashboard) => void; 
    onViewClick: (event: EventDashboard) => void;
    isProfileComplete: boolean;
}> = ({ event, type, onUploadClick, onViewClick, isProfileComplete }) => (
    <div className="bg-black/20 rounded-lg overflow-hidden border border-gray-700 hover:border-green-400/50 transition-colors flex flex-col">
        <Link to={`/events/${event.id}`}>
            <img src={event.imageUrl} alt={event.title.id} className="w-full h-48 object-cover" />
        </Link>
        <div className="p-4 sm:p-5 flex flex-col flex-grow">
            <p className="text-sm text-gray-400 flex items-center gap-2"><Calendar size={14} />{formatDate(event.startDate)} - {formatDate(event.endDate)}</p>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1 hover:text-green-400 transition-colors">
                <Link to={`/events/${event.id}`}>{event.title.id}</Link>
            </h3>
            <div className="mt-4 flex-grow flex flex-col justify-end">
                {type === 'open' && (
                    <div className="space-y-3">
                        {event.submission ? (
                            <div className="flex items-center justify-between gap-3 text-green-300 bg-green-900/40 p-3 rounded-md border border-green-500/30">
                                <div className="flex items-center gap-3"><CheckCircle size={20} /><p className="font-semibold">Karya Terkirim</p></div>
                                <button onClick={() => onViewClick(event)} className="text-sm text-blue-400 hover:underline flex-shrink-0">Lihat</button>
                            </div>
                        ) : (
                             <p className="text-sm text-yellow-300 bg-yellow-900/40 p-2 rounded-md border border-yellow-500/30">Anda belum mengirimkan karya.</p>
                        )}
                        <button 
                            onClick={() => onUploadClick(event)}
                            disabled={!isProfileComplete}
                            className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                            title={!isProfileComplete ? "Lengkapi profil Anda untuk mengupload karya" : (event.submission ? 'Ubah Karya' : 'Upload Karya')}
                        >
                           <Upload size={16} /> {event.submission ? 'Ubah Karya' : 'Upload Karya'}
                        </button>
                        <p className="text-center text-sm text-red-400 font-medium">{formatRemainingTime(event.endDate)}</p>
                    </div>
                )}
                {type === 'upcoming' && (
                    <div className="bg-blue-900/40 text-blue-300 border border-blue-500/30 p-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2"><Clock size={16} /> Akan Datang</div>
                )}
                {type === 'past' && event.submission && (
                     <div className="flex flex-wrap items-center gap-4">
                        <button onClick={() => onViewClick(event)} className="inline-flex items-center gap-2 font-semibold text-blue-400 hover:underline"><ImageIcon size={16} /> Lihat Karya</button>
                        {event.submission.placement && (
                            <p className="inline-flex items-center gap-2 font-bold text-yellow-300 bg-yellow-500/20 px-3 py-1 rounded-full text-sm"><Award size={16} /> Juara {event.submission.placement}</p>
                        )}
                     </div>
                )}
            </div>
        </div>
    </div>
);

export const UserDashboardPage: React.FC = () => {
    const { dashboardData, isLoading, isError, error, submitMutation, updateProfileMutation } = useUserDashboard();
    
    const [modalMode, setModalMode] = useState<'upload' | 'view' | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<EventDashboard | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [caption, setCaption] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileData, setProfileData] = useState<Partial<UserProfile>>({ address: '', phoneNumber: '', socialMedia: '' });
    
    useEffect(() => { setCaption(selectedEvent?.submission?.submissionNotes || ''); }, [selectedEvent]);
    useEffect(() => { if (dashboardData?.currentUserProfile) setProfileData({ address: dashboardData.currentUserProfile.address || '', phoneNumber: dashboardData.currentUserProfile.phoneNumber || '', socialMedia: dashboardData.currentUserProfile.socialMedia || '', }); }, [dashboardData?.currentUserProfile, isProfileModalOpen]);
    
    const openModal = (event: EventDashboard, mode: 'upload' | 'view') => { setSelectedEvent(event); setModalMode(mode); setSelectedFile(null); };
    const closeModal = () => { setModalMode(null); setSelectedEvent(null); };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]); };
    const handleSubmit = () => { if (!selectedEvent) return; if (!selectedEvent.submission && !selectedFile) { alert("Silakan pilih file untuk diunggah."); return; } submitMutation.mutate({ eventId: selectedEvent.id, file: selectedFile, caption: caption, currentImageUrl: selectedEvent.submission?.submissionUrl }, { onSuccess: () => closeModal() }); };
    const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleProfileSubmit = () => { updateProfileMutation.mutate(profileData as UserProfile, { onSuccess: () => setIsProfileModalOpen(false) }); };
    
    if (isLoading) return <div className="text-center p-8 text-gray-400">Memuat dashboard Anda...</div>;
    if (isError) return <div className="text-center p-8 text-red-400">Gagal memuat data. Error: {error?.message}</div>;

    const { stats, openForSubmission, upcomingEvents, pastEventsHistory, isProfileComplete } = dashboardData!;
    const displayImageUrl = selectedFile ? URL.createObjectURL(selectedFile) : selectedEvent?.submission?.submissionUrl;
    
    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Dashboard Peserta</h1>
                {isProfileComplete && (<button onClick={() => setIsProfileModalOpen(true)} className="w-full sm:w-auto text-lime-300 hover:text-lime-100 flex items-center justify-center sm:justify-start gap-2 bg-black/20 px-4 py-2 rounded-lg border border-lime-400/50 transition-colors" title="Ubah Profil"><Edit size={16} /> <span className="sm:inline">Ubah Profil</span></button>)}
            </div>

            {!isProfileComplete && (<div className="bg-yellow-900/50 border border-yellow-500 text-yellow-300 p-4 rounded-lg mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"><div className="flex items-center gap-3"><AlertTriangle className="w-6 h-6 shrink-0" /><p className="font-semibold text-center sm:text-left">Profil Anda belum lengkap untuk mengikuti event.</p></div><button onClick={() => setIsProfileModalOpen(true)} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 whitespace-nowrap transition-colors flex-shrink-0">Lengkapi Profil</button></div>)}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"><StatCard count={stats.open} label="Event Sedang Dibuka" icon={Upload} /><StatCard count={stats.participated} label="Event Telah Diikuti" icon={CheckCircle} /><StatCard count={stats.upcoming} label="Event Akan Datang" icon={Clock} /></div>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-200 mb-4 border-l-4 border-green-400 pl-3">Event yang Sedang Terbuka</h2>
                {openForSubmission.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{openForSubmission.map(event => <EventCard key={event.id} event={event} type="open" onUploadClick={() => openModal(event, 'upload')} onViewClick={() => openModal(event, 'view')} isProfileComplete={isProfileComplete}/>)}</div>) : <p className="text-gray-400 bg-black/20 border border-gray-700 p-6 rounded-lg">Saat ini tidak ada event yang dibuka untuk pengiriman karya.</p>}
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-200 mb-4 border-l-4 border-orange-400 pl-3">Event Akan Datang</h2>
                {upcomingEvents.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{upcomingEvents.map(event => <EventCard key={event.id} event={event} type="upcoming" onUploadClick={() => {}} onViewClick={() => {}} isProfileComplete={isProfileComplete}/>)}</div>) : <p className="text-gray-400 bg-black/20 border border-gray-700 p-6 rounded-lg">Tidak ada event yang dijadwalkan dalam waktu dekat.</p>}
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-200 mb-4 border-l-4 border-blue-400 pl-3">Riwayat Event yang Diikuti</h2>
                 {pastEventsHistory.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{pastEventsHistory.map(event => <EventCard key={event.id} event={event} type="past" onUploadClick={() => {}} onViewClick={() => openModal(event, 'view')} isProfileComplete={isProfileComplete}/>)}</div>) : <p className="text-gray-400 bg-black/20 border border-gray-700 p-6 rounded-lg">Anda belum pernah mengikuti dan menyelesaikan event.</p>}
            </section>

            {modalMode && selectedEvent && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#073f3d] text-gray-200 rounded-lg shadow-xl w-full max-w-lg border border-green-400/50 flex flex-col max-h-[90vh]">
                        <div className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0"><h3 className="text-xl font-bold text-white">{modalMode === 'upload' ? 'Unggah/Ubah Karya' : 'Lihat Karya'}</h3><button onClick={closeModal} className="text-gray-400 hover:text-white"><X /></button></div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="w-full aspect-video rounded-md bg-black/20 flex items-center justify-center border-2 border-dashed border-gray-600">{displayImageUrl ? (<img src={displayImageUrl} alt="Pratinjau Karya" className="max-w-full max-h-full object-contain"/>) : (<p className="text-gray-500">Pratinjau Gambar</p>)}</div>
                            {modalMode === 'upload' && (
                                <div>
                                    <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-green-400 hover:bg-black/20 transition-colors">{selectedFile ? <span className="text-green-300 font-semibold">{selectedFile.name}</span> : <span className="text-gray-400">Pilih Berkas...</span>}</button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="submission-file-input" />
                                    <p className="text-xs text-gray-400 mt-2 text-center">Rekomendasi rasio 16:9 (Contoh: 1280x720 piksel).</p>
                                </div>
                            )}
                            {modalMode === 'view' && selectedEvent.submission?.submissionUrl && (<a href={selectedEvent.submission.submissionUrl} download target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 bg-gray-600/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"><Download size={16}/> Unduh Karya</a>)}
                            <div><label htmlFor="caption" className="block text-sm font-medium text-gray-300 mb-2">Keterangan (Caption)</label><textarea id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Tulis keterangan..." className="w-full bg-black/20 border border-gray-600 rounded-md p-2 focus:ring-green-500 focus:border-green-500" rows={4} readOnly={modalMode === 'view'} /></div>
                        </div>
                        {modalMode === 'upload' && (<div className="p-4 flex justify-end gap-3 bg-black/20 rounded-b-lg flex-shrink-0"><button onClick={closeModal} disabled={submitMutation.isPending} className="bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-500 disabled:opacity-70">Batal</button><button onClick={handleSubmit} disabled={submitMutation.isPending} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50">{submitMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}</button></div>)}
                    </div>
                </div>
            )}

            {isProfileModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#073f3d] text-gray-200 rounded-lg shadow-xl w-full max-w-lg border border-yellow-400/50 flex flex-col max-h-[90vh]">
                        <div className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0"><h3 className="text-xl font-bold text-white">{isProfileComplete ? 'Ubah Profil Anda' : 'Lengkapi Profil Anda'}</h3><button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-white"><X /></button></div>
                        <div className="p-6 space-y-5 overflow-y-auto">
                            {!isProfileComplete && (<p className="text-sm text-gray-400">Anda harus mengisi Alamat dan No. Telepon untuk dapat berpartisipasi dalam event.</p>)}
                             <div><label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">Alamat Lengkap</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><textarea id="address" name="address" rows={3} value={profileData.address || ''} onChange={handleProfileInputChange} placeholder="Contoh: Jl. Narapati No. 10, Jakarta" className="w-full bg-black/20 border border-gray-600 rounded-md p-2 pl-10 focus:ring-yellow-500 focus:border-yellow-500" /></div></div>
                             <div><label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-2">No. Telepon (WhatsApp)</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input id="phoneNumber" name="phoneNumber" type="tel" value={profileData.phoneNumber || ''} onChange={handleProfileInputChange} placeholder="Contoh: 081234567890" className="w-full bg-black/20 border border-gray-600 rounded-md p-2 pl-10 focus:ring-yellow-500 focus:border-yellow-500" /></div></div>
                             <div><label htmlFor="socialMedia" className="block text-sm font-medium text-gray-300 mb-2">Instagram (Opsional)</label><div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input id="socialMedia" name="socialMedia" type="text" value={profileData.socialMedia || ''} onChange={handleProfileInputChange} placeholder="Contoh: @narapatiflora" className="w-full bg-black/20 border border-gray-600 rounded-md p-2 pl-10 focus:ring-yellow-500 focus:border-yellow-500" /></div></div>
                        </div>
                        <div className="p-4 flex justify-end gap-3 bg-black/20 rounded-b-lg flex-shrink-0"><button onClick={() => setIsProfileModalOpen(false)} disabled={updateProfileMutation.isPending} className="bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-500 disabled:opacity-70">Batal</button><button onClick={handleProfileSubmit} disabled={updateProfileMutation.isPending} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 disabled:opacity-50">{updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan Profil'}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};