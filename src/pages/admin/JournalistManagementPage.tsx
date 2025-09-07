import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Eye } from 'lucide-react';

// Tipe data untuk Artikel
interface Article {
    id: number;
    title: string;
    status: 'published' | 'pending';
}

// Tipe data untuk Jurnalis
interface Journalist {
    id: number;
    name: string;
    email: string;
    articleCount: number;
    status: 'active' | 'inactive';
    articles: Article[];
}

// Data awal sebagai contoh
const initialJournalists: Journalist[] = [
    { 
        id: 1, 
        name: 'Budi Santoso', 
        email: 'budi.s@example.com', 
        articleCount: 15, 
        status: 'active',
        articles: [
            { id: 101, title: 'Cara Merawat Anggrek Bulan', status: 'published' },
            { id: 102, title: 'Tips Membasmi Hama pada Tanaman Cabai', status: 'published' },
            { id: 103, title: 'Pupuk Organik Terbaik untuk Mawar', status: 'pending' },
        ]
    },
    { 
        id: 2, 
        name: 'Citra Lestari', 
        email: 'citra.l@example.com', 
        articleCount: 8, 
        status: 'active',
        articles: [
            { id: 201, title: 'Mengenal Tanaman Karnivora', status: 'published' },
            { id: 202, title: 'Panduan Lengkap Hidroponik untuk Pemula', status: 'published' },
        ]
    },
    { 
        id: 3, 
        name: 'Agus Wijaya', 
        email: 'agus.w@example.com', 
        articleCount: 22, 
        status: 'inactive',
        articles: []
    },
];

export const JournalistManagementPage: React.FC = () => {
    const [journalists, setJournalists] = useState<Journalist[]>(initialJournalists);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
    const [editingJournalist, setEditingJournalist] = useState<Journalist | null>(null);
    const [viewingJournalist, setViewingJournalist] = useState<Journalist | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', status: 'active' as 'active' | 'inactive' });

    const openModal = (journalist: Journalist | null = null) => {
        if (journalist) {
            setEditingJournalist(journalist);
            setFormData({ name: journalist.name, email: journalist.email, status: journalist.status });
        } else {
            setEditingJournalist(null);
            setFormData({ name: '', email: '', status: 'active' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingJournalist(null);
    };

    const openArticleModal = (journalist: Journalist) => {
        setViewingJournalist(journalist);
        setIsArticleModalOpen(true);
    };

    const closeArticleModal = () => {
        setIsArticleModalOpen(false);
        setViewingJournalist(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (editingJournalist) {
            // Edit Jurnalis
            setJournalists(journalists.map(j => 
                j.id === editingJournalist.id ? { ...j, ...formData } : j
            ));
        } else {
            // Tambah Jurnalis Baru
            const newJournalist: Journalist = {
                id: Date.now(),
                ...formData,
                articleCount: 0,
                articles: [],
            };
            setJournalists([...journalists, newJournalist]);
        }
        closeModal();
    };
    
    const handleDelete = (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus jurnalis ini?')) {
            setJournalists(journalists.filter(j => j.id !== id));
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Manajemen Jurnalis</h2>
                <button
                    onClick={() => openModal()}
                    className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} /> Tambah Jurnalis
                </button>
            </div>

            {/* Tabel Jurnalis */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Artikel</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {journalists.map(j => (
                            <tr key={j.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{j.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{j.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{j.articleCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${j.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {j.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openArticleModal(j)} className="text-green-600 hover:text-green-900 mr-4" title="Lihat Artikel"><Eye size={18} /></button>
                                    <button onClick={() => openModal(j)} className="text-indigo-600 hover:text-indigo-900 mr-4" title="Edit Jurnalis"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(j.id)} className="text-red-600 hover:text-red-900" title="Hapus Jurnalis"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Tambah/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                            <X size={24} />
                        </button>
                        <h3 className="text-2xl font-bold mb-4">{editingJournalist ? 'Edit Jurnalis' : 'Tambah Jurnalis Baru'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Alamat Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500">
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Tidak Aktif</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={closeModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Batal</button>
                            <button onClick={handleSave} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Lihat Artikel */}
            {isArticleModalOpen && viewingJournalist && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                        <button onClick={closeArticleModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                            <X size={24} />
                        </button>
                        <h3 className="text-2xl font-bold mb-1">Artikel oleh {viewingJournalist.name}</h3>
                        <p className="text-gray-500 mb-4">Total: {viewingJournalist.articles.length} artikel</p>
                        
                        <div className="max-h-80 overflow-y-auto pr-2">
                            {viewingJournalist.articles.length > 0 ? (
                                <ul className="space-y-3">
                                    {viewingJournalist.articles.map(article => (
                                        <li key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                            <span className="text-gray-800">{article.title}</span>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {article.status === 'published' ? 'Diterbitkan' : 'Menunggu'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 py-8">Jurnalis ini belum memiliki artikel.</p>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button onClick={closeArticleModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
