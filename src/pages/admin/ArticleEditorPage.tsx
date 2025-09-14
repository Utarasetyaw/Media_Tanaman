import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Newspaper, ArrowLeft, Save, Send } from 'lucide-react';
import { useArticleEditor } from '../../hooks/useArticleEditor';
import { MarkdownEditor } from './components/MarkdownEditor';
import { useAuth } from '../../contexts/AuthContext';

const initialFormData = {
    title: { id: '', en: '' },
    excerpt: { id: '', en: '' },
    content: { id: '', en: '' },
    imageUrl: '',
    categoryId: 0,
    plantTypeId: 0,
};

export const ArticleEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const { user } = useAuth();

    const { articleData, categories, plantTypes, isLoading, isSaving, handleSaveAction } = useArticleEditor(id);

    const [formData, setFormData] = useState<any>(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (isEditMode && articleData) {
            setFormData({
                title: articleData.title,
                excerpt: articleData.excerpt,
                content: articleData.content,
                imageUrl: articleData.imageUrl,
                categoryId: articleData.category?.id || 0,
                plantTypeId: articleData.plantType?.id || 0,
            });
        }
    }, [articleData, isEditMode]);
    
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

    const handleAction = (action: 'save' | 'publish') => {
        if (!formData.title.id || !formData.categoryId) {
            alert('Judul (Indonesia) dan Kategori wajib diisi.');
            return;
        }
        handleSaveAction({ formData, imageFile, action });
    };

    if (isLoading) {
        return <div className="text-white p-8 text-center">Memuat editor artikel...</div>;
    }

    const backLinkUrl = window.location.pathname.includes('/admin') ? '/admin/articles' : '/jurnalis/articles';

    return (
        <div>
            <Link to={backLinkUrl} className="inline-flex items-center gap-2 text-lime-300 hover:text-lime-200 mb-6 transition-colors">
                <ArrowLeft size={20} />
                Kembali ke Manajemen Artikel
            </Link>
            <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90 flex items-center gap-3 mb-6">
                <Newspaper /> {isEditMode ? 'Ubah Artikel' : 'Buat Artikel Baru'}
            </h2>
            
            <form onSubmit={(e) => e.preventDefault()} className="bg-[#004A49]/60 border-2 border-lime-400/50 shadow-lg rounded-lg p-4 sm:p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Judul (Indonesia)</label>
                        <input value={formData.title.id} onChange={(e) => handleJsonChange('title', 'id', e.target.value)} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Judul (Bahasa Inggris)</label>
                        <input value={formData.title.en} onChange={(e) => handleJsonChange('title', 'en', e.target.value)} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/>
                    </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Kutipan (Indonesia)</label>
                        <textarea value={formData.excerpt.id} onChange={(e) => handleJsonChange('excerpt', 'id', e.target.value)} rows={3} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Kutipan (Bahasa Inggris)</label>
                        <textarea value={formData.excerpt.en} onChange={(e) => handleJsonChange('excerpt', 'en', e.target.value)} rows={3} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Konten (Indonesia)</label>
                    <MarkdownEditor value={formData.content.id} onChange={(value) => handleJsonChange('content', 'id', value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Konten (Bahasa Inggris)</label>
                     <MarkdownEditor value={formData.content.en} onChange={(value) => handleJsonChange('content', 'en', value)} />
                </div>

                <div className="grid md:grid-cols-2 gap-6 border-t border-lime-400/30 pt-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Gambar Utama</label>
                        <div className='mb-2 min-h-[1rem]'>
                            {imageFile ? <img src={URL.createObjectURL(imageFile)} alt="Pratinjau" className="max-h-40 rounded-md border p-1 border-lime-400/50" />
                            : formData.imageUrl && <img src={formData.imageUrl} alt="Gambar saat ini" className="max-h-40 rounded-md border p-1 border-lime-400/50" />}
                        </div>
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

                {/* REVISI: Tombol dibuat responsif (bertumpuk di mobile) */}
                <div className="flex flex-col sm:flex-row justify-end pt-6 border-t border-lime-400/30 gap-4">
                    {isEditMode && (
                         <button type="button" onClick={() => handleAction('save')} disabled={isSaving} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                            <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    )}
                    {!isEditMode && user?.role === 'ADMIN' && (
                        <>
                            <button type="button" onClick={() => handleAction('save')} disabled={isSaving} className="w-full sm:w-auto bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors disabled:bg-gray-700 disabled:opacity-60">
                                <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan Draf'}
                            </button>
                             <button type="button" onClick={() => handleAction('publish')} disabled={isSaving} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                                <Send size={18} /> {isSaving ? 'Menerbitkan...' : 'Terbitkan'}
                            </button>
                        </>
                    )}
                    {!isEditMode && user?.role === 'JOURNALIST' && (
                         <button type="button" onClick={() => handleAction('save')} disabled={isSaving} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                            <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan Artikel'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};