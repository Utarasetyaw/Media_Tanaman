import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { useSiteSettings } from '../../../hooks/admin/useSiteSettings';
import { Trash2, PlusCircle, UploadCloud, XCircle, FileImage, Loader2 } from 'lucide-react';
import type { BannerImage, FaqItem, CompanyValue, SiteSettings } from '../../../types/admin/adminsettings';
import { toast } from 'react-hot-toast';

// Pindahkan definisi tipe ke luar komponen untuk praktik terbaik
type ArrayField = 'faqs' | 'companyValues';
type FaqSubField = 'q' | 'a';
type CompanyValueSubField = 'title' | 'description';

// Komponen UI Kecil (Reusable & Themed)
const InputField: React.FC<{ label: string; name: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; placeholder?: string, type?: string }> = 
({ label, name, value, onChange, placeholder, type='text' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            id={name} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} type={type}
            className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-lime-400 transition-colors"
        />
    </div>
);

const TextareaField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    rows?: number;
    maxLength?: number;
    className?: string;
}> = ({ label, name, value, onChange, placeholder, rows = 3, maxLength, className }) => {
    const wordCount = value?.split(/\s+/).filter(Boolean).length || 0;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; 
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [value]);

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="flex justify-between items-center mb-1">
                <label htmlFor={name} className="block text-sm font-medium text-gray-300">{label}</label>
                {maxLength && (
                    <span className={`text-xs ${wordCount > maxLength ? 'text-red-400' : 'text-gray-400'}`}>
                        {wordCount}/{maxLength} kata
                    </span>
                )}
            </div>
            <textarea
                ref={textareaRef}
                id={name}
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-lime-400 transition-colors resize-none overflow-y-hidden flex-grow"
            />
        </div>
    );
};


const SectionCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className="space-y-4">
        <h4 className='text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2'>{title}</h4>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
            {children}
        </div>
    </div>
);

// Gunakan forwardRef untuk meneruskan ref ke input file
const ImageUploadField = forwardRef<HTMLInputElement, {
    label: string;
    description: string;
    currentImageUrl: string | null | undefined;
    onFileSelect: (file: File | null) => void;
    onRemoveImage: () => void;
    isUploading?: boolean;
    variant?: 'square' | 'banner';
}>(({ label, description, currentImageUrl, onFileSelect, onRemoveImage, isUploading, variant = 'square' }, ref) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
        }
        onFileSelect(file);
    };

    const handleRemovePreview = () => {
        setPreviewUrl(null);
        onFileSelect(null);
        if (typeof ref === 'object' && ref?.current) {
            ref.current.value = "";
        }
    };
    
    const displayUrl = previewUrl || currentImageUrl;

    const isBanner = variant === 'banner';
    const containerClasses = isBanner ? "w-full" : "w-20 h-20 shrink-0";
    const imageClasses = isBanner ? "w-full object-cover rounded-lg bg-white/10 aspect-[3/1]" : "h-20 w-20 object-contain bg-white/10 p-1 rounded-lg";
    const placeholderClasses = isBanner ? "w-full bg-gray-900/50 rounded-lg flex items-center justify-center aspect-[3/1]" : "w-20 h-20 bg-gray-900/50 rounded-lg flex items-center justify-center";
    const layoutClasses = isBanner ? "flex flex-col gap-4" : "flex items-center gap-4";

    return (
        <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-300">{label}</label>
            <p className="text-xs text-gray-400 -mt-1 mb-2">{description}</p>
            <div className={layoutClasses}>
                <div className={`relative group ${containerClasses}`}>
                    {isUploading ? (
                        <div className={placeholderClasses}><Loader2 className="animate-spin text-lime-400" /></div>
                    ) : displayUrl ? (
                        <div className="relative w-full h-full group">
                            <img src={displayUrl} alt="preview" className={imageClasses} />
                            <button
                                onClick={previewUrl ? handleRemovePreview : onRemoveImage}
                                className="absolute -top-2 -right-2 bg-red-600/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Hapus gambar"
                            >
                                <XCircle size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className={placeholderClasses + " text-gray-500"}><FileImage size={isBanner ? 32 : 24} /></div>
                    )}
                </div>
                <div className='w-full'>
                    <input ref={ref} type="file" accept='image/*' onChange={handleFileChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-200/20 file:text-lime-300 hover:file:bg-lime-200/30 cursor-pointer"/>
                </div>
            </div>
        </div>
    );
});


const ValidationError: React.FC<{ message: string }> = ({ message }) => (
    <p className="text-red-400 text-xs mt-1">{message}</p>
);

export const GeneralSettingsComponent: React.FC = () => {
    const { 
        settings, isLoadingSettings, isSavingSettings, updateSettings, 
        addBanner, isAddingBanner, deleteBanner 
    } = useSiteSettings();
    
    const [formData, setFormData] = useState<Partial<SiteSettings>>({});
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [newBannerFile, setNewBannerFile] = useState<File | null>(null);

    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
    
    const bannerFileInputRef = useRef<HTMLInputElement>(null);
    const logoFileInputRef = useRef<HTMLInputElement>(null);
    const faviconFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (settings) {
            const ensureArray = (data: any): any[] => Array.isArray(data) ? data : [];
            setFormData({
                ...settings,
                contactInfo: settings.contactInfo || {},
                shortDescription: settings.shortDescription || { id: '', en: '' },
                businessDescription: settings.businessDescription || { id: '', en: '' },
                faqs: ensureArray(settings.faqs),
                companyValues: ensureArray(settings.companyValues),
                privacyPolicy: settings.privacyPolicy || { id: '', en: '' },
                bannerTagline: settings.bannerTagline || { id: '', en: '' },
                bannerImages: ensureArray(settings.bannerImages),
            });
        }
    }, [settings]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNestedChange = (field: keyof SiteSettings, subField: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: { ...(prev[field] as object), [subField]: value } }));
    };

    const handleDeeplyNestedChange = (field: keyof SiteSettings, subField: string, deepField: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: { ...(prev[field] as object), [subField]: { ...((prev[field] as any)?.[subField] || {}), [deepField]: value } } }));
    };
    
    const handleArrayItemChange = (arrayName: ArrayField, index: number, fieldName: FaqSubField | CompanyValueSubField, lang: 'id' | 'en', value: string) => {
        setFormData(prev => {
            const newArray = JSON.parse(JSON.stringify(prev[arrayName] || []));
            if (!newArray[index]) return prev;
            if (!newArray[index][fieldName]) newArray[index][fieldName] = { id: '', en: '' };
            (newArray[index][fieldName] as any)[lang] = value;
            return { ...prev, [arrayName]: newArray };
        });
    };

    const addArrayItem = (arrayName: ArrayField, newItem: object) => {
        setFormData(prev => ({ ...prev, [arrayName]: [...(prev[arrayName] || []), newItem] }));
    };
    
    const removeArrayItem = (arrayName: ArrayField | 'bannerImages', index: number) => {
        const newArray = (formData[arrayName] || []).filter((_: any, i: number) => i !== index);
        setFormData(prev => ({ ...prev, [arrayName]: newArray }));
    };
    
    const handleRemoveImage = (fieldName: 'logoUrl' | 'faviconUrl') => {
        toast((t: any) => (
            <div className="flex flex-col gap-3 p-2">
                <p className="font-semibold text-white">{`Yakin ingin menghapus ${fieldName === 'logoUrl' ? 'Logo' : 'Favicon'}?`}</p>
                <div className="flex gap-2">
                    <button
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-sm"
                        onClick={() => {
                            setFormData(prev => ({ ...prev, [fieldName]: null }));
                            if (fieldName === 'logoUrl') setLogoFile(null);
                            if (fieldName === 'faviconUrl') setFaviconFile(null);
                            toast.dismiss(t.id);
                            toast.success(`${fieldName === 'logoUrl' ? 'Logo' : 'Favicon'} akan dihapus setelah disimpan.`);
                        }}
                    >
                        Ya, Hapus
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
    
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string | null } = {};

        if (!formData.name?.trim()) newErrors.name = 'Nama Situs wajib diisi.';
        if (!formData.businessDescription?.id?.trim()) newErrors.businessDescription = 'Deskripsi (Indonesia) wajib diisi.';
        if (!formData.logoUrl && !logoFile) newErrors.logo = 'Logo wajib diunggah.';
        if (!formData.faviconUrl && !faviconFile) newErrors.favicon = 'Favicon wajib diunggah.';
        if ((!formData.bannerImages || formData.bannerImages.length === 0) && !newBannerFile) newErrors.banner = 'Minimal harus ada satu gambar banner.';

        setErrors(newErrors);
        
        if (Object.keys(newErrors).length > 0) {
            const firstError = Object.values(newErrors)[0];
            if (firstError) toast.error(firstError);
            return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!validateForm()) return;
        
        if (logoFile) setIsUploadingLogo(true);
        if (faviconFile) setIsUploadingFavicon(true);

        updateSettings({ settingsData: formData, logoFile, faviconFile }, {
            onSuccess: () => {
                setLogoFile(null);
                setFaviconFile(null);
                if (logoFileInputRef.current) logoFileInputRef.current.value = "";
                if (faviconFileInputRef.current) faviconFileInputRef.current.value = "";
                setErrors({});
            },
            onSettled: () => {
                setIsUploadingLogo(false);
                setIsUploadingFavicon(false);
            }
        });
    };

    const handleAddBanner = () => {
        if (!newBannerFile) {
            toast.error("Pilih file gambar banner terlebih dahulu.");
            return;
        }
        addBanner(newBannerFile, {
            onSuccess: () => {
                setNewBannerFile(null);
                setErrors(prev => ({...prev, banner: null}));
                if (bannerFileInputRef.current) {
                    bannerFileInputRef.current.value = "";
                }
            }
        });
    };

    const handleRemoveBanner = (bannerId: number) => {
        toast((t: any) => (
            <div className="flex flex-col gap-3 p-2">
                <p className="font-semibold text-white">Yakin ingin menghapus banner ini?</p>
                <div className="flex gap-2">
                    <button
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-sm"
                        onClick={() => {
                            deleteBanner(bannerId);
                            toast.dismiss(t.id);
                        }}
                    >
                        Ya, Hapus
                    </button>
                    <button
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md text-sm"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Batal
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    };
    
    if (isLoadingSettings) return <div className='text-center text-gray-300 p-8'>Memuat pengaturan...</div>;

    return (
        <div className="bg-[#0b5351]/30 p-4 sm:p-6 rounded-lg border border-lime-400/50 space-y-8">
            <h3 className="text-xl font-bold text-gray-200">Pengaturan Umum Situs</h3>
            <SectionCard title="Informasi Dasar & Kontak">
                <div>
                    <InputField label="Nama Situs *" name="name" value={formData.name || ''} onChange={handleInputChange} />
                    {errors.name && <ValidationError message={errors.name} />}
                </div>
                <div className="md:col-span-2">
                    <TextareaField 
                        label="Short Description (Indonesia)"
                        name="short_description_id"
                        value={formData.shortDescription?.id || ''}
                        onChange={(e) => handleNestedChange('shortDescription', 'id', e.target.value)}
                        maxLength={30}
                        rows={2}
                    />
                </div>
                 <div className="md:col-span-2">
                    <TextareaField 
                        label="Short Description (English)"
                        name="short_description_en"
                        value={formData.shortDescription?.en || ''}
                        onChange={(e) => handleNestedChange('shortDescription', 'en', e.target.value)}
                        maxLength={30}
                        rows={2}
                    />
                </div>
                <InputField label="Email Kontak" name="email" value={formData.contactInfo?.email || ''} onChange={(e) => handleNestedChange('contactInfo', 'email', e.target.value)} />
                <InputField label="Telepon" name="phone" value={formData.contactInfo?.phone || ''} onChange={(e) => handleNestedChange('contactInfo', 'phone', e.target.value)} />
                <div className="md:col-span-2">
                  <TextareaField label="Alamat" name="address" value={formData.contactInfo?.address || ''} onChange={(e) => handleNestedChange('contactInfo', 'address', e.target.value)} />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="URL Instagram" name="instagram" placeholder="https://instagram.com/akunanda" value={formData.contactInfo?.socialMedia?.instagram || ''} onChange={(e) => handleDeeplyNestedChange('contactInfo', 'socialMedia', 'instagram', e.target.value)} />
                    <InputField label="URL Facebook" name="facebook" placeholder="https://facebook.com/akunanda" value={formData.contactInfo?.socialMedia?.facebook || ''} onChange={(e) => handleDeeplyNestedChange('contactInfo', 'socialMedia', 'facebook', e.target.value)} />
                    <InputField label="URL TikTok" name="tiktok" placeholder="https://tiktok.com/@akunanda" value={formData.contactInfo?.socialMedia?.tiktok || ''} onChange={(e) => handleDeeplyNestedChange('contactInfo', 'socialMedia', 'tiktok', e.target.value)} />
                </div>
            </SectionCard>
            
            <div className="space-y-4">
                <h4 className='text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2'>Deskripsi Perusahaan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:grid-flow-col md:auto-cols-fr">
                    <div>
                        <TextareaField 
                            label="Deskripsi (Indonesia) *" 
                            name="id" 
                            value={formData.businessDescription?.id || ''} 
                            onChange={(e) => handleNestedChange('businessDescription', 'id', e.target.value)} 
                            maxLength={150} 
                        />
                        {errors.businessDescription && <ValidationError message={errors.businessDescription} />}
                    </div>
                    <TextareaField 
                        label="Deskripsi (Bahasa Inggris)" 
                        name="en" 
                        value={formData.businessDescription?.en || ''} 
                        onChange={(e) => handleNestedChange('businessDescription', 'en', e.target.value)} 
                        maxLength={150} 
                    />
                </div>
            </div>

            <SectionCard title="Aset Visual">
                <div>
                    <ImageUploadField
                        ref={logoFileInputRef}
                        label="Logo *"
                        description="Rasio 1:1 (kotak). Ukuran ideal 512x512 piksel."
                        currentImageUrl={formData.logoUrl}
                        onFileSelect={setLogoFile}
                        onRemoveImage={() => handleRemoveImage('logoUrl')}
                        isUploading={isUploadingLogo || (isSavingSettings && logoFile != null)}
                    />
                    {errors.logo && <ValidationError message={errors.logo} />}
                </div>
                 <div>
                    <ImageUploadField
                        ref={faviconFileInputRef}
                        label="Favicon *"
                        description="Gunakan format .ico atau .png transparan. Ukuran 48x48 piksel."
                        currentImageUrl={formData.faviconUrl}
                        onFileSelect={setFaviconFile}
                        onRemoveImage={() => handleRemoveImage('faviconUrl')}
                        isUploading={isUploadingFavicon || (isSavingSettings && faviconFile != null)}
                    />
                    {errors.favicon && <ValidationError message={errors.favicon} />}
                </div>
            </SectionCard>

            <div className="space-y-4">
                 <h4 className='text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2'>Banner Halaman Utama *</h4>
                 {errors.banner && <ValidationError message={errors.banner} />}
                 <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <InputField label="Tagline Banner (ID)" name="bannerTagline_id" value={formData.bannerTagline?.id || ''} onChange={(e) => handleNestedChange('bannerTagline', 'id', e.target.value)} />
                    <InputField label="Tagline Banner (EN)" name="bannerTagline_en" value={formData.bannerTagline?.en || ''} onChange={(e) => handleNestedChange('bannerTagline', 'en', e.target.value)} />
                 </div>
                 <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                    {formData.bannerImages?.map((banner: BannerImage, index: number) => (
                        <div key={banner.id || index} className="relative group">
                            <img src={banner.imageUrl} alt={`banner-${index}`} className="w-full h-24 object-cover rounded-md bg-white/10" />
                            <button onClick={() => typeof banner.id === 'number' && handleRemoveBanner(banner.id)} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                        </div>
                    ))}
                 </div>
                 <div className="p-4 border-2 border-dashed border-lime-400/30 rounded-lg space-y-4">
                    <h5 className="font-semibold text-gray-200">Tambah Gambar Banner Baru</h5>
                    <ImageUploadField 
                        ref={bannerFileInputRef}
                        variant="banner"
                        label="Pilih File Gambar"
                        description="Rasio 3:1. Ukuran ideal 1920x640 piksel. Min 1500x500 piksel."
                        currentImageUrl={null}
                        onFileSelect={setNewBannerFile}
                        onRemoveImage={() => setNewBannerFile(null)}
                    />
                    <button onClick={handleAddBanner} disabled={isAddingBanner || !newBannerFile} className="bg-lime-400/80 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-lime-500 transition-colors text-sm flex items-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isAddingBanner ? <><Loader2 size={16} className="animate-spin" /> Mengunggah...</> : <><UploadCloud size={16}/> Upload & Tambah Gambar</>}
                    </button>
                 </div>
            </div>
            <div className="space-y-4">
                 <h4 className='text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2'>Nilai Perusahaan</h4>
                {formData.companyValues?.map((value: CompanyValue, index: number) => (
                    <div key={index} className="p-4 border border-lime-400/20 rounded-lg space-y-2 relative bg-gray-900/20">
                        <button onClick={() => removeArrayItem('companyValues', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><Trash2 size={18}/></button>
                        <InputField label={`Judul Nilai ${index + 1} (ID)`} name={`value_t_id_${index}`} value={value.title?.id || ''} onChange={(e) => handleArrayItemChange('companyValues', index, 'title', 'id', e.target.value)}/>
                        <InputField label={`Judul Nilai ${index + 1} (EN)`} name={`value_t_en_${index}`} value={value.title?.en || ''} onChange={(e) => handleArrayItemChange('companyValues', index, 'title', 'en', e.target.value)}/>
                        <TextareaField label={`Deskripsi ${index + 1} (ID)`} name={`value_d_id_${index}`} value={(value as any).description?.id || ''} onChange={(e) => handleArrayItemChange('companyValues', index, 'description', 'id', e.target.value)}/>
                        <TextareaField label={`Deskripsi ${index + 1} (EN)`} name={`value_d_en_${index}`} value={(value as any).description?.en || ''} onChange={(e) => handleArrayItemChange('companyValues', index, 'description', 'en', e.target.value)}/>
                    </div>
                ))}
                 <button onClick={() => addArrayItem('companyValues', { title: { id: '', en: '' }, description: { id: '', en: '' } })} className="mt-2 flex items-center gap-2 text-sm font-semibold text-lime-300 hover:text-lime-200">
                    <PlusCircle size={18}/> Tambah Nilai Perusahaan
                </button>
            </div>
            <div className="space-y-4">
                 <h4 className='text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2'>Tanya Jawab (FAQ)</h4>
                {formData.faqs?.map((faq: FaqItem, index: number) => (
                    <div key={index} className="p-4 border border-lime-400/20 rounded-lg space-y-2 relative bg-gray-900/20">
                        <button onClick={() => removeArrayItem('faqs', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><Trash2 size={18}/></button>
                        <InputField label={`Pertanyaan ${index + 1} (ID)`} name={`faq_q_id_${index}`} value={faq.q?.id || ''} onChange={(e) => handleArrayItemChange('faqs', index, 'q', 'id', e.target.value)}/>
                        <InputField label={`Pertanyaan ${index + 1} (EN)`} name={`faq_q_en_${index}`} value={faq.q?.en || ''} onChange={(e) => handleArrayItemChange('faqs', index, 'q', 'en', e.target.value)}/>
                        <TextareaField label={`Jawaban ${index + 1} (ID)`} name={`faq_a_id_${index}`} value={faq.a?.id || ''} onChange={(e) => handleArrayItemChange('faqs', index, 'a', 'id', e.target.value)}/>
                        <TextareaField label={`Jawaban ${index + 1} (EN)`} name={`faq_a_en_${index}`} value={faq.a?.en || ''} onChange={(e) => handleArrayItemChange('faqs', index, 'a', 'en', e.target.value)}/>
                    </div>
                ))}
                 <button onClick={() => addArrayItem('faqs', { q: { id: '', en: '' }, a: { id: '', en: '' } })} className="mt-2 flex items-center gap-2 text-sm font-semibold text-lime-300 hover:text-lime-200">
                    <PlusCircle size={18}/> Tambah FAQ
                </button>
            </div>

            <SectionCard title="Kebijakan Privasi" className='md:grid-cols-1'>
                <TextareaField label="Isi Kebijakan Privasi (Indonesia)" name="privacyPolicy_id" value={formData.privacyPolicy?.id || ''} onChange={(e) => handleNestedChange('privacyPolicy', 'id', e.target.value)} rows={8} maxLength={300} />
                <TextareaField label="Isi Kebijakan Privasi (Bahasa Inggris)" name="privacyPolicy_en" value={formData.privacyPolicy?.en || ''} onChange={(e) => handleNestedChange('privacyPolicy', 'en', e.target.value)} rows={8} maxLength={300} />
            </SectionCard>

            <div className='pt-6 mt-6 border-t border-lime-400/30'>
                <button onClick={handleSave} disabled={isSavingSettings || isUploadingLogo || isUploadingFavicon} className="w-full bg-lime-400 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isSavingSettings ? <><Loader2 className="animate-spin"/> Menyimpan...</> : 'Simpan Semua Perubahan'}
                </button>
            </div>
        </div>
    );
};