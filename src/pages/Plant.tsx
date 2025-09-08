import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { plants } from '../data/plants';
import PlantCard from '../components/PlantCard';
import { Search } from 'lucide-react';

// Import komponen iklan
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';

const PlantPage: FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlants = useMemo(() => {
    if (!searchTerm.trim()) return plants;
    const lowercasedFilter = searchTerm.toLowerCase();
    return plants.filter(plant =>
      plant.name.toLowerCase().includes(lowercasedFilter) ||
      plant.scientificName.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm]);

  return (
    // PERUBAHAN: Latar belakang diubah ke hijau tua
    <div className="bg-[#003938] min-h-screen relative">

      <VerticalAd position="left" />
      <VerticalAd position="right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-16">
        <div className="text-center mb-12">
          {/* PERUBAHAN: Warna judul & font disesuaikan */}
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-lime-400 mb-4">{t('plantPage.title')}</h2>
          {/* PERUBAHAN: Warna deskripsi disesuaikan */}
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">{t('plantPage.description')}</p>
        </div>
        
        <div className="mb-12 flex justify-center">
          <div className="relative w-full max-w-lg">
            {/* PERUBAHAN: Styling search bar disesuaikan untuk tema gelap */}
            <input
              type="text"
              placeholder={t('plantPage.searchPlaceholder')}
              className="w-full py-3 pl-12 pr-4 text-base bg-[#004A49]/60 border-2 border-lime-400 rounded-full text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-[#004A49]/80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-lime-400" size={20} />
          </div>
        </div>

        <div className="mb-12">
            <HorizontalAd />
        </div>

        {filteredPlants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {/* Catatan: Komponen PlantCard juga perlu disesuaikan warnanya agar cocok dengan tema gelap ini */}
            {filteredPlants.map(plant => <PlantCard key={plant.id} plant={plant} />)}
          </div>
        ) : (
          // PERUBAHAN: Warna teks "not found" disesuaikan
          <p className="text-center text-gray-400 text-lg py-16">
            {t('plantPage.notFound', { searchTerm })}
          </p>
        )}
      </div>
    </div>
  );
};

export default PlantPage;