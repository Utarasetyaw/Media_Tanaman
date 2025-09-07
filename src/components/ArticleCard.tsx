import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../types'; // Menggunakan tipe data terpusat

interface ArticleCardProps {
  article: Article;
  layout?: 'default' | 'horizontal';
}

const ArticleCard: FC<ArticleCardProps> = ({ article, layout = 'default' }) => {
  const { id, title, excerpt, imageUrl, category } = article;

  // Layout Horizontal
  if (layout === 'horizontal') {
    return (
      // UBAH: Wrapper utama menjadi <div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl md:flex">
        {/* Gambar tetap bisa diklik */}
        <div className="md:w-1/3">
          <Link to={`/news/${id}`}>
            <img src={imageUrl} alt={title} className="w-full h-56 md:h-full object-cover" />
          </Link>
        </div>
        {/* UBAH: Area konten menjadi flex untuk mendorong tombol ke bawah */}
        <div className="p-6 md:w-2/3 flex flex-col">
          <div className="flex-grow">
            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full mb-2">{category}</span>
            {/* Judul tetap bisa diklik */}
            <Link to={`/news/${id}`}>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">{title}</h3>
            </Link>
            <p className="text-gray-600 text-sm">{excerpt}</p>
          </div>
          {/* BARU: Tombol ditambahkan di sini */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              to={`/news/${id}`}
              className="inline-block w-full text-center bg-green-700 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-800 transition-colors text-sm"
            >
              Lihat Detail
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Layout Default (Vertikal)
  return (
    // UBAH: Wrapper utama menjadi <div> dan dibuat flex
    <div className="bg-white rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full">
      {/* Gambar tetap bisa diklik */}
      <Link to={`/news/${id}`}>
        <img src={imageUrl} alt={title} className="w-full h-56 object-cover" />
      </Link>
      {/* UBAH: Area konten menjadi flex untuk mendorong tombol ke bawah */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full mb-2">{category}</span>
          {/* Judul tetap bisa diklik */}
          <Link to={`/news/${id}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">{title}</h3>
          </Link>
          <p className="text-gray-600 text-sm">{excerpt}</p>
        </div>
        {/* BARU: Tombol ditambahkan di sini */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            to={`/news/${id}`}
            className="inline-block w-full text-center bg-green-700 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-800 transition-colors text-sm"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;