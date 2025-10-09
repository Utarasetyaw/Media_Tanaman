import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventManager } from '../../hooks/admin/useEventManager';
import { ArrowLeft, Trophy, User, Link as LinkIcon, Edit, Save, XCircle, Calendar, MapPin, Download, Mail, Phone, Home, Globe, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "d MMMM yyyy, HH:mm", { locale: id });
};

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number; color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-black/20 border-2 border-lime-400/30 p-4 rounded-lg flex items-start gap-4">
        <div className={`p-3 rounded-full bg-${color}-500/20 flex-shrink-0`}>
            <Icon className={`text-${color}-300`} size={24} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-lg font-bold text-white">{value}</p>
        </div>
    </div>
);

const InfoItem: React.FC<{ icon: React.ElementType; label: string; value?: string | null }> = ({ icon: Icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-2 text-sm">
            <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
                <strong className="block text-gray-400">{label}:</strong>
                <p className="text-gray-200 break-words">{value}</p>
            </div>
        </div>
    );
};

export const EventDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { event, isLoadingDetail, handleSetPlacement } = useEventManager(id);

    const [editingSubmissionId, setEditingSubmissionId] = useState<number | null>(null);
    const [placementValue, setPlacementValue] = useState<string>('0');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const handleDownload = async (imageUrl: string, fileName: string) => {
        setDownloadingId(imageUrl);
        toast.loading('Mulai mengunduh...');

        try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error('Gagal mengambil gambar dari server.');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const finalFilename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            link.setAttribute('download', finalFilename || `${fileName.replace(/\s+/g, '_')}.jpg`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.dismiss();
            toast.success('Gambar berhasil diunduh!');
        } catch (err) {
            console.error("Download Error:", err);
            toast.dismiss();
            toast.error('Gagal mengunduh gambar.');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleEditPlacement = (submission: any) => {
        setEditingSubmissionId(submission.id);
        setPlacementValue(String(submission.placement || '0'));
    };

    const handleSavePlacement = (submissionId: number) => {
        handleSetPlacement(submissionId, placementValue);
        setEditingSubmissionId(null);
    };

    if (isLoadingDetail) return <div className="p-8 text-center text-white">Memuat detail event...</div>;
    
    if (!event) return (
        <div className="p-8 text-center text-gray-400">
            <p>Event tidak ditemukan atau gagal dimuat.</p>
            <button onClick={() => navigate('/admin/events')} className="mt-4 text-lime-300 hover:text-lime-100 flex items-center justify-center gap-2 bg-black/20 px-4 py-2 rounded-lg border border-lime-400/50 transition-colors mx-auto">
                <ArrowLeft size={16} /> Kembali
            </button>
        </div>
    );

    const getPlacementLabel = (placement: number | null) => {
        if (placement === 1) return 'Juara 1';
        if (placement === 2) return 'Juara 2';
        if (placement === 3) return 'Juara 3';
        return 'Peserta';
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90">Detail Event</h2>
                <button onClick={() => navigate('/admin/events')} className="flex items-center justify-center gap-2 bg-transparent border border-lime-400/60 text-lime-200/90 font-semibold py-2 px-4 rounded-lg hover:bg-lime-900/20 transition-colors text-sm w-full sm:w-auto">
                    <ArrowLeft size={16} /> Kembali ke Manajemen Event
                </button>
            </div>

            <div className="bg-[#0b5351]/30 p-4 sm:p-6 rounded-lg border border-lime-400/50 space-y-8">
                <div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white">{event.title.id}</h3>
                    {event.title.en && <p className="text-gray-400 italic mt-1">{event.title.en}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard icon={User} title="Penyelenggara" value={event.organizer} color="blue" />
                    <StatCard icon={LinkIcon} title="Tipe Event" value={event.eventType === 'INTERNAL' ? 'Internal' : 'Eksternal'} color="yellow" />
                    {event.eventType === 'INTERNAL' ? (
                        <StatCard icon={Trophy} title="Total Submission" value={event.submissions?.length || 0} color="green" />
                    ) : (
                        <StatCard icon={Trophy} title="Total Klik Link" value={event.externalLinkClicks || 0} color="pink" />
                    )}
                </div>
                
                <div className="space-y-4 border-t border-lime-400/20 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3"><Calendar size={18} className="text-lime-400 mt-1 flex-shrink-0"/><p><strong className="block text-gray-300">Mulai:</strong> {formatDate(event.startDate)}</p></div>
                        <div className="flex items-start gap-3"><Calendar size={18} className="text-lime-400 mt-1 flex-shrink-0"/><p><strong className="block text-gray-300">Selesai:</strong> {formatDate(event.endDate)}</p></div>
                    </div>
                     <div className="flex items-start gap-3"><MapPin size={18} className="text-lime-400 mt-1 flex-shrink-0"/><p><strong className="block text-gray-300">Lokasi:</strong> {event.location}</p></div>
                </div>

                <div>
                    <img src={event.imageUrl} alt={event.title.id} className="w-full aspect-video object-cover rounded-lg bg-black/20" />
                    <div className="flex justify-center mt-3">
                        <button 
                            onClick={() => handleDownload(event.imageUrl, event.title.id)}
                            disabled={downloadingId === event.imageUrl}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-600/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {downloadingId === event.imageUrl ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            {downloadingId === event.imageUrl ? 'Mengunduh...' : 'Unduh Gambar Utama'}
                        </button>
                    </div>
                </div>
                
                <div>
                    <h4 className="text-xl font-bold text-lime-400 mb-2">Deskripsi (ID)</h4>
                    <p className="text-gray-300 whitespace-pre-wrap">{event.description.id}</p>
                </div>
                {event.description.en && (
                     <div>
                        <h4 className="text-xl font-bold text-lime-400 mb-2">Deskripsi (EN)</h4>
                        <p className="text-gray-300 whitespace-pre-wrap">{event.description.en}</p>
                    </div>
                )}
                
                {event.eventType === 'EXTERNAL' && (
                    <div>
                        <h4 className="text-xl font-bold text-lime-400 mb-2">Link Eksternal</h4>
                        <a href={event.externalUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline break-all">{event.externalUrl}</a>
                    </div>
                )}
                
                {event.eventType === 'INTERNAL' && (
                    <div>
                        <h4 className="text-xl font-bold text-lime-400 mb-4">Submission Peserta ({event.submissions.length})</h4>
                        {event.submissions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {event.submissions.map((sub) => (
                                    <div key={sub.id} className="bg-black/20 p-4 rounded-lg border border-lime-400/20 flex flex-col gap-4">
                                        <div className='space-y-2'>
                                            <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer">
                                                <img src={sub.submissionUrl} alt={`Karya dari ${sub.user.name}`} className="w-full aspect-video object-contain rounded-md bg-black/30" />
                                            </a>
                                            <button 
                                                onClick={() => handleDownload(sub.submissionUrl, sub.user.name)}
                                                disabled={downloadingId === sub.submissionUrl}
                                                className="w-full flex items-center justify-center gap-2 bg-gray-600/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed"
                                            >
                                                {downloadingId === sub.submissionUrl ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                                {downloadingId === sub.submissionUrl ? 'Mengunduh...' : 'Unduh Karya'}
                                            </button>
                                        </div>

                                        <div className="border-t border-lime-400/20 pt-4 flex flex-col flex-grow">
                                            <div className="space-y-2 flex-grow">
                                                <p className="font-semibold text-white flex items-center gap-2"><User size={16} /> {sub.user.name}</p>
                                                <div className="space-y-2 pl-6">
                                                    <InfoItem icon={Mail} label="Email" value={sub.user.email} />
                                                    <InfoItem icon={Phone} label="Telepon" value={sub.user.phoneNumber} />
                                                    <InfoItem icon={Home} label="Alamat" value={sub.user.address} />
                                                    <InfoItem icon={Globe} label="Instagram" value={sub.user.socialMedia} />
                                                </div>
                                                {sub.submissionNotes && <p className="text-sm text-gray-300 mt-2 pt-2 border-t border-lime-400/10 italic">"{sub.submissionNotes}"</p>}
                                            </div>

                                            <div className="flex items-center gap-2 w-full mt-4 pt-3 border-t border-lime-400/20 self-end">
                                                {editingSubmissionId === sub.id ? (
                                                    <>
                                                        <select value={placementValue} onChange={(e) => setPlacementValue(e.target.value)} className="bg-transparent border border-lime-400/60 rounded-md py-1 px-2 text-white w-full">
                                                            <option value="0" className="bg-[#003938]">Peserta</option>
                                                            <option value="1" className="bg-[#003938]">Juara 1</option>
                                                            <option value="2" className="bg-[#003938]">Juara 2</option>
                                                            <option value="3" className="bg-[#003938]">Juara 3</option>
                                                        </select>
                                                        <button onClick={() => handleSavePlacement(sub.id)} className="p-2 text-green-400 hover:text-green-300"><Save size={18} /></button>
                                                        <button onClick={() => setEditingSubmissionId(null)} className="p-2 text-gray-400 hover:text-white"><XCircle size={18} /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-sm font-semibold text-lime-300 flex items-center gap-2 flex-grow"><Trophy size={16} /> {getPlacementLabel(sub.placement)}</span>
                                                        <button onClick={() => handleEditPlacement(sub)} className="p-2 text-blue-400 hover:text-blue-300"><Edit size={18} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">Belum ada submission.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};