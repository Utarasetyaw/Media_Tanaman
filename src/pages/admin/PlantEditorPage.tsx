import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlantManager } from '../../hooks/admin/usePlantManager';
import { Trash2, PlusCircle, ArrowLeft, Loader2 } from 'lucide-react';

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

export const PlantEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const {
        formData, imageFile, isMutating, isLoading, plantTypes,
        handleInputChange, handleJsonChange, handleImageChange,
        handleStoreChange, addStoreField, removeStoreField,
        handleSave,
    } = usePlantManager(id);

    if (isLoading) {
        return <div className="text-center text-gray-300 p-8">Memuat data tanaman...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90">
                    {isEditing ? 'Ubah Data Tanaman' : 'Tambah Tanaman Baru'}
                </h2>
                <button 
                    onClick={() => navigate('/admin/plants')} 
                    className="flex items-center gap-2 bg-transparent border border-lime-400/60 text-lime-200/90 font-semibold py-2 px-4 rounded-lg hover:bg-lime-900/20 transition-colors text-sm w-full sm:w-auto justify-center"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Manajemen Tanaman
                </button>
            </div>

            <div className="bg-[#0b5351]/30 p-4 sm:p-6 rounded-lg border border-lime-400/50 space-y-6">
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nama Tanaman (ID) *</label>
                        <input type="text" value={formData.name?.id || ''} onChange={(e) => handleJsonChange('name', 'id', e.target.value)} placeholder="Nama Tanaman (Indonesia)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nama Tanaman (EN)</label>
                        <input type="text" value={formData.name?.en || ''} onChange={(e) => handleJsonChange('name', 'en', e.target.value)} placeholder="Nama Tanaman (Bahasa Inggris)" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nama Ilmiah</label>
                        <input type="text" name="scientificName" value={formData.scientificName || ''} onChange={handleInputChange} placeholder="Nama Ilmiah" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" />
                    </div>
                    <div className='md:col-span-2'>
                        <TextareaField
                            label="Deskripsi (ID)"
                            value={formData.description?.id || ''}
                            onChange={(e) => handleJsonChange('description', 'id', e.target.value)}
                            placeholder="Deskripsi (Indonesia)"
                            maxLength={500}
                            rows={5}
                        />
                    </div>
                    <div className='md:col-span-2'>
                        <TextareaField
                            label="Deskripsi (EN)"
                            value={formData.description?.en || ''}
                            onChange={(e) => handleJsonChange('description', 'en', e.target.value)}
                            placeholder="Deskripsi (Bahasa Inggris)"
                            maxLength={500}
                            rows={5}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tipe Tanaman *</label>
                        <select name="plantTypeId" value={formData.plantTypeId || 0} onChange={handleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"><option value={0} disabled>Pilih Tipe Tanaman</option>{plantTypes.map(pt => <option key={pt.id} value={pt.id} className="bg-[#003938] text-white">{pt.name['id']}</option>)}</select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Gambar Utama {isEditing ? '(Opsional)' : '*'}</label>
                        <p className="text-xs text-gray-400 mt-1 mb-2">Rekomendasi rasio 16:9 (Ukuran Ideal: 1280x720 piksel).</p>
                        {(formData?.imageUrl && !imageFile) ? 
                            (<div className="mb-2"><img src={formData.imageUrl} alt="Gambar saat ini" className="w-32 aspect-video object-cover rounded-md border border-lime-400/50 p-1" /></div>) 
                            : imageFile && 
                            (<div className="mb-2"><img src={URL.createObjectURL(imageFile)} alt="Pratinjau gambar baru" className="w-32 aspect-video object-cover rounded-md border border-lime-400/50 p-1" /></div>)
                        }
                        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-200/20 file:text-lime-300 hover:file:bg-lime-200/30 cursor-pointer"/>
                    </div>
                    <div className="md:col-span-2">
                        <h4 className="text-lg font-semibold text-lime-300 border-b border-lime-400/30 pb-2 mb-3">Toko Penjual</h4>
                        {formData.stores?.map((store: { name: string, url: string }, index: number) => (
                            <div key={index} className="space-y-2 mb-4 p-3 border border-lime-400/20 rounded-md">
                                <input 
                                    type="text" 
                                    value={store.name || ''} 
                                    onChange={(e) => handleStoreChange(index, 'name', e.target.value)} 
                                    placeholder="Nama Toko" 
                                    className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" 
                                />
                                <input 
                                    type="url" 
                                    value={store.url || ''} 
                                    onChange={(e) => handleStoreChange(index, 'url', e.target.value)} 
                                    placeholder="URL Toko" 
                                    className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" 
                                />
                                <button 
                                    onClick={() => removeStoreField(index)} 
                                    className="w-full justify-center bg-red-600/10 text-red-400 hover:bg-red-600/20 hover:text-red-300 font-semibold p-2 rounded-md flex items-center gap-2 text-sm"
                                >
                                    <Trash2 size={16}/>
                                    <span>Hapus Toko</span>
                                </button>
                            </div>
                        ))}
                        <button 
                            type="button" 
                            onClick={addStoreField} 
                            className="mt-2 w-full justify-center bg-lime-400/10 text-lime-300 hover:bg-lime-400/20 hover:text-lime-200 font-semibold p-2 rounded-md flex items-center gap-2 text-sm"
                        >
                            <PlusCircle size={16}/>
                            <span>Tambah Toko</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-lime-400/30">
                    <button onClick={() => navigate('/admin/plants')} className="w-full sm:w-auto bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Batal</button>
                    <button onClick={() => handleSave(id)} disabled={isMutating} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 disabled:bg-gray-500 disabled:cursor-wait">
                        {isMutating ? <><Loader2 className="animate-spin mr-2"/>Menyimpan...</> : 'Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
};