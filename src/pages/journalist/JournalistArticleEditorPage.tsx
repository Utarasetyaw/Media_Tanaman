import React, { useEffect, useState, Fragment } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Loader2, AlertTriangle, CheckCircle, ChevronDown, Trash2, Download, Newspaper } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useJournalistArticleEditor } from '../../hooks/jurnalist/useJournalistArticleEditor';
import { MarkdownEditor } from '../admin/components/MarkdownEditor';
import type { JournalistArticleFormData } from '../../types/jurnalist/journalistArticleEditor.types';
import { toast } from 'react-hot-toast'; // Impor toast

const initialFormData: JournalistArticleFormData = {
    title: { id: '', en: '' },
    excerpt: { id: '', en: '' },
    content: { id: '', en: '' },
    imageUrl: '',
    categoryId: 0,
    plantTypeId: 0,
};

// Komponen CustomDropdown (Tidak ada perubahan)
const CustomDropdown: React.FC<{
    options: { id: string | number; name: string }[];
    selectedValue: string | number;
    onSelect: (value: string) => void;
    placeholder: string;
    readOnly?: boolean;
}> = ({ options, selectedValue, onSelect, placeholder, readOnly }) => {
    const selectedLabel = options.find(opt => opt.id.toString() === selectedValue.toString())?.name || placeholder;
    return (
        <Menu as="div" className="relative inline-block text-left w-full">
            <div>
                <Menu.Button 
                    disabled={readOnly}
                    className="inline-flex w-full justify-between items-center rounded-lg bg-transparent border border-lime-400/60 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-[#004A49]/50 focus:outline-none read-only:bg-gray-700/30 read-only:cursor-not-allowed"
                >
                    {selectedLabel}
                    <ChevronDown className="ml-2 -mr-1 h-5 w-5 text-lime-200/70" aria-hidden="true" />
                </Menu.Button>
            </div>
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

// Komponen SuccessModal (dihapus)

export const JournalistArticleEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();

    const { 
        articleData, categories, plantTypes, isLoading, 
        isSaving, saveArticleAsync, finishRevision 
    } = useJournalistArticleEditor();

    const [formData, setFormData] = useState<JournalistArticleFormData>(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isDownloading, setIsDownloading] = useState(false); // State untuk unduh gambar

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

    const handleDownload = async (imageUrl: string) => {
        setIsDownloading(true);
        toast.loading('Mulai mengunduh...');
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', imageUrl.substring(imageUrl.lastIndexOf('/') + 1));
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.dismiss();
            toast.success('Gambar berhasil diunduh!');
        } catch (error) {
            toast.dismiss();
            toast.error('Gagal mengunduh gambar.');
        } finally {
            setIsDownloading(false);
        }
    };
    
    const handleSave = async (action: 'save' | 'submit') => {
        if (!formData.title.id || !formData.categoryId) {
            toast.error('Judul (Indonesia) dan Kategori wajib diisi.');
            return;
        }
        try {
            const savedArticle = await saveArticleAsync({ formData, imageFile, action });
            if (savedArticle) {
                if (action === 'submit') {
                    toast.success('Artikel berhasil dikirim untuk tinjauan!');
                    navigate('/jurnalis/articles');
                } else {
                    const message = isEditMode ? 'Draf berhasil diperbarui!' : 'Draf berhasil disimpan!';
                    const path = isEditMode ? '/jurnalis/articles' : `/jurnalis/articles/edit/${savedArticle.id}`;
                    toast.success(message);
                    if(!isEditMode) navigate(path); // Arahkan ke halaman edit hanya jika membuat baru
                }
            }
        } catch (error) {
            // Error sudah ditangani di hook, tidak perlu toast lagi di sini
            console.error("Gagal memproses:", error);
        }
    };
    
    const confirmFinishRevision = () => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-2">
                <p className="font-semibold text-white">Kirim hasil revisi ini kembali ke admin?</p>
                <div className="flex gap-2">
                    <button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md text-sm"
                        onClick={async () => {
                            toast.dismiss(t.id);
                            if (!formData.title.id || !formData.categoryId) {
                                toast.error('Judul (Indonesia) dan Kategori wajib diisi.');
                                return;
                            }
                            try {
                                const savedArticle = await saveArticleAsync({ formData, imageFile, action: 'save' });
                                if (savedArticle) {
                                    finishRevision(savedArticle.id);
                                }
                            } catch (error) {
                                console.log("Gagal menyimpan sebelum menyelesaikan revisi.", error);
                            }
                        }}
                    >
                        Ya, Kirim
                    </button>
                    <button
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md text-sm"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Batal
                    </button>
                </div>
            </div>
        ));
    };

    if (isLoading) return <div className="text-white p-8 text-center">Memuat editor...</div>;

    const displayImageUrl = imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl;
    const isEditable = !isEditMode || ['DRAFT', 'NEEDS_REVISION', 'JOURNALIST_REVISING'].includes(articleData?.status || 'DRAFT');

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90 flex items-center gap-3">
                    <Newspaper /> {isEditMode ? 'Ubah Artikel' : 'Tulis Artikel Baru'}
                </h2>
                <Link to="/jurnalis/articles" className="w-full sm:w-auto text-lime-300 hover:text-lime-100 flex items-center justify-center sm:justify-start gap-2 bg-black/20 px-4 py-2 rounded-lg border border-lime-400/50 transition-colors">
                    <ArrowLeft size={16} /> Kembali ke Artikel Saya
                </Link>
            </div>
            
            {articleData?.feedback && ['NEEDS_REVISION', 'JOURNALIST_REVISING'].includes(articleData.status) && (
                <div className="bg-yellow-500/20 border-l-4 border-yellow-400 text-yellow-300 p-4 mb-6 rounded-r-lg">
                    <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0"/>
                        <div>
                            <p className="font-bold">Umpan Balik dari Admin:</p>
                            <p className="text-sm italic">"{articleData.feedback}"</p>
                        </div>
                    </div>
                </div>
            )}
            
            <form onSubmit={(e) => e.preventDefault()} className="bg-[#004A49]/60 border-2 border-lime-400/50 shadow-lg rounded-lg p-4 sm:p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Judul (Indonesia)</label><input readOnly={!isEditable} value={formData.title.id} onChange={(e) => handleJsonChange('title', 'id', e.target.value)} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 read-only:bg-gray-700/30 read-only:cursor-not-allowed" required/></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Judul (Bahasa Inggris)</label><input readOnly={!isEditable} value={formData.title.en} onChange={(e) => handleJsonChange('title', 'en', e.target.value)} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 read-only:bg-gray-700/30 read-only:cursor-not-allowed"/></div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Kutipan (Indonesia)</label><textarea readOnly={!isEditable} value={formData.excerpt.id} onChange={(e) => handleJsonChange('excerpt', 'id', e.target.value)} rows={3} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 read-only:bg-gray-700/30 read-only:cursor-not-allowed"/></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Kutipan (Bahasa Inggris)</label><textarea readOnly={!isEditable} value={formData.excerpt.en} onChange={(e) => handleJsonChange('excerpt', 'en', e.target.value)} rows={3} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 read-only:bg-gray-700/30 read-only:cursor-not-allowed"/></div>
                </div>
                
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Konten (Indonesia)</label><MarkdownEditor readOnly={!isEditable} value={formData.content.id} onChange={(value) => handleJsonChange('content', 'id', value)} /></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Konten (Bahasa Inggris)</label><MarkdownEditor readOnly={!isEditable} value={formData.content.en} onChange={(value) => handleJsonChange('content', 'en', value)} /></div>

                <div className="grid md:grid-cols-2 gap-6 border-t border-lime-400/30 pt-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Gambar Utama</label>
                        <p className="text-xs text-gray-400 mt-1 mb-2">Rekomendasi rasio 16:9 (Contoh: 1280x720 piksel).</p>
                        <div className="mt-2">
                            {displayImageUrl ? (
                                <div className="relative group w-full max-w-sm aspect-video rounded-lg overflow-hidden border p-1 border-lime-400/50">
                                    <img src={displayImageUrl} alt="Pratinjau" className="w-full h-full object-cover rounded-md" />
                                    {isEditable && <button type="button" onClick={handleRemoveImage} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Hapus gambar"><Trash2 size={16} /></button>}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full max-w-sm h-32 bg-black/20 rounded-md border-2 border-dashed border-lime-400/30"><p className="text-gray-400">Pratinjau Gambar</p></div>
                            )}
                        </div>
                        {isEditable && (
                            <div className="flex items-center gap-4 mt-3">
                                <label htmlFor="image-input" className="cursor-pointer bg-lime-200/20 text-lime-300 hover:bg-lime-200/30 font-semibold text-sm py-2 px-4 rounded-full transition-colors">Pilih File</label>
                                <input id="image-input" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                {formData.imageUrl && !imageFile && (<button type="button" disabled={isDownloading} onClick={() => handleDownload(formData.imageUrl)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white disabled:opacity-50">{isDownloading ? <Loader2 className="animate-spin" size={16}/> : <Download size={16} />} Unduh</button>)}
                            </div>
                        )}
                    </div>
                    <div className='space-y-4'>
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">Kategori</label><CustomDropdown readOnly={!isEditable} placeholder="Pilih Kategori" selectedValue={formData.categoryId} onSelect={(value) => setFormData({ ...formData, categoryId: parseInt(value, 10) })} options={categories.map(cat => ({ id: cat.id, name: cat.name.id }))}/></div>
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">Tipe Tanaman (Opsional)</label><CustomDropdown readOnly={!isEditable} placeholder="Tidak ada" selectedValue={formData.plantTypeId} onSelect={(value) => setFormData({ ...formData, plantTypeId: parseInt(value, 10) || 0 })} options={plantTypes.map(pt => ({ id: pt.id, name: pt.name.id }))} /></div>
                    </div>
                </div>

                {isEditable && (
                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-lime-400/30">
                        {isEditMode && ['NEEDS_REVISION', 'JOURNALIST_REVISING'].includes(articleData?.status || '') ? (
                            <>
                                <button type="button" onClick={() => handleSave('save')} disabled={isSaving} className="w-full sm:w-auto bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-60 flex items-center justify-center gap-2">{isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={16} />} Simpan Perubahan</button>
                                <button type="button" onClick={confirmFinishRevision} disabled={isSaving} className="w-full sm:w-auto bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 disabled:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2">{isSaving ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle size={16} />} Revisi Selesai</button>
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={() => handleSave('save')} disabled={isSaving} className="w-full sm:w-auto bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-60 flex items-center justify-center gap-2">{isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={16} />} Simpan Draf</button>
                                <button type="button" onClick={() => handleSave('submit')} disabled={isSaving} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-lime-500 disabled:bg-lime-700 disabled:opacity-60 flex items-center justify-center gap-2">{isSaving ? <Loader2 className="animate-spin" size={20}/> : <Send size={16} />} Kirim untuk Tinjauan</button>
                            </>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
};