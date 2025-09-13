import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Heart, BarChart2 } from 'lucide-react';
import { useJournalistArticleAnalytics } from '../../hooks/useJournalistArticleAnalytics'; // <-- Impor hook baru
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: number | string; color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-black/20 border-2 border-lime-400/30 p-6 rounded-lg shadow-md flex items-center gap-4">
        <div className={`p-3 rounded-full bg-${color}-500/20`}>
            <Icon className={`text-${color}-300`} size={28} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-300">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

export const JournalistArticleAnalyticsPage: React.FC = () => {
    // REVISI: Semua logika data sekarang berasal dari satu hook
    const { article, isLoading, error } = useJournalistArticleAnalytics();

    if (isLoading) return <div className="p-8 text-center text-white">Memuat analitik artikel...</div>;
    if (error) return <div className="p-8 text-center text-red-400">Gagal memuat data: {(error as Error).message}</div>;
    if (!article) return <div className="p-8 text-center text-gray-400">Data artikel tidak ditemukan.</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                 <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90">
                    Analitik Artikel
                </h2>
                <Link to="/jurnalis/articles" className="text-lime-300 hover:text-lime-100 flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg border border-lime-400/50 transition-colors">
                    <ArrowLeft size={16} /> Kembali ke Artikel Saya
                </Link>
            </div>

            <div className="bg-[#004A49]/60 border-2 border-lime-400/50 p-6 rounded-lg shadow-md">
                <div className="border-b-2 border-lime-400/30 pb-4 mb-6">
                    <p className="text-sm text-lime-300 font-semibold">{article.category.name.id}</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{article.title.id}</h3>
                </div>
                
                <h4 className="text-xl font-bold text-lime-400 mb-4">Statistik Performa</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <StatCard icon={Eye} title="Total Pembaca" value={article.viewCount ?? 0} color="blue" />
                    <StatCard icon={Heart} title="Total Suka" value={article._count?.likes ?? 0} color="pink" />
                    <StatCard icon={BarChart2} title="Status" value={article.status.replace('_', ' ')} color="green" />
                </div>

                <div className="mt-8 pt-6 border-t border-lime-400/30">
                     <h4 className="text-xl font-bold text-lime-400 mb-4">Pratinjau Konten (Indonesia)</h4>
                     <div className="prose prose-invert max-w-none bg-black/20 p-4 rounded-md text-gray-300 prose-headings:text-lime-300 prose-a:text-teal-400 hover:prose-a:text-teal-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {article.content.id}
                        </ReactMarkdown>
                     </div>
                </div>
                
                 <div className="mt-6 flex justify-end">
                    <Link to={`/news/${article.id}`} target="_blank" rel="noopener noreferrer" className="bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 flex items-center gap-2 transition-colors">
                        Lihat Halaman Publik
                    </Link>
                </div>
            </div>
        </div>
    );
};