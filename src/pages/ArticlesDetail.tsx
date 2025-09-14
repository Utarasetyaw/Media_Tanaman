import type { FC } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowLeft, User, Calendar } from 'lucide-react';
import { useArticleDetail } from '../hooks/useArticleDetail';
import ArticleCard from '../components/ArticlesCard';
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';
import { articleDetailTranslations } from '../assets/articleDetail.i18n';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ArticleDetail: FC = () => {
  const { lang: currentLang } = useOutletContext<{ lang: 'id' | 'en' }>();
  
  const t = (key: keyof typeof articleDetailTranslations.id): string => {
      return articleDetailTranslations[currentLang]?.[key] || key;
  };

  const { article, relatedArticles, isLoading, isError } = useArticleDetail();

  if (isLoading) {
    return (
      <div className="text-center py-20 bg-[#003938] min-h-screen text-white">
        <h2 className="text-2xl font-bold">{t('loading')}</h2>
      </div>
    );
  }
  
  if (isError || !article) {
    return (
      <div className="text-center py-20 bg-[#003938] min-h-screen text-white">
        <h2 className="text-2xl font-bold">{t('error_title')}</h2>
        <Link to="/articles" className="text-lime-400 mt-4 inline-block hover:underline">{t('back_link')}</Link>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#003938] text-white min-h-screen">
      <VerticalAd position="left" />
      <VerticalAd position="right" />

      {/* --- BAGIAN INI YANG DIPERBAIKI --- */}
      {/* Menambahkan padding "2xl:px-60" agar layout konsisten dengan halaman lainnya */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-60 py-12 sm:py-16">
        <Link to="/articles" className="inline-flex items-center gap-2 text-lime-400 font-semibold hover:underline mb-8">
          <ArrowLeft size={20} />
          {t('back_link')}
        </Link>
        
        <article>
          <span className="inline-block bg-lime-200 text-lime-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
            {article.category.name[currentLang]}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-gray-100 mb-4 leading-tight">
            {article.title[currentLang]}
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-gray-400 text-sm mb-8">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{t('by')} {article.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{t('published_on')} {new Date(article.createdAt).toLocaleDateString(currentLang, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="aspect-video bg-black/20 rounded-2xl shadow-lg mb-8 overflow-hidden">
            <img src={article.imageUrl} alt={article.title[currentLang]} className="w-full h-full object-cover" />
          </div>

          <div className="prose prose-lg prose-invert max-w-none text-gray-300 leading-relaxed">
             <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content[currentLang]}
             </ReactMarkdown>
          </div>
        </article>
        
        <div className="my-16">
          <HorizontalAd />
        </div>

        {relatedArticles && relatedArticles.length > 0 && (
          <section className="border-t-2 border-lime-400/30 pt-12">
            <h2 className="text-3xl font-bold text-lime-400 text-center mb-8">{t('related_articles')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map(related => <ArticleCard key={related.id} article={related} lang={currentLang} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ArticleDetail;