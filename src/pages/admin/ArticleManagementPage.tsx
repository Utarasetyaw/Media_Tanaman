import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import axios secara langsung
import { Plus, Edit, Trash2, X, CheckCircle, MessageSquare, XCircle, Settings2, Newspaper, Edit3, Eye } from 'lucide-react';
import type { Article, ArticleStatus, AdminEditRequestStatus } from '../../types';

// --- Konfigurasi API Service (diintegrasikan langsung) ---
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Pastikan URL ini bisa diakses dari browser Anda
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Di lingkungan browser yang sebenarnya, ini akan mengambil token
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


// Tipe untuk filter, mencakup semua kemungkinan status
type ArticleFilter = ArticleStatus | AdminEditRequestStatus | 'ALL';

// --- API Functions ---
const fetchAllArticles = async (): Promise<Article[]> => {
    const { data } = await api.get('/articles/management/all');
    return data;
};
const updateArticleStatus = ({ articleId, status, feedback }: { articleId: number; status: ArticleStatus; feedback?: string }) => 
    api.put(`/articles/management/${articleId}/status`, { status, feedback });
const deleteArticle = (id: number) => api.delete(`/articles/management/${id}`);
const requestEditAccess = (articleId: number) => api.post(`/articles/management/${articleId}/request-edit`);

// --- Komponen Utama ---
export const ArticleManagementPage: React.FC = () => {
    const queryClient = useQueryClient();

    const [activeFilter, setActiveFilter] = useState<ArticleFilter>('PUBLISHED');
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');

    const { data: articles = [], isLoading, error } = useQuery<Article[]>({
        queryKey: ['allArticlesAdmin'],
        queryFn: fetchAllArticles,
    });
    
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allArticlesAdmin'] });
        },
        onError: (err: any) => {
            // Sebaiknya tampilkan notifikasi error di sini
            console.error("An error occurred:", err.response?.data?.message || err.message);
        }
    };

    const statusUpdateMutation = useMutation({
        mutationFn: updateArticleStatus,
        onSuccess: () => {
            mutationOptions.onSuccess();
            setIsFeedbackModalOpen(false);
            setCurrentArticle(null);
        },
        onError: mutationOptions.onError
    });
    
    const requestEditMutation = useMutation({
        mutationFn: requestEditAccess,
        ...mutationOptions
    });

    const deleteMutation = useMutation({
        mutationFn: deleteArticle,
        ...mutationOptions
    });
    
    // Logika untuk memfilter artikel sesuai kebutuhan dengan prioritas
    const filteredArticles = useMemo(() => {
        if (activeFilter === 'ALL') return articles;

        // Logika filter dengan prioritas untuk memastikan artikel hanya muncul di satu tab
        switch (activeFilter) {
            case 'PENDING':
            case 'APPROVED':
            case 'DENIED':
                // Tab ini memiliki prioritas tertinggi, hanya berdasarkan adminEditRequest
                return articles.filter(a => a.adminEditRequest === activeFilter);
            
            case 'NEEDS_REVISION':
                // Tampilkan jika statusnya revisi DAN tidak ada permintaan edit admin yang aktif
                return articles.filter(a => 
                    a.adminEditRequest === 'NONE' && 
                    ['NEEDS_REVISION', 'JOURNALIST_REVISING', 'REVISED'].includes(a.status)
                );
            
            case 'PUBLISHED':
                // Tampilkan jika status PUBLISHED DAN tidak ada kondisi prioritas lain yang terpenuhi
                return articles.filter(a => 
                    a.adminEditRequest === 'NONE' && 
                    a.status === 'PUBLISHED'
                );

            default:
                // Filter fallback untuk status lain seperti IN_REVIEW, REJECTED
                return articles.filter(a => 
                    a.adminEditRequest === 'NONE' && 
                    !['NEEDS_REVISION', 'JOURNALIST_REVISING', 'REVISED'].includes(a.status) &&
                    a.status === activeFilter
                );
        }
    }, [articles, activeFilter]);

    // Logika untuk menghitung jumlah artikel di setiap tab filter secara eksklusif
    const articleCounts = useMemo(() => {
        // Inisialisasi semua counter ke 0
        const counts = {
            PUBLISHED: 0,
            IN_REVIEW: 0,
            NEEDS_REVISION_GROUP: 0,
            PENDING: 0,
            APPROVED: 0,
            DENIED: 0,
            REJECTED: 0,
        };

        // Gunakan logika prioritas yang sama dengan filter untuk menghitung
        articles.forEach(article => {
            if (article.adminEditRequest === 'PENDING') {
                counts.PENDING++;
            } else if (article.adminEditRequest === 'APPROVED') {
                counts.APPROVED++;
            } else if (article.adminEditRequest === 'DENIED') {
                counts.DENIED++;
            } else if (['NEEDS_REVISION', 'JOURNALIST_REVISING', 'REVISED'].includes(article.status)) {
                counts.NEEDS_REVISION_GROUP++;
            } else if (article.status === 'PUBLISHED') {
                counts.PUBLISHED++;
            } else if (article.status === 'IN_REVIEW') {
                counts.IN_REVIEW++;
            } else if (article.status === 'REJECTED') {
                counts.REJECTED++;
            }
        });

        return counts;
    }, [articles]);


    // Handlers untuk modal dan aksi
    const openFeedbackModal = (article: Article) => {
        setCurrentArticle(article);
        setFeedbackText('');
        setIsFeedbackModalOpen(true);
    };

    const handleSendFeedback = () => {
        if (!currentArticle) return;
        // Kirim feedback dengan status NEEDS_REVISION
        statusUpdateMutation.mutate({ articleId: currentArticle.id, status: 'NEEDS_REVISION', feedback: feedbackText });
    };

    const handleRequestEdit = (id: number) => {
        if (window.confirm('Ambil alih dan revisi artikel ini sebagai admin? Jurnalis akan diberitahu.')) {
            requestEditMutation.mutate(id);
        }
    };
    
    const handleDelete = (id: number) => {
        if (window.confirm('Yakin ingin menghapus artikel ini secara permanen?')) {
            deleteMutation.mutate(id);
        }
    };
    
    if (isLoading) return <div className="text-white p-8 text-center">Loading articles...</div>;
    if (error) return <div className="text-red-400 p-8 text-center">Error fetching data: {(error as Error).message}</div>;

    const FilterButton: React.FC<{ filter: ArticleFilter; label: string; count: number }> = ({ filter, label, count }) => (
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
        // Prioritaskan status dari admin edit request jika ada
        const displayStatus = article.adminEditRequest !== 'NONE' ? article.adminEditRequest : article.status;
        const statusText = displayStatus.replace('_', ' ');

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
            NONE: '' // Tidak akan pernah ditampilkan
        };
        return <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[displayStatus]}`}>{statusText}</span>;
    };
    
    const ActionButtons = ({ article }: { article: Article }) => {
        switch (activeFilter) {
            case 'PUBLISHED':
                return (
                    <>
                        <Link to={`/admin/articles/edit/${article.id}`} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Edit3 size={12}/> Edit</Link>
                        <Link to={`/admin/articles/seo/${article.id}`} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Settings2 size={12}/> SEO</Link>
                        <button onClick={() => handleDelete(article.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Trash2 size={12}/> Hapus</button>
                    </>
                );
            case 'IN_REVIEW':
                return (
                    <>
                        <Link to={`/articles/preview/${article.id}`} target="_blank" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Eye size={12}/> View</Link>
                        <button onClick={() => statusUpdateMutation.mutate({ articleId: article.id, status: 'PUBLISHED'})} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><CheckCircle size={12}/> Approve</button>
                        <button onClick={() => openFeedbackModal(article)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><MessageSquare size={12}/> Revisi Jurnalis</button>
                        <button onClick={() => handleRequestEdit(article.id)} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Edit size={12}/> Revisi Admin</button>
                        <button onClick={() => statusUpdateMutation.mutate({ articleId: article.id, status: 'REJECTED'})} className="bg-red-500/80 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><XCircle size={12}/> Reject</button>
                        <button onClick={() => handleDelete(article.id)} className="bg-red-900 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Trash2 size={12}/> Hapus</button>
                    </>
                );
            case 'NEEDS_REVISION':
                if (article.status === 'REVISED') {
                    return (
                        <>
                            <button onClick={() => statusUpdateMutation.mutate({ articleId: article.id, status: 'PUBLISHED'})} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><CheckCircle size={12}/> Approve</button>
                             <button onClick={() => statusUpdateMutation.mutate({ articleId: article.id, status: 'REJECTED'})} className="bg-red-500/80 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><XCircle size={12}/> Reject</button>
                            <button onClick={() => openFeedbackModal(article)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><MessageSquare size={12}/> Revisi Ulang</button>
                            <button onClick={() => handleDelete(article.id)} className="bg-red-900 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Trash2 size={12}/> Hapus</button>
                        </>
                    );
                }
                return (
                    <>
                        <span className="text-xs text-gray-400 italic">Menunggu jurnalis...</span>
                        <button onClick={() => handleDelete(article.id)} className="bg-red-900 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Trash2 size={12}/> Hapus</button>
                    </>
                );
            case 'PENDING':
                return <button onClick={() => handleDelete(article.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Trash2 size={12}/> Hapus Permintaan</button>;
            case 'APPROVED':
                return (
                     <>
                        <Link to={`/admin/articles/edit/${article.id}`} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Edit3 size={12}/> Edit Artikel</Link>
                        <button onClick={() => statusUpdateMutation.mutate({ articleId: article.id, status: 'PUBLISHED'})} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><CheckCircle size={12}/> Publish</button>
                        <button onClick={() => handleDelete(article.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Trash2 size={12}/> Hapus</button>
                    </>
                );
            case 'DENIED':
            case 'REJECTED':
                return <button onClick={() => handleDelete(article.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Trash2 size={12}/> Hapus</button>;
            
            default:
                // Tampilkan aksi berdasarkan status aktual jika berada di tab "ALL"
                if (activeFilter === 'ALL') {
                    // Anda bisa menambahkan logika mini-router di sini jika perlu,
                    // atau cukup tampilkan tombol dasar.
                     return <Link to={`/articles/preview/${article.id}`} target="_blank" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded text-xs flex items-center gap-1"><Eye size={12}/> View</Link>
                }
                return <span className="text-xs text-gray-400 italic">Pilih filter untuk melihat aksi</span>;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lime-400 flex items-center gap-3"><Newspaper /> Manajemen Artikel</h2>
                <Link to="/admin/articles/new" className="bg-lime-300 text-lime-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-400 flex items-center gap-2 transition-colors w-full sm:w-auto">
                    <Plus size={20} /> Buat Artikel
                </Link>
            </div>
            
            <div className="mb-6 pb-2 border-b-2 border-lime-400/30">
                <div className="flex gap-2 overflow-x-auto -mb-px pb-2">
                    <FilterButton filter="ALL" label="Semua" count={articles.length} />
                    <FilterButton filter="PUBLISHED" label="Published" count={articleCounts.PUBLISHED || 0} />
                    <FilterButton filter="IN_REVIEW" label="Request Jurnalis" count={articleCounts.IN_REVIEW || 0} />
                    <FilterButton filter="NEEDS_REVISION" label="Perlu Direvisi" count={articleCounts.NEEDS_REVISION_GROUP || 0} />
                    <FilterButton filter="PENDING" label="Admin Minta Edit" count={articleCounts.PENDING || 0} />
                    <FilterButton filter="APPROVED" label="Izin Diberikan" count={articleCounts.APPROVED || 0} />
                    <FilterButton filter="DENIED" label="Izin Ditolak" count={articleCounts.DENIED || 0} />
                    <FilterButton filter="REJECTED" label="Ditolak" count={articleCounts.REJECTED || 0} />
                </div>
            </div>

            <div className="bg-[#004A49]/60 border-2 border-lime-400 shadow-lg rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y-2 divide-lime-400/30">
                    <thead className="bg-black/20">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-lime-300 uppercase tracking-wider">Judul & Penulis</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-lime-300 uppercase tracking-wider hidden md:table-cell">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-lime-300 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-lime-400/30">
                        {filteredArticles.length > 0 ? filteredArticles.map(article => (
                            <tr key={article.id} className="hover:bg-black/10 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-white break-words">{article.title.id}</div>
                                    <div className="text-sm text-gray-400">oleh {article.author.name}</div>
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
                            <tr>
                                <td colSpan={3} className="text-center py-10 text-gray-400">
                                    Tidak ada artikel pada filter ini.
                                </td>
                            </tr>
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
                            <button onClick={handleSendFeedback} disabled={statusUpdateMutation.isPending || !feedbackText} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 disabled:bg-yellow-700 disabled:cursor-not-allowed">
                                {statusUpdateMutation.isPending ? 'Mengirim...' : 'Kirim Feedback'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

