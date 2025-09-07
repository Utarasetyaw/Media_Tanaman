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
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Tanaman tidak ditemukan</h2>
        <Link to="/plants" className="text-green-700 mt-4 inline-block">Kembali ke galeri</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen relative">
      <VerticalAd position="left" />
      <VerticalAd position="right" />

      {/* UBAH: max-w-6xl menjadi max-w-7xl untuk area konten yang lebih lebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/plants" className="inline-flex items-center gap-2 text-green-800 font-semibold hover:underline mb-8">
          <ArrowLeft size={20} />
          {t('plantPage.detail.backLink')}
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Kolom Gambar */}
          <div>
            <img src={plant.imageUrl} alt={plant.name} className="w-full h-auto object-cover rounded-2xl shadow-lg sticky top-24" />
          </div>
          {/* Kolom Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{plant.name}</h1>
            <p className="text-xl text-gray-500 italic mt-2 mb-6">{plant.scientificName}</p>
            
            <div className="grid grid-cols-3 gap-4 text-center mb-8 bg-gray-50 p-4 rounded-lg">
              <div>
                <Zap className="mx-auto text-green-700 mb-1" />
                <h4 className="font-bold text-sm text-gray-800">{t('plantPage.detail.careLevel')}</h4>
                <p className="text-sm text-gray-600">{plant.careLevel}</p>
              </div>
              <div>
                <Maximize className="mx-auto text-green-700 mb-1" />
                <h4 className="font-bold text-sm text-gray-800">{t('plantPage.detail.size')}</h4>
                <p className="text-sm text-gray-600">{plant.size}</p>
              </div>
              <div>
                <Sprout className="mx-auto text-green-700 mb-1" />
                <h4 className="font-bold text-sm text-gray-800">{t('plantPage.detail.family')}</h4>
                <p className="text-sm text-gray-600">{plant.family}</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('plantPage.detail.description')}</h2>
            <p className="text-gray-600 leading-relaxed mb-10">{plant.description}</p>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('plantPage.detail.whereToBuy')}</h2>
            <div className="space-y-3">
              {plant.stores.map((store, index) => (
                <a key={index} href={store.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all">
                  <span className="font-semibold text-gray-700">{store.name}</span>
                  <div className="flex items-center gap-2 text-green-700">
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