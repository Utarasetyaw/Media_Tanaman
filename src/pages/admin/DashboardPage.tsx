import React from 'react';
// REVISI: Impor tipe data dan hook
import { useDashboard } from '../../hooks/useDashboard';
import type { AdminDashboardData, JournalistDashboardData } from '../../hooks/useDashboard';
// REVISI: Tambahkan 'CheckCircle' ke dalam impor
import { Calendar, Eye, CheckCircle, Edit, Heart, TrendingUp, BarChart } from 'lucide-react';

// Komponen Card Statistik (tidak berubah)
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

// REVISI: Beri tipe data yang spesifik pada props komponen view
const AdminView: React.FC<{ data: AdminDashboardData }> = ({ data }) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={CheckCircle} // Ikon diganti agar lebih sesuai
          title="Artikel Terbit" 
          value={data.stats.publishedArticles.toString()}
          color="green"
        />
        <StatCard 
          icon={Calendar} 
          title="Event Berjalan" 
          value={data.stats.runningEvents.toString()}
          color="blue"
        />
        <StatCard 
          icon={Edit} 
          title="Request Jurnalis" 
          value={data.stats.journalistRequests.toString()}
          color="yellow"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart /> Performa Situs</h3>
           <p className="text-gray-600">Total Pembaca: {data.performanceChart.totalViews.toLocaleString('id-ID')}</p>
           <p className="text-gray-600">Total Suka: {data.performanceChart.totalLikes.toLocaleString('id-ID')}</p>
           <p className="text-center text-gray-400 mt-8 italic">(Komponen grafik akan ditampilkan di sini)</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp /> Top 5 Artikel</h3>
          <div className="space-y-2">
            {data.topArticles.map((article, index) => (
              <div key={article.id} className="p-3 rounded-lg flex items-center justify-between transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400 w-5 text-center">{index + 1}.</span>
                  <span className="text-gray-700 font-medium">{article.title.id}</span>
                </div>
                <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {article.viewCount.toLocaleString('id-ID')} views
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
);

// REVISI: Beri tipe data yang spesifik pada props komponen view
const JournalistView: React.FC<{ data: JournalistDashboardData }> = ({ data }) => (
     <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={CheckCircle} title="Artikel Terbit" value={data.stats.published.toString()} color="green" />
        <StatCard icon={Edit} title="Perlu Revisi" value={data.stats.needsRevision.toString()} color="yellow" />
        <StatCard icon={Eye} title="Total Dilihat" value={data.stats.totalViews.toLocaleString('id-ID')} color="blue" />
        <StatCard icon={Heart} title="Total Suka" value={data.stats.totalLikes.toLocaleString('id-ID')} color="pink" />
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart /> Performa Artikel Anda</h3>
           <p className="text-gray-600">Total Pembaca: {data.performanceChart.totalViews.toLocaleString('id-ID')}</p>
           <p className="text-gray-600">Total Suka: {data.performanceChart.totalLikes.toLocaleString('id-ID')}</p>
           <p className="text-center text-gray-400 mt-8 italic">(Komponen grafik akan ditampilkan di sini)</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp /> Top 5 Artikel Anda</h3>
          <div className="space-y-2">
            {data.topArticles.map((article, index) => (
               <div key={article.id} className="p-3 rounded-lg flex items-center justify-between transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400 w-5 text-center">{index + 1}.</span>
                  <span className="text-gray-700 font-medium">{article.title.id}</span>
                </div>
                <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {article.viewCount.toLocaleString('id-ID')} views
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
     </>
);

// Halaman Dashboard Utama
export const DashboardPage: React.FC = () => {
  const { data, isLoading, isError, isAdmin } = useDashboard();

  if (isLoading) {
    return <div className="text-center text-gray-600 p-8">Memuat data dashboard...</div>;
  }
  if (isError || !data) {
    return <div className="text-center text-red-500 p-8">Gagal memuat data dashboard.</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
      {/* REVISI: Gunakan 'casting' (as) untuk memberi tahu TypeScript tipe data yang benar */}
      {isAdmin 
        ? <AdminView data={data as AdminDashboardData} /> 
        : <JournalistView data={data as JournalistDashboardData} />}
    </div>
  );
};