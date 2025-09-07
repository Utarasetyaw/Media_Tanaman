import React, { useState } from 'react';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';

// Tipe data untuk Artikel
interface Article {
    id: number;
    title: string;
    category: string;
    status: 'published' | 'pending' | 'needs_revision' | 'rejected';
    feedback?: string;
}

// Data awal sebagai contoh untuk jurnalis yang sedang login
const initialArticles: Article[] = [
    { id: 1, title: 'Cara Merawat Anggrek Bulan', category: 'Perawatan', status: 'published' },
    { id: 3, title: 'Pupuk Organik Terbaik untuk Mawar', category: 'Tips & Trik', status: 'pending' },
    { id: 6, title: 'Membuat Bonsai dari Awal', category: 'Panduan', status: 'needs_revision', feedback: 'Tolong tambahkan lebih banyak gambar dan detail pada langkah ke-3.'},
    { id: 8, title: '5 Jenis Sukulen Populer', category: 'Edukasi', status: 'rejected', feedback: 'Topik sudah pernah dibahas.' },
];

export const JournalistArticleManagementPage: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>(initialArticles);

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
                <h2 className="text-3xl font-bold text-gray-800">Artikel Saya</h2>
                <button className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <Plus size={20} /> Tulis Artikel Baru
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {articles.map(article => (
                            <tr key={article.id}>
                                <td className="px-6 py-4 font-medium text-gray-900">{article.title}</td>
                                <td className="px-6 py-4 text-gray-500">{article.category}</td>
                                <td className="px-6 py-4">
                                    {getStatusChip(article.status)}
                                    {article.status === 'needs_revision' && <p className="text-xs text-orange-700 mt-1 italic">"{article.feedback}"</p>}
                                     {article.status === 'rejected' && <p className="text-xs text-red-700 mt-1 italic">"{article.feedback}"</p>}
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium flex gap-2 justify-end">
                                    <button className="text-gray-500 hover:text-blue-700" title="Lihat"><Eye size={18} /></button>
                                    {(article.status === 'needs_revision' || article.status === 'rejected') && <button className="text-gray-500 hover:text-indigo-700" title="Edit"><Edit size={18} /></button>}
                                    <button className="text-gray-500 hover:text-red-700" title="Hapus"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
