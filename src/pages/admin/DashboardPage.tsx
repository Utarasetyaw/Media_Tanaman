import React, { useState } from 'react';
import { Newspaper, Calendar, Eye, CheckCircle, TrendingUp, Flame, Star } from 'lucide-react';

// Komponen Card Statistik
const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string; color: string; }> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`p-3 rounded-full bg-${color}-100`}>
      <Icon className={`text-${color}-600`} size={28} />
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// Halaman Dashboard Utama
export const DashboardPage: React.FC = () => {
  // Data statis sebagai contoh
  const stats = {
    pendingArticles: 5,
    ongoingEvents: 2,
    dailyVisitors: 1482,
  };

  // Data statis untuk berita trending
  const trendingArticles = [
    { id: 1, title: 'Tips Jitu Merawat Kaktus di Musim Hujan', views: 12500 },
    { id: 2, title: 'Mengenal 5 Jenis Aglonema Paling Populer', views: 9800 },
    { id: 3, title: 'Rahasia Membuat Bonsai Beringin Tampak Tua', views: 7600 },
    { id: 4, title: 'Cara Stek Batang Mawar agar Cepat Tumbuh', views: 6540 },
  ];
  
  // State untuk menyimpan ID artikel yang menjadi "hot"
  const [hotArticleId, setHotArticleId] = useState<number>(1); // Default artikel pertama jadi hot

  const handleSetHotArticle = (id: number) => {
    setHotArticleId(id);
    // Di aplikasi nyata, Anda akan mengirim pembaruan ini ke server
    console.log(`Artikel ID ${id} telah dijadikan hot news.`);
  };


  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
      
      {/* Grid untuk Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={Newspaper} 
          title="Berita Perlu Persetujuan" 
          value={stats.pendingArticles.toString()}
          color="yellow"
        />
        <StatCard 
          icon={Calendar} 
          title="Event Sedang Berjalan" 
          value={stats.ongoingEvents.toString()}
          color="blue"
        />
        <StatCard 
          icon={Eye} 
          title="Pengunjung Hari Ini" 
          value={stats.dailyVisitors.toLocaleString('id-ID')}
          color="green"
        />
      </div>

      {/* Grid untuk konten utama (Aktivitas & Trending) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        {/* Bagian Aktivitas Terbaru */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Aktivitas Terbaru</h3>
          <ul>
            <li className="flex items-center gap-4 py-3 border-b">
              <CheckCircle className="text-green-500" size={20} />
              <div>
                <p className="font-semibold">Artikel "Cara Merawat Anggrek" telah disetujui.</p>
                <p className="text-sm text-gray-500">2 jam yang lalu</p>
              </div>
            </li>
            <li className="flex items-center gap-4 py-3">
              <Newspaper className="text-yellow-500" size={20} />
              <div>
                <p className="font-semibold">Jurnalis Budi Santoso mengirim artikel baru.</p>
                <p className="text-sm text-gray-500">5 jam yang lalu</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Bagian Berita Paling Trending */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" />
            Berita Paling Trending
          </h3>
          <div className="space-y-2">
            {trendingArticles.map((article) => {
              const isHot = article.id === hotArticleId;
              return (
                <div key={article.id} className={`p-3 rounded-lg flex items-center justify-between transition-colors ${isHot ? 'bg-orange-100' : 'bg-transparent'}`}>
                  <div className="flex items-center gap-3">
                    {isHot ? <Flame className="text-orange-500" size={20} /> : <span className="text-lg font-bold text-gray-400 w-5 text-center">{trendingArticles.indexOf(article) + 1}.</span>}
                    <span className="text-gray-700 font-medium">{article.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {article.views.toLocaleString('id-ID')} views
                    </span>
                    {!isHot && (
                      <button 
                        onClick={() => handleSetHotArticle(article.id)}
                        className="text-xs font-bold text-orange-600 bg-orange-200 hover:bg-orange-300 px-3 py-1 rounded-full transition-colors"
                        title="Jadikan Hot News"
                      >
                        <Star size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
