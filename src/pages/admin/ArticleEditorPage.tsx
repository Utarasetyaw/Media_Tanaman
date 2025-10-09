import React, { useEffect, useState, Fragment } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Newspaper, ArrowLeft, Save, Send, ChevronDown, Trash2, Download } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useArticleEditor } from '../../hooks/admin/useArticleEditor';
import { MarkdownEditor } from './components/MarkdownEditor';
import { useAuth } from '../../contexts/AuthContext';
import type { AdminArticleFormData } from '../../types/admin/adminarticleeditor.types';
import { toast } from 'react-hot-toast';

const initialFormData: AdminArticleFormData = {
    title: { id: '', en: '' },
    excerpt: { id: '', en: '' },
    content: { id: '', en: '' },
    imageUrl: '',
    categoryId: 0,
    plantTypeId: 0,
};

const CustomDropdown: React.FC<{
    options: { id: string | number; name: string }[];
    selectedValue: string | number;
    onSelect: (value: string) => void;
    placeholder: string;
}> = ({ options, selectedValue, onSelect, placeholder }) => {
    const selectedLabel = options.find(opt => opt.id.toString() === selectedValue.toString())?.name || placeholder;
    return (
        <Menu as="div" className="relative inline-block text-left w-full">
            <div><Menu.Button className="inline-flex w-full justify-between items-center rounded-lg bg-transparent border border-lime-400/60 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-[#004A49]/50 focus:outline-none"><>{selectedLabel} <ChevronDown className="ml-2 -mr-1 h-5 w-5 text-lime-200/70" aria-hidden="true" /></></Menu.Button></div>
            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute left-0 mt-2 w-full origin-top-right rounded-md bg-[#003938] border-2 border-lime-400/50 shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                    <div className="px-1 py-1 max-h-60 overflow-y-auto">
                        <Menu.Item>{({ active }) => (<button type="button" onClick={() => onSelect('0')} className={`${active ? 'bg-[#004A49] text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}>{placeholder}</button>)}</Menu.Item>
                        {options.map((option) => (<Menu.Item key={option.id}>{({ active }) => (<button type="button" onClick={() => onSelect(String(option.id))} className={`${active ? 'bg-[#004A49] text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}>{option.name}</button>)}</Menu.Item>))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export const ArticleEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const { user } = useAuth();
    const navigate = useNavigate();

    const { articleData, categories, plantTypes, isLoading, isSaving, handleSaveAction } = useArticleEditor(id);

    const [formData, setFormData] = useState<AdminArticleFormData>(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            toast.error('Anda tidak memiliki akses ke halaman ini.');
            navigate('/admin/dashboard');
        }
    }, [user, navigate]);

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
    
    const handleJsonChange = (field: 'title' | 'excerpt' | 'content', lang: 'id' | 'en', value: string | undefined) => {
        setFormData(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value || '' } }));
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setFormData(prev => ({ ...prev, imageUrl: '' }));
        const fileInput = document.getElementById('image-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleAction = async (action: 'save' | 'publish') => {
        if (!formData.title.id || !formData.categoryId) {
            toast.error('Judul (Indonesia) dan Kategori wajib diisi.');
            return;
        }
        try {
            const savedArticle = await handleSaveAction({ formData, imageFile, action });
            if (savedArticle) {
                let message = '';
                let path = '/admin/articles';
                if (action === 'publish') {
                    message = 'Artikel berhasil diterbitkan!';
                } else {
                    message = isEditMode ? 'Perubahan berhasil disimpan!' : 'Draf berhasil disimpan!';
                    if (!isEditMode) path = `/admin/articles/edit/${savedArticle.id}`;
                }
                toast.success(message);
                navigate(path);
            }
        } catch (error) {
            console.error("Gagal menyimpan artikel:", error);
        }
    };

    if (isLoading || !user) return <div className="text-white p-8 text-center">Memuat editor artikel...</div>;
    if (user.role !== 'ADMIN') return null;

    const displayImageUrl = imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90 flex items-center gap-3">
                    <Newspaper /> {isEditMode ? 'Ubah Artikel' : 'Buat Artikel Baru'}
                </h2>
                <Link to="/admin/articles" className="w-full sm:w-auto text-lime-300 hover:text-lime-100 flex items-center justify-center sm:justify-start gap-2 bg-black/20 px-4 py-2 rounded-lg border border-lime-400/50 transition-colors">
                    <ArrowLeft size={16} /> Kembali ke Manajemen Artikel
                </Link>
            </div>
            
            <form onSubmit={(e) => e.preventDefault()} className="bg-[#004A49]/60 border-2 border-lime-400/50 shadow-lg rounded-lg p-4 sm:p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Judul (Indonesia)</label><input value={formData.title.id} onChange={(e) => handleJsonChange('title', 'id', e.target.value)} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" required/></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Judul (Bahasa Inggris)</label><input value={formData.title.en} onChange={(e) => handleJsonChange('title', 'en', e.target.value)} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Kutipan (Indonesia)</label><textarea value={formData.excerpt.id} onChange={(e) => handleJsonChange('excerpt', 'id', e.target.value)} rows={3} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Kutipan (Bahasa Inggris)</label><textarea value={formData.excerpt.en} onChange={(e) => handleJsonChange('excerpt', 'en', e.target.value)} rows={3} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Konten (Indonesia)</label><MarkdownEditor value={formData.content.id} onChange={(value) => handleJsonChange('content', 'id', value)} /></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Konten (Bahasa Inggris)</label><MarkdownEditor value={formData.content.en} onChange={(value) => handleJsonChange('content', 'en', value)} /></div>

                <div className="grid md:grid-cols-2 gap-6 border-t border-lime-400/30 pt-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Gambar Utama</label>
                        <p className="text-xs text-gray-400 mt-1 mb-2">Rekomendasi rasio 16:9 (Ukuran Ideal: 1280x720 piksel).</p>
                        <div className="mt-2">
                            {displayImageUrl ? (
                                <div className="relative group w-full max-w-sm aspect-video rounded-lg overflow-hidden border p-1 border-lime-400/50">
                                    <img src={displayImageUrl} alt="Pratinjau" className="w-full h-full object-cover rounded-md" />
                                    <button type="button" onClick={handleRemoveImage} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Hapus gambar"><Trash2 size={16} /></button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full max-w-sm h-32 bg-black/20 rounded-md border-2 border-dashed border-lime-400/30">
                                    <p className="text-gray-400">Pratinjau Gambar</p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                            <label htmlFor="image-input" className="cursor-pointer bg-lime-200/20 text-lime-300 hover:bg-lime-200/30 font-semibold text-sm py-2 px-4 rounded-full transition-colors">Pilih File</label>
                            <input id="image-input" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            {formData.imageUrl && !imageFile && (
                                <a href={formData.imageUrl} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"><Download size={16} /> Unduh</a>
                            )}
                        </div>
                    </div>
                    <div className='space-y-4'>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Kategori</label>
                            <CustomDropdown placeholder="Pilih Kategori" selectedValue={formData.categoryId} onSelect={(value) => setFormData({ ...formData, categoryId: parseInt(value) })} options={categories.map(c => ({ id: c.id, name: c.name.id }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Tipe Tanaman (Opsional)</label>
                            <CustomDropdown placeholder="Tidak ada" selectedValue={formData.plantTypeId} onSelect={(value) => setFormData({ ...formData, plantTypeId: parseInt(value) || 0 })} options={plantTypes.map(pt => ({ id: pt.id, name: pt.name.id }))} />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end pt-6 border-t border-lime-400/30 gap-4">
                    <button type="button" onClick={() => handleAction('save')} disabled={isSaving} className="w-full sm:w-auto bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors disabled:bg-gray-700 disabled:opacity-60">
                        <Save size={18} /> {isSaving ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Simpan Draf')}
                    </button>
                    <button type="button" onClick={() => handleAction('publish')} disabled={isSaving} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                        <Send size={18} /> {isSaving ? 'Memproses...' : (isEditMode ? 'Terbitkan Perubahan' : 'Terbitkan')}
                    </button>
                </div>
            </form>
        </div>
    );
};