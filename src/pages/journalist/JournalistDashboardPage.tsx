import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Edit, ShieldAlert, XCircle, FileText, MessageSquare, Edit3, Info } from 'lucide-react';
import type { RecentArticle, ArticleStatus, AdminEditRequestStatus } from '../../types/jurnalist/journalistDashboard.types';
import { useJournalistDashboard } from '../../hooks/jurnalist/useJournalistDashboard';

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: number; color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-black/20 border-2 border-lime-400/30 p-4 sm:p-6 rounded-lg shadow-md flex items-center transition-all hover:border-lime-400 hover:bg-black/40">
        <div className={`p-3 rounded-full bg-${color}-500/20`}>
            <Icon className={`text-${color}-300`} size={28} />
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-300">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const getStatusChip = (article: RecentArticle) => {
    let displayStatus: ArticleStatus | AdminEditRequestStatus = article.status;
    let statusText = '';
    if (article.adminEditRequest === 'PENDING') {
        displayStatus = 'PENDING';
        statusText = 'Req. Akses Edit';
    } else {
        switch(article.status) {
            case 'PUBLISHED': statusText = 'Diterbitkan'; break;
            case 'IN_REVIEW': statusText = 'Dalam Tinjauan'; break;
            case 'NEEDS_REVISION': statusText = 'Perlu Revisi'; break;
            case 'JOURNALIST_REVISING': statusText = 'Sedang Direvisi'; break;
            case 'REVISED': statusText = 'Telah Direvisi'; break;
            case 'REJECTED': statusText = 'Ditolak'; break;
            default: statusText = 'Draf';
        }
    }
    const styles: Record<ArticleStatus | AdminEditRequestStatus | 'NONE', string> = {
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

export const JournalistDashboardPage: React.FC = () => {
    const { data, announcements, isLoading, error } = useJournalistDashboard();

    if (isLoading) return <div className="p-8 text-center text-white">Memuat dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-400">Gagal memuat data: {(error as Error).message}</div>;

    const stats = data?.stats;
    const recentArticles = data?.recentArticles || [];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90 mb-6">Dashboard Jurnalis</h2>

            {announcements && (announcements.journalistAnnouncement?.id || announcements.journalistRules?.id) && (
                <div className="mb-8 p-5 bg-blue-900/40 border border-blue-500/50 rounded-lg space-y-4">
                    <div className="flex items-center gap-3 text-blue-300">
                        <Info size={20} className="shrink-0" />
                        <h2 className="text-xl font-bold">Informasi Penting</h2>
                    </div>
                    {announcements.journalistAnnouncement?.id && (
                        <div>
                            <h3 className="font-semibold text-white mb-1">Pengumuman</h3>
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{announcements.journalistAnnouncement.id}</p>
                        </div>
                    )}
                    {announcements.journalistRules?.id && (
                        <div className="pt-2">
                            <h3 className="font-semibold text-white mb-1">Aturan & Panduan</h3>
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{announcements.journalistRules.id}</p>
                        </div>
                    )}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={CheckCircle} title="Diterbitkan" value={stats?.published ?? 0} color="green" />
                <StatCard icon={Clock} title="Menunggu Tinjauan" value={stats?.inReview ?? 0} color="blue" />
                <StatCard icon={Edit} title="Perlu Revisi" value={stats?.needsRevision ?? 0} color="yellow" />
                <StatCard icon={ShieldAlert} title="Permintaan Admin" value={stats?.adminRequest ?? 0} color="purple" />
                <StatCard icon={XCircle} title="Ditolak" value={stats?.rejected ?? 0} color="red" />
                <StatCard icon={Edit3} title="Draf" value={stats?.draft ?? 0} color="gray" />
            </div>

            <div className="mt-10 bg-[#004A49]/60 border-2 border-lime-400 p-4 sm:p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-lime-400/30">
                    <h3 className="text-xl font-bold text-lime-400">Aktivitas Artikel Terbaru</h3>
                </div>
                 {recentArticles.length > 0 ? (
                    <ul className="space-y-2">
                        {recentArticles.map((article) => (
                            <li key={article.id}>
                                <Link to={`/jurnalis/articles/edit/${article.id}`} className="block p-3 rounded-md transition-colors border-b-2 border-lime-400/20 last:border-b-0 hover:bg-black/20">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                        <p className="font-semibold text-white flex items-center gap-2">
                                            <FileText size={16} className="text-gray-400 flex-shrink-0"/>
                                            <span className="break-words">{article.title.id}</span>
                                        </p>
                                        <div className="self-end sm:self-center flex-shrink-0">
                                            {getStatusChip(article)}
                                        </div>
                                    </div>
                                    {(article.status === 'NEEDS_REVISION' || article.status === 'REJECTED') && article.feedback && 
                                        <p className="text-xs text-yellow-400 mt-2 italic pl-6 sm:pl-8">
                                            <MessageSquare size={12} className="inline mr-1.5"/> Umpan Balik: "{article.feedback}"
                                        </p>
                                    }
                                </Link>
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <p className="text-center text-gray-400 py-4">Belum ada aktivitas artikel terbaru.</p>
                 )}
            </div>
        </div>
    );
};