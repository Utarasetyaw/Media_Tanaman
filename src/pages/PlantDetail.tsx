import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { plants } from '../data/plants'; // Sesuaikan path
import { ArrowLeft, Zap, Maximize, Sprout, ExternalLink } from 'lucide-react';

// Import komponen iklan
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';

const PlantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const plant = plants.find(p => p.id === parseInt(id || ''));

  if (!plant) {
    return (
      // PERUBAHAN: Disesuaikan untuk tema gelap
      <div className="text-center py-20 bg-[#003938] min-h-screen text-white">
        <h2 className="text-2xl font-bold">Tanaman tidak ditemukan</h2>
        <Link to="/plants" className="text-lime-400 mt-4 inline-block hover:underline">Kembali ke galeri</Link>
      </div>
    );
  }

  return (
    // PERUBAHAN: Latar belakang diubah ke hijau tua
    <div className="bg-[#003938] min-h-screen relative">
      <VerticalAd position="left" />
      <VerticalAd position="right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-16">
        {/* PERUBAHAN: Warna link diubah ke lime */}
        <Link to="/plants" className="inline-flex items-center gap-2 text-lime-400 font-semibold hover:underline mb-8">
          <ArrowLeft size={20} />
          {t('plantPage.detail.backLink')}
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Kolom Gambar */}
          <div>
            <img src={plant.imageUrl} alt={plant.name} className="w-full h-auto object-cover rounded-2xl shadow-lg sticky top-24 border-2 border-lime-400" />
          </div>
          {/* Kolom Info */}
          <div>
            {/* PERUBAHAN: Warna teks dan font judul diubah */}
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">{plant.name}</h1>
            <p className="text-xl text-gray-400 italic mt-2 mb-6">{plant.scientificName}</p>
            
            {/* PERUBAHAN: Styling Info Box disesuaikan untuk tema gelap */}
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
                <p className="text-sm text-gray-300">{plant.family}</p>
              </div>
            </div>

            {/* PERUBAHAN: Warna judul seksi diubah ke lime */}
            <h2 className="font-serif text-2xl font-bold text-lime-400 mb-4">{t('plantPage.detail.description')}</h2>
            <p className="text-gray-300 leading-relaxed mb-10">{plant.description}</p>

            <h2 className="font-serif text-2xl font-bold text-lime-400 mb-4">{t('plantPage.detail.whereToBuy')}</h2>
            <div className="space-y-3">
              {plant.stores.map((store, index) => (
                // PERUBAHAN: Styling link toko disesuaikan untuk tema gelap
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