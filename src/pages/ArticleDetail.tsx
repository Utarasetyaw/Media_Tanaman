import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { articles } from '../data/articles'; // Sesuaikan path
import ArticleCard from '../components/ArticleCard'; // Sesuaikan path
import { ArrowLeft, User, Calendar } from 'lucide-react';

// Import komponen iklan
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const article = articles.find(a => a.id === parseInt(id || ''));
  
  const relatedArticles = articles.filter(a => a.category === article?.category && a.id !== article?.id).slice(0, 3);

  if (!article) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Artikel tidak ditemukan</h2>
        <Link to="/articles" className="text-green-700 mt-4 inline-block">Kembali ke daftar artikel</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen relative">
      <VerticalAd position="left" />
      <VerticalAd position="right" />

      {/* UBAH: Kembalikan max-w-7xl dan mx-auto untuk mencegah konten menutupi iklan */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/articles" className="inline-flex items-center gap-2 text-green-800 font-semibold hover:underline mb-8">
          <ArrowLeft size={20} />
          {t('articlePage.detail.backLink')}
        </Link>
        
        <article>
          <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">{article.category}</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{article.title}</h1>
          <div className="flex items-center gap-6 text-gray-500 text-sm mb-8">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{t('articlePage.detail.by')} {article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{t('articlePage.detail.publishedOn')} {new Date(article.publishedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <img src={article.imageUrl} alt={article.title} className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-lg mb-8" />

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {article.content.trim().split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
        
        <div className="my-16">
          <HorizontalAd />
        </div>

        {relatedArticles.length > 0 && (
          <section className="border-t border-gray-200 pt-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">{t('articlePage.detail.relatedArticles')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map(related => <ArticleCard key={related.id} article={related} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ArticleDetail;