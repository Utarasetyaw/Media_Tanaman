import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { Plant } from '../types/plant';
// Impor file translasi
import { cardTranslations } from '../assets/card.i18n';

// Definisikan props untuk menerima bahasa
interface PlantCardProps {
  plant: Plant;
  lang: 'id' | 'en';
}

const PlantCard: FC<PlantCardProps> = ({ plant, lang }) => {
  // Fungsi translasi lokal
  const t = (key: keyof typeof cardTranslations.id): string => {
    return cardTranslations[lang]?.[key] || key;
  };

  return (
    <div className="border-2 border-lime-400/50 bg-[#004A49]/60 rounded-lg shadow-sm overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:shadow-lime-400/20 hover:-translate-y-1">
      <Link to={`/plants/${plant.id}`} className="block group overflow-hidden">
        {/* REVISI: Rasio aspek diubah menjadi video (16:9) agar konsisten */}
        <div className="aspect-video bg-black/20">
            <img
            src={plant.imageUrl}
            alt={plant.name[lang]}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
        </div>
      </Link>
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="font-serif font-bold text-base sm:text-lg text-gray-100 truncate">
            <Link to={`/plants/${plant.id}`} className="hover:text-lime-400 transition-colors">
              {plant.name[lang]}
            </Link>
          </h3>
          <p className="font-sans text-gray-400 text-sm italic mt-1 truncate">
            {plant.scientificName}
          </p>
        </div>
        <div className="mt-4">
          <Link
            to={`/plants/${plant.id}`}
            className="font-sans inline-block w-full text-center bg-lime-300 text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-lime-400 transition-colors text-sm"
          >
            {t('view_detail')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;