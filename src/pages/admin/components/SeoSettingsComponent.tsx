import React from 'react';
import { useSiteSettings } from '../../../hooks/admin/useSiteSettings';
import type { SiteSettings } from '../../../types/admin/settings';

// Komponen UI Kecil (diambil dari GeneralSettingsComponent agar konsisten)
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

export const SeoSettingsComponent: React.FC = () => {
    const { settings, isLoading, isSaving, updateSettings } = useSiteSettings();
    const [formData, setFormData] = React.useState<Partial<SiteSettings>>({});

    React.useEffect(() => {
        if (settings) {
            setFormData({
                ...settings,
                seo: settings.seo || {},
            });
        }
    }, [settings]);

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

    const handleSave = () => {
        updateSettings({ settingsData: formData });
    };

    if (isLoading) {
        return <div className='text-center text-gray-300 p-8'>Memuat pengaturan SEO...</div>;
    }

    return (
        <div className="bg-[#0b5351]/30 p-4 sm:p-6 rounded-lg border border-lime-400/50 space-y-8">
            <h3 className="text-xl font-bold text-gray-200">Pengaturan SEO Situs</h3>

            <SectionCard title="Meta Tags Utama">
                <InputField
                    label="Meta Title (ID)"
                    name="metaTitle_id"
                    value={formData.seo?.metaTitle?.id || ''}
                    onChange={(e) => handleDeeplyNestedChange('seo', 'metaTitle', 'id', e.target.value)}
                />
                <InputField
                    label="Meta Title (EN)"
                    name="metaTitle_en"
                    value={formData.seo?.metaTitle?.en || ''}
                    onChange={(e) => handleDeeplyNestedChange('seo', 'metaTitle', 'en', e.target.value)}
                />
                <div className="md:col-span-2">
                    <TextareaField
                        label="Meta Description (ID)"
                        name="metaDescription_id"
                        value={formData.seo?.metaDescription?.id || ''}
                        onChange={(e) => handleDeeplyNestedChange('seo', 'metaDescription', 'id', e.target.value)}
                    />
                </div>
                <div className="md:col-span-2">
                    <TextareaField
                        label="Meta Description (EN)"
                        name="metaDescription_en"
                        value={formData.seo?.metaDescription?.en || ''}
                        onChange={(e) => handleDeeplyNestedChange('seo', 'metaDescription', 'en', e.target.value)}
                    />
                </div>
                <div className="md:col-span-2">
                    <InputField
                        label="Meta Keywords (pisahkan dengan koma)"
                        name="metaKeywords"
                        value={formData.seo?.metaKeywords || ''}
                        onChange={(e) => handleNestedChange('seo', 'metaKeywords', e.target.value)}
                    />
                </div>
            </SectionCard>

            <SectionCard title="Open Graph (Untuk Media Sosial)">
                 <InputField
                    label="Open Graph Title (ID)"
                    name="ogDefaultTitle_id"
                    value={formData.seo?.ogDefaultTitle?.id || ''}
                    onChange={(e) => handleDeeplyNestedChange('seo', 'ogDefaultTitle', 'id', e.target.value)}
                />
                <InputField
                    label="Open Graph Title (EN)"
                    name="ogDefaultTitle_en"
                    value={formData.seo?.ogDefaultTitle?.en || ''}
                    onChange={(e) => handleDeeplyNestedChange('seo', 'ogDefaultTitle', 'en', e.target.value)}
                />
                <div className="md:col-span-2">
                    <TextareaField
                        label="Open Graph Description (ID)"
                        name="ogDefaultDescription_id"
                        value={formData.seo?.ogDefaultDescription?.id || ''}
                        onChange={(e) => handleDeeplyNestedChange('seo', 'ogDefaultDescription', 'id', e.target.value)}
                    />
                </div>
                <div className="md:col-span-2">
                    <TextareaField
                        label="Open Graph Description (EN)"
                        name="ogDefaultDescription_en"
                        value={formData.seo?.ogDefaultDescription?.en || ''}
                        onChange={(e) => handleDeeplyNestedChange('seo', 'ogDefaultDescription', 'en', e.target.value)}
                    />
                </div>
                {/* ▼▼▼ INPUT BARU DI SINI ▼▼▼ */}
                <div className="md:col-span-2">
                    <InputField
                        label="URL Gambar Open Graph Default"
                        name="ogDefaultImageUrl"
                        placeholder="https://.../gambar-bagus.jpg"
                        value={formData.seo?.ogDefaultImageUrl || ''}
                        onChange={(e) => handleNestedChange('seo', 'ogDefaultImageUrl', e.target.value)}
                    />
                </div>
                {/* ▲▲▲ AKHIR DARI INPUT BARU ▲▲▲ */}
            </SectionCard>
            
            <SectionCard title="Lainnya">
                 <InputField
                    label="Twitter Username (@username)"
                    name="twitterSite"
                    value={formData.seo?.twitterSite || ''}
                    onChange={(e) => handleNestedChange('seo', 'twitterSite', e.target.value)}
                />
                <InputField
                    label="Google Site Verification ID"
                    name="googleSiteVerificationId"
                    value={formData.seo?.googleSiteVerificationId || ''}
                    onChange={(e) => handleNestedChange('seo', 'googleSiteVerificationId', e.target.value)}
                />
            </SectionCard>

            <div className='pt-6 mt-6 border-t border-lime-400/30'>
                <button onClick={handleSave} disabled={isSaving} className="w-full bg-lime-400 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                    {isSaving ? 'Menyimpan Pengaturan SEO...' : 'Simpan Pengaturan SEO'}
                </button>
            </div>
        </div>
    );
};