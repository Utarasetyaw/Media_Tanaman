import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

// Impor dipisahkan antara fungsi (useHomeData) dan tipe data
import { useHomeData } from '../hooks/useHomeData';
import type { Article, Event, Plant, Category, BannerImage, LocalizedString } from '../hooks/useHomeData';
import api from '../services/apiService';

// Import komponen UI lainnya
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';
import BannerAd from '../components/BannerAd';

// Ganti bahasa ini sesuai state global Anda nantinya
const lang: 'id' | 'en' = 'id';

// Tipe data spesifik untuk Top Headline
interface HeadlineArticle {
  id: number;
  title: LocalizedString;
}

// --- Ikon SVG ---
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const LocationMarkerIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>);

// --- Komponen-komponen UI ---
const ArticleCard: React.FC<{ article: Article }> = ({ article }) => (
  <div className="border-2 border-lime-400 bg-[#004A49]/60 rounded-lg shadow-sm overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <Link to={`/news/${article.id}`}>
      <img src={article.imageUrl} alt={article.title[lang]} className="w-full h-40 object-cover" />
    </Link>
    <div className="p-4 flex flex-col flex-grow">
      <div className="flex-grow">
        <Link to={`/news/${article.id}`} className="hover:text-lime-400 transition-colors">
          <h3 className="font-serif font-bold text-md text-gray-100">{article.title[lang]}</h3>
        </Link>
        <p className="font-sans text-gray-300 mt-2 text-sm">{article.excerpt[lang]}</p>
      </div>
      <div className="mt-4">
        <Link to={`/news/${article.id}`} className="font-sans inline-block w-full text-center bg-lime-300 text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-lime-400 transition-colors text-sm">
          Lihat Detail
        </Link>
      </div>
    </div>
  </div>
);

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const formattedDate = new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div className="bg-[#004A49]/60 rounded-lg shadow-md overflow-hidden border-2 border-lime-400">
      <div className="flex flex-col md:flex-row">
        <Link to={`/events/${event.id}`} className="block md:w-2/5 flex-shrink-0">
          <img src={event.imageUrl} alt={event.title[lang]} className="w-full h-48 md:h-full object-cover" />
        </Link>
        <div className="p-4 sm:p-6 flex flex-col justify-between flex-grow">
          <div>
            <p className="font-sans inline-block bg-lime-100 text-lime-800 text-xs font-bold px-3 py-1 rounded-full mb-3">EVENT BERJALAN</p>
            <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-gray-100">
              <Link to={`/events/${event.id}`} className="hover:text-lime-400 transition-colors">{event.title[lang]}</Link>
            </h3>
            <div className="font-sans mt-4 space-y-2 text-gray-300">
              <div className="flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-gray-400" /><span>{formattedDate}</span></div>
              <div className="flex items-center gap-2"><LocationMarkerIcon className="w-5 h-5 text-gray-400" /><span>{event.location}</span></div>
            </div>
          </div>
          <div className="mt-6">
            <Link to={`/events/${event.id}`} className="font-sans inline-block bg-lime-300 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-lime-400 transition-colors">
              Lihat Event
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarLink: React.FC<{ article: HeadlineArticle }> = ({ article }) => (
    <Link to={`/news/${article.id}`} className="font-serif font-semibold text-gray-200 py-3 border-b-2 border-lime-400 block transition-colors duration-200 hover:text-lime-400">
        {article.title[lang]}
    </Link>
);

const HeroBanner: React.FC<{ banners: BannerImage[] }> = ({ banners }) => {
    if (!banners || banners.length === 0) {
        return <div className="w-full rounded-lg shadow-xl bg-gray-800 min-h-[300px] md:h-[400px]"></div>;
    }
    return (
        <div className="w-full rounded-lg shadow-xl overflow-hidden relative min-h-[300px] md:h-[400px]">
            <img src={banners[0].imageUrl} alt="Banner Utama" className="absolute inset-0 w-full h-full object-cover" />
        </div>
    );
};

const UpcomingEvent: React.FC<{ event: Event }> = ({ event }) => (
  <section className="py-12">
    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lime-400 text-center mb-8">Event Komunitas Terdekat</h2>
    <div className="max-w-4xl mx-auto">
      <EventCard event={event} />
    </div>
  </section>
);

const FeaturedPlant: React.FC<{ plant: Plant }> = ({ plant }) => (
  <section className="py-12">
    <div className="max-w-4xl mx-auto bg-[#004A49]/60 p-4 sm:p-6 md:p-8 rounded-lg border-2 border-lime-400 grid md:grid-cols-2 gap-8 items-center">
      <div className="w-full h-64 md:h-full rounded-lg overflow-hidden">
        <img src={plant.imageUrl} alt={plant.name[lang]} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col justify-center">
        <h3 className="font-sans text-lime-400 font-bold uppercase text-sm tracking-wider">Tanaman Pilihan Minggu Ini</h3>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-100 my-2">{plant.name[lang]}</h2>
        <p className="font-sans text-gray-300 leading-relaxed">{plant.description[lang]}</p>
        <div className="mt-6">
          <Link to={`/plants/${plant.id}`} className="font-sans inline-block bg-lime-300 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-lime-400 transition-colors">
            Lihat Detail Tanaman
          </Link>
        </div>
      </div>
    </div>
  </section>
);

interface Filters {
  categoryId?: number | string;
  plantTypeId?: number | string;
}

interface CategoryFiltersProps {
  categories: Category[];
  plantTypes: Category[];
  onFilterChange: (newFilters: Partial<Filters>) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({ categories, plantTypes, onFilterChange }) => {
  const [activeType, setActiveType] = useState<number | string>('all');
  
  const allPlantTypes = [{ id: 'all', name: { id: 'Semua Jenis', en: 'All Types' } }, ...plantTypes];
  
  const handleTypeClick = (typeId: number | string) => {
    setActiveType(typeId);
    onFilterChange({ plantTypeId: typeId === 'all' ? '' : typeId });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ categoryId: e.target.value });
  };

  return (
    <div className="font-sans flex flex-col md:flex-row md:items-center gap-4 my-8">
      <select 
        onChange={handleCategoryChange} 
        className="bg-[#004A49]/60 border-2 border-lime-400 rounded-lg px-4 py-2 text-sm font-medium text-gray-200 hover:bg-[#004A49]/80 focus:ring-lime-400 focus:border-lime-400"
      >
        <option value="">Semua Kategori Artikel</option>
        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name[lang]}</option>)}
      </select>
      
      <div className="hidden md:block h-6 w-px bg-lime-400"></div>

      <div className="w-full overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap pb-2">
          {allPlantTypes.map(pt => (
            <button key={pt.id} onClick={() => handleTypeClick(pt.id)}
              className={`font-sans px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${activeType === pt.id ? 'bg-lime-300 text-gray-900 border-lime-300' : 'bg-[#004A49]/60 text-gray-200 border-lime-400 hover:bg-[#004A49]/80'}`}>
              {pt.name[lang]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// =================================================================
// Komponen Utama Halaman Home
// =================================================================
const Home: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({});
  const [isScrollButtonVisible, setScrollButtonVisible] = useState(false);

  const { data: staticData, isLoading: isLoadingStatic, isError: isErrorStatic } = useHomeData();

  const fetchFilteredArticles = async ({ queryKey }: any) => {
    const [_key, currentFilters] = queryKey;
    const params = new URLSearchParams({ limit: '16' });
    if (currentFilters.categoryId) params.append('categoryId', String(currentFilters.categoryId));
    if (currentFilters.plantTypeId) params.append('plantTypeId', String(currentFilters.plantTypeId));
    const { data } = await api.get(`/articles?${params.toString()}`);
    return data;
  };

  const { data: filteredData, isLoading: isLoadingFiltered, isError: isErrorFiltered } = useQuery({
    queryKey: ['filteredArticles', filters],
    queryFn: fetchFilteredArticles,
  });

  useEffect(() => {
    const toggleVisibility = () => window.pageYOffset > 300 ? setScrollButtonVisible(true) : setScrollButtonVisible(false);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  const moreArticles = filteredData?.data || [];
  const articleChunks = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < moreArticles.length; i += 4) {
      chunks.push(moreArticles.slice(i, i + 4));
    }
    return chunks;
  }, [moreArticles]);

  if (isLoadingStatic) return <div className="h-screen w-full flex items-center justify-center bg-[#003938] text-white">Loading Page...</div>;
  if (isErrorStatic || !staticData) return <div className="h-screen w-full flex items-center justify-center bg-[#003938] text-red-400">Failed to load page data.</div>;

  const { mostViewedArticle, latestArticles, topHeadlines, runningEvents, plants, bannerImages, categories, plantTypes } = staticData;

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="relative w-full bg-[#003938]">
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 pt-8">
        <HeroBanner banners={bannerImages} />
        <CategoryFilters categories={categories} plantTypes={plantTypes} onFilterChange={handleFilterChange} />
      </div>
      
      <VerticalAd position="left" />
      <VerticalAd position="right" />
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4"><HorizontalAd /></div>

      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-8">
          <main className="lg:col-span-2">
            {mostViewedArticle && (
              <section>
                <img src={mostViewedArticle.imageUrl} alt={mostViewedArticle.title[lang]} className="w-full h-auto mb-4 rounded-lg shadow-md" />
                <div className="font-sans text-lime-400 font-bold uppercase text-sm tracking-wider">{mostViewedArticle.category.name[lang]}</div>
                <h2><Link to={`/news/${mostViewedArticle.id}`} className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-100 my-2 block hover:text-lime-400 transition-colors">{mostViewedArticle.title[lang]}</Link></h2>
                <p className="font-sans text-lg text-gray-300 leading-relaxed">{mostViewedArticle.excerpt[lang]}</p>
                <div className="mt-4"><Link to={`/news/${mostViewedArticle.id}`} className="font-sans inline-block bg-lime-300 text-gray-900 font-bold px-6 py-2 rounded-lg hover:bg-lime-400 transition-colors text-sm">Lihat Berita</Link></div>
              </section>
            )}
            <hr className="my-10 border-t-2 border-lime-400" />
            <section>
              <h2 className="font-serif text-2xl font-bold text-gray-100 mb-6">Berita Terbaru</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {latestArticles.map(article => <ArticleCard key={article.id} article={article} />)}
              </div>
            </section>
          </main>
          <aside className="mt-12 lg:mt-0 lg:pl-8 lg:border-l-2 lg:border-lime-400">
            <h3 className="font-serif text-lg font-bold uppercase text-lime-400 border-b-2 border-lime-400 pb-2 mb-6">Top Headlines</h3>
            <div className="flex flex-col">
              {topHeadlines.map(article => <SidebarLink key={`headline-${article.id}`} article={article} />)}
            </div>
            <div className="mt-6 flex flex-col gap-3"><BannerAd /><div className="hidden lg:flex flex-col gap-3"><BannerAd /><BannerAd /></div></div>
          </aside>
        </div>
      </div>
      
      <section className="mt-12 pt-8 border-t-2 border-lime-400">
        <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 pb-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lime-400 text-center mb-8">More For You 🌿</h2>
          {isLoadingFiltered ? (
            <div className="text-center text-white p-8 animate-pulse">Memuat artikel...</div>
          ) : isErrorFiltered ? (
            <div className="text-center text-red-400 p-8">Gagal memuat artikel.</div>
          ) : articleChunks.length > 0 ? (
            <div className="flex flex-col">
              {articleChunks.map((chunk, index) => (
                <React.Fragment key={`chunk-${index}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {chunk.map((article: Article) => <ArticleCard key={article.id} article={article} />)}
                  </div>
                  {index === 0 && runningEvents.length > 0 && <UpcomingEvent event={runningEvents[0]} />}
                  {index === 1 && plants.length > 0 && <FeaturedPlant plant={plants[0]} />}
                  {index < articleChunks.length - 1 && <div className="my-8"><HorizontalAd /></div>}
                  {index < articleChunks.length - 1 && <hr className="my-10 border-t-2 border-lime-400" />}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 p-8">Tidak ada artikel yang cocok dengan filter Anda.</p>
          )}
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4">
        <hr className="my-10 border-t-2 border-lime-400" />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8">
          <Link to="/news" className="font-sans w-full sm:w-auto text-center bg-lime-300 text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-lime-400 transition-colors text-lg">
            Lihat Berita Lebih Banyak
          </Link>
          {isScrollButtonVisible && (
            <button onClick={scrollToTop} className="font-sans w-full sm:w-auto bg-lime-300 text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-lime-400 transition-colors text-lg shadow-md" aria-label="Kembali ke atas">
              Kembali ke Atas
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;