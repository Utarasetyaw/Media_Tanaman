import React from 'react';
import { useSiteSettings } from '../../../hooks/admin/useSiteSettings';
import type { SiteSettings } from '../../../types/admin/adminsettings';

// Komponen UI
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

const SectionCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className="space-y-4">
        <h4 className='text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2'>{title}</h4>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
            {children}
        </div>
    </div>
);

export const TrackingSettingsComponent: React.FC = () => {
    const { settings, isLoading, isSaving, updateSettings } = useSiteSettings();
    const [formData, setFormData] = React.useState<Partial<SiteSettings>>({});

    React.useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        updateSettings({ settingsData: formData });
    };

    if (isLoading) {
        return <div className='text-center text-gray-300 p-8'>Memuat pengaturan...</div>;
    }

    return (
        <div className="bg-[#0b5351]/30 p-4 sm:p-6 rounded-lg border border-lime-400/50 space-y-8">
            <h3 className="text-xl font-bold text-gray-200">Pengaturan Google & Ads</h3>

            {/* ▼▼▼ PERUBAHAN DI SINI ▼▼▼ */}
            {/* Wrapper div dihilangkan agar input menjadi anak langsung dari grid di SectionCard */}
            <SectionCard title="ID Pelacakan Pihak Ketiga" className="md:grid-cols-1">
                <InputField
                    label="Google Analytics ID"
                    name="googleAnalyticsId"
                    placeholder="Contoh: G-XXXXXXXXXX"
                    value={formData.googleAnalyticsId || ''}
                    onChange={handleInputChange}
                />
                <InputField
                    label="Google Ads ID"
                    name="googleAdsId"
                    placeholder="Contoh: AW-XXXXXXXXXX"
                    value={formData.googleAdsId || ''}
                    onChange={handleInputChange}
                />
                <InputField
                    label="Meta Pixel ID"
                    name="metaPixelId"
                    placeholder="Contoh: 1234567890123456"
                    value={formData.metaPixelId || ''}
                    onChange={handleInputChange}
                />
            </SectionCard>
            {/* ▲▲▲ AKHIR PERUBAHAN ▲▲▲ */}


            <div className='pt-6 mt-6 border-t border-lime-400/30'>
                <button onClick={handleSave} disabled={isSaving} className="w-full bg-lime-400 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>
        </div>
    );
};