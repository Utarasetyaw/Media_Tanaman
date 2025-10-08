import React, { useState, useEffect, useRef } from 'react';
import { useSiteSettings } from '../../../hooks/admin/useSiteSettings';
import type { AnnouncementSettings } from '../../../types/admin/adminsettings';
import { Loader2 } from 'lucide-react';

// Komponen TextareaField bisa di-copy atau diimpor jika Anda memindahkannya ke file terpisah
const TextareaField: React.FC<{
    label: string; value: string;
    onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
    rows?: number;
}> = ({ label, value, onChange, rows = 6 }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; 
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [value]);

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <textarea
                ref={textareaRef}
                value={value || ''}
                onChange={onChange}
                rows={rows}
                className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-lime-400 resize-none overflow-y-hidden"
            />
        </div>
    );
};

export const AnnouncementsComponent: React.FC = () => {
    // Panggil hook gabungan dan ambil data & fungsi yang relevan
    const { announcements, isLoadingAnnouncements, isSavingAnnouncements, updateAnnouncements } = useSiteSettings();
    const [formData, setFormData] = useState<Partial<AnnouncementSettings>>({});

    useEffect(() => {
        if (announcements) {
            setFormData(announcements);
        }
    }, [announcements]);

    const handleNestedChange = (field: keyof AnnouncementSettings, subField: 'id' | 'en', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...(prev[field] as object), [subField]: value },
        }));
    };
    
    const handleSave = () => {
        updateAnnouncements(formData);
    };

    if (isLoadingAnnouncements) {
        return <div className='text-center text-gray-300 p-8'>Memuat data pengumuman...</div>;
    }

    return (
        <div className="bg-[#0b5351]/30 p-4 sm:p-6 rounded-lg border border-lime-400/50 space-y-8">
            <h3 className="text-xl font-bold text-gray-200">Pengumuman & Aturan</h3>
            
            <div className="space-y-6">
                <h4 className='text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2'>Untuk Jurnalis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextareaField label="Pengumuman (Indonesia)" value={formData.journalistAnnouncement?.id || ''} onChange={(e) => handleNestedChange('journalistAnnouncement', 'id', e.target.value)} />
                    <TextareaField label="Announcement (English)" value={formData.journalistAnnouncement?.en || ''} onChange={(e) => handleNestedChange('journalistAnnouncement', 'en', e.target.value)} />
                    <TextareaField label="Aturan (Indonesia)" value={formData.journalistRules?.id || ''} onChange={(e) => handleNestedChange('journalistRules', 'id', e.target.value)} />
                    <TextareaField label="Rules (English)" value={formData.journalistRules?.en || ''} onChange={(e) => handleNestedChange('journalistRules', 'en', e.target.value)} />
                </div>
            </div>

            <div className="space-y-6">
                <h4 className='text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2'>Untuk Peserta (User)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextareaField label="Pengumuman (Indonesia)" value={formData.userAnnouncement?.id || ''} onChange={(e) => handleNestedChange('userAnnouncement', 'id', e.target.value)} />
                    <TextareaField label="Announcement (English)" value={formData.userAnnouncement?.en || ''} onChange={(e) => handleNestedChange('userAnnouncement', 'en', e.target.value)} />
                    <TextareaField label="Aturan (Indonesia)" value={formData.userRules?.id || ''} onChange={(e) => handleNestedChange('userRules', 'id', e.target.value)} />
                    <TextareaField label="Rules (English)" value={formData.userRules?.en || ''} onChange={(e) => handleNestedChange('userRules', 'en', e.target.value)} />
                </div>
            </div>

            <div className='pt-6 mt-6 border-t border-lime-400/30'>
                <button onClick={handleSave} disabled={isSavingAnnouncements} className="w-full bg-lime-400 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isSavingAnnouncements ? <><Loader2 className="animate-spin"/> Menyimpan...</> : 'Simpan Perubahan'}
                </button>
            </div>
        </div>
    );
};