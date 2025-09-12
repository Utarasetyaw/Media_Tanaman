import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMySubmissionHistory } from '../../services/apiAuth';
import { Award, Calendar, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

// --- Tipe Data ---
interface EventInfo {
  id: number;
  title: { id: string; en: string };
  imageUrl: string;
  startDate: string;
  endDate: string;
}
interface Submission {
  id: number;
  submissionUrl: string;
  placement: number | null;
  event: EventInfo;
}

// --- Helper Function untuk Format Tanggal ---
const formatDate = (dateString: string) => {
    try {
        return format(new Date(dateString), "d MMMM yyyy");
    } catch (error) {
        console.error("Invalid date format:", dateString);
        return "Tanggal tidak valid";
    }
};

export const UserDashboardPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getMySubmissionHistory();
                setSubmissions(data);
            } catch (error) {
                console.error("Failed to fetch submission history", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="text-center p-8">Memuat riwayat Anda...</div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8 bg-gray-50">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Riwayat Event Saya</h1>

            {submissions.length === 0 ? (
                <div className="text-center bg-white p-10 rounded-lg border shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-700">Anda Belum Mengikuti Event Apapun</h2>
                    <p className="text-gray-500 mt-2 mb-6">Jelajahi berbagai event menarik dan ikut serta untuk menunjukkan karya terbaik Anda!</p>
                    <Link to="/events" className="bg-[#003938] text-white font-bold py-3 px-6 rounded-lg hover:bg-green-800 transition-colors">
                        Lihat Daftar Event
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {submissions.map(sub => (
                        <div key={sub.id} className="flex flex-col md:flex-row items-center bg-white shadow-md rounded-lg overflow-hidden border transition-shadow hover:shadow-lg">
                            <Link to={`/events/${sub.event.id}`} className='w-full md:w-52 h-48 md:h-full shrink-0'>
                                <img 
                                    src={sub.event.imageUrl} 
                                    alt={sub.event.title.id} 
                                    className="w-full h-full object-cover"
                                />
                            </Link>
                            <div className="flex-1 p-5 md:p-6">
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <Calendar size={14} />
                                    {formatDate(sub.event.startDate)} - {formatDate(sub.event.endDate)}
                                </p>
                                <h2 className="text-2xl font-bold text-gray-800 mt-1">
                                    <Link to={`/events/${sub.event.id}`} className="hover:text-green-700 transition-colors">
                                        {sub.event.title.id}
                                    </Link>
                                </h2>
                                
                                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                                    <a 
                                        href={sub.submissionUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:underline"
                                    >
                                        <ImageIcon size={16} /> Lihat Karya Saya
                                    </a>

                                    {sub.placement && (
                                        <div className="inline-flex items-center gap-2 font-bold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-sm">
                                            <Award size={16} /> Juara {sub.placement}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};