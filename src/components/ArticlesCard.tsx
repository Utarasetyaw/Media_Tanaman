import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../types/article';
// Impor file translasi yang baru
import { cardTranslations } from '../assets/card.i18n';

// Definisikan props untuk menerima bahasa
interface ArticleCardProps {
  article: Article;
  layout?: 'default' | 'horizontal';
  lang: 'id' | 'en'; // Prop bahasa sekarang wajib
}

const ArticleCard: FC<ArticleCardProps> = ({ article, layout = 'default', lang }) => {
  // Fungsi translasi lokal
  const t = (key: keyof typeof cardTranslations.id): string => {
    return cardTranslations[lang]?.[key] || key;
  };
   
  // Mengambil data dari objek artikel berdasarkan bahasa dari props
  const categoryName = article.category?.name[lang] || 'Uncategorized';
  const titleText = article.title[lang];
  const excerptText = article.excerpt[lang];

  // Layout Horizontal
  if (layout === 'horizontal') {
    return (
      <div className="bg-[#004A49]/60 border-2 border-lime-400/50 rounded-lg shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-xl md:flex">
        <div className="md:w-2/5 flex-shrink-0">
          <Link to={`/articles/${article.id}`}>
            <div className="aspect-video h-full bg-black/20">
                <img src={article.imageUrl} alt={titleText} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
          </Link>
        </div>
        <div className="p-4 sm:p-6 md:w-3/5 flex flex-col">
          <div className="flex-grow">
            <span className="inline-block bg-lime-200 text-lime-800 text-xs font-semibold px-2 py-1 rounded-full mb-2">{categoryName}</span>
            <Link to={`/articles/${article.id}`}>
              {/* REVISI: Menambahkan line-clamp-2 untuk memotong judul yang panjang */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-100 mb-2 group-hover:text-lime-400 transition-colors line-clamp-2">{titleText}</h3>
            </Link>
            <p className="text-gray-300 text-sm line-clamp-3 sm:line-clamp-4">{excerptText}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-lime-400/30">
            <Link to={`/articles/${article.id}`} className="inline-block w-full text-center bg-lime-300 text-lime-900 font-bold px-4 py-2 rounded-lg hover:bg-lime-400 transition-colors text-sm">
              {t('view_detail')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Layout Default (Vertikal)
  return (
    <div className="bg-[#004A49]/60 border-2 border-lime-400/50 rounded-lg shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-lime-400/20 hover:-translate-y-1 flex flex-col h-full">
      <Link to={`/articles/${article.id}`}>
        <div className="aspect-video bg-black/20">
            <img src={article.imageUrl} alt={titleText} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
      </Link>
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <span className="inline-block bg-lime-200 text-lime-800 text-xs font-semibold px-2 py-1 rounded-full mb-2">{categoryName}</span>
          <Link to={`/articles/${article.id}`}>
            {/* REVISI: Menambahkan line-clamp-2 untuk memotong judul yang panjang */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-100 mb-2 group-hover:text-lime-400 transition-colors line-clamp-2">{titleText}</h3>
          </Link>
          <p className="text-gray-300 text-sm line-clamp-3">{excerptText}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-lime-400/30">
          <Link to={`/articles/${article.id}`} className="inline-block w-full text-center bg-lime-300 text-lime-900 font-bold px-4 py-2 rounded-lg hover:bg-lime-400 transition-colors text-sm">
            {t('view_detail')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;