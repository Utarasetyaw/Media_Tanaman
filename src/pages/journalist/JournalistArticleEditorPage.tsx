import React, { useEffect, useState, Fragment } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Loader2, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useJournalistArticleEditor } from '../../hooks/useJournalistArticleEditor';
import { MarkdownEditor } from '../admin/components/MarkdownEditor';

type JournalistArticleFormData = {
    title: { id: string; en: string };
    excerpt: { id: string; en: string };
    content: { id: string; en: string };
    imageUrl: string;
    categoryId: number;
    plantTypeId: number;
};

const initialFormData: JournalistArticleFormData = {
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

const SuccessModal: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300">
        <div className="bg-[#004A49] border-2 border-lime-400/50 rounded-lg p-8 text-center shadow-xl transform transition-all duration-300 scale-100">
            <CheckCircle className="text-green-400 w-16 h-16 mx-auto mb-4" />
            <p className="text-white text-lg mb-6">{message}</p>
            <button onClick={onClose} className="bg-lime-400 text-gray-900 font-bold py-2 px-8 rounded-lg hover:bg-lime-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#004A49] focus:ring-lime-400">OK</button>
        </div>
    </div>
);

export const JournalistArticleEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();

    const { 
        articleData, categories, plantTypes, isLoading, 
        isSaving, saveArticleAsync, finishRevision 
    } = useJournalistArticleEditor();

    const [formData, setFormData] = useState<any>(initialFormData);
    const [imageFile, setImageFile] = useState<File | null>(null);
    // REVISI 1: State notifikasi sekarang menyimpan pesan & tujuan redirect
    const [successInfo, setSuccessInfo] = useState<{ message: string; path: string } | null>(null);

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
        setFormData((prev: JournalistArticleFormData) => ({ ...prev, [field]: { ...prev[field], [lang]: value || '' } }));
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
    };

    // REVISI 2: Ubah fungsi `handleSaveDraft` menjadi async
    const handleSaveDraft = async () => {
        if (!formData.title.id || !formData.categoryId) {
            alert('Judul (Indonesia) dan Kategori wajib diisi.');
            return;
        }
        try {
            const savedArticle = await saveArticleAsync({ formData, imageFile, action: 'save' });
            // Tentukan pesan dan tujuan redirect berdasarkan mode (baru atau edit)
            const redirectPath = isEditMode ? '/jurnalis/articles' : `/jurnalis/articles/edit/${savedArticle.id}`;
            const message = isEditMode ? 'Draf berhasil diperbarui!' : 'Draf berhasil disimpan!';
            setSuccessInfo({ message, path: redirectPath });
        } catch (error) {
            console.error("Gagal menyimpan draf:", error);
        }
    };

    const handleSubmitForReview = async () => {
        if (!formData.title.id || !formData.categoryId) {
            alert('Judul (Indonesia) dan Kategori wajib diisi.');
            return;
        }
        try {
            await saveArticleAsync({ formData, imageFile, action: 'submit' });
            setSuccessInfo({ message: 'Artikel berhasil dikirim untuk tinjauan!', path: '/jurnalis/articles' });
        } catch (error) {
            console.error("Gagal mengirim untuk tinjauan:", error);
        }
    };
    
    const handleFinishRevision = async () => {
        if (!window.confirm('Yakin ingin mengirim hasil revisi ini kembali ke admin?')) return;
        if (!formData.title.id || !formData.categoryId) {
            alert('Judul (Indonesia) dan Kategori wajib diisi.');
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
    };

    if (isLoading) return <div className="text-white p-8 text-center">Memuat editor...</div>;

    const displayImageUrl = imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Link to="/jurnalis/articles" className="inline-flex items-center gap-2 text-lime-300 hover:text-lime-200 mb-6 transition-colors"><ArrowLeft size={20} /> Kembali ke Artikel Saya</Link>
            
            {successInfo && (
                <SuccessModal 
                    message={successInfo.message} 
                    onClose={() => {
                        setSuccessInfo(null);
                        navigate(successInfo.path);
                    }} 
                />
            )}

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
                 {/* ... sisa form tidak berubah ... */}
                 <div className="grid md:grid-cols-2 gap-4">
                    <input value={formData.title.id} onChange={(e) => handleJsonChange('title', 'id', e.target.value)} placeholder="Judul (Indonesia)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" required/>
                    <input value={formData.title.en} onChange={(e) => handleJsonChange('title', 'en', e.target.value)} placeholder="Judul (Bahasa Inggris)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/>
                    <textarea value={formData.excerpt.id} onChange={(e) => handleJsonChange('excerpt', 'id', e.target.value)} rows={3} placeholder="Kutipan (Indonesia)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/>
                    <textarea value={formData.excerpt.en} onChange={(e) => handleJsonChange('excerpt', 'en', e.target.value)} rows={3} placeholder="Kutipan (Bahasa Inggris)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/>
                </div>
                
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Konten (Indonesia)</label><MarkdownEditor value={formData.content.id} onChange={(value) => handleJsonChange('content', 'id', value)} /></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-2">Konten (Bahasa Inggris)</label><MarkdownEditor value={formData.content.en} onChange={(value) => handleJsonChange('content', 'en', value)} /></div>

                <div className="grid md:grid-cols-2 gap-6 border-t border-lime-400/30 pt-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Gambar Utama</label>
                        <div className='mb-2 min-h-[1rem]'>{displayImageUrl && <img src={displayImageUrl} alt="Pratinjau" className="max-h-40 rounded-md border p-1 border-lime-400/50" />}</div>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-200/20 file:text-lime-300 hover:file:bg-lime-200/30 cursor-pointer"/>
                    </div>
                    <div className='space-y-4'>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Kategori</label>
                            <CustomDropdown placeholder="Pilih Kategori" selectedValue={formData.categoryId} onSelect={(value) => setFormData({ ...formData, categoryId: parseInt(value, 10) })} options={categories.map(cat => ({ id: cat.id, name: cat.name.id }))}/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Tipe Tanaman (Opsional)</label>
                            <CustomDropdown placeholder="Tidak ada" selectedValue={formData.plantTypeId} onSelect={(value) => setFormData({ ...formData, plantTypeId: parseInt(value, 10) || 0 })} options={plantTypes.map(pt => ({ id: pt.id, name: pt.name.id }))} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-lime-400/30">
                    {isEditMode && ['NEEDS_REVISION', 'JOURNALIST_REVISING'].includes(articleData?.status || '') ? (
                        <>
                            <button type="button" onClick={handleSaveDraft} disabled={isSaving} className="w-full sm:w-auto bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-60 flex items-center justify-center gap-2">{isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={16} />} Simpan Perubahan</button>
                            <button type="button" onClick={handleFinishRevision} disabled={isSaving} className="w-full sm:w-auto bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 disabled:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2">{isSaving ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle size={16} />} Revisi Selesai</button>
                        </>
                    ) : (
                        <>
                            <button type="button" onClick={handleSaveDraft} disabled={isSaving} className="w-full sm:w-auto bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-60 flex items-center justify-center gap-2">{isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={16} />} Simpan Draf</button>
                            <button type="button" onClick={handleSubmitForReview} disabled={isSaving} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-lime-500 disabled:bg-lime-700 disabled:opacity-60 flex items-center justify-center gap-2">{isSaving ? <Loader2 className="animate-spin" size={20}/> : <Send size={16} />} Kirim untuk Tinjauan</button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
};