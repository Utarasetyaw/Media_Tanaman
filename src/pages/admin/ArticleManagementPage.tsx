import React, { useState, useMemo, Fragment } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, X, CheckCircle, MessageSquare, XCircle, Settings2, Newspaper, Edit3, Eye, Send, ChevronDown, ChevronLeft, ChevronRight, Search, SortAsc, SortDesc } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import type { Article, ArticleStatus, AdminEditRequestStatus } from '../../types/admin/adminarticlemanagement.types';
import { useArticleManager } from '../../hooks/admin/useArticleManager';

// Komponen Pagination
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
const Pagination: FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null;
    }

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    const commonButtonClasses = "px-3 py-1 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const activeClasses = "bg-lime-400 text-lime-900 border-lime-400";
    const inactiveClasses = "bg-black/20 border-lime-400/50 text-gray-300 hover:bg-lime-400/10";
    const arrowButtonClasses = "flex items-center gap-1 border " + inactiveClasses;

    return (
        <nav className="flex items-center justify-between mt-6" aria-label="Pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`${commonButtonClasses} ${arrowButtonClasses}`}
            >
                <ChevronLeft size={16} />
                <span>Sebelumnya</span>
            </button>
            <div className="hidden sm:flex items-center gap-2">
                {pageNumbers.map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`${commonButtonClasses} border ${currentPage === page ? activeClasses : inactiveClasses}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </button>
                ))}
            </div>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`${commonButtonClasses} ${arrowButtonClasses}`}
            >
                <span>Selanjutnya</span>
                <ChevronRight size={16} />
            </button>
        </nav>
    );
};

// Helper untuk status
const getStatusProps = (status: ArticleStatus, requestStatus?: AdminEditRequestStatus) => {
    const displayStatus = (requestStatus && requestStatus !== 'NONE') ? requestStatus : status;
    switch (displayStatus) {
        case 'PUBLISHED': return { text: 'Diterbitkan', className: 'bg-green-500/20 text-green-300' };
        case 'IN_REVIEW': return { text: 'Dalam Tinjauan', className: 'bg-blue-500/20 text-blue-300' };
        case 'NEEDS_REVISION': return { text: 'Perlu Revisi', className: 'bg-yellow-500/20 text-yellow-300' };
        case 'JOURNALIST_REVISING': return { text: 'Sedang Direvisi', className: 'bg-yellow-600/20 text-yellow-200 animate-pulse' };
        case 'REVISED': return { text: 'Telah Direvisi', className: 'bg-indigo-500/20 text-indigo-300' };
        case 'REJECTED': return { text: 'Ditolak', className: 'bg-red-500/20 text-red-300' };
        case 'DRAFT': return { text: 'Draf', className: 'bg-gray-500/20 text-gray-300' };
        case 'PENDING': return { text: 'Req. Akses Edit', className: 'bg-purple-500/20 text-purple-300' };
        case 'APPROVED': return { text: 'Akses Disetujui', className: 'bg-teal-500/20 text-teal-300' };
        case 'DENIED': return { text: 'Akses Ditolak', className: 'bg-pink-500/20 text-pink-300' };
        default: return { text: status, className: 'bg-gray-500/20 text-gray-300' };
    }
};

// Komponen Tombol Aksi
const ActionButton: FC<{ onClick?: () => void; to?: string; target?: string; rel?: string; color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'; icon: React.ReactNode; children: React.ReactNode; title?: string; }> = ({ onClick, to, target, rel, color, icon, children, title }) => {
    const colorClasses = { blue: 'bg-blue-600 hover:bg-blue-700', green: 'bg-green-600 hover:bg-green-700', red: 'bg-red-600 hover:bg-red-700', yellow: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900', purple: 'bg-purple-600 hover:bg-purple-700', gray: 'bg-gray-600 hover:bg-gray-700' };
    const commonClasses = "text-white font-bold py-1 px-3 rounded text-xs flex items-center justify-center gap-1.5 transition-colors";
    if (to) return <Link to={to} title={title} target={target} rel={rel} className={`${commonClasses} ${colorClasses[color]}`}>{icon} {children}</Link>;
    return <button onClick={onClick} title={title} className={`${commonClasses} ${colorClasses[color]}`}>{icon} {children}</button>;
};

// Tipe untuk filter dan sort
type ArticleFilter = 'ALL' | ArticleStatus | 'NEEDS_REVISION_GROUP' | AdminEditRequestStatus | 'REJECTED_GROUP';
type SortByType = 'terbaru' | 'terlama';

export const ArticleManagementPage: FC = () => {
    const { 
        articles, isLoading, isError, isMutating,
        updateStatus, deleteArticle, requestEdit, 
    } = useArticleManager();
    
    // State
    const [activeFilter, setActiveFilter] = useState<ArticleFilter>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortByType>('terbaru');
    const [currentPage, setCurrentPage] = useState(1);
    const ARTICLES_PER_PAGE = 12;

    // State untuk modal
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');

    const articlesForDisplay = useMemo(() => articles.filter(article => !(article.status === 'DRAFT' && article.author.role === 'JOURNALIST')), [articles]);

    const articleCounts = useMemo(() => {
        const counts: { [key: string]: number } = { ALL: articlesForDisplay.length, PUBLISHED: 0, IN_REVIEW: 0, NEEDS_REVISION_GROUP: 0, PENDING: 0, APPROVED: 0, REJECTED_GROUP: 0, DRAFT: 0 };
        articlesForDisplay.forEach(article => {
            if (article.status === 'DRAFT' && article.author.role === 'ADMIN') counts.DRAFT++;
            else if (['PENDING', 'APPROVED'].includes(article.adminEditRequest!)) counts[article.adminEditRequest!]++;
            else if (article.adminEditRequest === 'DENIED' || article.status === 'REJECTED') counts.REJECTED_GROUP++;
            else if (['NEEDS_REVISION', 'JOURNALIST_REVISING', 'REVISED'].includes(article.status)) counts.NEEDS_REVISION_GROUP++;
            else if (counts[article.status] !== undefined) counts[article.status]++;
        });
        return counts;
    }, [articlesForDisplay]);

    const filterOptions = useMemo(() => [
        { key: 'ALL', label: 'Semua', count: articleCounts.ALL },
        { key: 'IN_REVIEW', label: 'Permintaan Jurnalis', count: articleCounts.IN_REVIEW },
        { key: 'NEEDS_REVISION_GROUP', label: 'Perlu Direvisi', count: articleCounts.NEEDS_REVISION_GROUP },
        { key: 'PUBLISHED', label: 'Diterbitkan', count: articleCounts.PUBLISHED },
        { key: 'DRAFT', label: 'Draf Admin', count: articleCounts.DRAFT },
        { key: 'PENDING', label: 'Req. Akses Edit', count: articleCounts.PENDING },
        { key: 'APPROVED', label: 'Akses Disetujui', count: articleCounts.APPROVED },
        { key: 'REJECTED_GROUP', label: 'Ditolak', count: articleCounts.REJECTED_GROUP },
    ], [articleCounts]);
    
    const activeFilterLabel = filterOptions.find(f => f.key === activeFilter)?.label || 'Filter';

    // Handlers
    const handleFilterChange = (filter: ArticleFilter) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };
    const handleSortChange = (sort: SortByType) => {
        setSortBy(sort);
        setCurrentPage(1);
    };

    const filteredArticles = useMemo(() => {
        let processedArticles = [...articlesForDisplay];
        if (activeFilter !== 'ALL') {
            processedArticles = processedArticles.filter(article => {
                if (activeFilter === 'DRAFT') return article.status === 'DRAFT' && article.author.role === 'ADMIN';
                if (activeFilter === 'NEEDS_REVISION_GROUP') return ['NEEDS_REVISION', 'JOURNALIST_REVISING', 'REVISED'].includes(article.status) && (article.adminEditRequest === 'NONE' || !article.adminEditRequest);
                if (['PENDING', 'APPROVED'].includes(activeFilter)) return article.adminEditRequest === activeFilter;
                if (activeFilter === 'REJECTED_GROUP') return article.status === 'REJECTED' || article.adminEditRequest === 'DENIED';
                return article.status === activeFilter && (article.adminEditRequest === 'NONE' || !article.adminEditRequest);
            });
        }
        if (searchTerm) {
            processedArticles = processedArticles.filter(article =>
                article.title.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        processedArticles.sort((a, b) => {
            const dateA = new Date(a.updatedAt).getTime();
            const dateB = new Date(b.updatedAt).getTime();
            return sortBy === 'terbaru' ? dateB - dateA : dateA - dateB;
        });
        return processedArticles;
    }, [articlesForDisplay, activeFilter, searchTerm, sortBy]);
    
    const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
    const paginatedArticles = useMemo(() => {
        const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
        return filteredArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);
    }, [filteredArticles, currentPage]);

    const openFeedbackModal = (article: Article) => { setCurrentArticle(article); setFeedbackText(article.feedback || ''); setIsFeedbackModalOpen(true); };
    const handleSendFeedback = () => {
        if (!currentArticle || !feedbackText) return;
        Promise.resolve(
            updateStatus({ articleId: currentArticle.id, status: 'NEEDS_REVISION', feedback: feedbackText })
        ).then(() => {
            setIsFeedbackModalOpen(false);
            setCurrentArticle(null);
            setFeedbackText('');
        });
    };
    const handleDelete = (id: number) => { if (window.confirm('Apakah Anda yakin ingin menghapus artikel ini?')) deleteArticle(id); };
    
    if (isLoading) return <div className="text-white p-8 text-center">Memuat artikel...</div>;
    if (isError) return <div className="text-red-400 p-8 text-center">Gagal memuat data artikel.</div>;

    const ActionButtons: FC<{ article: Article }> = ({ article }) => {
        if (article.adminEditRequest === 'PENDING') return <ActionButton to={`/admin/articles/analytics/${article.id}`} color="gray" icon={<Eye size={12}/>}>Lihat</ActionButton>;
        if (article.adminEditRequest === 'APPROVED') return <>
            <ActionButton to={`/admin/articles/edit/${article.id}`} color="blue" icon={<Edit3 size={12}/>}>Ubah</ActionButton>
            <ActionButton onClick={() => updateStatus({ articleId: article.id, status: 'PUBLISHED'})} color="green" icon={<CheckCircle size={12}/>}>Terbitkan</ActionButton>
        </>;
        if (article.adminEditRequest === 'DENIED') return <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>;
        
        switch (article.status) {
            case 'IN_REVIEW': return <>
                <ActionButton onClick={() => updateStatus({ articleId: article.id, status: 'PUBLISHED'})} color="green" icon={<CheckCircle size={12}/>}>Setujui</ActionButton>
                <ActionButton onClick={() => updateStatus({ articleId: article.id, status: 'REJECTED'})} color="red" icon={<XCircle size={12}/>}>Tolak</ActionButton>
                <ActionButton onClick={() => openFeedbackModal(article)} color="yellow" icon={<MessageSquare size={12}/>}>Revisi</ActionButton>
                <ActionButton to={`/admin/articles/analytics/${article.id}`} color="gray" icon={<Eye size={12}/>}>Lihat</ActionButton>
                <ActionButton onClick={() => requestEdit(article.id)} color="purple" icon={<Edit3 size={12}/>}>Minta Akses</ActionButton>
            </>;
            case 'NEEDS_REVISION':
            case 'JOURNALIST_REVISING': return <ActionButton to={`/admin/articles/analytics/${article.id}`} color="gray" icon={<Eye size={12}/>}>Lihat</ActionButton>;
            case 'REVISED': return <>
                <ActionButton to={`/admin/articles/analytics/${article.id}`} color="gray" icon={<Eye size={12}/>}>Lihat</ActionButton>
                <ActionButton onClick={() => updateStatus({ articleId: article.id, status: 'PUBLISHED'})} color="green" icon={<CheckCircle size={12}/>}>Setujui</ActionButton>
                <ActionButton onClick={() => updateStatus({ articleId: article.id, status: 'REJECTED'})} color="red" icon={<XCircle size={12}/>}>Tolak</ActionButton>
                <ActionButton onClick={() => requestEdit(article.id)} color="purple" icon={<Edit3 size={12}/>}>Minta Akses</ActionButton>
                <ActionButton onClick={() => openFeedbackModal(article)} color="yellow" icon={<MessageSquare size={12}/>}>Revisi</ActionButton>
            </>;
            case 'PUBLISHED': return <>
                <ActionButton to={`/admin/articles/analytics/${article.id}`} color="gray" icon={<Eye size={12}/>} title="Lihat Analitik">Lihat</ActionButton>
                <ActionButton to={`/admin/articles/seo/${article.id}`} color="gray" icon={<Settings2 size={12}/>}>SEO</ActionButton>
                <ActionButton to={`/admin/articles/edit/${article.id}`} color="blue" icon={<Edit size={12}/>}>Ubah</ActionButton>
                <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>
            </>;
            case 'REJECTED': return <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>;
            case 'DRAFT': if(article.author.role === 'ADMIN') return <>
                <ActionButton onClick={() => updateStatus({ articleId: article.id, status: 'PUBLISHED'})} color="green" icon={<CheckCircle size={12}/>}>Terbitkan</ActionButton>
                <ActionButton to={`/admin/articles/edit/${article.id}`} color="blue" icon={<Edit3 size={12}/>}>Ubah</ActionButton>
                <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>
            </>;
        }
        return null;
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90 flex items-center gap-3"><Newspaper /> Manajemen Artikel</h2>
                <Link to="/admin/articles/new" className="bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"><Plus size={20} /> Buat Artikel</Link>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6 pb-4 border-b-2 border-lime-400/30">
                <div className="w-full md:flex-shrink-0 md:w-auto">
                    <Menu as="div" className="relative inline-block text-left w-full">
                        <div><Menu.Button className="inline-flex w-full justify-between items-center rounded-md bg-[#004A49]/60 border-2 border-lime-400/50 px-4 py-2 text-sm font-medium text-lime-300 hover:bg-[#004A49]/90 focus:outline-none"><span>{activeFilterLabel} ({articleCounts[activeFilter as keyof typeof articleCounts] ?? 0})</span><ChevronDown className="ml-2 -mr-1 h-5 w-5 text-lime-200/70" aria-hidden="true" /></Menu.Button></div>
                        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                            <Menu.Items className="absolute left-0 mt-2 w-64 origin-top-right divide-y divide-gray-600 rounded-md bg-[#003938] border-2 border-lime-400/50 shadow-lg ring-1 ring-black/5 focus:outline-none z-10"><div className="px-1 py-1 max-h-80 overflow-y-auto">{filterOptions.map((option) => (<Menu.Item key={option.key}>{({ active }) => (<button onClick={() => handleFilterChange(option.key as ArticleFilter)} className={`${ active ? 'bg-[#004A49] text-white' : 'text-gray-300' } group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm`}>{option.label}<span className="bg-gray-700 text-gray-200 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">{option.count}</span></button>)}</Menu.Item>))}</div></Menu.Items>
                        </Transition>
                    </Menu>
                </div>
                <div className="w-full md:flex-grow relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="search" placeholder="Cari artikel berdasarkan judul..." value={searchTerm} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2 bg-[#004A49]/60 border-2 border-lime-400/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-lime-400" />
                </div>
                <div className="w-full md:flex-shrink-0 md:w-auto">
                     <Menu as="div" className="relative inline-block text-left w-full">
                        <div><Menu.Button className="inline-flex w-full justify-between items-center rounded-md bg-[#004A49]/60 border-2 border-lime-400/50 px-4 py-2 text-sm font-medium text-lime-300 hover:bg-[#004A49]/90 focus:outline-none"><span>Urutkan: <span className="font-bold">{sortBy === 'terbaru' ? 'Terbaru' : 'Terlama'}</span></span><ChevronDown className="ml-2 -mr-1 h-5 w-5 text-lime-200/70" aria-hidden="true" /></Menu.Button></div>
                        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-[#003938] border-2 border-lime-400/50 shadow-lg ring-1 ring-black/5 focus:outline-none z-10"><div className="px-1 py-1"><Menu.Item><button onClick={() => handleSortChange('terbaru')} className='text-gray-300 hover:bg-[#004A49] group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm'><SortDesc size={16}/> Terbaru</button></Menu.Item><Menu.Item><button onClick={() => handleSortChange('terlama')} className='text-gray-300 hover:bg-[#004A49] group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm'><SortAsc size={16}/> Terlama</button></Menu.Item></div></Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>
            
            <div className="hidden lg:block bg-[#004A49]/60 border-2 border-lime-400/50 shadow-lg rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y-2 divide-lime-400/30">
                    <thead className="bg-black/20"><tr><th className="px-6 py-3 text-left text-xs font-medium text-lime-300 uppercase tracking-wider">Judul & Info</th><th className="px-6 py-3 text-left text-xs font-medium text-lime-300 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-right text-xs font-medium text-lime-300 uppercase tracking-wider">Aksi</th></tr></thead>
                    <tbody className="divide-y divide-lime-400/30">
                        {paginatedArticles.map(article => {
                            const status = getStatusProps(article.status, article.adminEditRequest);
                            return (<tr key={article.id} className="hover:bg-black/10 transition-colors"><td className="px-6 py-4"><div className="font-medium text-white break-words max-w-xs">{article.title.id}</div><div className="text-sm text-gray-400">oleh {article.author.name}</div></td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>{status.text}</span></td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex gap-2 justify-end items-center flex-wrap"><ActionButtons article={article} /></div></td></tr>);
                        })}
                    </tbody>
                </table>
            </div>
            <div className="lg:hidden space-y-4">
                {paginatedArticles.map(article => {
                    const status = getStatusProps(article.status, article.adminEditRequest);
                    return (<div key={article.id} className="bg-[#004A49]/60 border-2 border-lime-400/50 shadow-lg rounded-lg p-4 space-y-3"><div><div className="font-medium text-white break-words">{article.title.id}</div><div className="text-sm text-gray-400">oleh {article.author.name}</div></div><div><span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>{status.text}</span></div><div className="flex gap-2 justify-end items-center flex-wrap pt-3 border-t border-lime-400/20"><ActionButtons article={article} /></div></div>);
                })}
            </div>
            {filteredArticles.length === 0 && (<div className="text-center py-10 text-gray-400 bg-[#004A49]/60 border-2 border-lime-400/50 rounded-lg">Tidak ada artikel pada filter ini.</div>)}
            {totalPages > 1 && (<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />)}
            {isFeedbackModalOpen && currentArticle && ( <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"><div className="bg-[#003938] rounded-lg shadow-xl w-full max-w-lg p-6 relative border-2 border-lime-400"><button onClick={() => setIsFeedbackModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button><h3 className="text-2xl font-bold mb-2 text-lime-400">Umpan Balik untuk Revisi</h3><p className="mb-4 text-gray-300">Artikel: "{currentArticle.title.id}"</p><textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Tulis catatan revisi untuk jurnalis di sini..." className="w-full h-32 bg-white/10 border-2 border-lime-400/50 rounded-md p-2 text-white focus:ring-lime-300 focus:border-lime-300"/><div className="mt-6 flex justify-end gap-3"><button onClick={() => setIsFeedbackModalOpen(false)} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Batal</button><button onClick={handleSendFeedback} disabled={isMutating || !feedbackText} className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 disabled:bg-yellow-700 disabled:cursor-not-allowed flex items-center gap-2">{isMutating ? 'Mengirim...' : <><Send size={16}/> Kirim Umpan Balik</>}</button></div></div></div>)}
        </div>
    );
};