import type { FC } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Zap, Maximize, Sprout, ExternalLink } from 'lucide-react';
import { usePlantDetail } from '../hooks/usePlantDetail'; // Hook baru
import { plantDetailTranslations } from '../assets/plantDetail.i18n'; // Translasi baru
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';

const PlantDetail: FC = () => {
  const { lang: currentLang } = useOutletContext<{ lang: 'id' | 'en' }>();
  const t = (key: keyof typeof plantDetailTranslations.id) => plantDetailTranslations[currentLang]?.[key] || key;

  const { plant, isLoading, isError } = usePlantDetail();

  if (isLoading) {
    return <div className="text-center py-20 bg-[#003938] min-h-screen text-white"><h2 className="text-2xl font-bold">{t('loading')}</h2></div>;
  }
  if (isError || !plant) {
    return (
      <div className="text-center py-20 bg-[#003938] min-h-screen text-white">
        <h2 className="text-2xl font-bold">{t('error_title')}</h2>
        <Link to="/plants" className="text-lime-400 mt-4 inline-block hover:underline">{t('back_link')}</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#003938] min-h-screen relative">
      <VerticalAd position="left" />
      <VerticalAd position="right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link to="/plants" className="inline-flex items-center gap-2 text-lime-400 font-semibold hover:underline mb-8">
          <ArrowLeft size={20} />{t('back_link')}
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Kolom Gambar */}
          <div className="lg:sticky lg:top-24 h-fit">
             <div className="aspect-[4/5] bg-black/20 rounded-2xl shadow-lg overflow-hidden border-2 border-lime-400/80">
                <img src={plant.imageUrl} alt={plant.name[currentLang]} className="w-full h-full object-cover" />
             </div>
          </div>
          {/* Kolom Info */}
          <div className="flex flex-col">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white">{plant.name[currentLang]}</h1>
            <p className="text-xl text-gray-400 italic mt-2 mb-6">{plant.scientificName}</p>
            
            <div className="grid grid-cols-3 gap-4 text-center mb-8 bg-[#004A49]/60 p-4 rounded-lg border-2 border-lime-400/50">
              <div><Zap className="mx-auto text-lime-400 mb-1" /><h4 className="font-bold text-xs sm:text-sm text-gray-200">{t('care_level')}</h4><p className="text-xs sm:text-sm text-gray-300">{plant.careLevel}</p></div>
              <div><Maximize className="mx-auto text-lime-400 mb-1" /><h4 className="font-bold text-xs sm:text-sm text-gray-200">{t('size')}</h4><p className="text-xs sm:text-sm text-gray-300">{plant.size}</p></div>
              <div><Sprout className="mx-auto text-lime-400 mb-1" /><h4 className="font-bold text-xs sm:text-sm text-gray-200">{t('family')}</h4><p className="text-xs sm:text-sm text-gray-300">{plant.family.name[currentLang]}</p></div>
            </div>

            <h2 className="font-serif text-2xl font-bold text-lime-400 mb-4">{t('description')}</h2>
            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed mb-10">{plant.description[currentLang]}</div>

            <h2 className="font-serif text-2xl font-bold text-lime-400 mb-4">{t('where_to_buy')}</h2>
            <div className="space-y-3">
              {plant.stores.map((store, index) => (
                <a key={index} href={store.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-[#004A49]/60 p-4 rounded-lg border-2 border-lime-400/50 hover:border-lime-500 hover:bg-[#004A49]/90 transition-all">
                  <span className="font-semibold text-gray-200">{store.name}</span>
                  <div className="flex items-center gap-2 text-lime-400">
                    <span className="text-sm font-medium">{t('visit_store')}</span>
                    <ExternalLink size={16} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-16"><HorizontalAd /></div>
      </div>
    </div>
  );
};

export default PlantDetail;