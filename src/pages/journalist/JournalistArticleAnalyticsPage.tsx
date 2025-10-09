import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Heart, BarChart2, User, Calendar, MessageSquare, Tag, Type, Download } from 'lucide-react';
import { useJournalistArticleAnalytics } from '../../hooks/jurnalist/useJournalistArticleAnalytics';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';

// --- Helper & Komponen ---

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "d MMMM yyyy, HH:mm", { locale: id });
};

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string; color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-black/20 border-2 border-lime-400/30 p-4 sm:p-5 rounded-lg shadow-md flex items-start gap-4">
        <div className={`p-3 rounded-full bg-${color}-500/20 flex-shrink-0`}><Icon className={`text-${color}-300`} size={24} /></div>
        <div><p className="text-sm font-medium text-gray-400">{title}</p><p className="text-lg font-bold text-white break-words">{value}</p></div>
    </div>
);

// --- Komponen Utama Halaman ---

export const JournalistArticleAnalyticsPage: React.FC = () => {
    const { article, isLoading, error } = useJournalistArticleAnalytics();
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async (imageUrl: string, title: string) => {
        setIsDownloading(true);
        toast.loading('Mulai mengunduh...');

        try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error('Gagal mengambil gambar dari server.');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            link.setAttribute('download', filename || `${title.replace(/\s+/g, '_')}.jpg`);
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
            setIsDownloading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-white">Memuat analitik artikel...</div>;
    if (error) return <div className="p-8 text-center text-red-400">Gagal memuat data: {(error as Error).message}</div>;
    if (!article) return <div className="p-8 text-center text-gray-400">Data artikel tidak ditemukan.</div>;

    const getStatusInfo = (status: string) => {
        const text = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        let color = 'gray';
        switch (status) {
            case 'PUBLISHED': color = 'green'; break;
            case 'IN_REVIEW': color = 'blue'; break;
            case 'NEEDS_REVISION': case 'REJECTED': color = 'red'; break;
            case 'JOURNALIST_REVISING': color = 'yellow'; break;
        }
        return { text, color };
    };

    const statusInfo = getStatusInfo(article.status);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                 <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90">Analitik Artikel Saya</h2>
                <Link to="/jurnalis/articles" className="w-full sm:w-auto text-lime-300 hover:text-lime-100 flex items-center justify-center sm:justify-start gap-2 bg-black/20 px-4 py-2 rounded-lg border border-lime-400/50 transition-colors">
                    <ArrowLeft size={16} /> Kembali ke Artikel Saya
                </Link>
            </div>

            <div className="bg-[#004A49]/60 border-2 border-lime-400/50 p-4 sm:p-6 rounded-lg shadow-md">
                
                <div className="border-b-2 border-lime-400/30 pb-6 mb-6">
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-lime-300 font-semibold mb-2">
                        <span className="flex items-center gap-1.5"><Tag size={14}/> {article.category.name.id}</span>
                        {article.plantType && <span className="flex items-center gap-1.5"><Type size={14}/> {article.plantType.name.id}</span>}
                    </div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-1">{article.title.id}</h3>
                    {article.title.en && <p className="text-lg text-gray-400 mt-1 italic">{article.title.en}</p>}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 mt-3">
                        <span className="flex items-center gap-2"><User size={14}/> {article.author.name}</span>
                        <span className="flex items-center gap-2"><Calendar size={14}/> Dibuat: {formatDate(article.createdAt)}</span>
                        <span className="flex items-center gap-2"><Calendar size={14}/> Diperbarui: {formatDate(article.updatedAt)}</span>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h4 className="text-xl font-bold text-lime-400 mb-4">Statistik Performa</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <StatCard icon={Eye} title="Total Pembaca" value={String(article.viewCount ?? 0)} color="blue" />
                            <StatCard icon={Heart} title="Total Suka" value={String(article._count?.likes ?? 0)} color="pink" />
                            <StatCard icon={BarChart2} title="Status" value={statusInfo.text} color={statusInfo.color} />
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-xl font-bold text-lime-400 mb-2">Gambar Utama</h4>
                        <p className="text-xs text-gray-400 mb-3">Ukuran Ideal: 1280 x 720 piksel (HD).</p>
                        <div className="aspect-video bg-black/20 rounded-lg overflow-hidden border border-lime-400/30">
                            <img src={article.imageUrl} alt={article.title.id} className="w-full h-full object-cover"/>
                        </div>
                         <button 
                            onClick={() => handleDownload(article.imageUrl, article.title.id)}
                            disabled={isDownloading}
                            className="mt-3 w-full sm:w-auto flex bg-gray-600/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 items-center justify-center gap-2 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            <Download size={16} /> {isDownloading ? 'Mengunduh...' : 'Unduh Gambar'}
                        </button>
                    </div>

                    {article.feedback && (
                        <div>
                            <h4 className="text-xl font-bold text-lime-400 mb-2">Umpan Balik Admin</h4>
                            <div className="bg-yellow-500/10 border border-yellow-400/40 text-yellow-300 p-4 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <MessageSquare className="h-5 w-5 mt-0.5 flex-shrink-0"/>
                                    <p className="italic">"{article.feedback}"</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <h4 className="text-xl font-bold text-lime-400 mb-2">Kutipan (Excerpt)</h4>
                        <div className="bg-black/20 p-4 rounded-md text-gray-300 italic space-y-2">
                            <p><span className="font-bold text-gray-400 text-xs mr-2">[ID]</span>"{article.excerpt.id}"</p>
                            {article.excerpt.en && <p><span className="font-bold text-gray-400 text-xs mr-2">[EN]</span>"{article.excerpt.en}"</p>}
                        </div>
                    </div>
                    
                    <div>
                         <h4 className="text-xl font-bold text-lime-400 mb-2">Pratinjau Konten (ID)</h4>
                         <div className="prose prose-sm sm:prose-base prose-invert max-w-none break-words prose-pre:whitespace-pre-wrap bg-black/20 p-4 rounded-md text-gray-300 prose-headings:text-lime-300 prose-a:text-teal-400 hover:prose-a:text-teal-300">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content.id}</ReactMarkdown>
                         </div>
                    </div>
                    {article.content.en && (
                         <div>
                             <h4 className="text-xl font-bold text-lime-400 mb-2">Pratinjau Konten (EN)</h4>
                             <div className="prose prose-sm sm:prose-base prose-invert max-w-none break-words prose-pre:whitespace-pre-wrap bg-black/20 p-4 rounded-md text-gray-300 prose-headings:text-lime-300 prose-a:text-teal-400 hover:prose-a:text-teal-300">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content.en}</ReactMarkdown>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};