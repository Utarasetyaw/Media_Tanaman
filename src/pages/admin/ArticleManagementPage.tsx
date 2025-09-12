import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, X, CheckCircle, MessageSquare, XCircle, Settings2, Newspaper, Edit3, Eye, Send } from 'lucide-react';
import type { Article, ArticleStatus, AdminEditRequestStatus } from '../../types';
import * as apiAdmin from '../../services/apiAdmin';


type ArticleFilter = 'ALL' | ArticleStatus | 'NEEDS_REVISION_GROUP' | AdminEditRequestStatus | 'REJECTED_GROUP';

// --- Komponen Tombol Aksi ---
const ActionButton: React.FC<{
    onClick?: () => void;
    to?: string;
    target?: string;
    rel?: string;
    color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
    icon: React.ReactNode;
    children: React.ReactNode;
    title?: string;
}> = ({ onClick, to, target, rel, color, icon, children, title }) => {
    const colorClasses = {
        blue: 'bg-blue-600 hover:bg-blue-700',
        green: 'bg-green-600 hover:bg-green-700',
        red: 'bg-red-600 hover:bg-red-700',
        yellow: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900',
        purple: 'bg-purple-600 hover:bg-purple-700',
        gray: 'bg-gray-600 hover:bg-gray-700',
    };
    const commonClasses = "text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1.5 transition-colors";
    
    if (to) {
        return <Link to={to} title={title} target={target} rel={rel} className={`${commonClasses} ${colorClasses[color]}`}>{icon} {children}</Link>;
    }
    return <button onClick={onClick} title={title} className={`${commonClasses} ${colorClasses[color]}`}>{icon} {children}</button>;
};

export const ArticleManagementPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [activeFilter, setActiveFilter] = useState<ArticleFilter>('ALL');
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');

    const { data: articles = [], isLoading, error } = useQuery<Article[]>({
        queryKey: ['allAdminArticles'],
        queryFn: apiAdmin.getAllAdminArticles,
    });
    
    const articlesForDisplay = useMemo(() => {
        return articles.filter(article => !(article.status === 'DRAFT' && article.author.role === 'JOURNALIST'));
    }, [articles]);

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allAdminArticles'] });
        },
        onError: (err: any) => {
            alert(err.response?.data?.error || "Terjadi kesalahan.");
        }
    };

    const statusUpdateMutation = useMutation({
        mutationFn: apiAdmin.updateArticleStatus,
        onSuccess: () => {
            mutationOptions.onSuccess();
            setIsFeedbackModalOpen(false);
            setCurrentArticle(null);
            setFeedbackText('');
        },
        onError: mutationOptions.onError
    });
    
    const requestEditMutation = useMutation({ mutationFn: apiAdmin.requestAdminEditAccess, ...mutationOptions });
    const cancelRequestMutation = useMutation({ mutationFn: apiAdmin.cancelAdminEditRequest, ...mutationOptions });
    const revertApprovalMutation = useMutation({ mutationFn: apiAdmin.revertAdminEditApproval, ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: apiAdmin.deleteAdminArticle, ...mutationOptions });
    
    const articleCounts = useMemo(() => {
        const counts: { [key: string]: number } = {
            ALL: articlesForDisplay.length, PUBLISHED: 0, IN_REVIEW: 0, NEEDS_REVISION_GROUP: 0,
            PENDING: 0, APPROVED: 0, REJECTED_GROUP: 0, DRAFT: 0
        };
        articlesForDisplay.forEach(article => {
            if (article.status === 'DRAFT' && article.author.role === 'ADMIN') {
                counts.DRAFT++;
            } else if (article.adminEditRequest === 'PENDING' || article.adminEditRequest === 'APPROVED') {
                if (counts[article.adminEditRequest] !== undefined) counts[article.adminEditRequest]++;
            } else if (article.adminEditRequest === 'DENIED' || article.status === 'REJECTED') {
                counts.REJECTED_GROUP++;
            } else if (['NEEDS_REVISION', 'JOURNALIST_REVISING', 'REVISED'].includes(article.status)) {
                counts.NEEDS_REVISION_GROUP++;
            } else {
                if (counts[article.status] !== undefined) counts[article.status]++;
            }
        });
        return counts;
    }, [articlesForDisplay]);

    const filteredArticles = useMemo(() => {
        if (activeFilter === 'ALL') return articlesForDisplay;
        return articlesForDisplay.filter(article => {
            if (activeFilter === 'DRAFT') {
                return article.status === 'DRAFT' && article.author.role === 'ADMIN';
            }
            if (activeFilter === 'NEEDS_REVISION_GROUP') {
                return ['NEEDS_REVISION', 'JOURNALIST_REVISING', 'REVISED'].includes(article.status) && (!article.adminEditRequest || article.adminEditRequest === 'NONE');
            }
            if (['PENDING', 'APPROVED'].includes(activeFilter)) {
                return article.adminEditRequest === activeFilter;
            }
            if (activeFilter === 'REJECTED_GROUP') {
                return article.status === 'REJECTED' || article.adminEditRequest === 'DENIED';
            }
            return article.status === activeFilter && (!article.adminEditRequest || article.adminEditRequest === 'NONE');
        });
    }, [articlesForDisplay, activeFilter]);

    const openFeedbackModal = (article: Article) => {
        setCurrentArticle(article);
        setFeedbackText(article.feedback || '');
        setIsFeedbackModalOpen(true);
    };

    const handleSendFeedback = () => {
        if (!currentArticle || !feedbackText) return;
        statusUpdateMutation.mutate({ articleId: currentArticle.id, status: 'NEEDS_REVISION', feedback: feedbackText });
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Yakin ingin menghapus artikel ini?')) {
            deleteMutation.mutate(id);
        }
    };
    
    const handleCancelRequest = (id: number) => {
        if (window.confirm('Yakin ingin membatalkan permintaan edit?')) {
            cancelRequestMutation.mutate(id);
        }
    };

    const handleRevertApproval = (id: number) => {
        if (window.confirm('Yakin ingin membatalkan izin edit dan mengembalikan ke jurnalis?')) {
            revertApprovalMutation.mutate(id);
        }
    };
    
    if (isLoading) return <div className="text-white p-8 text-center">Memuat artikel...</div>;
    if (error) return <div className="text-red-400 p-8 text-center">Gagal memuat data.</div>;

    const FilterButton: React.FC<{ filter: ArticleFilter; label: string; count: number }> = ({ filter, label, count }) => (
        <button
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors flex-shrink-0 border-2 flex items-center gap-2 ${ activeFilter === filter ? 'bg-lime-300 text-lime-900 border-lime-300' : 'bg-[#004A49]/60 text-lime-300 border-lime-400/50 hover:bg-[#004A49]/90'}`}>
            {label} 
            <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${ activeFilter === filter ? 'bg-white text-lime-900' : 'bg-gray-800/80 text-gray-200'}`}>{count || 0}</span>
        </button>
    );

    const getStatusChip = (article: Article) => {
        const displayStatus = (article.adminEditRequest && article.adminEditRequest !== 'NONE') ? article.adminEditRequest : article.status;
        const statusText = displayStatus.replace(/_/g, ' ');
        const styles: Record<string, string> = {
            PUBLISHED: 'bg-green-500/20 text-green-300', IN_REVIEW: 'bg-blue-500/20 text-blue-300',
            NEEDS_REVISION: 'bg-yellow-500/20 text-yellow-300', JOURNALIST_REVISING: 'bg-yellow-600/20 text-yellow-200 animate-pulse',
            REVISED: 'bg-indigo-500/20 text-indigo-300', REJECTED: 'bg-red-500/20 text-red-300',
            DRAFT: 'bg-gray-500/20 text-gray-300', PENDING: 'bg-purple-500/20 text-purple-300',
            APPROVED: 'bg-teal-500/20 text-teal-300', DENIED: 'bg-pink-500/20 text-pink-300',
        };
        return <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${styles[displayStatus] || 'bg-gray-500/20 text-gray-300'}`}>{statusText}</span>;
    };
    
    const ActionButtons: React.FC<{ article: Article }> = ({ article }) => {
        const status = article.status;
        const requestStatus = article.adminEditRequest;

        // Prioritaskan penanganan status permintaan edit dari admin
        if (requestStatus === 'PENDING') {
            return <>
                <ActionButton to={`/admin/articles/analytics/${article.id}`} color="gray" icon={<Eye size={12}/>}>Lihat</ActionButton>
                <ActionButton onClick={() => handleCancelRequest(article.id)} color="red" icon={<XCircle size={12}/>}>Decline</ActionButton>
            </>;
        }

        if (requestStatus === 'APPROVED') {
             return <>
                <ActionButton to={`/admin/articles/edit/${article.id}`} color="blue" icon={<Edit3 size={12}/>}>Edit</ActionButton>
                <ActionButton onClick={() => handleRevertApproval(article.id)} color="red" icon={<XCircle size={12}/>}>Decline</ActionButton>
                <ActionButton onClick={() => statusUpdateMutation.mutate({ articleId: article.id, status: 'PUBLISHED'})} color="green" icon={<CheckCircle size={12}/>}>Publish</ActionButton>
            </>;
        }

        if (requestStatus === 'DENIED') {
            return <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>;
        }
        
        // Jika tidak ada permintaan edit dari admin, gunakan status artikel
        if (status === 'IN_REVIEW') {
             return <>
                <ActionButton onClick={() => statusUpdateMutation.mutate({ articleId: article.id, status: 'PUBLISHED'})} color="green" icon={<CheckCircle size={12}/>}>Approve</ActionButton>
                <ActionButton onClick={() => statusUpdateMutation.mutate({ articleId: article.id, status: 'REJECTED'})} color="red" icon={<XCircle size={12}/>}>Decline</ActionButton>
                <ActionButton onClick={() => openFeedbackModal(article)} color="yellow" icon={<MessageSquare size={12}/>}>Revisi</ActionButton>
                <ActionButton to={`/admin/articles/analytics/${article.id}`} color="gray" icon={<Eye size={12}/>}>Lihat</ActionButton>
                <ActionButton onClick={() => requestEditMutation.mutate(article.id)} color="purple" icon={<Edit3 size={12}/>}>Request Edit</ActionButton>
            </>;
        }
        
        if (['NEEDS_REVISION', 'JOURNALIST_REVISING'].includes(status)) {
            return <ActionButton to={`/admin/articles/analytics/${article.id}`} color="gray" icon={<Eye size={12}/>}>Lihat</ActionButton>;
        }

        if (status === 'REVISED') {
             return <>
                <ActionButton to={`/admin/articles/analytics/${article.id}`} color="gray" icon={<Eye size={12}/>}>Lihat</ActionButton>
                <ActionButton onClick={() => statusUpdateMutation.mutate({ articleId: article.id, status: 'PUBLISHED'})} color="green" icon={<CheckCircle size={12}/>}>Approve</ActionButton>
                <ActionButton onClick={() => statusUpdateMutation.mutate({ articleId: article.id, status: 'REJECTED'})} color="red" icon={<XCircle size={12}/>}>Reject</ActionButton>
                <ActionButton onClick={() => requestEditMutation.mutate(article.id)} color="purple" icon={<Edit3 size={12}/>}>Minta Akses</ActionButton>
                <ActionButton onClick={() => openFeedbackModal(article)} color="yellow" icon={<MessageSquare size={12}/>}>Revisi</ActionButton>
            </>;
        }

        if (status === 'PUBLISHED') {
            return <>
                <ActionButton to={`/news/${article.id}`} target="_blank" rel="noopener noreferrer" color="gray" icon={<Eye size={12}/>}>Lihat</ActionButton>
                <ActionButton to={`/admin/articles/seo/${article.id}`} color="gray" icon={<Settings2 size={12}/>}>SEO</ActionButton>
                <ActionButton to={`/admin/articles/edit/${article.id}`} color="blue" icon={<Edit size={12}/>}>Edit</ActionButton>
                <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>
            </>;
        }

        if (status === 'REJECTED') {
            return <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>;
        }

        if (status === 'DRAFT' && article.author.role === 'ADMIN') {
             return <>
                <ActionButton onClick={() => statusUpdateMutation.mutate({ articleId: article.id, status: 'PUBLISHED'})} color="green" icon={<CheckCircle size={12}/>}>Publish</ActionButton>
                <ActionButton to={`/admin/articles/edit/${article.id}`} color="blue" icon={<Edit3 size={12}/>}>Edit</ActionButton>
                <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>
            </>;
        }
        
        return null;
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-900 min-h-screen text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90 flex items-center gap-3"><Newspaper /> Manajemen Artikel</h2>
                <Link to="/admin/articles/new" className="bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 flex items-center gap-2 transition-colors w-full sm:w-auto">
                    <Plus size={20} /> Buat Artikel
                </Link>
            </div>
            
            <div className="mb-6 pb-2 border-b-2 border-lime-400/30">
                <div className="flex gap-2 overflow-x-auto -mb-px pb-2">
                    <FilterButton filter="ALL" label="Semua" count={articleCounts.ALL} />
                    <FilterButton filter="IN_REVIEW" label="Request Jurnalis" count={articleCounts.IN_REVIEW} />
                    <FilterButton filter="NEEDS_REVISION_GROUP" label="Perlu Direvisi" count={articleCounts.NEEDS_REVISION_GROUP} />
                    <FilterButton filter="PUBLISHED" label="Published" count={articleCounts.PUBLISHED} />
                    <FilterButton filter="DRAFT" label="Draft Admin" count={articleCounts.DRAFT} />
                    <FilterButton filter="PENDING" label="Admin Minta Edit" count={articleCounts.PENDING} />
                    <FilterButton filter="APPROVED" label="Izin Diberikan" count={articleCounts.APPROVED} />
                    <FilterButton filter="REJECTED_GROUP" label="Ditolak" count={articleCounts.REJECTED_GROUP} />
                </div>
            </div>

            <div className="bg-[#004A49]/60 border-2 border-lime-400/50 shadow-lg rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y-2 divide-lime-400/30">
                    <thead className="bg-black/20">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-lime-300 uppercase tracking-wider">Judul & Info</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-lime-300 uppercase tracking-wider hidden md:table-cell">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-lime-300 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-lime-400/30">
                        {filteredArticles.length > 0 ? filteredArticles.map(article => (
                            <tr key={article.id} className="hover:bg-black/10 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white break-words max-w-xs">{article.title.id}</div>
                                    <div className="text-sm text-gray-400">oleh {article.author.name}</div>
                                    <div className='flex items-center gap-2 mt-2 flex-wrap'>
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-300">{article.category.name.id}</span>
                                        {article.plantType && (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-sky-500/20 text-sky-300">{article.plantType.name.id}</span>
                                        )}
                                    </div>
                                    <div className="md:hidden mt-2">{getStatusChip(article)}</div>
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

            {isFeedbackModalOpen && currentArticle && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#003938] rounded-lg shadow-xl w-full max-w-lg p-6 relative border-2 border-lime-400">
                        <button onClick={() => setIsFeedbackModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                        <h3 className="text-2xl font-bold mb-2 text-lime-400">Feedback untuk Revisi</h3>
                        <p className="mb-4 text-gray-300">Artikel: "{currentArticle.title.id}"</p>
                        <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Tulis catatan revisi untuk jurnalis di sini..." className="w-full h-32 bg-white/10 border-2 border-lime-400/50 rounded-md p-2 text-white focus:ring-lime-300 focus:border-lime-300"/>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsFeedbackModalOpen(false)} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Batal</button>
                            <button onClick={handleSendFeedback} disabled={statusUpdateMutation.isPending || !feedbackText} className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 disabled:bg-yellow-700 disabled:cursor-not-allowed flex items-center gap-2">
                                {statusUpdateMutation.isPending ? 'Mengirim...' : <><Send size={16}/> Kirim Feedback</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArticleManagementPage;

