import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Send, Loader2, AlertTriangle } from 'lucide-react';
import type { Article, Category, PlantType } from '../../types';
import * as apiAdmin from '../../services/apiAdmin';
import * as apiArticles from '../../services/apiArticles';
import * as apiJournalist from '../../services/apiJournalist'; // Kita akan buat ini
import { MarkdownEditor } from '../admin/components/MarkdownEditor'; // Gunakan ulang editor dari admin

const initialFormData = {
    title: { id: '', en: '' },
    excerpt: { id: '', en: '' },
    content: { id: '', en: '' },
    imageUrl: '',
    categoryId: 0,
    plantTypeId: 0,
};

export const JournalistArticleEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEditMode = Boolean(id);
    const articleId = Number(id);

    const [formData, setFormData] = useState<any>(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const { data: articleData, isLoading: isLoadingArticle } = useQuery<Article>({
        queryKey: ['journalistArticle', articleId],
        queryFn: () => apiArticles.getArticleById(articleId), // getArticleById bisa dipakai jurnalis & admin
        enabled: isEditMode,
    });

    const { data: categories = [] } = useQuery<Category[]>({ queryKey: ['allCategories'], queryFn: apiAdmin.getCategories });
    const { data: plantTypes = [] } = useQuery<PlantType[]>({ queryKey: ['allPlantTypes'], queryFn: apiAdmin.getPlantTypes });

    useEffect(() => {
        if (isEditMode && articleData) {
            setFormData({
                title: articleData.title || { id: '', en: '' },
                excerpt: articleData.excerpt || { id: '', en: '' },
                content: articleData.content || { id: '', en: '' },
                imageUrl: articleData.imageUrl || '',
                categoryId: articleData.category?.id || 0,
                plantTypeId: articleData.plantType?.id || 0,
            });
        }
    }, [articleData, isEditMode]);
    
    const mutation = useMutation({
        mutationFn: (payload: any) => isEditMode 
            ? apiArticles.updateArticle({ id: articleId, ...payload }) 
            : apiArticles.createArticle(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['myArticles'] });
            // Jika ini artikel baru, arahkan ke mode edit agar bisa langsung submit
            if (!isEditMode) {
                navigate(`/jurnalis/articles/edit/${data.data.id}`);
            }
        },
        onError: (error: any) => alert(`Gagal menyimpan: ${error.response?.data?.error || error.message}`),
    });

    const submitMutation = useMutation({
        mutationFn: (idToSubmit: number) => apiJournalist.submitArticleForReview(idToSubmit),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myArticles'] });
            alert('Artikel berhasil dikirim untuk ditinjau!');
            navigate('/jurnalis/articles');
        },
        onError: (error: any) => alert(`Gagal mengirim: ${error.response?.data?.error || error.message}`),
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleJsonChange = (field: 'title' | 'excerpt' | 'content', lang: 'id' | 'en', value: string | undefined) => {
        setFormData((prev: any) => ({ ...prev, [field]: { ...prev[field], [lang]: value || '' } }));
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleAction = async (action: 'save' | 'submit') => {
        if (!formData.title.id || !formData.categoryId) {
            alert('Judul (Indonesia) dan Kategori wajib diisi.');
            return;
        }

        let finalImageUrl = formData.imageUrl;
        try {
            if (imageFile) {
                const uploadRes = await apiAdmin.uploadFile('artikel', imageFile);
                finalImageUrl = uploadRes.imageUrl;
            }

            if (!finalImageUrl && action === 'submit') {
                alert('Gambar utama wajib diunggah sebelum mengirim untuk ditinjau.');
                return;
            }

            const payload = { ...formData, imageUrl: finalImageUrl };
            
            // Simpan dulu (baik create atau update)
            const savedArticle = await mutation.mutateAsync(payload);
            
            // Jika aksinya adalah submit, panggil submitMutation setelah berhasil menyimpan
            if (action === 'submit') {
                const idToSubmit = isEditMode ? articleId : savedArticle.data.id;
                submitMutation.mutate(idToSubmit);
            } else {
                alert('Draf berhasil disimpan!');
            }
        } catch (error) {
            console.error("Save/Submit error:", error);
            // Error sudah ditangani di `onError` masing-masing mutation
        }
    };

    const isLoading = mutation.isPending || submitMutation.isPending;
    if (isLoadingArticle) return <div className="text-white p-8 text-center">Memuat editor...</div>;

    // Tentukan apakah tombol submit bisa ditampilkan
    const canSubmit = !isEditMode || (articleData && ['DRAFT', 'NEEDS_REVISION'].includes(articleData.status));
    const displayImageUrl = imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl;

    return (
        <div>
            <Link to="/jurnalis/articles" className="inline-flex items-center gap-2 text-lime-300 hover:text-lime-200 mb-6 transition-colors">
                <ArrowLeft size={20} /> Kembali ke Artikel Saya
            </Link>

            {articleData?.feedback && articleData.status === 'NEEDS_REVISION' && (
                <div className="bg-yellow-500/20 border-l-4 border-yellow-400 text-yellow-300 p-4 mb-6 rounded-r-lg">
                    <div className="flex items-start"><AlertTriangle className="h-5 w-5 mr-3 mt-1"/><div><p className="font-bold">Feedback dari Admin:</p><p className="text-sm italic">"{articleData.feedback}"</p></div></div>
                </div>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="bg-[#004A49]/60 border-2 border-lime-400/50 shadow-lg rounded-lg p-6 space-y-6">
                {/* Input Judul & Excerpt */}
                <div className="grid md:grid-cols-2 gap-4">
                    <input value={formData.title.id} onChange={(e) => handleJsonChange('title', 'id', e.target.value)} placeholder="Judul (Indonesia)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" required/>
                    <input value={formData.title.en} onChange={(e) => handleJsonChange('title', 'en', e.target.value)} placeholder="Title (English)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/>
                    <textarea value={formData.excerpt.id} onChange={(e) => handleJsonChange('excerpt', 'id', e.target.value)} rows={3} placeholder="Excerpt (Indonesia)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/>
                    <textarea value={formData.excerpt.en} onChange={(e) => handleJsonChange('excerpt', 'en', e.target.value)} rows={3} placeholder="Excerpt (English)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/>
                </div>
                
                {/* Editor Konten */}
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Konten (Indonesia)</label><MarkdownEditor value={formData.content.id} onChange={(value) => handleJsonChange('content', 'id', value)} /></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Konten (English)</label><MarkdownEditor value={formData.content.en} onChange={(value) => handleJsonChange('content', 'en', value)} /></div>

                {/* Metadata & Gambar */}
                <div className="grid md:grid-cols-2 gap-6 border-t border-lime-400/30 pt-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Gambar Utama</label>
                        <div className='mb-2 min-h-[1rem]'>{displayImageUrl && <img src={displayImageUrl} alt="Pratinjau" className="max-h-40 rounded-md border p-1 border-lime-400/50" />}</div>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-200/20 file:text-lime-300 hover:file:bg-lime-200/30 cursor-pointer"/>
                    </div>
                    <div className='space-y-4'>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Kategori</label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" required>
                                <option value={0} disabled>Pilih Kategori</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name.id}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Tipe Tanaman (Opsional)</label>
                            <select name="plantTypeId" value={formData.plantTypeId} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200">
                                <option value={0}>Tidak ada</option>
                                {plantTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name.id}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-lime-400/30">
                    <button type="button" onClick={() => handleAction('save')} disabled={isLoading} className="w-full sm:w-auto bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-60 flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={16} />} Simpan Draf
                    </button>
                    {canSubmit && (
                         <button type="button" onClick={() => handleAction('submit')} disabled={isLoading} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-lime-500 disabled:bg-lime-700 disabled:opacity-60 flex items-center justify-center gap-2">
                             {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Send size={16} />} Kirim untuk Tinjauan
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};