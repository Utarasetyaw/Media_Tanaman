import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/apiService';
import { Settings2, ArrowLeft, Save } from 'lucide-react';
import type { Article, SEO } from '../../types';

// --- Fungsi API Khusus untuk Halaman Ini ---
const fetchArticleById = async (id: string): Promise<Article> => {
    // Menggunakan endpoint publik karena kita hanya butuh data untuk ditampilkan
    const { data } = await api.get(`/articles/${id}`);
    return data;
};

// Fungsi ini akan mengirimkan seluruh objek SEO ke backend untuk diupdate
const updateArticleSeo = ({ id, seo }: { id: number; seo: Partial<SEO> }) => 
    api.put(`/articles/${id}`, { seo });


// --- Komponen Utama Halaman SEO ---
export const ArticleSeoPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // State untuk menampung data formulir SEO
    const [seoData, setSeoData] = useState<Partial<SEO>>({
        metaTitle: '',
        metaDescription: '',
        ogTitle: '',
        ogDescription: '',
        ogImageUrl: '',
        twitterHandle: ''
    });

    // Mengambil data artikel untuk mendapatkan judul dan data SEO yang sudah ada
    const { data: articleData, isLoading } = useQuery<Article>({
        queryKey: ['articleSeo', id],
        queryFn: () => fetchArticleById(id!),
        enabled: !!id,
    });

    // Mengisi formulir dengan data SEO yang ada saat data selesai di-fetch
    useEffect(() => {
        if (articleData?.seo) {
            setSeoData({
                metaTitle: articleData.seo.metaTitle || '',
                metaDescription: articleData.seo.metaDescription || '',
                ogTitle: articleData.seo.ogTitle || '',
                ogDescription: articleData.seo.ogDescription || '',
                ogImageUrl: articleData.seo.ogImageUrl || '',
                twitterHandle: articleData.seo.twitterHandle || '',
            });
        }
    }, [articleData]);
    
    // Mutation untuk menyimpan data SEO
    const mutation = useMutation({
        mutationFn: updateArticleSeo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allArticlesAdmin'] });
            navigate('/admin/articles');
        },
        onError: (error) => {
            alert(`Gagal menyimpan SEO: ${(error as any).response?.data?.error || (error as Error).message}`);
        }
    });

    // Handler untuk setiap perubahan pada input form
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSeoData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Handler untuk submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ id: Number(id), seo: seoData });
    };

    if (isLoading) {
        return <div className="text-white p-8">Loading data SEO...</div>;
    }

    return (
        <div>
            <Link to="/admin/articles" className="inline-flex items-center gap-2 text-lime-400 font-semibold hover:underline mb-6">
                <ArrowLeft size={20} />
                Kembali ke Manajemen Artikel
            </Link>
            <h2 className="font-serif text-3xl font-bold text-lime-400 flex items-center gap-3 mb-2">
                <Settings2 /> Pengaturan SEO
            </h2>
            <p className="text-gray-300 mb-6">
                Untuk artikel: <span className="font-bold text-white">{articleData?.title.id}</span>
            </p>

            <form onSubmit={handleSubmit} className="bg-[#004A49]/60 border-2 border-lime-400 shadow-lg rounded-lg p-6 space-y-6">
                {/* --- SEO Dasar --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Meta Title</label>
                    <input name="metaTitle" value={seoData.metaTitle} onChange={handleInputChange} className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white p-2"/>
                    <p className="text-xs text-gray-400 mt-1">Judul yang muncul di tab browser dan hasil pencarian Google (optimal 50-60 karakter).</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Meta Description</label>
                    <textarea name="metaDescription" value={seoData.metaDescription} onChange={handleInputChange} rows={3} className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white p-2"/>
                    <p className="text-xs text-gray-400 mt-1">Deskripsi singkat yang muncul di bawah judul di hasil pencarian Google (optimal 150-160 karakter).</p>
                </div>
                
                {/* --- Social Media Sharing (Open Graph & Twitter) --- */}
                <div className="pt-4 border-t border-lime-400/30">
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Tampilan Media Sosial</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Judul Social Media (og:title)</label>
                            <input name="ogTitle" value={seoData.ogTitle} onChange={handleInputChange} className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white p-2"/>
                             <p className="text-xs text-gray-400 mt-1">Judul saat dibagikan di Facebook, LinkedIn, dll. Jika kosong, akan menggunakan Meta Title.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Deskripsi Social Media (og:description)</label>
                            <textarea name="ogDescription" value={seoData.ogDescription} onChange={handleInputChange} rows={3} className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white p-2"/>
                            <p className="text-xs text-gray-400 mt-1">Deskripsi saat dibagikan. Jika kosong, akan menggunakan Meta Description.</p>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">URL Gambar Social Media (og:image)</label>
                            <input name="ogImageUrl" value={seoData.ogImageUrl} onChange={handleInputChange} className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white p-2" placeholder="https://.../gambar.jpg"/>
                             <p className="text-xs text-gray-400 mt-1">URL gambar spesifik untuk social media (optimal 1200x630px). Jika kosong, akan menggunakan gambar utama artikel.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Twitter Handle</label>
                            <input name="twitterHandle" value={seoData.twitterHandle} onChange={handleInputChange} className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white p-2" placeholder="@UsernameAnda"/>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-lime-400/30">
                    <button type="submit" disabled={mutation.isPending} className="bg-lime-300 text-lime-900 font-bold py-2 px-6 rounded-lg hover:bg-lime-400 flex items-center gap-2 transition-colors disabled:bg-lime-200">
                        <Save size={18} /> {mutation.isPending ? 'Menyimpan...' : 'Simpan SEO'}
                    </button>
                </div>
            </form>
        </div>
    );
};