import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Heart, BarChart2, User, Calendar, MessageSquare, Tag, Type } from 'lucide-react';
import { useArticleAnalytics } from '../../hooks/useArticleAnalytics';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// --- Helper & Komponen ---

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "d MMMM yyyy, HH:mm", { locale: id });
};

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string; color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-black/20 border-2 border-lime-400/30 p-4 sm:p-5 rounded-lg shadow-md flex items-start gap-4">
        <div className={`p-3 rounded-full bg-${color}-500/20 flex-shrink-0`}>
            <Icon className={`text-${color}-300`} size={24} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-lg font-bold text-white break-words">{value}</p>
        </div>
    </div>
);

// --- Komponen Utama Halaman ---

export const ArticleAnalyticsPage: React.FC = () => {
    const { article, isLoading, error } = useArticleAnalytics();

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
                 <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90">Analitik Artikel</h2>
                <Link to="/admin/articles" className="w-full sm:w-auto text-lime-300 hover:text-lime-100 flex items-center justify-center sm:justify-start gap-2 bg-black/20 px-4 py-2 rounded-lg border border-lime-400/50 transition-colors">
                    <ArrowLeft size={16} /> Kembali ke Manajemen Artikel
                </Link>
            </div>

            <div className="bg-[#004A49]/60 border-2 border-lime-400/50 p-4 sm:p-6 rounded-lg shadow-md">
                
                {/* --- BAGIAN HEADER INFORMASI ARTIKEL --- */}
                <div className="border-b-2 border-lime-400/30 pb-6 mb-6">
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-lime-300 font-semibold mb-2">
                        <span className="flex items-center gap-1.5"><Tag size={14}/> {article.category.name.id}</span>
                        {article.plantType && <span className="flex items-center gap-1.5"><Type size={14}/> {article.plantType.name.id}</span>}
                    </div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-1">{article.title.id}</h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 mt-3">
                        <span className="flex items-center gap-2"><User size={14}/> {article.author.name}</span>
                        <span className="flex items-center gap-2"><Calendar size={14}/> Dibuat: {formatDate(article.createdAt)}</span>
                        <span className="flex items-center gap-2"><Calendar size={14}/> Diperbarui: {formatDate(article.updatedAt)}</span>
                    </div>
                </div>

                {/* --- BAGIAN KONTEN UTAMA (GRID) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- KOLOM KIRI: STATISTIK & KONTEN --- */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h4 className="text-xl font-bold text-lime-400 mb-4">Statistik Performa</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <StatCard icon={Eye} title="Total Pembaca" value={String(article.viewCount ?? 0)} color="blue" />
                                <StatCard icon={Heart} title="Total Suka" value={String(article._count?.likes ?? 0)} color="pink" />
                                <StatCard icon={BarChart2} title="Status" value={statusInfo.text} color={statusInfo.color} />
                            </div>
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
                            <div className="bg-black/20 p-4 rounded-md text-gray-300 italic">
                                <p>"{article.excerpt.id}"</p>
                            </div>
                        </div>
                        
                        <div>
                             <h4 className="text-xl font-bold text-lime-400 mb-2">Pratinjau Konten</h4>
                             <div className="prose prose-sm sm:prose-base prose-invert max-w-none bg-black/20 p-4 rounded-md text-gray-300 prose-headings:text-lime-300 prose-a:text-teal-400 hover:prose-a:text-teal-300">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content.id}</ReactMarkdown>
                             </div>
                        </div>
                    </div>

                    {/* --- KOLOM KANAN: GAMBAR & AKSI --- */}
                    <div className="lg:col-span-1 space-y-6">
                        <div>
                            <h4 className="text-xl font-bold text-lime-400 mb-4">Gambar Utama</h4>
                            <div className="aspect-[4/5] bg-black/20 rounded-lg overflow-hidden border border-lime-400/30">
                                <img src={article.imageUrl} alt={article.title.id} className="w-full h-full object-cover"/>
                            </div>
                        </div>
                         {/* <div className="sticky top-24">
                            <Link to={`/news/${article.id}`} target="_blank" rel="noopener noreferrer" className="w-full bg-lime-400 text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 transition-colors">
                                Lihat Halaman Publik
                            </Link>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};