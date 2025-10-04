import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Heart, BarChart2, User, Calendar, MessageSquare, Tag, Type, Globe, Search, Download } from 'lucide-react';
import { useArticleAnalytics } from '../../hooks/admin/useArticleAnalytics';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// --- Helper & Komponen (Tidak ada perubahan) ---

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

const SeoInfoItem: React.FC<{ label: string; value?: string | null | {id: string, en: string} }> = ({ label, value }) => {
    if (!value || (typeof value === 'object' && !value.id && !value.en)) return null;
    return (
        <div>
            <p className="text-xs font-semibold text-lime-300 uppercase tracking-wider">{label}</p>
            {typeof value === 'object' && value !== null ? (
                <>
                    {value.id && <p className="text-sm text-gray-200 mt-0.5 break-words"><span className="font-bold text-gray-400 text-xs mr-2">[ID]</span>{value.id}</p>}
                    {value.en && <p className="text-sm text-gray-200 mt-0.5 break-words"><span className="font-bold text-gray-400 text-xs mr-2">[EN]</span>{value.en}</p>}
                </>
            ) : (
                <p className="text-sm text-gray-200 mt-0.5 break-words">{String(value)}</p>
            )}
        </div>
    );
};

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

                {/* ▼▼▼ STRUKTUR UTAMA DIUBAH MENJADI SATU KOLOM ▼▼▼ */}
                <div className="space-y-8">

                    {/* 1. STATISTIK PERFORMA */}
                    <div>
                        <h4 className="text-xl font-bold text-lime-400 mb-4">Statistik Performa</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <StatCard icon={Eye} title="Total Pembaca" value={String(article.viewCount ?? 0)} color="blue" />
                            <StatCard icon={Heart} title="Total Suka" value={String(article._count?.likes ?? 0)} color="pink" />
                            <StatCard icon={BarChart2} title="Status" value={statusInfo.text} color={statusInfo.color} />
                        </div>
                    </div>
                    
                    {/* 2. GAMBAR UTAMA (PINDAH KE SINI) */}
                    <div>
                        <h4 className="text-xl font-bold text-lime-400 mb-2">Gambar Utama</h4>
                        <p className="text-xs text-gray-400 mb-3">Rekomendasi rasio 16:9 (Contoh: 1280x720 piksel).</p>
                        <div className="aspect-w-16 aspect-h-9 bg-black/20 rounded-lg overflow-hidden border border-lime-400/30">
                            <img src={article.imageUrl} alt={article.title.id} className="w-full h-full object-cover"/>
                        </div>
                         <a 
                            href={article.imageUrl} 
                            download 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="mt-3 w-full sm:w-auto inline-flex bg-gray-600/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 items-center justify-center gap-2 transition-colors"
                        >
                            <Download size={16} /> Unduh Gambar
                        </a>
                    </div>

                    {/* 3. UMPAN BALIK ADMIN */}
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
                    
                    {/* 4. KUTIPAN (EXCERPT) */}
                    <div>
                        <h4 className="text-xl font-bold text-lime-400 mb-2">Kutipan (Excerpt)</h4>
                        <div className="bg-black/20 p-4 rounded-md text-gray-300 italic space-y-2">
                            <p><span className="font-bold text-gray-400 text-xs mr-2">[ID]</span>"{article.excerpt.id}"</p>
                            {article.excerpt.en && <p><span className="font-bold text-gray-400 text-xs mr-2">[EN]</span>"{article.excerpt.en}"</p>}
                        </div>
                    </div>

                    {/* 5. TINJAUAN SEO (DENGAN TOMBOL EDIT DI DALAMNYA) */}
                    {article.seo && (
                        <div>
                            <h4 className="text-xl font-bold text-lime-400 mb-4 flex items-center gap-2"><Search size={20}/> Tinjauan SEO</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-black/20 p-4 rounded-md">
                                <SeoInfoItem label="Meta Title" value={article.seo.metaTitle} />
                                <SeoInfoItem label="Keywords" value={article.seo.keywords} />
                                <div className="sm:col-span-2">
                                    <SeoInfoItem label="Meta Description" value={article.seo.metaDescription} />
                                </div>
                                <hr className="sm:col-span-2 border-lime-400/20"/>
                                <SeoInfoItem label="OG Title" value={article.seo.ogTitle} />
                                <SeoInfoItem label="OG Image URL" value={article.seo.ogImageUrl} />
                                <div className="sm:col-span-2">
                                    <SeoInfoItem label="OG Description" value={article.seo.ogDescription} />
                                </div>
                                <hr className="sm:col-span-2 border-lime-400/20"/>
                                <SeoInfoItem label="Canonical URL" value={article.seo.canonicalUrl} />
                                <SeoInfoItem label="Meta Robots" value={article.seo.metaRobots} />
                            </div>
                            <Link to={`/admin/articles/seo/${article.id}`} className="mt-4 w-full sm:w-auto inline-flex bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 items-center justify-center gap-2 transition-colors">
                                <Globe size={18} /> Edit SEO Artikel
                            </Link>
                        </div>
                    )}
                    
                    {/* 6. PRATINJAU KONTEN */}
                    <div>
                         <h4 className="text-xl font-bold text-lime-400 mb-2">Pratinjau Konten (ID)</h4>
                         <div className="prose prose-sm sm:prose-base prose-invert max-w-none bg-black/20 p-4 rounded-md text-gray-300 prose-headings:text-lime-300 prose-a:text-teal-400 hover:prose-a:text-teal-300">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content.id}</ReactMarkdown>
                         </div>
                    </div>
                    {article.content.en && (
                         <div>
                             <h4 className="text-xl font-bold text-lime-400 mb-2">Pratinjau Konten (EN)</h4>
                             <div className="prose prose-sm sm:prose-base prose-invert max-w-none bg-black/20 p-4 rounded-md text-gray-300 prose-headings:text-lime-300 prose-a:text-teal-400 hover:prose-a:text-teal-300">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content.en}</ReactMarkdown>
                             </div>
                        </div>
                    )}
                </div>
                {/* ▲▲▲ AKHIR DARI STRUKTUR UTAMA ▲▲▲ */}

            </div>
        </div>
    );
};