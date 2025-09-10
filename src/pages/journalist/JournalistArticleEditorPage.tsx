import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios, { type AxiosRequestConfig } from 'axios';
import { Save, Send, Loader2, ArrowLeft, AlertTriangle, Bold, Italic, Strikethrough, Heading2, Link2, List, Upload } from 'lucide-react';
import type { Article } from '../../types';

// --- Placeholder untuk ReactMarkdown agar tidak error saat pratinjau ---
const ReactMarkdown = ({ children }: { children: React.ReactNode }) => {
    return <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', color: 'inherit' }}>{children}</pre>;
};


// --- Konfigurasi API Service ---
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- API Functions ---
const fetchArticleById = async (id: string): Promise<Article> => {
    const { data } = await api.get(`/articles/my-articles/analytics/${id}`);
    return data;
};

const createArticle = async (articleData: Partial<Article>): Promise<Article> => {
    const { data } = await api.post('/articles', articleData);
    return data;
};

const updateArticle = async ({ id, articleData }: { id: number; articleData: Partial<Article> }): Promise<Article> => {
    const { data } = await api.put(`/articles/${id}`, articleData);
    return data;
};

const submitForReview = (id: number) => api.post(`/articles/${id}/submit`);

const uploadImage = async (
    file: File,
    onProgress: (progress: number) => void
): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const config: AxiosRequestConfig = {
        headers: {
            'Content-Type': undefined,
        },
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    };
    
    const { data } = await api.post('/upload', formData, config);
    return data;
};


// --- Sub-Komponen Input ---
interface InputFieldProps {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-lime-300 mb-1">{label}</label>
        <input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder}
            className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md p-2 text-white focus:ring-lime-300 focus:border-lime-300"
        />
    </div>
);

interface TextareaFieldProps {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string; rows?: number;
}

const TextareaField: React.FC<TextareaFieldProps> = ({ label, name, value, onChange, placeholder, rows = 4 }) => (
     <div>
        <label className="block text-sm font-medium text-lime-300 mb-1">{label}</label>
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows}
            className="w-full bg-white/10 border-2 border-lime-400/50 rounded-md p-2 text-white focus:ring-lime-300 focus:border-lime-300"
        />
    </div>
);

// --- Komponen Editor Markdown dengan Toolbar ---
type FormatType = 'bold' | 'italic' | 'strike' | 'h2' | 'link' | 'list';
interface MarkdownEditorFieldProps {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string; rows?: number;
}

const MarkdownEditorField: React.FC<MarkdownEditorFieldProps> = ({ label, name, value, onChange, placeholder, rows = 15 }) => {
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleFormat = (type: FormatType) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let newText = '';

        const triggerChange = (newValue: string) => {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
            nativeInputValueSetter?.call(textarea, newValue);
            const event = new Event('input', { bubbles: true });
            textarea.dispatchEvent(event);
        };

        switch (type) {
            case 'bold': newText = `**${selectedText || 'Teks Tebal'}**`; break;
            case 'italic': newText = `*${selectedText || 'Teks Miring'}*`; break;
            case 'strike': newText = `~~${selectedText || 'Teks Coret'}~~`; break;
            case 'h2': newText = `## ${selectedText || 'Judul'}`; break;
            case 'link':
                const url = prompt('Masukkan URL:', 'https://');
                if (url) { newText = `[${selectedText || 'Teks Link'}](${url})`; } else { return; }
                break;
            case 'list': newText = `- ${selectedText || 'Item Daftar'}`; break;
        }

        const updatedValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
        triggerChange(updatedValue);
        textarea.focus();
        const newCursorPos = start + newText.length;
        setTimeout(() => textarea.setSelectionRange(newCursorPos, newCursorPos), 0);
    };

    const ToolbarButton = ({ formatType, children }: { formatType: FormatType, children: React.ReactNode }) => (
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat(formatType); }}
            className="p-2 text-gray-300 hover:bg-lime-400/20 hover:text-lime-200 rounded">
            {children}
        </button>
    );

    return (
        <div>
            <label className="block text-sm font-medium text-lime-300 mb-2">{label}</label>
            <div className="bg-white/10 border-2 border-lime-400/50 rounded-md text-white">
                <div className="flex items-center flex-wrap gap-1 p-1 border-b-2 border-lime-400/50">
                    <ToolbarButton formatType="bold"><Bold size={16} /></ToolbarButton>
                    <ToolbarButton formatType="italic"><Italic size={16} /></ToolbarButton>
                    <ToolbarButton formatType="strike"><Strikethrough size={16} /></ToolbarButton>
                    <ToolbarButton formatType="h2"><Heading2 size={16} /></ToolbarButton>
                    <ToolbarButton formatType="link"><Link2 size={16} /></ToolbarButton>
                    <ToolbarButton formatType="list"><List size={16} /></ToolbarButton>
                </div>
                <div className="flex border-b-2 border-lime-400/50">
                    <button type="button" onClick={() => setActiveTab('write')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'write' ? 'bg-lime-400/20 text-lime-200' : 'text-gray-400 hover:bg-white/5'}`}>Tulis</button>
                    <button type="button" onClick={() => setActiveTab('preview')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'preview' ? 'bg-lime-400/20 text-lime-200' : 'text-gray-400 hover:bg-white/5'}`}>Pratinjau</button>
                </div>
                <div className="p-2">
                    {activeTab === 'write' ? (
                        <textarea ref={textareaRef} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full bg-transparent p-2 focus:outline-none resize-y" />
                    ) : (
                        <div className="prose prose-invert max-w-none p-2 min-h-[330px] prose-headings:text-lime-300 prose-a:text-teal-300">
                             <ReactMarkdown>{value || 'Tidak ada konten untuk pratinjau.'}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Komponen Utama ---
export const JournalistArticleEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        title: { id: '', en: '' },
        excerpt: { id: '', en: '' },
        content: { id: '', en: '' },
        imageUrl: '',
        category: '',
        plantType: '',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
    
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    const { data: existingArticle, isLoading: isLoadingArticle, error: fetchError } = useQuery({
        queryKey: ['myArticle', id],
        queryFn: () => fetchArticleById(id!),
        enabled: isEditMode,
    });

    useEffect(() => {
        if (existingArticle) {
            setFormData({
                title: { id: existingArticle.title.id || '', en: existingArticle.title.en || '' },
                excerpt: { id: existingArticle.excerpt.id || '', en: existingArticle.excerpt.en || '' },
                content: { id: existingArticle.content.id || '', en: existingArticle.content.en || '' },
                imageUrl: existingArticle.imageUrl || '',
                category: existingArticle.category || '',
                plantType: (existingArticle as any).plantType || '',
            });
            setLocalImagePreview(null);
        }
    }, [existingArticle]);

    const mutationOptions = {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myArticles'] }),
        onError: (err: any) => console.error("Operation failed:", err.response?.data?.message || err.message),
    };

    const createMutation = useMutation({ mutationFn: createArticle, ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: updateArticle, ...mutationOptions });
    const submitMutation = useMutation({ 
        mutationFn: submitForReview, 
        onSuccess: () => {
            mutationOptions.onSuccess();
            navigate('/jurnalis/articles');
        }
    });

    const capitalizeWords = (str: string) => str.replace(/\b\w/g, char => char.toUpperCase());

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [field, lang] = name.split('.');
            setFormData(prev => ({...prev, [field]: {...(prev[field as keyof typeof prev] as object), [lang]: value }}));
        } else {
            const finalValue = (name === 'category' || name === 'plantType') ? capitalizeWords(value) : value;
            setFormData(prev => ({ ...prev, [name]: finalValue }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setLocalImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (action: 'save' | 'submit') => {
        let finalData = { ...formData };

        if (imageFile) {
            setIsUploading(true);
            setUploadProgress(0);
            try {
                const uploadResponse = await uploadImage(imageFile, (progress) => {
                    setUploadProgress(progress);
                });
                finalData.imageUrl = uploadResponse.imageUrl;
            } catch (error) {
                console.error("Image upload failed:", error);
                alert("Gagal mengunggah gambar. Silakan coba lagi.");
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        if (!finalData.imageUrl && action === 'submit') {
            alert("Gambar utama wajib diunggah sebelum mengirim untuk tinjauan.");
            return;
        }

        if (isEditMode) {
            await updateMutation.mutateAsync({ id: parseInt(id!), articleData: finalData });
            if (action === 'submit') submitMutation.mutate(parseInt(id!));
        } else {
            const newArticle = await createMutation.mutateAsync(finalData);
            if (newArticle) {
                if (action === 'save') navigate(`/jurnalis/articles/edit/${newArticle.id}`);
                if (action === 'submit') submitMutation.mutate(newArticle.id);
            }
        }
    };
    
    const isLoading = createMutation.isPending || updateMutation.isPending || submitMutation.isPending;
    if (isLoadingArticle) return <div className="p-8 text-center text-white">Memuat editor...</div>;
    if (fetchError) return <div className="p-8 text-center text-red-400">Error: {(fetchError as Error).message}</div>;

    const canSubmit = !existingArticle || ['DRAFT', 'REJECTED', 'NEEDS_REVISION'].includes(existingArticle.status);
    
    // --- REVISI DI SINI ---
    // Logika diubah untuk memprioritaskan pratinjau lokal, 
    // lalu gambar dari data API yang baru dimuat, baru kemudian dari state form.
    const displayImageUrl = localImagePreview || existingArticle?.imageUrl || formData.imageUrl || null;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                 <h2 className="text-2xl sm:text-3xl font-bold text-lime-400 font-serif">{isEditMode ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h2>
                <Link to="/jurnalis/articles" className="text-lime-300 hover:text-lime-100 flex items-center gap-2"><ArrowLeft size={16} /> Kembali</Link>
            </div>

            {existingArticle?.feedback && ['NEEDS_REVISION', 'REJECTED'].includes(existingArticle.status) && (
                <div className="bg-yellow-500/20 border-l-4 border-yellow-400 text-yellow-300 p-4 mb-6 rounded-r-lg">
                    <div className="flex items-start"><AlertTriangle className="h-5 w-5 mr-3 mt-1"/><div><p className="font-bold">Feedback dari Admin:</p><p className="text-sm italic">"{existingArticle.feedback}"</p></div></div>
                </div>
            )}

            <div className="bg-[#004A49]/60 border-2 border-lime-400 p-6 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Judul (Indonesia)" name="title.id" value={formData.title.id} onChange={handleInputChange} placeholder="Masukkan judul utama" />
                    <InputField label="Title (English)" name="title.en" value={formData.title.en} onChange={handleInputChange} placeholder="Enter the title in English" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Kategori" name="category" value={formData.category} onChange={handleInputChange} placeholder="Cth: Perawatan, Tips & Trik" />
                    <InputField label="Jenis Tanaman" name="plantType" value={formData.plantType} onChange={handleInputChange} placeholder="Cth: Monstera, Aglaonema" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-lime-300 mb-1">Gambar Utama</label>
                    <div className="mt-1 flex flex-wrap items-center gap-4">
                        <div className="w-32 sm:w-40 h-24 bg-black/20 rounded-md flex items-center justify-center overflow-hidden">
                           {displayImageUrl ? <img src={displayImageUrl} alt="Pratinjau" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">Pratinjau</span>}
                        </div>
                        <label htmlFor="file-upload" className={`cursor-pointer bg-white/10 text-lime-300 font-semibold py-2 px-4 rounded-md hover:bg-white/20 border border-lime-400/50 flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                           <Upload size={16}/> <span>Unggah File</span>
                        </label>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" disabled={isUploading}/>
                    </div>
                    {isUploading && (
                        <div className="mt-3 w-full max-w-sm">
                             <div className="w-full bg-gray-600 rounded-full h-2.5">
                                <div 
                                    className="bg-lime-400 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-right text-lime-200 mt-1">{uploadProgress}%</p>
                        </div>
                    )}
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextareaField label="Ringkasan (Indonesia)" name="excerpt.id" value={formData.excerpt.id} onChange={handleInputChange} placeholder="Tulis ringkasan singkat..." />
                    <TextareaField label="Excerpt (English)" name="excerpt.en" value={formData.excerpt.en} onChange={handleInputChange} placeholder="Write a brief excerpt..." />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <MarkdownEditorField label="Konten (Indonesia)" name="content.id" value={formData.content.id} onChange={handleInputChange} placeholder="Tulis konten utama artikel di sini..." />
                     <MarkdownEditorField label="Content (English)" name="content.en" value={formData.content.en} onChange={handleInputChange} placeholder="Write the main article content here..." />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-lime-400/30">
                     <button onClick={() => handleSubmit('save')} disabled={isLoading || isUploading} className="w-full sm:w-auto bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-60 flex items-center justify-center gap-2">
                        {isLoading || isUploading ? <Loader2 className="animate-spin" size={20}/> : <Save size={16} />} 
                        {isUploading ? `Mengunggah...` : 'Simpan Draf'}
                    </button>
                    {canSubmit && (
                         <button onClick={() => handleSubmit('submit')} disabled={isLoading || isUploading} className="w-full sm:w-auto bg-lime-500 text-lime-900 font-bold py-2 px-6 rounded-lg hover:bg-lime-600 disabled:bg-lime-700 disabled:opacity-60 flex items-center justify-center gap-2">
                             {isLoading || isUploading ? <Loader2 className="animate-spin" size={20}/> : <Send size={16} />} 
                             {isUploading ? `Mengunggah...` : 'Kirim untuk Tinjauan'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

