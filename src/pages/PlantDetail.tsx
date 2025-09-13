import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Zap, Maximize, Sprout, ExternalLink } from 'lucide-react';

// Impor tipe data dan API service
import type { Plant } from '../types/plant';
import api from '../services/apiService';

// Import komponen UI lainnya
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';

// Ganti bahasa ini sesuai state global Anda nantinya
const lang: 'id' | 'en' = 'id';

// Fungsi untuk mengambil detail satu tanaman dari API
const fetchPlantById = async (id: string): Promise<Plant> => {
  const { data } = await api.get(`/plants/${id}`);
  return data;
};

const PlantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  // Gunakan Tanstack Query untuk mengambil data detail tanaman
  const { data: plant, isLoading, isError } = useQuery<Plant, Error>({
    // Kunci query ini unik untuk setiap tanaman berdasarkan ID-nya
    queryKey: ['plant', id],
    queryFn: () => fetchPlantById(id!),
    enabled: !!id, // Query hanya akan berjalan jika 'id' ada
  });

  // Tampilan saat loading
  if (isLoading) {
    return (
      <div className="text-center py-20 bg-[#003938] min-h-screen text-white">
        <h2 className="text-2xl font-bold">Loading Plant Details...</h2>
      </div>
    );
  }
  
  // Tampilan jika terjadi error atau tanaman tidak ditemukan
  if (isError || !plant) {
    return (
      <div className="text-center py-20 bg-[#003938] min-h-screen text-white">
        <h2 className="text-2xl font-bold">Tanaman tidak ditemukan</h2>
        <Link to="/plants" className="text-lime-400 mt-4 inline-block hover:underline">Kembali ke galeri</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#003938] min-h-screen relative">
      <VerticalAd position="left" />
      <VerticalAd position="right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-16">
        <Link to="/plants" className="inline-flex items-center gap-2 text-lime-400 font-semibold hover:underline mb-8">
          <ArrowLeft size={20} />
          {t('plantPage.detail.backLink')}
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Kolom Gambar */}
          <div>
            <img src={plant.imageUrl} alt={plant.name[lang]} className="w-full h-auto object-cover rounded-2xl shadow-lg sticky top-24 border-2 border-lime-400" />
          </div>
          {/* Kolom Info */}
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">{plant.name[lang]}</h1>
            <p className="text-xl text-gray-400 italic mt-2 mb-6">{plant.scientificName}</p>
            
            <div className="grid grid-cols-3 gap-4 text-center mb-8 bg-[#004A49]/60 p-4 rounded-lg border-2 border-lime-400">
              <div>
                <Zap className="mx-auto text-lime-400 mb-1" />
                <h4 className="font-bold text-sm text-gray-200">{t('plantPage.detail.careLevel')}</h4>
                <p className="text-sm text-gray-300">{plant.careLevel}</p>
              </div>
              <div>
                <Maximize className="mx-auto text-lime-400 mb-1" />
                <h4 className="font-bold text-sm text-gray-200">{t('plantPage.detail.size')}</h4>
                <p className="text-sm text-gray-300">{plant.size}</p>
              </div>
              <div>
                <Sprout className="mx-auto text-lime-400 mb-1" />
                <h4 className="font-bold text-sm text-gray-200">{t('plantPage.detail.family')}</h4>
                <p className="text-sm text-gray-300">{plant.family.name[lang]}</p>
              </div>
            </div>

            <h2 className="font-serif text-2xl font-bold text-lime-400 mb-4">{t('plantPage.detail.description')}</h2>
            <p className="text-gray-300 leading-relaxed mb-10">{plant.description[lang]}</p>

            <h2 className="font-serif text-2xl font-bold text-lime-400 mb-4">{t('plantPage.detail.whereToBuy')}</h2>
            <div className="space-y-3">
              {plant.stores.map((store, index) => (
                <a key={index} href={store.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-[#004A49]/60 p-4 rounded-lg border-2 border-lime-400 hover:border-lime-500 hover:bg-[#004A49]/90 transition-all">
                  <span className="font-semibold text-gray-200">{store.name}</span>
                  <div className="flex items-center gap-2 text-lime-400">
                    <span className="text-sm font-medium">{t('plantPage.detail.visitStore')}</span>
                    <ExternalLink size={16} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-16">
          <HorizontalAd />
        </div>
      </div>
    </div>
  );
};

export default PlantDetail;