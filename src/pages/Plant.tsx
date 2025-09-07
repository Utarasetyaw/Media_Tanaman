import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { plants } from '../data/plants';
import PlantCard from '../components/PlantCard';
import { Search } from 'lucide-react';

// BARU: Import komponen iklan
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
    // UBAH: Wrapper utama untuk menampung iklan vertikal
    <div className="bg-stone-50 min-h-screen relative">

      {/* BARU: Iklan Vertikal */}
      <VerticalAd position="left" />
      <VerticalAd position="right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-green-800 mb-4">{t('plantPage.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('plantPage.description')}</p>
        </div>
        
        <div className="mb-12 flex justify-center">
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              placeholder={t('plantPage.searchPlaceholder')}
              className="w-full py-3 pl-12 pr-4 text-base border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {/* BARU: Iklan Horizontal */}
        <div className="mb-12">
            <HorizontalAd />
        </div>

        {filteredPlants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredPlants.map(plant => <PlantCard key={plant.id} plant={plant} />)}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg py-16">
            {t('plantPage.notFound', { searchTerm })}
          </p>
        )}
      </div>
    </div>
  );
};

export default PlantPage;