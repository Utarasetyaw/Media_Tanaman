import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { articles } from '../data/articles';
import ArticleCard from '../components/ArticleCard';

// Import komponen iklan
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';

const ArticlePage: FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    // Mengambil semua kategori unik dari data artikel
    const allCategories = articles.map(article => article.category);
    return ['All', ...Array.from(new Set(allCategories))];
  }, []);

  const filteredArticles = useMemo(() => {
    // Filter artikel yang bukan 'isFeatured' untuk ditampilkan di halaman ini
    const baseArticles = articles.filter(article => !article.isFeatured);
    
    // Jika kategori 'All' dipilih, tampilkan semua artikel
    if (selectedCategory === 'All') {
      return baseArticles;
    }
    
    // Jika kategori lain dipilih, filter berdasarkan kategori tersebut
    return baseArticles.filter(article => article.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="bg-stone-50 min-h-screen relative">
      {/* Iklan Vertikal */}
      <VerticalAd position="left" />
      <VerticalAd position="right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-green-800 mb-4">{t('articlePage.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('articlePage.description')}</p>
        </div>
        
        <div className="flex justify-center flex-wrap gap-3 mb-12">
          {categories.map(category => (
            <button 
              key={category} 
              onClick={() => setSelectedCategory(category)} 
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                selectedCategory === category 
                  ? 'bg-green-800 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-green-100 border border-gray-300'
              }`}
            >
              {category === 'All' ? t('articlePage.allCategory') : category}
            </button>
          ))}
        </div>

        {/* Iklan Horizontal */}
        <div className="mb-12">
            <HorizontalAd />
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredArticles.map(article => <ArticleCard key={article.id} article={article} />)}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-16">
            <h3 className="text-2xl font-semibold mb-2">{t('articlePage.noArticles')}</h3>
            <p>{t('articlePage.noArticlesText', { category: selectedCategory })}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlePage;