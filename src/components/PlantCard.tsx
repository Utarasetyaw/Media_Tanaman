import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { Plant } from '../types/plant'; // REVISI: Impor tipe Plant yang benar dari API

// Ganti bahasa ini sesuai state global Anda nantinya
const lang: 'id' | 'en' = 'id';

interface PlantCardProps {
  plant: Plant;
}

const PlantCard: FC<PlantCardProps> = ({ plant }) => {
  return (
    <div className="border-2 border-lime-400 bg-[#004A49]/60 rounded-lg shadow-sm overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link to={`/plants/${plant.id}`} className="block aspect-square overflow-hidden">
        <img
          src={plant.imageUrl}
          alt={plant.name[lang]}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* REVISI: Gunakan plant.name[lang] untuk mengakses nama */}
          <h3 className="font-serif font-bold text-lg text-gray-100 truncate">
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
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;