import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventManager } from '../../hooks/admin/useEventManager';
import { ArrowLeft, Loader2, Trash2, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TextareaField: React.FC<{
    label: string; value: string;
    onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string; rows?: number; maxLength?: number;
}> = ({ label, value, onChange, placeholder, rows = 3, maxLength }) => {
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
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-300">{label}</label>
                {maxLength && (
                    <span className={`text-xs ${wordCount > maxLength ? 'text-red-400' : 'text-gray-400'}`}>
                        {wordCount}/{maxLength} kata
                    </span>
                )}
            </div>
            <textarea
                ref={textareaRef}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-lime-400 transition-colors resize-none overflow-y-hidden"
            />
        </div>
    );
};

export const EventEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const {
        formData, imageFile, isMutating, isLoadingDetail,
        handleInputChange, handleJsonChange, handleImageChange, handleRemoveImage,
        handleSave,
    } = useEventManager(id);

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async (imageUrl: string, title: string) => {
        setIsDownloading(true);
        toast.loading('Mulai mengunduh...');
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error('Gagal mengambil gambar dari server.');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            link.setAttribute('download', filename || `${title.replace(/\s+/g, '_')}.jpg`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.dismiss();
            toast.success('Gambar berhasil diunduh!');
        } catch (err) {
            console.error("Download Error:", err);
            toast.dismiss();
            toast.error('Gagal mengunduh gambar.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoadingDetail && isEditing) {
        return <div className="text-center text-gray-300 p-8">Memuat data event...</div>;
    }

    const inputClassName = "w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-lime-400";
    const displayImageUrl = imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90">
                    {isEditing ? 'Ubah Data Event' : 'Tambah Event Baru'}
                </h2>
                <button 
                    onClick={() => navigate('/admin/events')} 
                    className="flex items-center gap-2 bg-transparent border border-lime-400/60 text-lime-200/90 font-semibold py-2 px-4 rounded-lg hover:bg-lime-900/20 transition-colors text-sm w-full sm:w-auto justify-center"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Manajemen Event
                </button>
            </div>

            <div className="bg-[#0b5351]/30 p-4 sm:p-6 rounded-lg border border-lime-400/50 space-y-6">
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Judul Event (ID) *</label><input type="text" value={formData.title?.id || ''} onChange={(e) => handleJsonChange('title', 'id', e.target.value)} className={inputClassName} /></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Judul Event (EN)</label><input type="text" value={formData.title?.en || ''} onChange={(e) => handleJsonChange('title', 'en', e.target.value)} className={inputClassName} /></div>
                    
                    <div className='md:col-span-2'>
                        <TextareaField
                            label="Deskripsi (ID)"
                            value={formData.description?.id || ''}
                            onChange={(e) => handleJsonChange('description', 'id', e.target.value)}
                        />
                    </div>
                    <div className='md:col-span-2'>
                        <TextareaField
                            label="Deskripsi (EN)"
                            value={formData.description?.en || ''}
                            onChange={(e) => handleJsonChange('description', 'en', e.target.value)}
                        />
                    </div>

                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Lokasi</label><input type="text" name="location" value={formData.location || ''} onChange={handleInputChange} className={inputClassName} /></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Penyelenggara</label><input type="text" name="organizer" value={formData.organizer || ''} onChange={handleInputChange} className={inputClassName} /></div>
                    <div><label className='block text-sm font-medium text-gray-300 mb-1'>Tanggal Mulai *</label><input type="datetime-local" name="startDate" value={formData.startDate || ''} onChange={handleInputChange} className={inputClassName} /></div>
                    <div><label className='block text-sm font-medium text-gray-300 mb-1'>Tanggal Selesai *</label><input type="datetime-local" name="endDate" value={formData.endDate || ''} onChange={handleInputChange} className={inputClassName} /></div>
                    <div className='md:col-span-2'><label className="block text-sm font-medium text-gray-300 mb-1">Tipe Event</label>
                        <select name="eventType" value={formData.eventType || 'EXTERNAL'} onChange={handleInputChange} className={inputClassName}>
                            <option className="bg-[#003938]" value="EXTERNAL">Eksternal</option>
                            <option className="bg-[#003938]" value="INTERNAL">Internal (Dengan Pendaftaran)</option>
                        </select>
                    </div>
                    {formData.eventType === 'EXTERNAL' && <div className='md:col-span-2'><label className="block text-sm font-medium text-gray-300 mb-1">URL Pendaftaran Eksternal</label><input type="url" name="externalUrl" value={formData.externalUrl || ''} onChange={handleInputChange} className={inputClassName} /></div>}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Gambar Utama {isEditing ? '(Opsional)' : '*'}</label>
                        <p className="text-xs text-gray-400 mt-1 mb-2">Rekomendasi rasio 16:9 (Contoh: 1280x720 piksel).</p>
                        <div className="mt-2">
                            {displayImageUrl ? (
                                <div className="relative group w-full max-w-sm aspect-video rounded-lg overflow-hidden border p-1 border-lime-400/50">
                                    <img src={displayImageUrl} alt="Pratinjau" className="w-full h-full object-cover rounded-md" />
                                    <button type="button" onClick={handleRemoveImage} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Hapus gambar"><Trash2 size={16} /></button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full max-w-sm h-32 bg-black/20 rounded-md border-2 border-dashed border-lime-400/30"><p className="text-gray-400">Pratinjau Gambar</p></div>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                            <label htmlFor="event-image-input" className="cursor-pointer bg-lime-200/20 text-lime-300 hover:bg-lime-200/30 font-semibold text-sm py-2 px-4 rounded-full transition-colors">Pilih File</label>
                            <input id="event-image-input" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            {formData.imageUrl && !imageFile && (
                                <button
                                    type="button"
                                    disabled={isDownloading}
                                    onClick={() => handleDownload(formData.imageUrl, formData.title?.id || 'event_image')}
                                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white disabled:opacity-50"
                                >
                                    {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                    {isDownloading ? 'Mengunduh...' : 'Unduh'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-lime-400/30">
                    <button onClick={() => navigate('/admin/events')} className="w-full sm:w-auto bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Batal</button>
                    <button onClick={() => handleSave(id)} disabled={isMutating} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 disabled:bg-gray-500 disabled:cursor-wait flex items-center justify-center">
                        {isMutating ? <><Loader2 size={18} className="animate-spin mr-2"/>Menyimpan...</> : 'Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
};