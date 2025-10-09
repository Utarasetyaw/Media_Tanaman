import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlantManager } from '../../hooks/admin/usePlantManager';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const lang = 'id';

export const PlantDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { viewingPlant, isLoading } = usePlantManager(id);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async (imageUrl: string, plantName: string) => {
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
            link.setAttribute('download', filename || `${plantName.replace(/\s+/g, '_')}.jpg`);
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

    if (isLoading) {
        return <div className="text-center text-gray-300 p-8">Memuat detail tanaman...</div>;
    }

    if (!viewingPlant) {
        return <div className="text-center text-red-400 p-8">Data tanaman tidak ditemukan.</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90">
                    Detail Tanaman
                </h2>
                <button 
                    onClick={() => navigate('/admin/plants')} 
                    className="flex items-center justify-center gap-2 bg-transparent border border-lime-400/60 text-lime-200/90 font-semibold py-2 px-4 rounded-lg hover:bg-lime-900/20 transition-colors text-sm w-full sm:w-auto"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Manajemen Tanaman
                </button>
            </div>

            <div className="bg-[#0b5351]/30 p-4 sm:p-6 rounded-lg border border-lime-400/50 space-y-6">
                <div>
                    <img 
                        src={viewingPlant.imageUrl} 
                        alt={viewingPlant.name[lang]} 
                        className="w-full aspect-video object-cover rounded-lg bg-black/20 max-w-4xl mx-auto" 
                    />
                    <div className="flex justify-center mt-3">
                        <button 
                            onClick={() => handleDownload(viewingPlant.imageUrl, viewingPlant.name[lang])}
                            disabled={isDownloading}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-600/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            {isDownloading ? 'Mengunduh...' : 'Unduh Gambar'}
                        </button>
                    </div>
                </div>
                
                <div className="border-b border-lime-400/20 pb-6">
                    <h3 className="text-2xl font-bold text-gray-100 mb-4">{viewingPlant.name[lang]}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <strong className="block text-lime-400 text-sm">Nama Ilmiah:</strong> 
                            <span className="text-gray-300 italic">{viewingPlant.scientificName}</span>
                        </div>
                        {viewingPlant.plantType && 
                            <div>
                                <strong className="block text-lime-400 text-sm">Tipe Tanaman:</strong> 
                                <span className="text-gray-300">{viewingPlant.plantType.name[lang]}</span>
                            </div>
                        }
                    </div>
                </div>
                
                <div className="pt-2">
                    <strong className="text-lime-400 block mb-2 border-b border-lime-400/20 pb-1">Deskripsi (ID):</strong>
                    <p className="text-gray-300 whitespace-pre-wrap">{viewingPlant.description[lang]}</p>
                </div>

                {viewingPlant.description.en && 
                    <div className="pt-2">
                        <strong className="text-lime-400 block mb-2 border-b border-lime-400/20 pb-1">Deskripsi (EN):</strong>
                        <p className="text-gray-300 whitespace-pre-wrap">{viewingPlant.description.en}</p>
                    </div>
                }

                {viewingPlant.stores && viewingPlant.stores.length > 0 && (
                    <div className="pt-2">
                        <strong className="text-lime-400 block mb-2 border-b border-lime-400/20 pb-1">Analitik Toko Penjual:</strong>
                        <ul className="text-gray-300 space-y-2 pt-2">
                            {viewingPlant.stores.map((store) => (
                                <li key={store.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-2 rounded-md hover:bg-lime-900/20">
                                    <a href={`/api/plants/track/store/${store.id}`} target="_blank" rel="noopener noreferrer" className="hover:text-lime-300 underline break-all">
                                        {store.name}
                                    </a>
                                    <span className="text-sm bg-lime-900/50 text-lime-300 font-mono py-1 px-2 rounded-md mt-1 sm:mt-0">
                                        {store.clicks} klik
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};