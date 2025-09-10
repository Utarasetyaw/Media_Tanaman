import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Eye, Heart, BarChart2 } from 'lucide-react';
import type { Article } from '../../types';

// --- Placeholder untuk ReactMarkdown agar tidak error saat pratinjau ---
const ReactMarkdown = ({ children }: { children: React.ReactNode }) => {
    // Komponen ini akan merender teks mentah dalam pratinjau, 
    // tetapi di aplikasi React sebenarnya, library 'react-markdown' akan merendernya sebagai HTML.
    return <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'sans-serif', color: 'inherit' }}>{children}</div>;
};

// --- Tipe data yang diperluas untuk analitik ---
interface ArticleWithAnalytics extends Article {
    viewCount?: number;
    _count?: {
        likes: number;
    };
}

// --- Konfigurasi API Service ---
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- API Function ---
const fetchMyArticleAnalytics = async (id: string): Promise<ArticleWithAnalytics> => {
    const { data } = await api.get(`/articles/my-articles/analytics/${id}`);
    return data;
};


// --- Sub-Komponen ---
const StatCard: React.FC<{ icon: React.ElementType; title: string; value: number | string; color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-black/20 border-2 border-lime-400/30 p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full bg-${color}-500/20`}>
            <Icon className={`text-${color}-300`} size={28} />
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-300">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);


// --- Komponen Utama ---
export const JournalistArticleAnalyticsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const { data: article, isLoading, error } = useQuery({
        queryKey: ['myArticleAnalytics', id],
        queryFn: () => fetchMyArticleAnalytics(id!),
        enabled: !!id, // Hanya jalankan query jika ID tersedia
    });

    if (isLoading) return <div className="p-8 text-center text-white">Memuat analitik artikel...</div>;
    if (error) return <div className="p-8 text-center text-red-400">Gagal memuat data: {(error as Error).message}</div>;
    if (!article) return <div className="p-8 text-center text-gray-400">Data artikel tidak ditemukan.</div>

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                 <h2 className="text-2xl sm:text-3xl font-bold text-lime-400 font-serif">
                    Detail & Analitik Artikel
                </h2>
                <Link to="/jurnalis/articles" className="text-lime-300 hover:text-lime-100 flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg border border-lime-400/50">
                    <ArrowLeft size={16} /> Kembali
                </Link>
            </div>

            <div className="bg-[#004A49]/60 border-2 border-lime-400 p-6 rounded-lg shadow-md">
                <div className="border-b-2 border-lime-400/30 pb-4 mb-6">
                    <p className="text-sm text-lime-300 font-semibold">{article.category || 'Tanpa Kategori'}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{article.title.id}</h3>
                    <p className="text-md text-gray-300 italic mt-2">{article.excerpt.id}</p>
                </div>
                
                <h4 className="text-xl font-bold text-lime-400 mb-4">Statistik Performa</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <StatCard icon={Eye} title="Total Pembaca" value={article.viewCount ?? 0} color="blue" />
                    <StatCard icon={Heart} title="Total Suka" value={article._count?.likes ?? 0} color="pink" />
                    <StatCard icon={BarChart2} title="Status" value={article.status.replace('_', ' ')} color="green" />
                </div>

                <div className="mt-8 pt-6 border-t border-lime-400/30">
                     <h4 className="text-xl font-bold text-lime-400 mb-4">Pratinjau Konten (Bahasa Indonesia)</h4>
                     <div className="prose prose-invert max-w-none bg-black/20 p-4 rounded-md text-gray-300 prose-headings:text-lime-300 prose-a:text-teal-400 hover:prose-a:text-teal-300">
                        <ReactMarkdown>{article.content.id}</ReactMarkdown>
                     </div>
                </div>
                
                 <div className="mt-6 flex justify-end">
                    <Link to={`/news/${article.id}`} target="_blank" rel="noopener noreferrer" className="bg-lime-300 text-lime-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-400 flex items-center gap-2">
                        Lihat Halaman Publik
                    </Link>
                </div>
            </div>
        </div>
    );
};

