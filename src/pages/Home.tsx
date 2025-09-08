import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import bannerVideo from '../assets/Banner.mp4';

// Import komponen iklan (asumsi path sudah benar)
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';
import BannerAd from '../components/BannerAd';

// --- Definisi Tipe Data & Data Placeholder ---
interface Article {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  imageUrl: string;
}

const articles: Article[] = [
  // Artikel Utama & Sekunder
  { id: '1', imageUrl: 'https://i.ytimg.com/vi/coatD4KJPkU/maxresdefault.jpg', category: 'Tips & Trik', title: 'Cara Merawat Tanaman Hias di Dalam Ruangan', excerpt: 'Pelajari cara terbaik untuk merawat tanaman hias Anda agar tetap sehat dan subur.' },
  { id: '2', imageUrl: 'https://i.ytimg.com/vi/uHo3LhSVx-M/maxresdefault.jpg', category: 'Inspirasi', title: 'Ide Dekorasi Taman Minimalis', excerpt: 'Inspirasi menciptakan taman minimalis yang indah di lahan terbatas.' },
  { id: '3', imageUrl: 'https://i.ytimg.com/vi/SJjznRxom4E/maxresdefault.jpg', category: 'Panduan', title: 'Mengenal Jenis-Jenis Pupuk Organik', excerpt: 'Panduan lengkap mengenai berbagai jenis pupuk organik dan manfaatnya.' },

  // Artikel untuk feed "More For You"
  { id: '4', imageUrl: 'https://i.ytimg.com/vi/c1sO4y8EGhQ/maxresdefault.jpg', category: 'Berita', title: 'Manfaat Tanaman Lidah Buaya', excerpt: 'Manfaat luar biasa dari lidah buaya untuk kesehatan dan kecantikan.' },
  { id: '5', imageUrl: 'https://i.ytimg.com/vi/NkfOxJ9uLN4/maxresdefault.jpg', category: 'Berita', title: 'Cara Membuat Bonsai untuk Pemula', excerpt: 'Langkah mudah memulai hobi bonsai di rumah.' },
  { id: '6', imageUrl: 'https://i.ytimg.com/vi/NkfOxJ9uLN4/maxresdefault.jpg', category: 'Berita', title: 'Tanaman Pengusir Nyamuk', excerpt: 'Jenis tanaman ampuh untuk mengusir nyamu secara alami.' },
  { id: '7', imageUrl: 'https://i.ytimg.com/vi/NkfOxJ9uLN4/maxresdefault.jpg', category: 'Berita', title: 'Tips Memilih Pot yang Tepat', excerpt: 'Jangan salah pilih, ini cara memilih pot yang sesuai.' },
  { id: '8', imageUrl: 'https://i.ytimg.com/vi/NkfOxJ9uLN4/maxresdefault.jpg', category: 'Berita', title: 'Perawatan Kaktus di Musim Hujan', excerpt: 'Cara agar kaktus tidak busuk saat musim hujan.' },
  { id: '9', imageUrl: 'https://i.ytimg.com/vi/NkfOxJ9uLN4/maxresdefault.jpg', category: 'Tips', title: 'Merawat Bunga Anggrek agar Rajin Berbunga', excerpt: 'Tips jitu untuk anggrek kesayangan Anda.' },
  { id: '10', imageUrl: 'https://i.ytimg.com/vi/NkfOxJ9uLN4/maxresdefault.jpg', category: 'Panduan', title: 'Mengenal Sistem Hidroponik Wick', excerpt: 'Sistem hidroponik paling sederhana untuk pemula.' },
  { id: '11', imageUrl: 'https://i.ytimg.com/vi/NkfOxJ9uLN4/maxresdefault.jpg', category: 'DIY', title: 'Cara Membuat Pupuk Kompos Sendiri', excerpt: 'Manfaatkan sampah dapur menjadi pupuk kaya nutrisi.' },
  { id: '12', imageUrl: 'https://i.ytimg.com/vi/NkfOxJ9uLN4/maxresdefault.jpg', category: 'Tanaman Hias', title: 'Mengatasi Daun Monstera yang Menguning', excerpt: 'Identifikasi penyebab dan cara menanganinya.' },
];

const events: Event[] = [
  { id: 'e1', name: 'Pameran Anggrek Nasional 2025', date: '2025-09-15', location: 'Jakarta Convention Center', imageUrl: 'https://i.ibb.co/6wmTdbQ/image-0c192c.jpg' },
  { id: 'e2', name: 'Workshop Terrarium Mini', date: '2025-11-15', location: 'Green Space Cafe', imageUrl: 'https://placehold.co/600x400/c2f0e0/333333?text=Event+2' }
];

const featuredPlant = {
  name: 'Monstera Deliciosa',
  description: 'Dikenal karena daunnya yang unik dan berlubang, Monstera Deliciosa atau "Swiss Cheese Plant" adalah tanaman hias favorit yang dapat memberikan nuansa tropis di dalam ruangan Anda. Perawatannya relatif mudah dan cocok untuk pemula.',
  imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  link: '/plants/monstera-deliciosa'
};


// --- Ikon SVG ---
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const CategoryIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>);
const LocationMarkerIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>);

// --- Komponen-Komponen UI ---
const ArticleCard: React.FC<{ article: Article }> = ({ article }) => (
  // PERUBAHAN WARNA: Border diubah menjadi lime-400
  <div className="border-2 border-lime-400 bg-[#004A49]/60 rounded-lg shadow-sm overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <Link to={`/news/${article.id}`}>
      <img src={article.imageUrl} alt={article.title} className="w-full h-40 object-cover" />
    </Link>
    <div className="p-4 flex flex-col flex-grow">
      <div className="flex-grow">
        <Link to={`/news/${article.id}`} className="hover:text-lime-400 transition-colors">
          <h3 className="font-serif font-bold text-md text-gray-100">{article.title}</h3>
        </Link>
        <p className="font-sans text-gray-300 mt-2 text-sm">{article.excerpt}</p>
      </div>
      <div className="mt-4">
        <Link
          to={`/news/${article.id}`}
          className="font-sans inline-block w-full text-center bg-lime-300 text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-lime-400 transition-colors text-sm"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  </div>
);

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const formattedDate = new Date(event.date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    // PERUBAHAN WARNA: Border diubah menjadi lime-400
    <div className="bg-[#004A49]/60 rounded-lg shadow-md overflow-hidden border-2 border-lime-400">
      <div className="flex flex-col md:flex-row">
        <Link to={`/events/${event.id}`} className="block md:w-2/5 flex-shrink-0">
          <img src={event.imageUrl} alt={event.name} className="w-full h-48 md:h-full object-cover" />
        </Link>
        <div className="p-4 sm:p-6 flex flex-col justify-between flex-grow">
          <div>
            <p className="font-sans inline-block bg-lime-100 text-lime-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
              EVENT TERDEKAT
            </p>
            <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-gray-100">
              <Link to={`/events/${event.id}`} className="hover:text-lime-400 transition-colors">{event.name}</Link>
            </h3>
            <div className="font-sans mt-4 space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <LocationMarkerIcon className="w-5 h-5 text-gray-400" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Link to={`/events/${event.id}`} className="font-sans inline-block bg-lime-300 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-lime-400 transition-colors">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// PERUBAHAN WARNA: Border diubah menjadi lime-400
const SidebarLink: React.FC<{ article: Article }> = ({ article }) => <Link to={`/news/${article.id}`} className="font-serif font-semibold text-gray-200 py-3 border-b-2 border-lime-400 block transition-colors duration-200 hover:text-lime-400">{article.title}</Link>;

const HeroBanner: React.FC = () => (<div className="w-full rounded-lg shadow-xl overflow-hidden relative min-h-[300px] md:h-[400px]"><video src={bannerVideo} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline /></div>);

const CategoryFilters: React.FC = () => {
  const categories = [{ key: 'all', text: 'Semua Jenis' }, { key: 'hias', text: 'Tanaman Hias' }, { key: 'buah', text: 'Tanaman Buah' }, { key: 'obat', text: 'Tanaman Obat' }, { key: 'bonsai', text: 'Bonsai' }, { key: 'sayuran', text: 'Sayuran' }, { key: 'bunga', text: 'Bunga Potong' }];
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);
  const [isDateOpen, setIsDateOpen] = React.useState(false);
  const dropdownCategories = ['Plant', 'Event', 'News'];

  const scrollbarCustomStyle = `
        @media (max-width: 767px) {
          .custom-scrollbar::-webkit-scrollbar { display: none; }
          .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        }
        @media (min-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar { height: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a0a0a0; }
          .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #ccc #f1f1f1; }
        }
      `;

  return (
    <>
      <style>{scrollbarCustomStyle}</style>
      <div className="font-sans flex flex-col md:flex-row md:items-center gap-4 my-8">
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="relative w-1/2 md:w-auto">
            {/* PERUBAHAN WARNA: Border diubah menjadi lime-400 */}
            <button onClick={() => setIsCategoryOpen(!isCategoryOpen)} className="flex items-center gap-2 bg-[#004A49]/60 border-2 border-lime-400 rounded-lg px-4 py-2 text-sm font-medium text-gray-200 hover:bg-[#004A49]/80 w-full justify-between">
              <div className="flex items-center gap-2">
                <CategoryIcon className="w-5 h-5 text-lime-400" />
                <span>Kategori</span>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-300" />
            </button>
            {isCategoryOpen && (
              // PERUBAHAN WARNA: Border diubah menjadi lime-400
              <div className="absolute z-20 mt-2 w-48 bg-[#004A49]/90 rounded-md shadow-lg border-2 border-lime-400">
                <ul className="py-1">
                  {dropdownCategories.map(cat => (<li key={cat}><a href="#" className="block px-4 py-2 text-sm text-gray-100 hover:bg-white/10">{cat}</a></li>))}
                </ul>
              </div>
            )}
          </div>
          <div className="relative w-1/2 md:w-auto">
            {/* PERUBAHAN WARNA: Border diubah menjadi lime-400 */}
            <button onClick={() => setIsDateOpen(!isDateOpen)} className="flex items-center gap-2 bg-[#004A49]/60 border-2 border-lime-400 rounded-lg px-4 py-2 text-sm font-medium text-gray-200 hover:bg-[#004A49]/80 w-full justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-lime-400" />
                <span>Tanggal</span>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-300" />
            </button>
            {isDateOpen && (
              // PERUBAHAN WARNA: Border diubah menjadi lime-400, input border diubah ke lime-500
              <div className="absolute right-0 z-20 mt-2 w-64 bg-[#004A49]/90 rounded-md shadow-lg border-2 border-lime-400 p-4 space-y-3">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-200">Dari Tanggal</label>
                  <input type="date" id="start_date" className="mt-1 block w-full bg-[#004A49]/70 border border-lime-500 rounded-md shadow-sm focus:ring-lime-500 focus:border-lime-500 sm:text-sm p-2 text-gray-100" />
                </div>
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-200">Sampai Tanggal</label>
                  <input type="date" id="end_date" className="mt-1 block w-full bg-[#004A49]/70 border border-lime-500 rounded-md shadow-sm focus:ring-lime-500 focus:border-lime-500 sm:text-sm p-2 text-gray-100" />
                </div>
                <button className="w-full bg-lime-300 text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-lime-400">Terapkan</button>
              </div>
            )}
          </div>
        </div>
        {/* PERUBAHAN WARNA: Divider diubah menjadi lime-400 */}
        <div className="hidden md:block h-6 w-px bg-lime-400 mx-2"></div>
        <div className="w-full overflow-x-scroll custom-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap pb-2">
            {categories.map(cat => (
              // PERUBAHAN WARNA: Border tombol kategori diubah menjadi lime-400
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`font-sans px-4 py-2 text-sm font-medium rounded-lg border-2 ${
                  activeCategory === cat.key ? 'bg-lime-300 text-gray-900 border-lime-300' : 'bg-[#004A49]/60 text-gray-200 border-lime-400 hover:bg-[#004A49]/80'
                }`}
              >
                {cat.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const UpcomingEvent: React.FC = () => (
  <section className="py-12">
    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lime-400 text-center mb-8">
      Event Komunitas Terdekat
    </h2>
    <div className="max-w-4xl mx-auto">
      {events.length > 0 && <EventCard event={events[0]} />}
    </div>
  </section>
);

const FeaturedPlant: React.FC = () => (
  <section className="py-12">
    {/* PERUBAHAN WARNA: Border diubah menjadi lime-400 */}
    <div className="max-w-4xl mx-auto bg-[#004A49]/60 p-4 sm:p-6 md:p-8 rounded-lg border-2 border-lime-400 grid md:grid-cols-2 gap-8 items-center">
      <div className="w-full h-64 md:h-full rounded-lg overflow-hidden">
        <img src={featuredPlant.imageUrl} alt={featuredPlant.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col justify-center">
        <h3 className="font-sans text-lime-400 font-bold uppercase text-sm tracking-wider">Tanaman Pilihan Minggu Ini</h3>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-100 my-2">{featuredPlant.name}</h2>
        <p className="font-sans text-gray-300 leading-relaxed">{featuredPlant.description}</p>
        <div className="mt-6">
          <Link
            to={featuredPlant.link}
            className="font-sans inline-block bg-lime-300 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-lime-400 transition-colors"
          >
            Lihat Detail Tanaman
          </Link>
        </div>
      </div>
    </div>
  </section>
);


// --- Pembagian Data ---
const featuredArticle = articles[0];
const secondaryArticles = articles.slice(1, 3);
const articlesForFeed = articles.slice(3);
const topHeadlines = articles.slice(3, 8);

// --- Komponen Utama Halaman Home ---
const Home: React.FC = () => {
  const articleChunks = React.useMemo(() => {
    const chunks = [];
    const chunkSize = 4;
    for (let i = 0; i < articlesForFeed.length; i += chunkSize) {
      chunks.push(articlesForFeed.slice(i, i + chunkSize));
    }
    return chunks;
  }, []);

  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) { setIsScrollButtonVisible(true); } else { setIsScrollButtonVisible(false); }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full bg-[#003938]">
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 pt-8">
        <HeroBanner />
        <CategoryFilters />
      </div>

      <VerticalAd position="left" />
      <VerticalAd position="right" />

      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4">
        <HorizontalAd />
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-8">
          <main className="lg:col-span-2">
            <section>
              <img src={featuredArticle.imageUrl} alt={featuredArticle.title} className="w-full h-auto mb-4 rounded-lg shadow-md" />
              <div className="font-sans text-lime-400 font-bold uppercase text-sm tracking-wider">{featuredArticle.category}</div>
              <h2><Link to={`/news/${featuredArticle.id}`} className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-100 my-2 block hover:text-lime-400 transition-colors">{featuredArticle.title}</Link></h2>
              <p className="font-sans text-lg text-gray-300 leading-relaxed">{featuredArticle.excerpt}</p>
              <div className="mt-4">
                <Link to={`/news/${featuredArticle.id}`} className="font-sans inline-block bg-lime-300 text-gray-900 font-bold px-6 py-2 rounded-lg hover:bg-lime-400 transition-colors text-sm">
                  Lihat Berita
                </Link>
              </div>
            </section>
            {/* PERUBAHAN WARNA: HR diubah menjadi lime-400 */}
            <hr className="my-10 border-t-2 border-lime-400" />
            <section>
              <h2 className="font-serif text-2xl font-bold text-gray-100 mb-6">Berita Terbaru</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {secondaryArticles.map(article => <ArticleCard key={article.id} article={article} />)}
              </div>
            </section>
          </main>
          {/* PERUBAHAN WARNA: Border sidebar diubah menjadi lime-400 */}
          <aside className="mt-12 lg:mt-0 lg:pl-8 lg:border-l-2 lg:border-lime-400">
            {/* PERUBAHAN WARNA: Border diubah menjadi lime-400 */}
            <h3 className="font-serif text-lg font-bold uppercase text-lime-400 border-b-2 border-lime-400 pb-2 mb-6">Top Headlines</h3>
            <div className="flex flex-col">
              {topHeadlines.map(article => <SidebarLink key={`headline-${article.id}`} article={article} />)}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <BannerAd />
              <div className="hidden lg:flex flex-col gap-3">
                <BannerAd />
                <BannerAd />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* PERUBAHAN WARNA: Border section diubah menjadi lime-400 */}
      <section className="mt-12 pt-8 border-t-2 border-lime-400">
        <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 pb-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lime-400 text-center mb-8">
            More For You 🌿
          </h2>
          <div className="flex flex-col">
            {articleChunks.map((chunk, index) => (
              <React.Fragment key={`chunk-${index}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {chunk.map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {index === 0 && <UpcomingEvent />}
                {index === 1 && <FeaturedPlant />}

                {index < articleChunks.length - 1 && (
                  <div className="my-8">
                    <HorizontalAd />
                  </div>
                )}

                {index < articleChunks.length - 1 && (
                  // PERUBAHAN WARNA: HR diubah menjadi lime-400
                  <hr className="my-10 border-t-2 border-lime-400" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* PERUBAHAN WARNA: HR diubah menjadi lime-400 */}
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
      </section>
    </div>
  );
};

export default Home;