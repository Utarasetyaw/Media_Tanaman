import React, { useState, useMemo, Fragment } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, X, CheckCircle, MessageSquare, Send, ShieldCheck, ShieldX, PlayCircle, BarChart2, ChevronDown, ChevronLeft, ChevronRight, Search, SortAsc, SortDesc } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import type { Article } from '../../types/jurnalist/journalistArticleManagement.types';
import { useJournalistArticleManager } from '../../hooks/jurnalist/useJournalistArticleManager';

// Komponen Pagination
const Pagination: FC<{currentPage: number; totalPages: number; onPageChange: (page: number) => void;}> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    const commonButtonClasses = "px-3 py-1 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const activeClasses = "bg-lime-400 text-lime-900 border-lime-400";
    const inactiveClasses = "bg-black/20 border-lime-400/50 text-gray-300 hover:bg-lime-400/10";
    const arrowButtonClasses = "flex items-center gap-1 border " + inactiveClasses;
    return (
        <nav className="flex items-center justify-between mt-6" aria-label="Pagination">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`${commonButtonClasses} ${arrowButtonClasses}`}><ChevronLeft size={16} /><span>Sebelumnya</span></button>
            <div className="hidden sm:flex items-center gap-2">{pageNumbers.map(page => (<button key={page} onClick={() => onPageChange(page)} className={`${commonButtonClasses} border ${currentPage === page ? activeClasses : inactiveClasses}`} aria-current={currentPage === page ? 'page' : undefined}>{page}</button>))}</div>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`${commonButtonClasses} ${arrowButtonClasses}`}><span>Selanjutnya</span><ChevronRight size={16} /></button>
        </nav>
    );
};

// Helper untuk status
const getStatusProps = (article: Article) => {
    if (article.adminEditRequest === 'PENDING') return { text: 'Req. Akses Edit', className: 'bg-purple-500/20 text-purple-300' };
    if (article.adminEditRequest === 'APPROVED') return { text: 'Akses Disetujui', className: 'bg-teal-500/20 text-teal-300' };
    if (article.adminEditRequest === 'DENIED') return { text: 'Akses Ditolak', className: 'bg-pink-500/20 text-pink-300' };

    switch (article.status) {
        case 'PUBLISHED': return { text: 'Diterbitkan', className: 'bg-green-500/20 text-green-300' };
        case 'IN_REVIEW': return { text: 'Dalam Tinjauan', className: 'bg-blue-500/20 text-blue-300' };
        case 'NEEDS_REVISION': return { text: 'Perlu Revisi', className: 'bg-yellow-500/20 text-yellow-300' };
        case 'JOURNALIST_REVISING': return { text: 'Sedang Direvisi', className: 'bg-yellow-600/20 text-yellow-200 animate-pulse' };
        case 'REVISED': return { text: 'Telah Direvisi', className: 'bg-indigo-500/20 text-indigo-300' };
        case 'REJECTED': return { text: 'Ditolak', className: 'bg-red-500/20 text-red-300' };
        default: return { text: 'Draf', className: 'bg-gray-500/20 text-gray-300' };
    }
};

// Komponen Tombol Aksi
const ActionButton: FC<{ onClick?: () => void; to?: string; color: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ onClick, to, color, icon, children }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-600 hover:bg-blue-700', green: 'bg-green-600 hover:bg-green-700',
        red: 'bg-red-600 hover:bg-red-700', yellow: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900',
        gray: 'bg-gray-600 hover:bg-gray-700', indigo: 'bg-indigo-600 hover:bg-indigo-700',
        purple: 'bg-purple-500 hover:bg-purple-600',
    };
    const commonClasses = "text-white font-bold py-1 px-3 rounded text-xs flex items-center justify-center gap-1.5 transition-colors";
    
    if (to) return <Link to={to} className={`${commonClasses} ${colorClasses[color]}`}>{icon} {children}</Link>;
    return <button onClick={onClick} className={`${commonClasses} ${colorClasses[color]}`}>{icon} {children}</button>;
};

// Tipe untuk filter dan sort
type JournalistArticleFilter = 'ALL' | 'DRAFT' | 'IN_REVIEW_GROUP' | 'NEEDS_REVISION_GROUP' | 'PUBLISHED' | 'REJECTED_GROUP' | 'PENDING';
type SortByType = 'terbaru' | 'terlama';

export const JournalistArticleManagementPage: FC = () => {
    const {
        articles, isLoading, isError, isMutating,
        deleteArticle, submitArticle, startRevision, finishRevision, respondToRequest,
    } = useJournalistArticleManager();

    const [activeFilter, setActiveFilter] = useState<JournalistArticleFilter>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortByType>('terbaru');
    const [currentPage, setCurrentPage] = useState(1);
    const ARTICLES_PER_PAGE = 12;

    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);

    const { filteredArticles, articleCounts } = useMemo(() => {
        const counts: Record<JournalistArticleFilter, number> = { ALL: 0, DRAFT: 0, IN_REVIEW_GROUP: 0, NEEDS_REVISION_GROUP: 0, PUBLISHED: 0, REJECTED_GROUP: 0, PENDING: 0 };
        
        let processedArticles = [...articles];

        if (searchTerm) {
            processedArticles = processedArticles.filter(article =>
                article.title.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        processedArticles.forEach(article => {
            counts.ALL++;
            if (article.adminEditRequest === 'PENDING') counts.PENDING++;
            else if (['IN_REVIEW', 'REVISED'].includes(article.status) || article.adminEditRequest === 'APPROVED') { if (article.adminEditRequest !== 'DENIED') counts.IN_REVIEW_GROUP++; }
            else if (article.status === 'DRAFT') counts.DRAFT++;
            else if (['NEEDS_REVISION', 'JOURNALIST_REVISING'].includes(article.status)) counts.NEEDS_REVISION_GROUP++;
            else if (article.status === 'PUBLISHED') counts.PUBLISHED++;
            else if (article.status === 'REJECTED' || article.adminEditRequest === 'DENIED') counts.REJECTED_GROUP++;
        });

        const filterLogic = (article: Article) => {
            if (activeFilter === 'ALL') return true;
            if (activeFilter === 'PENDING') return article.adminEditRequest === 'PENDING';
            if (article.adminEditRequest === 'PENDING') return false;
            
            switch (activeFilter) {
                case 'DRAFT': return article.status === 'DRAFT';
                case 'IN_REVIEW_GROUP': return (['IN_REVIEW', 'REVISED'].includes(article.status) || article.adminEditRequest === 'APPROVED') && article.adminEditRequest !== 'DENIED';
                case 'NEEDS_REVISION_GROUP': return ['NEEDS_REVISION', 'JOURNALIST_REVISING'].includes(article.status);
                case 'PUBLISHED': return article.status === 'PUBLISHED';
                case 'REJECTED_GROUP': return article.status === 'REJECTED' || article.adminEditRequest === 'DENIED';
                default: return false;
            }
        };
        let finalArticles = processedArticles.filter(filterLogic);

        finalArticles.sort((a, b) => {
            const dateA = new Date(a.updatedAt).getTime();
            const dateB = new Date(b.updatedAt).getTime();
            return sortBy === 'terbaru' ? dateB - dateA : dateA - dateB;
        });

        return { filteredArticles: finalArticles, articleCounts: counts };
    }, [articles, activeFilter, searchTerm, sortBy]);

    const filterOptions = useMemo(() => [
        { key: 'ALL', label: 'Semua', count: articleCounts.ALL },
        { key: 'DRAFT', label: 'Draf', count: articleCounts.DRAFT },
        { key: 'IN_REVIEW_GROUP', label: 'Dalam Tinjauan', count: articleCounts.IN_REVIEW_GROUP },
        { key: 'NEEDS_REVISION_GROUP', label: 'Perlu Revisi', count: articleCounts.NEEDS_REVISION_GROUP },
        { key: 'PENDING', label: 'Permintaan Admin', count: articleCounts.PENDING },
        { key: 'PUBLISHED', label: 'Diterbitkan', count: articleCounts.PUBLISHED },
        { key: 'REJECTED_GROUP', label: 'Ditolak', count: articleCounts.REJECTED_GROUP },
    ], [articleCounts]);

    const activeFilterLabel = filterOptions.find(f => f.key === activeFilter)?.label || 'Filter';

    const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
    const paginatedArticles = useMemo(() => {
        const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
        return filteredArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);
    }, [filteredArticles, currentPage]);

    const handleDelete = (id: number) => { if (window.confirm('Yakin ingin menghapus artikel ini?')) deleteArticle(id); };
    const openRequestModal = (article: Article) => { setCurrentArticle(article); setIsRequestModalOpen(true); };
    const openFeedbackModal = (article: Article) => { setCurrentArticle(article); setIsFeedbackModalOpen(true); };
    const handleRespondToRequest = (response: "APPROVED" | "DENIED") => {
        if (!currentArticle) return;
        respondToRequest({ articleId: currentArticle.id, response });
        setIsRequestModalOpen(false);
    };

    if (isLoading) return <div className="p-8 text-center text-white">Memuat artikel Anda...</div>;
    if (isError) return <div className="p-8 text-center text-red-400">Gagal memuat data.</div>;

    const ActionButtons: FC<{ article: Article }> = ({ article }) => {
        if (article.adminEditRequest === 'APPROVED') return <ActionButton to={`/jurnalis/articles/analytics/${article.id}`} color="gray" icon={<BarChart2 size={12}/>}>Lihat</ActionButton>;
        if (article.adminEditRequest === 'PENDING') return <ActionButton onClick={() => openRequestModal(article)} color="purple" icon={<ShieldCheck size={12}/>}>Respon</ActionButton>;
        if (article.adminEditRequest === 'DENIED') return <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>;
        
        switch (article.status) {
            case 'DRAFT': return <>
                <ActionButton to={`/jurnalis/articles/edit/${article.id}`} color="blue" icon={<Edit size={12}/>}>Ubah</ActionButton>
                <ActionButton onClick={() => submitArticle(article.id)} color="green" icon={<Send size={12}/>}>Kirim</ActionButton>
                <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>
            </>;
            case 'IN_REVIEW': return <ActionButton to={`/jurnalis/articles/analytics/${article.id}`} color="gray" icon={<BarChart2 size={12}/>}>Lihat</ActionButton>;
            case 'NEEDS_REVISION': return <>
                <ActionButton onClick={() => openFeedbackModal(article)} color="yellow" icon={<MessageSquare size={12}/>}>Lihat Umpan Balik</ActionButton>
                <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>
                <ActionButton onClick={() => startRevision(article.id)} color="blue" icon={<PlayCircle size={14}/>}>Mulai Revisi</ActionButton>
            </>;
            case 'JOURNALIST_REVISING': return <>
                <ActionButton to={`/jurnalis/articles/edit/${article.id}`} color="blue" icon={<Edit size={12}/>}>Ubah</ActionButton>
                <ActionButton onClick={() => openFeedbackModal(article)} color="yellow" icon={<MessageSquare size={12}/>}>Lihat Umpan Balik</ActionButton>
                <ActionButton onClick={() => finishRevision(article.id)} color="green" icon={<CheckCircle size={12}/>}>Selesai Revisi</ActionButton>
            </>;
            case 'REVISED': return <ActionButton to={`/jurnalis/articles/analytics/${article.id}`} color="gray" icon={<BarChart2 size={12}/>}>Lihat</ActionButton>;
            case 'PUBLISHED': return <>
                <ActionButton to={`/jurnalis/articles/analytics/${article.id}`} color="gray" icon={<BarChart2 size={12}/>}>Lihat</ActionButton>
                <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>
            </>;
            case 'REJECTED': return <ActionButton onClick={() => handleDelete(article.id)} color="red" icon={<Trash2 size={12}/>}>Hapus</ActionButton>;
            default: return null;
        }
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90">Manajemen Artikel Saya</h2>
                <Link to="/jurnalis/articles/new" className="bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 w-full sm:w-auto">
                    <Plus size={20} /> Tulis Artikel Baru
                </Link>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6 pb-4 border-b-2 border-lime-400/30">
                <div className="w-full md:flex-shrink-0 md:w-auto"><Menu as="div" className="relative inline-block text-left w-full"><div><Menu.Button className="inline-flex w-full justify-between items-center rounded-md bg-[#004A49]/60 border-2 border-lime-400/50 px-4 py-2 text-sm font-medium text-lime-300 hover:bg-[#004A49]/90 focus:outline-none"><span>{activeFilterLabel} ({articleCounts[activeFilter as keyof typeof articleCounts] ?? 0})</span><ChevronDown className="ml-2 -mr-1 h-5 w-5 text-lime-200/70" aria-hidden="true" /></Menu.Button></div><Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95"><Menu.Items className="absolute left-0 mt-2 w-56 origin-top-right divide-y divide-gray-600 rounded-md bg-[#003938] border-2 border-lime-400/50 shadow-lg ring-1 ring-black/5 focus:outline-none z-10"><div className="px-1 py-1">{filterOptions.map((option) => (<Menu.Item key={option.key}>{({ active }) => (<button onClick={() => {setActiveFilter(option.key as JournalistArticleFilter); setCurrentPage(1);}} className={`${ active ? 'bg-[#004A49] text-white' : 'text-gray-300' } group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm`}>{option.label}<span className="bg-gray-700 text-gray-200 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{option.count}</span></button>)}</Menu.Item>))}</div></Menu.Items></Transition></Menu></div>
                <div className="w-full md:flex-grow relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="search" placeholder="Cari artikel..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="w-full pl-10 pr-4 py-2 bg-[#004A49]/60 border-2 border-lime-400/50 rounded-md text-white placeholder-gray-400 focus:outline-none" /></div>
                <div className="w-full md:flex-shrink-0 md:w-auto"><Menu as="div" className="relative inline-block text-left w-full"><div><Menu.Button className="inline-flex w-full justify-between items-center rounded-md bg-[#004A49]/60 border-2 border-lime-400/50 px-4 py-2 text-sm font-medium text-lime-300 hover:bg-[#004A49]/90 focus:outline-none"><span>Urutkan: <span className="font-bold">{sortBy === 'terbaru' ? 'Terbaru' : 'Terlama'}</span></span><ChevronDown className="ml-2 -mr-1 h-5 w-5 text-lime-200/70" aria-hidden="true" /></Menu.Button></div><Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95"><Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-[#003938] border-2 border-lime-400/50 shadow-lg z-10"><div className="px-1 py-1"><Menu.Item><button onClick={() => {setSortBy('terbaru'); setCurrentPage(1);}} className='text-gray-300 hover:bg-[#004A49] group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm'><SortDesc size={16}/> Terbaru</button></Menu.Item><Menu.Item><button onClick={() => {setSortBy('terlama'); setCurrentPage(1);}} className='text-gray-300 hover:bg-[#004A49] group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm'><SortAsc size={16}/> Terlama</button></Menu.Item></div></Menu.Items></Transition></Menu></div>
            </div>

            <div className="hidden lg:block bg-[#004A49]/60 border-2 border-lime-400/50 shadow-lg rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y-2 divide-lime-400/30">
                    <thead className="bg-black/20"><tr><th className="px-6 py-3 text-left text-xs font-medium text-lime-300 uppercase tracking-wider">Judul & Umpan Balik</th><th className="px-6 py-3 text-left text-xs font-medium text-lime-300 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-right text-xs font-medium text-lime-300 uppercase tracking-wider">Aksi</th></tr></thead>
                    <tbody className="divide-y divide-lime-400/30">{paginatedArticles.map(article => (<tr key={article.id} className="hover:bg-black/10 transition-colors"><td className="px-6 py-4 whitespace-normal"><div className="font-medium text-white break-words max-w-xs">{article.title.id}</div> { (article.status === 'NEEDS_REVISION' || article.status === 'REJECTED') && article.feedback && <p className="text-xs text-yellow-400 mt-2 italic flex items-start gap-1.5"><MessageSquare size={14} className="shrink-0 mt-0.5"/> <span>"{article.feedback}"</span></p> }</td><td className="px-6 py-4 whitespace-nowrap">{ (() => { const status = getStatusProps(article); return <span className={`capitalize px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>{status.text}</span>; })() }</td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex gap-2 justify-end items-center flex-wrap"><ActionButtons article={article} /></div></td></tr>))}</tbody>
                </table>
            </div>
            <div className="lg:hidden space-y-4">{paginatedArticles.map(article => { const status = getStatusProps(article); return (<div key={article.id} className="bg-[#004A49]/60 border-2 border-lime-400/50 shadow-lg rounded-lg p-4 space-y-3"><div><div className="font-medium text-white break-words">{article.title.id}</div>{(article.status === 'NEEDS_REVISION' || article.status === 'REJECTED') && article.feedback && <p className="text-xs text-yellow-400 mt-2 italic flex items-start gap-1.5"><MessageSquare size={14} className="shrink-0 mt-0.5"/> <span>"{article.feedback}"</span></p>}</div><div><span className={`capitalize px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>{status.text}</span></div><div className="flex gap-2 justify-end items-center flex-wrap pt-3 border-t border-lime-400/20"><ActionButtons article={article} /></div></div>)})}</div>
            {filteredArticles.length === 0 && (<div className="text-center py-10 text-gray-400 bg-[#004A49]/60 border-2 border-lime-400/50 rounded-lg">Tidak ada artikel pada filter ini.</div>)}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />

            {isRequestModalOpen && currentArticle && (<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"><div className="bg-[#003B38] rounded-lg shadow-xl w-full max-w-md p-6 relative border-2 border-lime-400"><button onClick={() => setIsRequestModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button><h3 className="text-xl font-bold mb-2 text-lime-400">Permintaan Edit dari Admin</h3><p className="mb-4 text-gray-300">Admin meminta izin untuk mengubah artikel Anda: <span className="font-semibold text-white">"{currentArticle.title.id}"</span>.</p><div className="flex justify-end gap-3 mt-6"><button onClick={() => handleRespondToRequest('DENIED')} disabled={isMutating} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-red-700 disabled:bg-red-400"><ShieldX size={16}/> Tolak</button><button onClick={() => handleRespondToRequest('APPROVED')} disabled={isMutating} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:bg-green-400"><ShieldCheck size={16}/> Izinkan</button></div></div></div>)}
            {isFeedbackModalOpen && currentArticle && (<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"><div className="bg-[#003B38] rounded-lg shadow-xl w-full max-w-lg p-6 relative border-2 border-lime-400"><button onClick={() => setIsFeedbackModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button><h3 className="text-xl font-bold mb-2 text-lime-400">Umpan Balik dari Admin</h3><p className="mb-4 text-gray-300">Untuk artikel: <span className="font-semibold text-white">"{currentArticle.title.id}"</span></p><div className="bg-black/20 p-4 rounded-md text-gray-200 italic min-h-[100px] whitespace-pre-wrap">{currentArticle.feedback || "Tidak ada umpan balik."}</div><div className="flex justify-end mt-6"><button onClick={() => setIsFeedbackModalOpen(false)} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Tutup</button></div></div></div>)}
        </div>
    );
};