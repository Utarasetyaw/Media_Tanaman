import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/apiService';
import { Newspaper, ArrowLeft, Save } from 'lucide-react';
import type { Article } from '../../types';

// --- Fungsi API Khusus untuk Halaman Ini ---
const fetchArticleById = async (id: string): Promise<Article> => {
    // Menggunakan endpoint publik untuk mengambil detail, karena admin juga perlu data yang sama
    const { data } = await api.get(`/articles/${id}`);
    return data;
};

const createArticle = (data: Partial<Article>) => api.post('/articles', data);

const updateArticle = ({ id, ...data }: Partial<Article>) => api.put(`/articles/${id}`, data);

// --- Komponen Utama Halaman Editor ---
export const ArticleEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEditMode = Boolean(id);

    // State untuk menampung data formulir
    const [formData, setFormData] = useState({
        title: { id: '', en: '' },
        excerpt: { id: '', en: '' },
        content: { id: '', en: '' },
        imageUrl: '',
        category: '',
    });

    // Mengambil data artikel jika dalam mode edit
    const { data: articleData, isLoading: isLoadingArticle } = useQuery<Article>({
        queryKey: ['adminArticle', id],
        queryFn: () => fetchArticleById(id!),
        enabled: isEditMode, // Query ini hanya berjalan jika 'isEditMode' bernilai true
    });

    // Mengisi formulir dengan data artikel saat mode edit
    useEffect(() => {
        if (isEditMode && articleData) {
            setFormData({
                title: articleData.title,
                excerpt: articleData.excerpt,
                content: articleData.content,
                imageUrl: articleData.imageUrl,
                category: articleData.category,
            });
        }
    }, [articleData, isEditMode]);
    
    // Mutation untuk menyimpan data (bisa create atau update)
    const mutation = useMutation({
        mutationFn: isEditMode ? updateArticle : createArticle,
        onSuccess: () => {
            // Memberi tahu React Query bahwa data artikel sudah tidak valid dan perlu di-fetch ulang
            queryClient.invalidateQueries({ queryKey: ['allArticlesAdmin'] });
            // Kembali ke halaman manajemen setelah sukses
            navigate('/admin/articles');
        },
        onError: (error) => {
            // Tampilkan pesan error jika gagal
            alert(`Gagal menyimpan: ${(error as any).response?.data?.error || (error as Error).message}`);
        }
    });

    // Handler untuk setiap perubahan pada input form
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, lang?: 'id' | 'en') => {
        const { name, value } = e.target;
        if (lang) {
            // Menangani perubahan untuk field multibahasa
            setFormData(prev => ({ ...prev, [name]: { ...(prev[name as keyof typeof formData] as object), [lang]: value } }));
        } else {
            // Menangani perubahan untuk field biasa
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handler untuk submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = isEditMode ? { id: Number(id), ...formData } : formData;
        mutation.mutate(payload);
    };

    if (isEditMode && isLoadingArticle) {
        return <div className="text-white p-8">Loading data artikel...</div>;
    }

    return (
        <div>
            <Link to="/admin/articles" className="inline-flex items-center gap-2 text-lime-400 font-semibold hover:underline mb-6">
                <ArrowLeft size={20} />
                Kembali ke Manajemen Artikel
            </Link>
            <h2 className="font-serif text-3xl font-bold text-lime-400 flex items-center gap-3 mb-6">
                <Newspaper /> {isEditMode ? 'Edit Artikel' : 'Buat Artikel Baru'}
            </h2>
            
            <form onSubmit={handleSubmit} className="bg-[#004A49]/60 border-2 border-lime-400 shadow-lg rounded-lg p-6 space-y-6">
                {/* Judul */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Judul (Indonesia)</label><input name="title" value={formData.title.id} onChange={(e) => handleInputChange(e, 'id')} className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white p-2"/></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Judul (English)</label><input name="title" value={formData.title.en} onChange={(e) => handleInputChange(e, 'en')} className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white p-2"/></div>
                </div>
                
                {/* Excerpt */}
                 <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Excerpt (Indonesia)</label><textarea name="excerpt" value={formData.excerpt.id} onChange={(e) => handleInputChange(e, 'id')} rows={3} className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white p-2"/></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Excerpt (English)</label><textarea name="excerpt" value={formData.excerpt.en} onChange={(e) => handleInputChange(e, 'en')} rows={3} className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white p-2"/></div>
                </div>
                
                {/* Konten */}
                <div><label className="block text-sm font-medium text-gray-300 mb-1">Konten Markdown (Indonesia)</label><textarea name="content" value={formData.content.id} onChange={(e) => handleInputChange(e, 'id')} rows={10} className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white p-2 font-mono"/></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-1">Konten Markdown (English)</label><textarea name="content" value={formData.content.en} onChange={(e) => handleInputChange(e, 'en')} rows={10} className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white p-2 font-mono"/></div>

                {/* Info Lain */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">URL Gambar</label><input name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white p-2"/></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Kategori</label><input name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white p-2"/></div>
                </div>

                <div className="flex justify-end pt-4 border-t border-lime-400/30">
                    <button type="submit" disabled={mutation.isPending} className="bg-lime-300 text-lime-900 font-bold py-2 px-6 rounded-lg hover:bg-lime-400 flex items-center gap-2 transition-colors disabled:bg-lime-200 disabled:cursor-not-allowed">
                        <Save size={18} /> {mutation.isPending ? 'Menyimpan...' : 'Simpan Artikel'}
                    </button>
                </div>
            </form>
        </div>
    );
};