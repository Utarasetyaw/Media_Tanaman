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
  { id: '13', imageUrl: 'https://i.ytimg.com/vi/NkfOxJ9uLN4/maxresdefault.jpg', category: 'Tanaman Hias', title: 'Jenis Aglaonema Paling Populer 2025', excerpt: 'Koleksi Aglaonema yang sedang tren tahun ini.' },
  { id: '14', imageUrl: 'https://i.ytimg.com/vi/NkfOxJ9uLN4/maxresdefault.jpg', category: 'Tanaman Hias', title: 'Cara Memperbanyak Sekulen dengan Mudah', excerpt: 'Hanya dengan satu daun, dapatkan tanaman baru.' },
  { id: '15', imageUrl: 'https://i.ytimg.com/vi/NkfOxJ9uLN4/maxresdefault.jpg', category: 'Tips', title: 'Basmi Hama Kutu Putih Secara Alami', excerpt: 'Solusi aman tanpa pestisida kimia berbahaya.' },
  { id: '16', imageUrl: 'https://i.ytimg.com/vi/NkfOxJ9uLN4/maxresdefault.jpg', category: 'Inspirasi', title: 'Ide Taman Vertikal untuk Rumah Mungil', excerpt: 'Solusi berkebun di lahan yang sangat terbatas.' },
];

const events: Event[] = [
  { id: 'e1', name: 'Pameran Anggrek Nasional 2025', date: '2025-09-15', location: 'Jakarta Convention Center', imageUrl: 'https://i.ibb.co/6wmTdbQ/image-0c192c.jpg' },
  { id: 'e2', name: 'Workshop Terrarium Mini', date: '2025-11-15', location: 'Green Space Cafe', imageUrl: 'https://placehold.co/600x400/c2f0e0/333333?text=Event+2' }
];

// --- Ikon SVG (ArrowUpIcon tidak lagi digunakan untuk tombol, tapi tetap di sini jika dibutuhkan di tempat lain) ---
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const CategoryIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>);
const LocationMarkerIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>);
// --- Komponen-Komponen UI ---
const ArticleCard: React.FC<{ article: Article }> = ({ article }) => (
  <div className="border bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <Link to={`/news/${article.id}`}>
      <img src={article.imageUrl} alt={article.title} className="w-full h-40 object-cover" />
    </Link>
    <div className="p-4 flex flex-col flex-grow">
      <div className="flex-grow">
        <Link to={`/news/${article.id}`} className="hover:text-green-700 transition-colors">
          <h3 className="font-bold text-md text-gray-800">{article.title}</h3>
        </Link>
        <p className="text-gray-600 mt-2 text-sm">{article.excerpt}</p>
      </div>
      <div className="mt-4">
        <Link
          to={`/news/${article.id}`}
          className="inline-block w-full text-center bg-green-700 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-800 transition-colors text-sm"
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden border">
      <div className="flex flex-col md:flex-row">
        <Link to={`/events/${event.id}`} className="block md:w-2/5 flex-shrink-0">
          <img src={event.imageUrl} alt={event.name} className="w-full h-48 md:h-full object-cover" />
        </Link>
        <div className="p-6 flex flex-col justify-between flex-grow">
          <div>
            <p className="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
              EVENT TERDEKAT
            </p>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
              <Link to={`/events/${event.id}`} className="hover:text-green-700 transition-colors">{event.name}</Link>
            </h3>
            <div className="mt-4 space-y-2 text-gray-600">
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
            <Link to={`/events/${event.id}`} className="inline-block bg-green-700 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-800 transition-colors">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarLink: React.FC<{ article: Article }> = ({ article }) => <Link to={`/news/${article.id}`} className="font-semibold text-gray-800 py-3 border-b border-gray-200 block transition-colors duration-200 hover:text-green-800">{article.title}</Link>;

const HeroBanner: React.FC = () => (<div className="w-full rounded-lg shadow-xl overflow-hidden relative min-h-[350px] md:h-[400px]"><video src={bannerVideo} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline /></div>);

const CategoryFilters: React.FC = () => {
  const categories = [{ key: 'all', text: 'Semua Jenis' }, { key: 'hias', text: 'Tanaman Hias' }, { key: 'buah', text: 'Tanaman Buah' }, { key: 'obat', text: 'Tanaman Obat' }, { key: 'bonsai', text: 'Bonsai' }, { key: 'sayuran', text: 'Sayuran' }, { key: 'bunga', text: 'Bunga Potong' }];
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);
  const [isDateOpen, setIsDateOpen] = React.useState(false);
  const dropdownCategories = ['Plant', 'Event', 'News'];

  const scrollbarCustomStyle = `
        @media (max-width: 767px) {
          .custom-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .custom-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }
        @media (min-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar {
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a0a0a0;
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #ccc #f1f1f1;
          }
        }
      `;

  return (
    <>
      <style>{scrollbarCustomStyle}</style>
      <div className="flex flex-col md:flex-row md:items-center gap-4 my-8">
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="relative w-1/2 md:w-auto">
            <button onClick={() => setIsCategoryOpen(!isCategoryOpen)} className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 w-full justify-between">
              <div className="flex items-center gap-2">
                <CategoryIcon className="w-5 h-5 text-green-700" />
                <span>Kategori</span>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            </button>
            {isCategoryOpen && (
              <div className="absolute z-20 mt-2 w-48 bg-white rounded-md shadow-lg border">
                <ul className="py-1">
                  {dropdownCategories.map(cat => (<li key={cat}><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{cat}</a></li>))}
                </ul>
              </div>
            )}
          </div>
          <div className="relative w-1/2 md:w-auto">
            <button onClick={() => setIsDateOpen(!isDateOpen)} className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 w-full justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-green-700" />
                <span>Tanggal</span>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            </button>
            {isDateOpen && (
              <div className="absolute right-0 z-20 mt-2 w-64 bg-white rounded-md shadow-lg border p-4 space-y-3">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Dari Tanggal</label>
                  <input type="date" id="start_date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2" />
                </div>
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">Sampai Tanggal</label>
                  <input type="date" id="end_date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2" />
                </div>
                <button className="w-full bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-800">Terapkan</button>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:block h-6 w-px bg-gray-300 mx-2"></div>

        <div className="w-full overflow-x-scroll custom-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap pb-2">
            {categories.map(cat => (
              <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors flex-shrink-0 ${activeCategory === cat.key ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>
                {cat.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

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
      // Tombol akan muncul jika scroll lebih dari 300px
      if (window.pageYOffset > 300) {
        setIsScrollButtonVisible(true);
      } else {
        setIsScrollButtonVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Membuat scroll menjadi halus
    });
  };

  return (
    <div className="relative w-full bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <HeroBanner />
        <CategoryFilters />
      </div>

      <VerticalAd position="left" />
      <VerticalAd position="right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HorizontalAd />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-8">

          <main className="lg:col-span-2">
            <section>
              <img src={featuredArticle.imageUrl} alt={featuredArticle.title} className="w-full h-auto mb-4 rounded-lg shadow-md" />
              <div className="text-green-800 font-bold uppercase text-sm tracking-wider">{featuredArticle.category}</div>
              <h2><Link to={`/news/${featuredArticle.id}`} className="text-3xl lg:text-4xl font-bold text-gray-900 my-2 block hover:text-green-700 transition-colors">{featuredArticle.title}</Link></h2>
              <p className="text-lg text-gray-600 leading-relaxed">{featuredArticle.excerpt}</p>
              <div className="mt-4">
                <Link
                  to={`/news/${featuredArticle.id}`}
                  className="inline-block bg-green-700 text-white font-bold px-6 py-2 rounded-lg hover:bg-green-800 transition-colors text-sm"
                >
                  Lihat Berita
                </Link>
              </div>
            </section>

            <hr className="my-10 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Berita Terbaru</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {secondaryArticles.map(article => <ArticleCard key={article.id} article={article} />)}
              </div>
            </section>
          </main>

          <aside className="mt-12 lg:mt-0 lg:pl-8 lg:border-l lg:border-gray-200">
            <h3 className="text-lg font-bold uppercase text-green-800 border-b-2 border-green-800 pb-2 mb-6">Top Headlines</h3>
            <div className="flex flex-col">
              {topHeadlines.map(article => <SidebarLink key={`headline-${article.id}`} article={article} />)}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <BannerAd />
              <BannerAd />
              <BannerAd />
            </div>
          </aside>

        </div>
      </div>

      {/* REVISI: Padding atas dan bawah pada section */}
      <section className="mt-12 pt-8 border-t border-gray-200">
        {/* REVISI: Padding bawah (pb-6) dikurangi untuk mendekatkan ke footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2 text-center">
          <h2 className="text-3xl font-bold text-green-800 text-center mb-8">
            More For You 🌿
          </h2>
          <div className="flex flex-col gap-8">
            {articleChunks.map((chunk, index) => (
              <React.Fragment key={`chunk-${index}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {chunk.map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {(index % 2 === 0) && (<HorizontalAd />)}
                {(index % 2 !== 0 && events[Math.floor(index / 2)]) && (<EventCard event={events[Math.floor(index / 2)]} />)}
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-12">
            <Link
              to="/news"
              className="inline-block bg-green-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-800 transition-colors text-lg"
            >
              Lihat Berita Lebih Banyak
            </Link>

            {isScrollButtonVisible && (
              <button
                onClick={scrollToTop}
                className="bg-green-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-800 transition-colors text-lg shadow-md"
                aria-label="Kembali ke atas"
              >
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