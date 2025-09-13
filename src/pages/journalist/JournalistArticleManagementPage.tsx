import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, X, CheckCircle, MessageSquare, Send, ShieldCheck, ShieldX, PlayCircle, BarChart2 } from 'lucide-react';
import type { Article } from '../../types';
import { useJournalistArticleManager } from '../../hooks/useJournalistArticleManager';

type JournalistArticleFilter = 'ALL' | 'DRAFT' | 'IN_REVIEW' | 'NEEDS_REVISION' | 'PUBLISHED' | 'REJECTED' | 'PENDING';

// --- Komponen Tombol Aksi ---
const ActionButton: React.FC<{
    onClick?: () => void;
    to?: string;
    color: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}> = ({ onClick, to, color, icon, children }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-600 hover:bg-blue-700',
        green: 'bg-green-600 hover:bg-green-700',
        red: 'bg-red-600 hover:bg-red-700',
        yellow: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900',
        gray: 'bg-gray-600 hover:bg-gray-700',
        indigo: 'bg-indigo-600 hover:bg-indigo-700',
        purple: 'bg-purple-500 hover:bg-purple-600',
    };
    const commonClasses = "text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1.5 transition-colors";
    
    if (to) {
        return <Link to={to} className={`${commonClasses} ${colorClasses[color]}`}>{icon} {children}</Link>;
    }
    return <button onClick={onClick} className={`${commonClasses} ${colorClasses[color]}`}>{icon} {children}</button>;
};

export const JournalistArticleManagementPage: React.FC = () => {
    const {
        articles,
        isLoading,
        isError,
        isMutating,
        deleteArticle,
        submitArticle,
        startRevision,
        finishRevision,
        respondToRequest,
    } = useJournalistArticleManager();

    const [activeFilter, setActiveFilter] = useState<JournalistArticleFilter>('ALL');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);

    const { filteredArticles, articleCounts } = useMemo(() => {
        const counts: Record<JournalistArticleFilter, number> = {
            ALL: articles.length, DRAFT: 0, IN_REVIEW: 0, NEEDS_REVISION: 0, PUBLISHED: 0, REJECTED: 0, PENDING: 0
        };
        articles.forEach(article => {
            if (article.adminEditRequest === 'PENDING') {
                counts.PENDING++;
            } else if (['IN_REVIEW', 'REVISED'].includes(article.status) || article.adminEditRequest === 'APPROVED') {
                if (article.adminEditRequest !== 'DENIED') {
                    counts.IN_REVIEW++;
                }
            } else if (article.status === 'DRAFT') {
                counts.DRAFT++;
            } else if (['NEEDS_REVISION', 'JOURNALIST_REVISING'].includes(article.status)) {
                counts.NEEDS_REVISION++;
            } else if (article.status === 'PUBLISHED') {
                counts.PUBLISHED++;
            } else if (article.status === 'REJECTED' || article.adminEditRequest === 'DENIED') {
                counts.REJECTED++;
            }
        });

        const filterLogic = (article: Article) => {
            if (activeFilter === 'ALL') return true;
            if (activeFilter === 'PENDING') return article.adminEditRequest === 'PENDING';
            if (article.adminEditRequest === 'PENDING') return false;
            
            switch (activeFilter) {
                case 'DRAFT': return article.status === 'DRAFT';
                case 'IN_REVIEW': 
                    const isInReviewStatus = ['IN_REVIEW', 'REVISED'].includes(article.status) || article.adminEditRequest === 'APPROVED';
                    return isInReviewStatus && article.adminEditRequest !== 'DENIED';
                case 'NEEDS_REVISION': return ['NEEDS_REVISION', 'JOURNALIST_REVISING'].includes(article.status);
                case 'PUBLISHED': return article.status === 'PUBLISHED';
                case 'REJECTED': return article.status === 'REJECTED' || article.adminEditRequest === 'DENIED';
                default: return false;
            }
        };
        return { filteredArticles: articles.filter(filterLogic), articleCounts: counts };
    }, [articles, activeFilter]);

    const handleDelete = (id: number) => {
        if (window.confirm('Yakin ingin menghapus artikel ini?')) {
            deleteArticle(id);
        }
    };
    
    const openRequestModal = (article: Article) => {
        setCurrentArticle(article);
        setIsRequestModalOpen(true);
    };

    const openFeedbackModal = (article: Article) => {
        setCurrentArticle(article);
        setIsFeedbackModalOpen(true);
    };

    const handleRespondToRequest = (response: "APPROVED" | "DENIED") => {
        if (!currentArticle) return;
        respondToRequest({ articleId: currentArticle.id, response }, {
            onSuccess: () => setIsRequestModalOpen(false)
        });
    };

    if (isLoading) return <div className="p-8 text-center text-white">Memuat artikel Anda...</div>;
    if (isError) return <div className="p-8 text-center text-red-400">Gagal memuat data.</div>;

    const FilterButton: React.FC<{ filter: JournalistArticleFilter; label: string; count: number }> = ({ filter, label, count }) => (
        <button
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors flex-shrink-0 border-2 flex items-center gap-2 ${
                activeFilter === filter ? 'bg-lime-300 text-lime-900 border-lime-300' : 'bg-[#004A49]/60 text-lime-300 border-lime-400/50 hover:bg-[#004A49]/90'
            }`}>
            {label} 
            <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                activeFilter === filter ? 'bg-white text-lime-900' : 'bg-gray-800/80 text-gray-200'
            }`}>
                {count || 0}
            </span>
        </button>
    );

    const getStatusChip = (article: Article) => {
        let displayStatus = article.status.replace(/_/g, ' ');
        if (article.adminEditRequest === 'PENDING') displayStatus = 'Permintaan Edit';
        if (article.adminEditRequest === 'APPROVED') displayStatus = 'Izin Diberikan';
        if (article.adminEditRequest === 'DENIED') displayStatus = 'Izin Ditolak';

        const styles: Record<string, string> = {
            PUBLISHED: 'bg-green-500/20 text-green-300', IN_REVIEW: 'bg-blue-500/20 text-blue-300',
            NEEDS_REVISION: 'bg-yellow-500/20 text-yellow-300', 'JOURNALIST REVISING': 'bg-yellow-600/20 text-yellow-200 animate-pulse',
            REVISED: 'bg-indigo-500/20 text-indigo-300', REJECTED: 'bg-red-500/20 text-red-300',
            DRAFT: 'bg-gray-500/20 text-gray-300', 'Permintaan Edit': 'bg-purple-500/20 text-purple-300',
            'Izin Diberikan': 'bg-teal-500/20 text-teal-300', 'Izin Ditolak': 'bg-pink-500/20 text-pink-300',
        };
        return <span className={`capitalize px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[displayStatus] || 'bg-gray-600'}`}>{displayStatus}</span>;
    };
    
    const ActionButtons: React.FC<{ article: Article }> = ({ article }) => {
        if (article.adminEditRequest === 'APPROVED') {
            return <ActionButton to={`/jurnalis/articles/analytics/${article.id}`} color="gray" icon={<BarChart2 size={12}/>}>Lihat</ActionButton>;
        }
        if (article.adminEditRequest === 'PENDING') {
            return <ActionButton onClick={() => openRequestModal(article)} color="purple" icon={<ShieldCheck size={12}/>}>Respon</ActionButton>;
        }
        if (article.adminEditRequest === 'DENIED') {
            return <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>;
        }
        switch (article.status) {
            case 'DRAFT':
                return <>
                    <ActionButton to={`/jurnalis/articles/edit/${article.id}`} color="blue" icon={<Edit size={12}/>}>Edit</ActionButton>
                    <ActionButton onClick={() => submitArticle(article.id)} color="green" icon={<Send size={12}/>}>Kirim</ActionButton>
                    <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>
                </>;
            case 'IN_REVIEW':
                return <ActionButton to={`/jurnalis/articles/analytics/${article.id}`} color="gray" icon={<BarChart2 size={12}/>}>Lihat</ActionButton>;
            case 'NEEDS_REVISION':
                return <>
                    <ActionButton onClick={() => openFeedbackModal(article)} color="yellow" icon={<MessageSquare size={12}/>}>Lihat Feedback</ActionButton>
                    <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>
                    <ActionButton onClick={() => startRevision(article.id)} color="blue" icon={<PlayCircle size={14}/>}>Mulai Revisi</ActionButton>
                </>;
            case 'JOURNALIST_REVISING':
                return <>
                    <ActionButton to={`/jurnalis/articles/edit/${article.id}`} color="blue" icon={<Edit size={12}/>}>Edit</ActionButton>
                    <ActionButton onClick={() => openFeedbackModal(article)} color="yellow" icon={<MessageSquare size={12}/>}>Lihat Feedback</ActionButton>
                    <ActionButton onClick={() => finishRevision(article.id)} color="green" icon={<CheckCircle size={12}/>}>Revisi Selesai</ActionButton>
                </>;
            case 'REVISED':
                 return <ActionButton to={`/jurnalis/articles/analytics/${article.id}`} color="gray" icon={<BarChart2 size={12}/>}>Lihat</ActionButton>;
            case 'PUBLISHED':
                return <>
                    <ActionButton to={`/jurnalis/articles/analytics/${article.id}`} color="gray" icon={<BarChart2 size={12}/>}>Lihat</ActionButton>
                    <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>
                </>;
            case 'REJECTED':
                return <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>;
            default:
                return null;
        }
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90">Manajemen Artikel Saya</h2>
                <Link to="/jurnalis/articles/new" className="bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 flex items-center gap-2 w-full sm:w-auto">
                    <Plus size={20} /> Tulis Artikel Baru
                </Link>
            </div>
            
            <div className="mb-6 pb-2 border-b-2 border-lime-400/30">
                <div className="flex gap-2 overflow-x-auto -mb-px pb-2">
                    <FilterButton filter="ALL" label="Semua" count={articleCounts.ALL} />
                    <FilterButton filter="DRAFT" label="Draf" count={articleCounts.DRAFT} />
                    <FilterButton filter="IN_REVIEW" label="Dalam Tinjauan" count={articleCounts.IN_REVIEW} />
                    <FilterButton filter="NEEDS_REVISION" label="Perlu Revisi" count={articleCounts.NEEDS_REVISION} />
                    <FilterButton filter="PENDING" label="Permintaan Admin" count={articleCounts.PENDING} />
                    <FilterButton filter="PUBLISHED" label="Diterbitkan" count={articleCounts.PUBLISHED} />
                    <FilterButton filter="REJECTED" label="Ditolak" count={articleCounts.REJECTED} />
                </div>
            </div>

            <div className="bg-[#004A49]/60 border-2 border-lime-400/50 shadow-lg rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y-2 divide-lime-400/30">
                    <thead className="bg-black/20">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-lime-300 uppercase tracking-wider">Judul & Feedback</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-lime-300 uppercase tracking-wider hidden md:table-cell">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-lime-300 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-lime-400/30">
                        {filteredArticles.length > 0 ? filteredArticles.map(article => (
                            <tr key={article.id} className="hover:bg-black/10 transition-colors">
                                <td className="px-6 py-4 whitespace-normal">
                                    <div className="font-medium text-white break-words max-w-xs">{article.title.id}</div>
                                    {(article.status === 'NEEDS_REVISION' || article.status === 'REJECTED') && article.feedback && 
                                        <p className="text-xs text-yellow-400 mt-2 italic flex items-start gap-1.5">
                                            <MessageSquare size={14} className="shrink-0 mt-0.5"/> <span>Feedback: "{article.feedback}"</span>
                                        </p>
                                    }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">{getStatusChip(article)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex gap-2 justify-end items-center flex-wrap">
                                        <ActionButtons article={article} />
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={3} className="text-center py-10 text-gray-400">Tidak ada artikel pada filter ini.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isRequestModalOpen && currentArticle && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#003B38] rounded-lg shadow-xl w-full max-w-md p-6 relative border-2 border-lime-400">
                         <button onClick={() => setIsRequestModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                         <h3 className="text-xl font-bold mb-2 text-lime-400">Permintaan Edit dari Admin</h3>
                         <p className="mb-4 text-gray-300">Admin meminta izin untuk mengedit artikel Anda: <span className="font-semibold text-white">"{currentArticle.title.id}"</span>.</p>
                         <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => handleRespondToRequest('DENIED')} disabled={isMutating} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-red-700 disabled:bg-red-400">
                                <ShieldX size={16}/> Tolak
                            </button>
                            <button onClick={() => handleRespondToRequest('APPROVED')} disabled={isMutating} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:bg-green-400">
                                <ShieldCheck size={16}/> Izinkan
                            </button>
                         </div>
                    </div>
                </div>
            )}
            
            {isFeedbackModalOpen && currentArticle && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#003B38] rounded-lg shadow-xl w-full max-w-lg p-6 relative border-2 border-lime-400">
                         <button onClick={() => setIsFeedbackModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                         <h3 className="text-xl font-bold mb-2 text-lime-400">Feedback dari Admin</h3>
                         <p className="mb-4 text-gray-300">Untuk artikel: <span className="font-semibold text-white">"{currentArticle.title.id}"</span></p>
                         <div className="bg-black/20 p-4 rounded-md text-gray-200 italic min-h-[100px] whitespace-pre-wrap">
                            {currentArticle.feedback || "Tidak ada feedback."}
                         </div>
                         <div className="flex justify-end mt-6">
                            <button onClick={() => setIsFeedbackModalOpen(false)} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Tutup</button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};