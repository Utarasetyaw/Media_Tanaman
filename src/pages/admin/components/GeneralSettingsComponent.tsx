import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../../../hooks/useSiteSettings';
import { Trash2, PlusCircle, UploadCloud } from 'lucide-react';
import type { BannerImage, FaqItem, CompanyValue, SiteSettings } from '../../../types/settings';

// Tipe Data Lokal
type ArrayField = 'faqs' | 'companyValues';
type FaqSubField = keyof FaqItem;
// REVISI: Tentukan field secara eksplisit agar sesuai dengan penggunaan di komponen dan memperbaiki error TipeScript
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

const TextareaField: React.FC<{ label: string; name: string; value: string; onChange: React.ChangeEventHandler<HTMLTextAreaElement>; placeholder?: string, rows?: number }> = 
({ label, name, value, onChange, placeholder, rows=3 }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <textarea
            id={name} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} rows={rows}
            className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-lime-400 transition-colors"
        />
    </div>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className="space-y-4">
        <h4 className='text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2'>{title}</h4>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
            {children}
        </div>
    </div>
);

export const GeneralSettingsComponent: React.FC = () => {
    const { settings, isLoading, isSaving, updateSettings } = useSiteSettings();
    
    const [formData, setFormData] = useState<Partial<SiteSettings>>({});
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [newBannerFile, setNewBannerFile] = useState<File | null>(null);

    useEffect(() => {
        if (settings) {
            setFormData({
                ...settings,
                contactInfo: settings.contactInfo || {},
                businessDescription: settings.businessDescription || { id: '', en: '' },
                faqs: settings.faqs || [],
                companyValues: settings.companyValues || [],
                privacyPolicy: settings.privacyPolicy || { id: '', en: '' },
                bannerTagline: settings.bannerTagline || { id: '', en: '' },
                bannerImages: settings.bannerImages || [],
                seo: settings.seo || {},
            });
        }
    }, [settings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNestedChange = (field: keyof SiteSettings, subField: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...(prev[field] as object), [subField]: value },
        }));
    };

    const handleDeeplyNestedChange = (field: keyof SiteSettings, subField: string, deepField: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: {
                ...(prev[field] as object),
                [subField]: { ...((prev[field] as any)?.[subField] || {}), [deepField]: value }
            }
        }));
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
    
    const handleSave = () => {
        updateSettings({
            settingsData: formData,
            logoFile,
            faviconFile
        }, {
            onSuccess: () => {
                setLogoFile(null);
                setFaviconFile(null);
                const logoInput = document.getElementById('logo-input') as HTMLInputElement;
                const faviconInput = document.getElementById('favicon-input') as HTMLInputElement;
                if(logoInput) logoInput.value = "";
                if(faviconInput) faviconInput.value = "";
            }
        });
    };

    const handleAddBanner = () => {
        if (!newBannerFile) return;
        updateSettings({
            settingsData: formData,
            newBannerFile: newBannerFile,
        }, {
            onSuccess: () => {
                setNewBannerFile(null);
                const fileInput = document.getElementById('new-banner-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            }
        });
    };

    const handleRemoveBanner = (indexToRemove: number) => {
        if (!window.confirm('Yakin ingin hapus banner ini?')) return;
        const newBannerList = (formData.bannerImages || []).filter((_, i) => i !== indexToRemove);
        const updatedData = { ...formData, bannerImages: newBannerList };
        setFormData(updatedData);
        updateSettings({ settingsData: updatedData });
    };
    
    if (isLoading) {
        return <div className='text-center text-gray-300 p-8'>Memuat pengaturan...</div>;
    }

    return (
        <div className="bg-[#0b5351]/30 p-4 sm:p-6 rounded-lg border border-lime-400/50 space-y-8">
            <h3 className="text-xl font-bold text-gray-200">Pengaturan Umum Situs</h3>
            <SectionCard title="Informasi Dasar & Kontak">
                <InputField label="Nama Situs" name="name" value={formData.name || ''} onChange={handleInputChange} />
                <InputField label="Email Kontak" name="email" value={formData.contactInfo?.email || ''} onChange={(e) => handleNestedChange('contactInfo', 'email', e.target.value)} />
                <InputField label="Telepon" name="phone" value={formData.contactInfo?.phone || ''} onChange={(e) => handleNestedChange('contactInfo', 'phone', e.target.value)} />
                <div className="md:col-span-2">
                  <TextareaField label="Alamat" name="address" value={formData.contactInfo?.address || ''} onChange={(e) => handleNestedChange('contactInfo', 'address', e.target.value)} />
                </div>
                 {/* REVISI: Grup media sosial dibuat dalam satu baris untuk layout yang lebih rapi */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="URL Instagram" name="instagram" placeholder="https://instagram.com/akunanda" value={formData.contactInfo?.socialMedia?.instagram || ''} onChange={(e) => handleDeeplyNestedChange('contactInfo', 'socialMedia', 'instagram', e.target.value)} />
                    <InputField label="URL Facebook" name="facebook" placeholder="https://facebook.com/akunanda" value={formData.contactInfo?.socialMedia?.facebook || ''} onChange={(e) => handleDeeplyNestedChange('contactInfo', 'socialMedia', 'facebook', e.target.value)} />
                    <InputField label="URL TikTok" name="tiktok" placeholder="https://tiktok.com/@akunanda" value={formData.contactInfo?.socialMedia?.tiktok || ''} onChange={(e) => handleDeeplyNestedChange('contactInfo', 'socialMedia', 'tiktok', e.target.value)} />
                </div>
            </SectionCard>
            
            <SectionCard title="Deskripsi Perusahaan" className='md:grid-cols-1'>
                <TextareaField label="Deskripsi (Indonesia)" name="id" value={formData.businessDescription?.id || ''} onChange={(e) => handleNestedChange('businessDescription', 'id', e.target.value)} />
                <TextareaField label="Deskripsi (Bahasa Inggris)" name="en" value={formData.businessDescription?.en || ''} onChange={(e) => handleNestedChange('businessDescription', 'en', e.target.value)} />
            </SectionCard>

            <SectionCard title="Aset Visual">
                <div className='flex flex-col gap-2'>
                    <label className="block text-sm font-medium text-gray-300">Logo</label>
                    {formData.logoUrl && <img src={formData.logoUrl} alt="logo" className="h-16 w-16 object-contain mb-2 bg-white/10 p-1 rounded" />}
                    <input id="logo-input" type="file" accept='image/*' onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-200/20 file:text-lime-300 hover:file:bg-lime-200/30 cursor-pointer"/>
                </div>
                 <div className='flex flex-col gap-2'>
                    <label className="block text-sm font-medium text-gray-300">Favicon</label>
                    {formData.faviconUrl && <img src={formData.faviconUrl} alt="favicon" className="h-16 w-16 object-contain mb-2 bg-white/10 p-1 rounded" />}
                    <input id="favicon-input" type="file" accept='image/*' onChange={(e) => setFaviconFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-200/20 file:text-lime-300 hover:file:bg-lime-200/30 cursor-pointer"/>
                </div>
            </SectionCard>

            <div className="space-y-4">
                 <h4 className='text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2'>Banner Halaman Utama</h4>
                 <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <InputField label="Tagline Banner (ID)" name="bannerTagline_id" value={formData.bannerTagline?.id || ''} onChange={(e) => handleNestedChange('bannerTagline', 'id', e.target.value)} />
                    <InputField label="Tagline Banner (EN)" name="bannerTagline_en" value={formData.bannerTagline?.en || ''} onChange={(e) => handleNestedChange('bannerTagline', 'en', e.target.value)} />
                 </div>
                 <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                    {formData.bannerImages?.map((banner: BannerImage, index: number) => (
                        <div key={banner.id || index} className="relative group">
                            <img src={banner.imageUrl} alt={`banner-${index}`} className="w-full h-24 object-cover rounded-md bg-white/10" />
                            <button onClick={() => handleRemoveBanner(index)} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                        </div>
                    ))}
                 </div>
                 <div className="p-4 border-2 border-dashed border-lime-400/30 rounded-lg space-y-4">
                    <h5 className="font-semibold text-gray-200">Tambah Gambar Banner Baru</h5>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Pilih File Gambar</label>
                        <input id="new-banner-input" type="file" accept='image/*' onChange={(e) => setNewBannerFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-200/20 file:text-lime-300 hover:file:bg-lime-200/30 cursor-pointer"/>
                    </div>
                    <button onClick={handleAddBanner} disabled={isSaving || !newBannerFile} className="bg-lime-400/80 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-lime-500 transition-colors text-sm flex items-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed"><UploadCloud size={16}/> Upload & Tambah Gambar</button>
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
                        <InputField label={`Pertanyaan ${index + 1} (ID)`} name={`faq_q_id_${index}`} value={faq.question?.id || ''} onChange={(e) => handleArrayItemChange('faqs', index, 'question', 'id', e.target.value)}/>
                        <InputField label={`Pertanyaan ${index + 1} (EN)`} name={`faq_q_en_${index}`} value={faq.question?.en || ''} onChange={(e) => handleArrayItemChange('faqs', index, 'question', 'en', e.target.value)}/>
                        <TextareaField label={`Jawaban ${index + 1} (ID)`} name={`faq_a_id_${index}`} value={faq.answer?.id || ''} onChange={(e) => handleArrayItemChange('faqs', index, 'answer', 'id', e.target.value)}/>
                        <TextareaField label={`Jawaban ${index + 1} (EN)`} name={`faq_a_en_${index}`} value={faq.answer?.en || ''} onChange={(e) => handleArrayItemChange('faqs', index, 'answer', 'en', e.target.value)}/>
                    </div>
                ))}
                 <button onClick={() => addArrayItem('faqs', { question: { id: '', en: '' }, answer: { id: '', en: '' } })} className="mt-2 flex items-center gap-2 text-sm font-semibold text-lime-300 hover:text-lime-200">
                    <PlusCircle size={18}/> Tambah FAQ
                </button>
            </div>
            
            <SectionCard title="Kebijakan Privasi" className='md:grid-cols-1'>
                <TextareaField label="Isi Kebijakan Privasi (Indonesia)" name="privacyPolicy_id" value={formData.privacyPolicy?.id || ''} onChange={(e) => handleNestedChange('privacyPolicy', 'id', e.target.value)} rows={8} />
                <TextareaField label="Isi Kebijakan Privasi (Bahasa Inggris)" name="privacyPolicy_en" value={formData.privacyPolicy?.en || ''} onChange={(e) => handleNestedChange('privacyPolicy', 'en', e.target.value)} rows={8} />
            </SectionCard>

            <div className='pt-6 mt-6 border-t border-lime-400/30'>
                <button onClick={handleSave} disabled={isSaving} className="w-full bg-lime-400 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                    {isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                </button>
            </div>
        </div>
    );
};

