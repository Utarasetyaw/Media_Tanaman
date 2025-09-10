import React, { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings, uploadFile } from '../../../services/apiAdmin';
import { Trash2, PlusCircle, UploadCloud } from 'lucide-react';

// --- Tipe Data ---
interface Faq {
  question: { id: string; en: string };
  answer: { id: string; en: string };
}
interface BannerImage {
  id?: number;
  imageUrl: string;
}

// --- Komponen UI Kecil (Reusable & Themed) ---
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

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-4">
        <h4 className='text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2'>{title}</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {children}
        </div>
    </div>
);


export const GeneralSettingsComponent: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [settings, setSettings] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [newBannerFile, setNewBannerFile] = useState<File | null>(null);

    // --- DATA FETCHING ---
    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const data = await getSiteSettings();
            setSettings({
                ...data,
                contactInfo: data.contactInfo || {},
                businessDescription: data.businessDescription || { id: '', en: '' },
                faqs: data.faqs || [],
                bannerTagline: data.bannerTagline || { id: '', en: '' },
                bannerImages: data.bannerImages || [],
                seo: data.seo || {},
            });
        } catch (error) { console.error("Failed to fetch settings:", error); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // --- HANDLERS ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleJsonChange = (fieldName: string, key: string, value: string) => {
        setSettings((prev: any) => ({ ...prev, [fieldName]: { ...prev[fieldName], [key]: value } }));
    };
    
    const handleArrayItemChange = (arrayName: string, index: number, fieldName: string, lang: 'id' | 'en', value: string) => {
        const newArray = [...settings[arrayName]];
        newArray[index][fieldName] = { ...newArray[index][fieldName], [lang]: value };
        setSettings((prev: any) => ({ ...prev, [arrayName]: newArray }));
    };

    const addArrayItem = (arrayName: string, newItem: object) => {
        setSettings((prev: any) => ({ ...prev, [arrayName]: [...prev[arrayName], newItem] }));
    };

    const removeArrayItem = (arrayName: string, index: number) => {
        const newArray = settings[arrayName].filter((_: any, i: number) => i !== index);
        setSettings((prev: any) => ({ ...prev, [arrayName]: newArray }));
    };

    const handleAddBanner = async () => {
        if (!newBannerFile) {
            alert('Pilih file gambar untuk banner terlebih dahulu.');
            return;
        }
        setIsSaving(true);
        try {
            const res = await uploadFile('banners', newBannerFile);
            const newBannerList: BannerImage[] = [...settings.bannerImages, { imageUrl: res.imageUrl }];
            const updatedData = await updateSiteSettings({ ...settings, bannerImages: newBannerList });
            setSettings(updatedData);
            setNewBannerFile(null);
            const fileInput = document.getElementById('new-banner-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (error) {
            alert('Gagal menambahkan banner.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveBanner = async (indexToRemove: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus banner ini?')) return;
        setIsSaving(true);
        try {
            const newBannerList = settings.bannerImages.filter((_: any, i: number) => i !== indexToRemove);
            const updatedData = await updateSiteSettings({ ...settings, bannerImages: newBannerList });
            setSettings(updatedData);
        } catch(error) {
            alert('Gagal menghapus banner.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        let updatedSettings = JSON.parse(JSON.stringify(settings));

        try {
            if (logoFile) {
                const res = await uploadFile('settings', logoFile);
                updatedSettings.logoUrl = res.imageUrl;
            }
            if (faviconFile) {
                const res = await uploadFile('settings', faviconFile);
                updatedSettings.faviconUrl = res.imageUrl;
            }
            
            const savedSettings = await updateSiteSettings(updatedSettings);
            setSettings(savedSettings);
            alert('Pengaturan berhasil disimpan!');
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert('Gagal menyimpan pengaturan.');
        } finally {
            setIsSaving(false);
            setLogoFile(null);
            setFaviconFile(null);
        }
    };
    
    if (isLoading) {
        return <div className='text-center text-gray-300 p-8'>Memuat pengaturan...</div>;
    }

    return (
        <div className="bg-[#0b5351]/30 p-6 rounded-lg border border-lime-400/50 space-y-8">
            <h3 className="text-xl font-bold text-gray-200">Pengaturan Umum Situs</h3>

            <SectionCard title="Informasi Dasar">
                <InputField label="Nama Situs" name="name" value={settings.name} onChange={handleInputChange} />
                <div className="md:col-span-2">
                    <TextareaField label="Deskripsi (Indonesia)" name="id" value={settings.businessDescription?.id} onChange={(e) => handleJsonChange('businessDescription', 'id', e.target.value)} />
                </div>
                 <div className="md:col-span-2">
                    <TextareaField label="Deskripsi (English)" name="en" value={settings.businessDescription?.en} onChange={(e) => handleJsonChange('businessDescription', 'en', e.target.value)} />
                </div>
            </SectionCard>

            <SectionCard title="Aset Visual">
                <div className='flex flex-col gap-2'>
                    <label className="block text-sm font-medium text-gray-300">Logo</label>
                    {settings.logoUrl && <img src={`http://localhost:5000${settings.logoUrl}`} alt="logo" className="h-16 w-16 object-contain mb-2 bg-white/10 p-1 rounded" />}
                    <input type="file" accept='image/*' onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-200/20 file:text-lime-300 hover:file:bg-lime-200/30 cursor-pointer"/>
                </div>
                 <div className='flex flex-col gap-2'>
                    <label className="block text-sm font-medium text-gray-300">Favicon</label>
                    {settings.faviconUrl && <img src={`http://localhost:5000${settings.faviconUrl}`} alt="favicon" className="h-16 w-16 object-contain mb-2 bg-white/10 p-1 rounded" />}
                    <input type="file" accept='image/*' onChange={(e) => setFaviconFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-200/20 file:text-lime-300 hover:file:bg-lime-200/30 cursor-pointer"/>
                </div>
            </SectionCard>

            <div className="space-y-4">
                 <h4 className='text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2'>Banner Halaman Utama</h4>
                 <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <InputField label="Tagline Banner (ID)" name="bannerTagline_id" value={settings.bannerTagline?.id} onChange={(e) => handleJsonChange('bannerTagline', 'id', e.target.value)} />
                    <InputField label="Tagline Banner (EN)" name="bannerTagline_en" value={settings.bannerTagline?.en} onChange={(e) => handleJsonChange('bannerTagline', 'en', e.target.value)} />
                 </div>
                 <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                    {settings.bannerImages.map((banner: BannerImage, index: number) => (
                        <div key={banner.id || index} className="relative group">
                            <img src={`http://localhost:5000${banner.imageUrl}`} alt={`banner-${index}`} className="w-full h-24 object-cover rounded-md bg-white/10" />
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

            <SectionCard title="Pengaturan SEO & Analitik">
                <InputField label="Meta Title (ID)" name="id_metaTitle" value={settings.seo?.id_metaTitle} onChange={(e) => handleJsonChange('seo', 'id_metaTitle', e.target.value)} />
                <InputField label="Meta Title (EN)" name="en_metaTitle" value={settings.seo?.en_metaTitle} onChange={(e) => handleJsonChange('seo', 'en_metaTitle', e.target.value)} />
                 <div className="md:col-span-2">
                    <TextareaField label="Meta Description (ID)" name="id_metaDescription" value={settings.seo?.id_metaDescription} onChange={(e) => handleJsonChange('seo', 'id_metaDescription', e.target.value)} />
                </div>
                 <div className="md:col-span-2">
                    <TextareaField label="Meta Description (EN)" name="en_metaDescription" value={settings.seo?.en_metaDescription} onChange={(e) => handleJsonChange('seo', 'en_metaDescription', e.target.value)} />
                </div>
                <InputField label="Google Analytics ID" name="googleAnalyticsId" value={settings.googleAnalyticsId} onChange={handleInputChange} />
                <InputField label="Google Ads ID" name="googleAdsId" value={settings.googleAdsId} onChange={handleInputChange} />
                <InputField label="Meta Pixel ID" name="metaPixelId" value={settings.metaPixelId} onChange={handleInputChange} />
            </SectionCard>

            <div className="space-y-4">
                 <h4 className='text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2'>FAQ (Tanya Jawab)</h4>
                {settings.faqs.map((faq: Faq, index: number) => (
                    <div key={index} className="p-4 border border-lime-400/20 rounded-lg space-y-2 relative bg-gray-900/20">
                        <button onClick={() => removeArrayItem('faqs', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><Trash2 size={18}/></button>
                        <InputField label={`Pertanyaan ${index + 1} (ID)`} name={`faq_q_id_${index}`} value={faq.question?.id} onChange={(e) => handleArrayItemChange('faqs', index, 'question', 'id', e.target.value)}/>
                        <InputField label={`Pertanyaan ${index + 1} (EN)`} name={`faq_q_en_${index}`} value={faq.question?.en} onChange={(e) => handleArrayItemChange('faqs', index, 'question', 'en', e.target.value)}/>
                        <TextareaField label={`Jawaban ${index + 1} (ID)`} name={`faq_a_id_${index}`} value={faq.answer?.id} onChange={(e) => handleArrayItemChange('faqs', index, 'answer', 'id', e.target.value)}/>
                        <TextareaField label={`Jawaban ${index + 1} (EN)`} name={`faq_a_en_${index}`} value={faq.answer?.en} onChange={(e) => handleArrayItemChange('faqs', index, 'answer', 'en', e.target.value)}/>
                    </div>
                ))}
                 <button onClick={() => addArrayItem('faqs', { question: { id: '', en: '' }, answer: { id: '', en: '' } })} className="mt-2 flex items-center gap-2 text-sm font-semibold text-lime-300 hover:text-lime-200">
                    <PlusCircle size={18}/> Tambah FAQ
                </button>
            </div>
            
            <div className='pt-6 mt-6 border-t border-lime-400/30'>
                <button onClick={handleSave} disabled={isSaving} className="w-full bg-lime-400 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                    {isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                </button>
            </div>
        </div>
    );
};