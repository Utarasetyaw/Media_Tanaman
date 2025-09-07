import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, CheckCircle, XCircle, Eye, MessageSquare, Edit3, Clock, Lock } from 'lucide-react';

// Tipe data untuk Artikel
interface Article {
    id: number;
    title: string;
    author: string;
    category: string;
    status: 'published' | 'pending' | 'needs_revision' | 'rejected';
    content: string; // Konten artikel, bisa berupa HTML dari rich text editor
    feedback?: string; // Feedback dari admin untuk revisi
    editRequest?: 'pending' | 'approved'; // Status permintaan edit oleh admin
}

// Data awal yang lebih beragam
const initialArticles: Article[] = [
    { id: 1, title: 'Cara Merawat Anggrek Bulan', author: 'Budi Santoso', category: 'Perawatan', status: 'published', content: '<p>Ini adalah konten artikel tentang anggrek...</p>', editRequest: 'approved' },
    { id: 2, title: 'Mengenal Tanaman Karnivora', author: 'Citra Lestari', category: 'Edukasi', status: 'published', content: '<p>Ini adalah konten artikel tentang tanaman karnivora...</p>' },
    { id: 3, title: 'Pupuk Organik Terbaik untuk Mawar', author: 'Budi Santoso', category: 'Tips & Trik', status: 'pending', content: '<p>Ini adalah konten artikel tentang pupuk mawar...</p>' },
    { id: 4, title: 'Panduan Lengkap Hidroponik', author: 'Admin', category: 'Panduan', status: 'published', content: '<p>Ini adalah konten artikel tentang hidroponik...</p>' },
    { id: 5, title: 'Mengatasi Hama Kutu Putih', author: 'Citra Lestari', category: 'Perawatan', status: 'pending', content: '<p>Ini adalah konten artikel tentang hama...</p>' },
    { id: 6, title: 'Membuat Bonsai dari Awal', author: 'Budi Santoso', category: 'Panduan', status: 'needs_revision', content: '<p>Konten kurang detail...</p>', feedback: 'Tolong tambahkan lebih banyak gambar dan detail pada langkah ke-3.'},
    { id: 7, title: 'Teknik Stek Batang', author: 'Citra Lestari', category: 'Tips & Trik', status: 'rejected', content: '<p>Konten ditolak...</p>', feedback: 'Topik sudah pernah dibahas sebelumnya.'},
    { id: 8, title: '5 Jenis Sukulen Populer', author: 'Budi Santoso', category: 'Edukasi', status: 'published', content: '<p>Ini adalah konten artikel tentang sukulen...</p>', editRequest: 'pending' },
];

// Tipe untuk filter
type ArticleFilter = 'all' | 'pending' | 'published' | 'rejected' | 'revision' | 'edit_pending' | 'edit_approved';

export const ArticleManagementPage: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [activeFilter, setActiveFilter] = useState<ArticleFilter>('all');
    
    // States for modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [feedbackText, setFeedbackText] = useState('');

    // --- Data Filtering ---
    const filteredData = {
        all: articles,
        pending: articles.filter(a => a.status === 'pending'),
        published: articles.filter(a => a.status === 'published'),
        rejected: articles.filter(a => a.status === 'rejected'),
        revision: articles.filter(a => a.status === 'needs_revision'),
        edit_pending: articles.filter(a => a.editRequest === 'pending'),
        edit_approved: articles.filter(a => a.editRequest === 'approved'),
    };

    // --- Handlers ---
    const handleApprove = (id: number) => setArticles(articles.map(a => a.id === id ? { ...a, status: 'published', feedback: undefined } : a));
    const handleDecline = (id: number) => {
        if (window.confirm('Yakin ingin menolak artikel ini?')) {
            setArticles(articles.map(a => a.id === id ? { ...a, status: 'rejected', feedback: 'Ditolak oleh admin.' } : a));
        }
    };
    const openFeedbackModal = (article: Article) => {
        setCurrentArticle(article);
        setIsFeedbackModalOpen(true);
    };
    const handleSendFeedback = () => {
        if (!currentArticle) return;
        setArticles(articles.map(a => a.id === currentArticle.id ? { ...a, status: 'needs_revision', feedback: feedbackText } : a));
        setIsFeedbackModalOpen(false);
        setFeedbackText('');
    };
    const openViewModal = (article: Article) => {
        setCurrentArticle(article);
        setIsViewModalOpen(true);
    };
    const handleDelete = (id: number) => {
        if (window.confirm('Yakin ingin menghapus artikel ini secara permanen?')) {
            setArticles(articles.filter(a => a.id !== id));
        }
    };
    const handleRequestEdit = (id: number) => {
        alert(`Permintaan untuk mengedit artikel ID ${id} telah dikirim ke jurnalis.`);
        setArticles(articles.map(a => a.id === id ? { ...a, editRequest: 'pending' } : a));
    };

    // --- Components ---
    const FilterButton: React.FC<{ filterName: ArticleFilter; label: string; }> = ({ filterName, label }) => (
        <button
            onClick={() => setActiveFilter(filterName)}
            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors flex-shrink-0 ${activeFilter === filterName ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            {label} <span className={`ml-2 text-xs font-bold px-2 py-1 rounded-full ${activeFilter === filterName ? 'bg-white text-green-700' : 'bg-gray-200 text-gray-700'}`}>{filteredData[filterName].length}</span>
        </button>
    );

    const getStatusChip = (status: Article['status']) => {
        const styles = {
            published: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            needs_revision: 'bg-orange-100 text-orange-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{status.replace('_', ' ')}</span>;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Manajemen Artikel</h2>
                <button onClick={() => setIsCreateModalOpen(true)} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <Plus size={20} /> Buat Artikel Baru
                </button>
            </div>

            {/* Navigasi Filter */}
            <div className="mb-6 pb-2 border-b">
                <div className="flex gap-2 overflow-x-auto -mb-px">
                    <FilterButton filterName="all" label="Semua Artikel" />
                    <FilterButton filterName="pending" label="Request Artikel" />
                    <FilterButton filterName="published" label="Diterima" />
                    <FilterButton filterName="rejected" label="Ditolak" />
                    <FilterButton filterName="revision" label="Dalam Revisi" />
                    <FilterButton filterName="edit_pending" label="Request Izin Edit" />
                    <FilterButton filterName="edit_approved" label="Izin Edit Diberikan" />
                </div>
            </div>

            {/* Tabel Konten */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penulis</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData[activeFilter].map(article => (
                            <tr key={article.id}>
                                <td className="px-6 py-4 font-medium text-gray-900">{article.title}</td>
                                <td className="px-6 py-4 text-gray-500">{article.author}</td>
                                <td className="px-6 py-4">{getStatusChip(article.status)}</td>
                                <td className="px-6 py-4 text-right text-sm font-medium flex gap-2 justify-end">
                                    <button onClick={() => openViewModal(article)} className="text-gray-500 hover:text-blue-700" title="Lihat Konten"><Eye size={18} /></button>
                                    {activeFilter === 'pending' && (
                                        <>
                                            <button onClick={() => handleApprove(article.id)} className="text-gray-500 hover:text-green-700" title="Setujui"><CheckCircle size={18} /></button>
                                            <button onClick={() => openFeedbackModal(article)} className="text-gray-500 hover:text-yellow-700" title="Minta Revisi"><MessageSquare size={18} /></button>
                                            <button onClick={() => handleDecline(article.id)} className="text-gray-500 hover:text-red-700" title="Tolak"><XCircle size={18} /></button>
                                        </>
                                    )}
                                    {(activeFilter === 'all' || activeFilter === 'published') && article.author !== 'Admin' && !article.editRequest && <button onClick={() => handleRequestEdit(article.id)} className="text-gray-500 hover:text-purple-700" title="Minta Izin Edit"><Edit3 size={18} /></button>}
                                    {(activeFilter === 'all' || activeFilter === 'published' || activeFilter === 'edit_approved') && (article.author === 'Admin' || article.editRequest === 'approved') && <button className="text-gray-500 hover:text-indigo-700" title="Edit"><Edit size={18} /></button>}
                                    {activeFilter === 'edit_pending' && <span className="flex items-center text-xs text-gray-500"><Clock size={14} className="mr-1"/> Menunggu</span>}
                                    {(activeFilter !== 'pending') && <button onClick={() => handleDelete(article.id)} className="text-gray-500 hover:text-red-700" title="Hapus"><Trash2 size={18} /></button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal untuk Feedback Revisi */}
            {isFeedbackModalOpen && currentArticle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                        <button onClick={() => setIsFeedbackModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X size={24} /></button>
                        <h3 className="text-2xl font-bold mb-2">Feedback untuk Revisi</h3>
                        <p className="mb-4 text-gray-600">Artikel: "{currentArticle.title}"</p>
                        <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Tulis catatan revisi untuk jurnalis di sini..." className="w-full h-32 border border-gray-300 rounded-md p-2"/>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsFeedbackModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Batal</button>
                            <button onClick={handleSendFeedback} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg">Kirim Feedback</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal untuk Lihat Konten */}
            {isViewModalOpen && currentArticle && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
                        <button onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X size={24} /></button>
                        <h3 className="text-2xl font-bold mb-2">{currentArticle.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">oleh {currentArticle.author} | Kategori: {currentArticle.category}</p>
                        <div className="prose max-w-none max-h-96 overflow-y-auto border p-4 rounded-md" dangerouslySetInnerHTML={{ __html: currentArticle.content }} />
                        {currentArticle.feedback && (
                            <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                                <h4 className="font-bold text-yellow-800">Catatan Revisi:</h4>
                                <p className="text-yellow-700">{currentArticle.feedback}</p>
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setIsViewModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
