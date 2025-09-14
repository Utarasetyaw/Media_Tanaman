import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import type { AdminDashboardData, JournalistDashboardData } from '../../hooks/useDashboard';
import { Calendar, Eye, CheckCircle, Edit, Heart, TrendingUp, BarChart as BarChartIcon } from 'lucide-react';
// Impor BarChart dan komponen lain yang dibutuhkan dari recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- KOMPONEN GRAFIK (DIUBAH MENJADI BAR CHART) ---
interface PerformanceChartProps {
  // Menerima objek dengan total views dan likes
  data: {
    totalViews: number;
    totalLikes: number;
  };
}
const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  // Ubah data menjadi format array yang bisa dibaca oleh BarChart
  const chartData = [
    {
      name: 'Statistik',
      Pembaca: data.totalViews,
      Suka: data.totalLikes,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={chartData} 
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(209, 213, 219, 0.2)" />
        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
        <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', borderColor: '#6b7280', borderRadius: '0.5rem' }}
          labelStyle={{ color: '#ffffff' }}
          cursor={{ fill: 'rgba(132, 204, 22, 0.1)' }}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        <Bar dataKey="Pembaca" fill="#38bdf8" />
        <Bar dataKey="Suka" fill="#ec4899" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// --- KOMPONEN CARD STATISTIK ---
const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string; color: string; }> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-[#004A49]/60 border-2 border-lime-400/30 p-6 rounded-lg shadow-md flex items-center transition-all hover:border-lime-400 hover:bg-[#004A49]">
    <div className={`p-3 rounded-full bg-${color}-500/20`}>
      <Icon className={`text-${color}-300`} size={28} />
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-300">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

// --- KOMPONEN TAMPILAN ADMIN ---
const AdminView: React.FC<{ data: AdminDashboardData }> = ({ data }) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={CheckCircle} title="Artikel Terbit" value={data.stats.publishedArticles.toString()} color="green" />
        <StatCard icon={Calendar} title="Event Berjalan" value={data.stats.runningEvents.toString()} color="blue" />
        <StatCard icon={Edit} title="Request Jurnalis" value={data.stats.journalistRequests.toString()} color="yellow" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <div className="bg-[#004A49]/60 border-2 border-lime-400/50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-lime-300 mb-4 flex items-center gap-2"><BarChartIcon /> Performa Situs</h3>
           {/* Kirim objek performanceChart langsung */}
           <PerformanceChart data={data.performanceChart} />
        </div>

        <div className="bg-[#004A49]/60 border-2 border-lime-400/50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-lime-300 mb-4 flex items-center gap-2"><TrendingUp /> Top 5 Artikel</h3>
          <div className="space-y-2">
            {data.topArticles.map((article, index) => (
              <div key={article.id} className="p-3 rounded-lg flex flex-row items-center justify-between gap-4 transition-colors hover:bg-black/20">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-lg font-bold text-gray-400 w-5 text-center shrink-0">{index + 1}.</span>
                  <span className="text-gray-200 font-medium truncate">{article.title.id}</span>
                </div>
                <span className="text-sm font-semibold text-lime-300 bg-black/20 px-2 py-1 rounded shrink-0">
                  {article.viewCount.toLocaleString('id-ID')} views
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
);

// --- KOMPONEN TAMPILAN JURNALIS ---
const JournalistView: React.FC<{ data: JournalistDashboardData }> = ({ data }) => (
     <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={CheckCircle} title="Artikel Terbit" value={data.stats.published.toString()} color="green" />
        <StatCard icon={Edit} title="Perlu Revisi" value={data.stats.needsRevision.toString()} color="yellow" />
        <StatCard icon={Eye} title="Total Dilihat" value={data.stats.totalViews.toLocaleString('id-ID')} color="blue" />
        <StatCard icon={Heart} title="Total Suka" value={data.stats.totalLikes.toLocaleString('id-ID')} color="pink" />
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <div className="bg-[#004A49]/60 border-2 border-lime-400/50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-lime-300 mb-4 flex items-center gap-2"><BarChartIcon /> Performa Artikel Anda</h3>
           {/* Kirim objek performanceChart langsung */}
           <PerformanceChart data={data.performanceChart} />
        </div>

        <div className="bg-[#004A49]/60 border-2 border-lime-400/50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-lime-300 mb-4 flex items-center gap-2"><TrendingUp /> Top 5 Artikel Anda</h3>
          <div className="space-y-2">
            {data.topArticles.map((article, index) => (
               <div key={article.id} className="p-3 rounded-lg flex flex-row items-center justify-between gap-4 transition-colors hover:bg-black/20">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-lg font-bold text-gray-400 w-5 text-center shrink-0">{index + 1}.</span>
                  <span className="text-gray-200 font-medium truncate">{article.title.id}</span>
                </div>
                <span className="text-sm font-semibold text-lime-300 bg-black/20 px-2 py-1 rounded shrink-0">
                  {article.viewCount.toLocaleString('id-ID')} views
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
     </>
);

// --- KOMPONEN UTAMA HALAMAN DASHBOARD ---
export const DashboardPage: React.FC = () => {
  const { data, isLoading, isError, isAdmin } = useDashboard();

  if (isLoading) {
    return <div className="text-center text-gray-300 p-8">Memuat data dashboard...</div>;
  }
  if (isError || !data) {
    return <div className="text-center text-red-400 p-8">Gagal memuat data dashboard.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90 mb-6">Dashboard</h2>
      {isAdmin 
        ? <AdminView data={data as AdminDashboardData} /> 
        : <JournalistView data={data as JournalistDashboardData} />}
    </div>
  );
};