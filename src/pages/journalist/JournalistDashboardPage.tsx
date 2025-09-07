import React from 'react';
import { CheckCircle, Clock, Edit } from 'lucide-react';

// Komponen Kartu Statistik
const StatCard: React.FC<{ icon: React.ElementType; title: string; value: number; color: string }> = ({ icon: Icon, title, value, color }) => (
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

export const JournalistDashboardPage: React.FC = () => {
    // Data statis sebagai contoh
    const stats = {
        published: 15,
        pending: 3,
        needsRevision: 1,
    };

    const recentArticles = [
        { title: 'Pupuk Organik Terbaik untuk Mawar', status: 'pending' },
        { title: 'Cara Merawat Anggrek Bulan', status: 'published' },
        { title: 'Membuat Bonsai dari Awal', status: 'needs_revision', feedback: 'Tolong tambahkan lebih banyak gambar.' },
    ];

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Jurnalis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={CheckCircle} title="Artikel Diterbitkan" value={stats.published} color="green" />
                <StatCard icon={Clock} title="Menunggu Tinjauan" value={stats.pending} color="yellow" />
                <StatCard icon={Edit} title="Perlu Revisi" value={stats.needsRevision} color="orange" />
            </div>

            <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Status Artikel Terbaru</h3>
                <ul className="space-y-3">
                    {recentArticles.map((article, index) => (
                        <li key={index} className="p-3 bg-gray-50 rounded-md">
                            <p className="font-semibold text-gray-800">{article.title}</p>
                            <div className="flex items-center justify-between mt-1">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                    article.status === 'published' ? 'bg-green-100 text-green-800' :
                                    article.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-orange-100 text-orange-800'
                                }`}>
                                    {article.status === 'published' ? 'Diterbitkan' : article.status === 'pending' ? 'Menunggu Tinjauan' : 'Perlu Revisi'}
                                </span>
                                {article.status === 'needs_revision' && <p className="text-xs text-red-600 italic">"{article.feedback}"</p>}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
