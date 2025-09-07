import { Link } from 'react-router-dom';
import type { FC } from 'react';
import type { Plant } from '../data/plants'; // Sesuaikan path

interface PlantCardProps {
  plant: Plant;
}

const PlantCard: FC<PlantCardProps> = ({ plant }) => {
  return (
    // UBAH: Wrapper utama diubah menjadi <div> agar bisa menampung tombol terpisah
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Gambar tetap bisa diklik */}
      <Link to={`/plants/${plant.id}`}>
        <img src={plant.imageUrl} alt={plant.name} className="w-full h-64 object-cover" />
      </Link>
      
      {/* UBAH: Area konten dibuat flex untuk mendorong tombol ke bawah */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* Judul tetap bisa diklik */}
          <Link to={`/plants/${plant.id}`}>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">{plant.name}</h3>
          </Link>
          <p className="text-gray-500 text-sm italic">{plant.scientificName}</p>
        </div>
        
        {/* BARU: Tombol "Lihat Detail" ditambahkan di sini */}
        <div className="mt-4">
          <Link
            to={`/plants/${plant.id}`}
            className="inline-block w-full text-center bg-green-700 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-800 transition-colors text-sm"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;