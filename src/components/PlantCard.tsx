import { Link } from 'react-router-dom';
import type { FC } from 'react';
import type { Plant } from '../data/plants'; // Sesuaikan path jika perlu

interface PlantCardProps {
  plant: Plant;
}

const PlantCard: FC<PlantCardProps> = ({ plant }) => {
  return (
    // PERUBAHAN: Latar belakang, border, dan shadow disesuaikan untuk tema gelap
    <div className="bg-[#004A49]/60 border-2 border-lime-400 rounded-lg shadow-lg overflow-hidden flex flex-col h-full group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link to={`/plants/${plant.id}`}>
        <img src={plant.imageUrl} alt={plant.name} className="w-full h-64 object-cover" />
      </Link>
      
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <Link to={`/plants/${plant.id}`}>
            {/* PERUBAHAN: Warna teks dan hover disesuaikan */}
            <h3 className="text-xl font-bold text-gray-100 group-hover:text-lime-400 transition-colors">{plant.name}</h3>
          </Link>
          {/* PERUBAHAN: Warna teks disesuaikan */}
          <p className="text-gray-300 text-sm italic">{plant.scientificName}</p>
        </div>
        
        <div className="mt-4">
          {/* PERUBAHAN: Warna tombol diubah ke lime */}
          <Link
            to={`/plants/${plant.id}`}
            className="inline-block w-full text-center bg-lime-300 text-lime-900 font-bold px-4 py-2 rounded-lg hover:bg-lime-400 transition-colors text-sm"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;