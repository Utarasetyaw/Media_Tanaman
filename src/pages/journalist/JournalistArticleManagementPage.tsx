import React, { useState, useMemo, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, X, CheckCircle, MessageSquare, Send, Eye, ShieldCheck, ShieldX, PlayCircle } from 'lucide-react';
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

// Tipe untuk filter Jurnalis
type JournalistArticleFilter = 'ALL' | 'DRAFT' | 'IN_REVIEW' | 'NEEDS_REVISION' | 'PUBLISHED' | 'REJECTED' | 'PENDING';


// --- API Functions for Journalist ---
const fetchMyArticles = async (): Promise<Article[]> => {
    const { data } = await api.get('/articles/my-articles');
    return data;
};
const deleteMyArticle = (id: number) => api.delete(`/articles/${id}`);
const submitForReview = (id: number) => api.post(`/articles/${id}/submit`);
const startRevision = (id: number) => api.post(`/articles/${id}/start-revision`);
const finishRevision = (id: number) => api.post(`/articles/${id}/finish-revision`);
const respondToEditRequest = ({ articleId, response }: { articleId: number, response: 'APPROVED' | 'DENIED' }) =>
    api.put(`/articles/${articleId}/respond-edit`, { response });


// --- Komponen Utama ---
export const JournalistArticleManagementPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [activeFilter, setActiveFilter] = useState<JournalistArticleFilter>('ALL');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);

    const { data: articles = [], isLoading, error } = useQuery<Article[]>({
        queryKey: ['myArticles'],
        queryFn: fetchMyArticles,
    });

    const mutationOptions = {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myArticles'] }),
        onError: (err: any) => console.error("Mutation error:", err.response?.data?.message || err.message),
    };
    
    const deleteMutation = useMutation({ mutationFn: deleteMyArticle, ...mutationOptions });
    const submitMutation = useMutation({ mutationFn: submitForReview, ...mutationOptions });
    const startRevisionMutation = useMutation({ mutationFn: startRevision, ...mutationOptions });
    const finishRevisionMutation = useMutation({ mutationFn: finishRevision, ...mutationOptions });
    const respondRequestMutation = useMutation({
        mutationFn: respondToEditRequest,
        onSuccess: () => {
            mutationOptions.onSuccess();
            setIsRequestModalOpen(false);
        },
        onError: mutationOptions.onError,
    });

    const { filteredArticles, articleCounts } = useMemo(() => {
        const counts: Record<JournalistArticleFilter, number> = {
            ALL: articles.length, DRAFT: 0, IN_REVIEW: 0, NEEDS_REVISION: 0, PUBLISHED: 0, REJECTED: 0, PENDING: 0
        };

        articles.forEach(article => {
            if (article.adminEditRequest === 'PENDING') {
                counts.PENDING++;
            } else if (article.status === 'DRAFT') {
                counts.DRAFT++;
            } else if (['IN_REVIEW', 'REVISED'].includes(article.status)) {
                counts.IN_REVIEW++;
            } else if (['NEEDS_REVISION', 'JOURNALIST_REVISING'].includes(article.status)) {
                counts.NEEDS_REVISION++;
            } else if (article.status === 'PUBLISHED') {
                counts.PUBLISHED++;
            } else if (article.status === 'REJECTED') {
                counts.REJECTED++;
            }
        });

        const filterLogic = (article: Article) => {
            if (activeFilter === 'ALL') return true;
            if (activeFilter === 'PENDING') return article.adminEditRequest === 'PENDING';
            
            if (article.adminEditRequest !== 'PENDING') {
                switch (activeFilter) {
                    case 'DRAFT': return article.status === 'DRAFT';
                    case 'IN_REVIEW': return ['IN_REVIEW', 'REVISED'].includes(article.status);
                    case 'NEEDS_REVISION': return ['NEEDS_REVISION', 'JOURNALIST_REVISING'].includes(article.status);
                    case 'PUBLISHED': return article.status === 'PUBLISHED';
                    case 'REJECTED': return article.status === 'REJECTED';
                }
            }
            return false;
        };

        return { filteredArticles: articles.filter(filterLogic), articleCounts: counts };
    }, [articles, activeFilter]);

    const handleDelete = (id: number) => {
        if (window.confirm('Yakin ingin menghapus artikel ini secara permanen?')) {
            deleteMutation.mutate(id);
        }
    };
    
    const openRequestModal = (article: Article) => {
        setCurrentArticle(article);
        setIsRequestModalOpen(true);
    };

    if (isLoading) return <div className="p-8 text-center text-white">Memuat artikel Anda...</div>;
    if (error) return <div className="p-8 text-center text-red-400">Gagal memuat data: {(error as Error).message}</div>;

    const FilterButton: React.FC<{ filter: JournalistArticleFilter; label: string; count: number }> = ({ filter, label, count }) => (
        <button
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors flex-shrink-0 border-2 flex items-center gap-2 ${
                activeFilter === filter 
                ? 'bg-lime-300 text-lime-900 border-lime-300' 
                : 'bg-[#004A49]/60 text-lime-300 border-lime-400 hover:bg-[#004A49]/90'
            }`}
        >
            {label} 
            <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                activeFilter === filter 
                ? 'bg-white text-lime-900' 
                : 'bg-gray-800/80 text-gray-200'
            }`}>
                {count || 0}
            </span>
        </button>
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
        return <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[displayStatus]}`}>{statusText}</span>;
    };

    const ActionButtons = ({ article }: { article: Article }) => {
        if (article.adminEditRequest === 'PENDING') {
            return <button onClick={() => openRequestModal(article)} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><ShieldCheck size={12}/> Respon</button>;
        }

        switch (article.status) {
            case 'DRAFT':
                return (
                    <>
                        <Link to={`/jurnalis/articles/edit/${article.id}`} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Edit size={12}/> Edit</Link>
                        <button onClick={() => submitMutation.mutate(article.id)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Send size={12}/> Kirim</button>
                        <button onClick={() => handleDelete(article.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Trash2 size={12}/> Hapus</button>
                    </>
                );
            case 'NEEDS_REVISION':
                return <button onClick={() => startRevisionMutation.mutate(article.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><PlayCircle size={14}/> Lakukan Revisi</button>;
            case 'JOURNALIST_REVISING':
                 return (
                    <>
                       <Link to={`/jurnalis/articles/edit/${article.id}`} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Edit size={12}/> Lanjutkan Edit</Link>
                       <button onClick={() => finishRevisionMutation.mutate(article.id)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><CheckCircle size={12}/> Selesai Revisi</button>
                    </>
                );
            case 'REVISED':
                 return <button onClick={() => submitMutation.mutate(article.id)} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Send size={14}/> Kirim Ulang</button>;
            case 'REJECTED':
                return (
                    <>
                        <Link to={`/jurnalis/articles/edit/${article.id}`} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Edit size={12}/> Edit Ulang</Link>
                        <button onClick={() => handleDelete(article.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Trash2 size={12}/> Hapus</button>
                    </>
                );
            case 'IN_REVIEW':
                return <span className="text-xs text-gray-400 italic">Dalam tinjauan...</span>;
            default: // Ini menangani status PUBLISHED
                return <Link to={`/jurnalis/articles/analytics/${article.id}`} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Eye size={12}/> Lihat Detail & Analitik</Link>;
        }
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-400 font-serif">Manajemen Artikel Saya</h2>
                <Link to="/jurnalis/articles/new" className="bg-lime-300 text-lime-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-400 flex items-center gap-2 w-full sm:w-auto">
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

            <div className="bg-[#004A49]/60 border-2 border-lime-400 shadow-lg rounded-lg overflow-x-auto">
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
                                    <div className="font-medium text-white break-words">{article.title.id}</div>
                                    <div className="md:hidden mt-2">{getStatusChip(article)}</div>
                                    {(article.status === 'NEEDS_REVISION' || article.status === 'REJECTED') && article.feedback && 
                                        <p className="text-xs text-yellow-400 mt-2 italic">
                                            <MessageSquare size={12} className="inline mr-1"/> Feedback: "{article.feedback}"
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
                            <tr>
                                <td colSpan={3} className="text-center py-10 text-gray-400">Tidak ada artikel pada filter ini.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isRequestModalOpen && currentArticle && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#003938] rounded-lg shadow-xl w-full max-w-md p-6 relative border-2 border-lime-400">
                         <button onClick={() => setIsRequestModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                         <h3 className="text-xl font-bold mb-2 text-lime-400">Permintaan Edit dari Admin</h3>
                         <p className="mb-4 text-gray-300">Admin meminta izin untuk mengedit artikel Anda yang berjudul <span className="font-semibold text-white">"{currentArticle.title.id}"</span>.</p>
                         <p className="mb-6 text-sm text-gray-400">Tindakan ini akan memberikan admin kontrol penuh untuk mengubah konten. Anda akan diberitahu jika ada perubahan yang dipublikasikan.</p>
                         <div className="flex justify-end gap-3">
                            <button onClick={() => respondRequestMutation.mutate({ articleId: currentArticle.id, response: 'DENIED' })} disabled={respondRequestMutation.isPending} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-red-700 disabled:bg-red-400">
                                <ShieldX size={16}/> Tolak
                            </button>
                            <button onClick={() => respondRequestMutation.mutate({ articleId: currentArticle.id, response: 'APPROVED' })} disabled={respondRequestMutation.isPending} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:bg-green-400">
                                <ShieldCheck size={16}/> Izinkan
                            </button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};