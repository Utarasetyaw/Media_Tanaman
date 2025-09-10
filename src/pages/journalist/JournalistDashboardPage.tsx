import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CheckCircle, Clock, Edit, ShieldAlert, XCircle, FileText, MessageSquare } from 'lucide-react';
import type { Article, ArticleStatus, AdminEditRequestStatus } from '../../types';


// --- Konfigurasi API Service (diintegrasikan langsung) ---
const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// --- Akhir dari Konfigurasi API ---

interface DashboardStats {
    published: number;
    inReview: number;
    needsRevision: number;
    adminRequest: number;
    rejected: number;
}

interface DashboardData {
    stats: DashboardStats;
    recentArticles: Article[];
}

// --- API Function ---
const fetchDashboardData = async (): Promise<DashboardData> => {
    const { data } = await api.get('/articles/my-dashboard-stats');
    return data;
};

// --- Sub-Komponen ---

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: number; color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-black/20 border-2 border-lime-400/30 p-6 rounded-lg shadow-md flex items-center transition-all hover:border-lime-400 hover:bg-black/40">
        <div className={`p-3 rounded-full bg-${color}-500/20`}>
            <Icon className={`text-${color}-300`} size={28} />
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-300">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const getStatusChip = (article: Article) => {
    const displayStatus = article.adminEditRequest === 'PENDING' ? article.adminEditRequest : article.status;
    const statusText = displayStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const styles: Record<ArticleStatus | AdminEditRequestStatus, string> = {
        PUBLISHED: 'bg-green-500/20 text-green-300',
        IN_REVIEW: 'bg-blue-500/20 text-blue-300',
        NEEDS_REVISION: 'bg-yellow-500/20 text-yellow-300',
        JOURNALIST_REVISING: 'bg-yellow-600/20 text-yellow-200 animate-pulse',
        REVISED: 'bg-indigo-500/20 text-indigo-300',
        REJECTED: 'bg-red-500/20 text-red-300',
        DRAFT: 'bg-gray-500/20 text-gray-300',
        PENDING: 'bg-purple-500/20 text-purple-300',
        APPROVED: 'bg-teal-500/20 text-teal-300',
        DENIED: 'bg-pink-500/20 text-pink-300',
        NONE: '',
    };
    return <span className={`text-xs font-bold px-2 py-1 rounded-full ${styles[displayStatus]}`}>{statusText}</span>;
};


// --- Komponen Utama ---
export const JournalistDashboardPage: React.FC = () => {
    const { data, isLoading, error } = useQuery<DashboardData>({
        queryKey: ['journalistDashboard'],
        queryFn: fetchDashboardData,
    });

    if (isLoading) return <div className="p-8 text-center text-white">Memuat dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-400">Gagal memuat data: {(error as Error).message}</div>;

    const stats = data?.stats;
    const recentArticles = data?.recentArticles || [];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-bold text-lime-400 mb-6 font-serif">Dashboard Jurnalis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCard icon={CheckCircle} title="Diterbitkan" value={stats?.published ?? 0} color="green" />
                <StatCard icon={Clock} title="Menunggu Tinjauan" value={stats?.inReview ?? 0} color="blue" />
                <StatCard icon={Edit} title="Perlu Revisi" value={stats?.needsRevision ?? 0} color="yellow" />
                <StatCard icon={ShieldAlert} title="Permintaan Admin" value={stats?.adminRequest ?? 0} color="purple" />
                <StatCard icon={XCircle} title="Ditolak" value={stats?.rejected ?? 0} color="red" />
            </div>

            <div className="mt-10 bg-[#004A49]/60 border-2 border-lime-400 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-lime-400/30">
                    <h3 className="text-xl font-bold text-lime-400">Aktivitas Artikel Terbaru</h3>
                </div>
                 {recentArticles.length > 0 ? (
                    <ul className="space-y-0">
                        {recentArticles.map((article) => (
                            <li key={article.id} className="p-3 hover:bg-black/20 rounded-md transition-colors border-b-2 border-lime-400/20 last:border-b-0">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-white flex items-center gap-2">
                                        <FileText size={16} className="text-gray-400"/>
                                        {article.title.id}
                                    </p>
                                    {getStatusChip(article)}
                                </div>
                                {(article.status === 'NEEDS_REVISION' || article.status === 'REJECTED') && article.feedback && 
                                    <p className="text-xs text-yellow-400 mt-2 italic pl-8">
                                        <MessageSquare size={12} className="inline mr-1"/> Feedback: "{article.feedback}"
                                    </p>
                                }
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <p className="text-center text-gray-400 py-4">Belum ada aktivitas artikel.</p>
                 )}
            </div>
        </div>
    );
};

