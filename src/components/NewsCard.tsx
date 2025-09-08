import { Link } from 'react-router-dom';
import type { FC } from 'react';
import type { Article } from '../types'; // Sesuaikan path jika perlu

interface ArticleCardProps {
  article: Article;
  layout?: 'default' | 'horizontal';
}

const ArticleCard: FC<ArticleCardProps> = ({ article, layout = 'default' }) => {
  const { id, title, excerpt, imageUrl, category } = article;

  // Layout Horizontal
  if (layout === 'horizontal') {
    return (
      // PERUBAHAN: Latar belakang dan border disesuaikan untuk tema gelap
      <div className="bg-[#004A49]/60 border-2 border-lime-400 rounded-lg shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-xl md:flex">
        <div className="md:w-1/3">
          <Link to={`/news/${id}`}>
            <img src={imageUrl} alt={title} className="w-full h-56 md:h-full object-cover" />
          </Link>
        </div>
        <div className="p-6 md:w-2/3 flex flex-col">
          <div className="flex-grow">
            {/* PERUBAHAN: Warna tag kategori disesuaikan */}
            <span className="inline-block bg-lime-200 text-lime-800 text-xs font-semibold px-2 py-1 rounded-full mb-2">{category}</span>
            <Link to={`/news/${id}`}>
              {/* PERUBAHAN: Warna teks dan hover disesuaikan */}
              <h3 className="text-2xl font-bold text-gray-100 mb-2 group-hover:text-lime-400 transition-colors">{title}</h3>
            </Link>
            {/* PERUBAHAN: Warna teks disesuaikan */}
            <p className="text-gray-300 text-sm">{excerpt}</p>
          </div>
          {/* PERUBAHAN: Warna border internal dan tombol disesuaikan */}
          <div className="mt-4 pt-4 border-t border-lime-400/30">
            <Link
              to={`/news/${id}`}
              className="inline-block w-full text-center bg-lime-300 text-lime-900 font-bold px-4 py-2 rounded-lg hover:bg-lime-400 transition-colors text-sm"
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
    // PERUBAHAN: Latar belakang dan border disesuaikan untuk tema gelap
    <div className="bg-[#004A49]/60 border-2 border-lime-400 rounded-lg shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full">
      <Link to={`/news/${id}`}>
        <img src={imageUrl} alt={title} className="w-full h-56 object-cover" />
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* PERUBAHAN: Warna tag kategori disesuaikan */}
          <span className="inline-block bg-lime-200 text-lime-800 text-xs font-semibold px-2 py-1 rounded-full mb-2">{category}</span>
          <Link to={`/news/${id}`}>
            {/* PERUBAHAN: Warna teks dan hover disesuaikan */}
            <h3 className="text-xl font-bold text-gray-100 mb-2 group-hover:text-lime-400 transition-colors">{title}</h3>
          </Link>
          {/* PERUBAHAN: Warna teks disesuaikan */}
          <p className="text-gray-300 text-sm">{excerpt}</p>
        </div>
        {/* PERUBAHAN: Warna border internal dan tombol disesuaikan */}
        <div className="mt-4 pt-4 border-t border-lime-400/30">
          <Link
            to={`/news/${id}`}
            className="inline-block w-full text-center bg-lime-300 text-lime-900 font-bold px-4 py-2 rounded-lg hover:bg-lime-400 transition-colors text-sm"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;