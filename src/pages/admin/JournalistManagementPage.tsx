import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/apiService';
import { Plus, Edit, Trash2, X, Eye, Users } from 'lucide-react';

// PERBAIKAN 1: Definisikan tipe untuk status artikel
type ArticleStatus = 'DRAFT' | 'IN_REVIEW' | 'NEEDS_REVISION' | 'PUBLISHED' | 'REJECTED';

// PERBAIKAN 1: Tambahkan properti 'status' dan lainnya ke tipe Artikel
interface Article {
    id: number;
    title: string;
    status: ArticleStatus;
}

interface ArticleStats {
    published: number;
    needsRevision: number;
    rejected: number;
    inReview: number;
    draft: number;
}

interface Journalist {
    id: number;
    name: string;
    email: string;
    role: 'JOURNALIST' | 'ADMIN';
    articleStats: ArticleStats;
    articles?: Article[];
}

// --- API Functions ---
const fetchJournalists = async (): Promise<Journalist[]> => {
    const { data } = await api.get('/users');
    return data.filter((user: any) => user.role === 'JOURNALIST');
};

const fetchJournalistDetail = async (id: number): Promise<Journalist> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
};

const createJournalist = (data: Partial<Journalist>) => api.post('/users', data);
const updateJournalist = ({ id, ...data }: Partial<Journalist>) => api.put(`/users/${id}`, data);
const deleteJournalist = (id: number) => api.delete(`/users/${id}`);
const updateArticleStatus = ({ articleId, status, feedback }: { articleId: number; status: ArticleStatus; feedback?: string }) => 
    api.put(`/articles/management/${articleId}/status`, { status, feedback });

// --- Komponen Utama ---
export const JournalistManagementPage: React.FC = () => {
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
    const [selectedJournalistId, setSelectedJournalistId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const { data: journalists, isLoading, error } = useQuery<Journalist[]>({
        queryKey: ['journalists'],
        queryFn: fetchJournalists,
    });
    
    const { data: viewingJournalist, isLoading: isLoadingDetail } = useQuery<Journalist>({
        queryKey: ['journalistDetail', selectedJournalistId],
        queryFn: () => fetchJournalistDetail(selectedJournalistId!),
        enabled: !!selectedJournalistId && isArticleModalOpen,
    });

    const createMutation = useMutation({
        mutationFn: createJournalist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journalists'] });
            closeModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateJournalist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journalists'] });
            queryClient.invalidateQueries({ queryKey: ['journalistDetail', selectedJournalistId] });
            closeModal();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteJournalist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journalists'] });
        },
    });

    const statusUpdateMutation = useMutation({
        mutationFn: updateArticleStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journalistDetail', selectedJournalistId] });
            queryClient.invalidateQueries({ queryKey: ['journalists'] });
        }
    });
    
    const openModal = (journalist: Journalist | null = null) => {
        setSelectedJournalistId(journalist ? journalist.id : null);
        setFormData({ name: journalist?.name || '', email: journalist?.email || '', password: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);
    
    const openArticleModal = (id: number) => {
        setSelectedJournalistId(id);
        setIsArticleModalOpen(true);
    };

    const closeArticleModal = () => setIsArticleModalOpen(false);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const dataToSave: any = { ...formData };
        if (!dataToSave.password) delete dataToSave.password;

        if (selectedJournalistId) {
            updateMutation.mutate({ id: selectedJournalistId, ...dataToSave });
        } else {
            createMutation.mutate({ ...dataToSave, role: 'JOURNALIST' });
        }
    };
    
    const handleDelete = (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus jurnalis ini? Semua artikelnya juga akan terhapus.')) {
            deleteMutation.mutate(id);
        }
    };

    const handleStatusChange = (articleId: number, newStatus: ArticleStatus) => {
        let feedback = '';
        if (newStatus === 'NEEDS_REVISION' || newStatus === 'REJECTED') {
            feedback = prompt(`Berikan feedback untuk status '${newStatus}':`) || 'Tidak ada feedback.';
        }
        statusUpdateMutation.mutate({ articleId, status: newStatus, feedback });
    };
    
    if (isLoading) return <div className="text-white p-8">Loading data jurnalis...</div>;
    if (error) return <div className="text-red-400 p-8">Error: {(error as Error).message}</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="font-serif text-3xl font-bold text-lime-400 flex items-center gap-3">
                    <Users /> Manajemen Jurnalis
                </h2>
                <button
                    onClick={() => openModal()}
                    className="bg-lime-300 text-lime-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-400 flex items-center gap-2 transition-colors w-full sm:w-auto"
                >
                    <Plus size={20} /> Tambah Jurnalis
                </button>
            </div>

            <div className="bg-[#004A49]/60 border-2 border-lime-400 shadow-lg rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y-2 divide-lime-400/30">
                    <thead className="bg-black/20">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-lime-300 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-lime-300 uppercase tracking-wider">Statistik Artikel</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-lime-300 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-lime-400/30">
                        {journalists?.map(j => (
                            <tr key={j.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-white">{j.name}</div>
                                    <div className="text-sm text-gray-400">{j.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                    <div className="flex flex-wrap items-start gap-x-3 gap-y-1 text-xs">
                                        <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Published: {j.articleStats.published}</span>
                                        <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">In Review: {j.articleStats.inReview}</span>
                                        <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">Revision: {j.articleStats.needsRevision}</span>
                                        <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">Rejected: {j.articleStats.rejected}</span>
                                        <span className="bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded-full">Draft: {j.articleStats.draft}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openArticleModal(j.id)} className="text-lime-400 hover:text-lime-300 mr-4" title="Lihat Detail Artikel"><Eye size={18} /></button>
                                    <button onClick={() => openModal(j)} className="text-blue-400 hover:text-blue-300 mr-4" title="Edit Jurnalis"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(j.id)} className="text-red-400 hover:text-red-300" title="Hapus Jurnalis"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Tambah/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#003938] rounded-lg shadow-xl w-full max-w-md p-6 relative border-2 border-lime-400">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                        <h3 className="text-2xl font-bold mb-4 text-lime-400">{selectedJournalistId ? 'Edit Jurnalis' : 'Tambah Jurnalis Baru'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Nama Lengkap</label>
                                {/* PERBAIKAN 2: Menambahkan onChange */}
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white shadow-sm py-2 px-3 focus:ring-lime-400 focus:border-lime-400"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Alamat Email</label>
                                {/* PERBAIKAN 2: Menambahkan onChange */}
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white shadow-sm py-2 px-3 focus:ring-lime-400 focus:border-lime-400"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Password Baru</label>
                                {/* PERBAIKAN 2: Menambahkan onChange */}
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="mt-1 block w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white shadow-sm py-2 px-3 focus:ring-lime-400 focus:border-lime-400" placeholder={selectedJournalistId ? 'Kosongkan jika tidak diubah' : ''} />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={closeModal} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Batal</button>
                            {/* PERBAIKAN 2: Menambahkan onClick */}
                            <button onClick={handleSave} className="bg-lime-300 text-lime-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-400">Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Lihat Artikel */}
            {isArticleModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#003938] rounded-lg shadow-xl w-full max-w-3xl p-6 relative border-2 border-lime-400">
                        <button onClick={closeArticleModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                        {isLoadingDetail && <p className="text-white">Loading detail...</p>}
                        {viewingJournalist && (
                            <>
                                <h3 className="text-2xl font-bold mb-1 text-lime-400">Artikel oleh {viewingJournalist.name}</h3>
                                <p className="text-gray-400 mb-4">Total: {viewingJournalist.articles?.length || 0} artikel</p>
                                
                                <div className="max-h-[60vh] overflow-y-auto pr-2">
                                    {viewingJournalist.articles && viewingJournalist.articles.length > 0 ? (
                                        <ul className="space-y-3">
                                            {viewingJournalist.articles.map(article => (
                                                <li key={article.id} className="block sm:flex items-center justify-between p-3 bg-[#004A49]/80 rounded-md gap-4">
                                                    <div>
                                                        <span className="text-gray-200">{article.title}</span>
                                                        <span className={`block sm:inline-block ml-0 sm:ml-2 mt-1 sm:mt-0 px-2 text-xs font-semibold rounded-full bg-opacity-20 ${
                                                            article.status === 'PUBLISHED' ? 'bg-green-400 text-green-300' :
                                                            article.status === 'IN_REVIEW' ? 'bg-blue-400 text-blue-300' :
                                                            article.status === 'NEEDS_REVISION' ? 'bg-yellow-400 text-yellow-300' :
                                                            article.status === 'REJECTED' ? 'bg-red-400 text-red-300' :
                                                            'bg-gray-400 text-gray-300'
                                                        }`}>
                                                            {article.status}
                                                        </span>
                                                    </div>
                                                    {article.status === 'IN_REVIEW' && (
                                                        <div className="flex gap-2 mt-2 sm:mt-0 flex-shrink-0">
                                                            <button onClick={() => handleStatusChange(article.id, 'PUBLISHED')} className="text-xs bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded">Approve</button>
                                                            <button onClick={() => handleStatusChange(article.id, 'NEEDS_REVISION')} className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded">Revisi</button>
                                                            <button onClick={() => handleStatusChange(article.id, 'REJECTED')} className="text-xs bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded">Reject</button>
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-center text-gray-400 py-8">Jurnalis ini belum memiliki artikel.</p>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button onClick={closeArticleModal} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Tutup</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};