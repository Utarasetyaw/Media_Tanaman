import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, Calendar } from 'lucide-react';

// Impor tipe data, API service, dan komponen yang relevan
import type { Article } from '../types/article';
import api from '../services/apiService';
import ArticleCard from '../components/ArticlesCard'; // Pastikan nama & path benar
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';

// Ganti bahasa ini sesuai state global Anda nantinya
const lang: 'id' | 'en' = 'id';

// Fungsi untuk mengambil detail satu artikel dari API
const fetchArticleById = async (id: string): Promise<Article> => {
  const { data } = await api.get(`/articles/${id}`);
  return data;
};

// Fungsi untuk mengambil artikel terkait (berdasarkan kategori)
const fetchRelatedArticles = async (categoryId: number, currentArticleId: number): Promise<Article[]> => {
  // Ambil 4 artikel, lalu filter satu yang sedang dilihat
  const { data } = await api.get(`/articles?categoryId=${categoryId}&limit=4`);
  // Filter untuk memastikan artikel saat ini tidak muncul di daftar terkait
  return data.data.filter((article: Article) => article.id !== currentArticleId);
};


const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  // 1. Query pertama untuk mengambil data artikel utama
  const { data: article, isLoading, isError } = useQuery<Article, Error>({
    queryKey: ['article', id],
    queryFn: () => fetchArticleById(id!),
    enabled: !!id, // Query hanya akan berjalan jika 'id' ada
  });

  // 2. Query kedua untuk mengambil artikel terkait
  //    Query ini hanya aktif (enabled) setelah query pertama berhasil dan kita mendapatkan categoryId
  const { data: relatedArticles } = useQuery<Article[], Error>({
    queryKey: ['relatedArticles', article?.category.id],
    queryFn: () => fetchRelatedArticles(article!.category.id, article!.id),
    enabled: !!article, // Hanya berjalan jika 'article' sudah ada
  });

  // Tampilan saat loading
  if (isLoading) {
    return (
      <div className="text-center py-20 bg-[#003938] min-h-screen text-white">
        <h2 className="text-2xl font-bold">Loading Article...</h2>
      </div>
    );
  }
  
  // Tampilan jika terjadi error atau artikel tidak ditemukan
  if (isError || !article) {
    return (
      <div className="text-center py-20 bg-[#003938] min-h-screen text-white">
        <h2 className="text-2xl font-bold">Artikel tidak ditemukan</h2>
        <Link to="/articles" className="text-lime-400 mt-4 inline-block hover:underline">Kembali ke daftar artikel</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#003938] text-white min-h-screen relative">
      <VerticalAd position="left" />
      <VerticalAd position="right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/articles" className="inline-flex items-center gap-2 text-lime-400 font-semibold hover:underline mb-8">
          <ArrowLeft size={20} />
          {t('articlePage.detail.backLink')}
        </Link>
        
        <article>
          <span className="inline-block bg-lime-200 text-lime-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
            {article.category.name[lang]}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-100 mb-4">{article.title[lang]}</h1>
          <div className="flex items-center gap-6 text-gray-400 text-sm mb-8">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{t('articlePage.detail.by')} {article.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              {/* Asumsi 'createdAt' ada di tipe data 'Article' Anda */}
              <span>{t('articlePage.detail.publishedOn')} {new Date(article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <img src={article.imageUrl} alt={article.title[lang]} className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-lg mb-8" />

          {/* Asumsi 'content' ada di tipe data 'Article' Anda */}
          <div className="prose prose-lg max-w-none text-gray-300 leading-relaxed">
            {article.content[lang].trim().split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
        
        <div className="my-16">
          <HorizontalAd />
        </div>

        {relatedArticles && relatedArticles.length > 0 && (
          <section className="border-t-2 border-lime-400/30 pt-12">
            <h2 className="text-3xl font-bold text-lime-400 text-center mb-8">{t('articlePage.detail.relatedArticles')}</h2>
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