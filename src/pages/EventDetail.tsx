import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Clock, MapPin, User } from 'lucide-react';

// Impor tipe data, API service, dan komponen lain
import type { Event } from '../types/event';
import api from '../services/apiService';
import VerticalAd from '../components/VerticalAd';

// Ganti bahasa ini sesuai state global Anda nantinya
const lang: 'id' | 'en' = 'id';

// Fungsi untuk mengambil detail satu event dari API
const fetchEventById = async (id: string): Promise<Event> => {
  const { data } = await api.get(`/events/${id}`);
  return data;
};

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  // Gunakan Tanstack Query untuk mengambil data detail event
  const { data: event, isLoading, isError } = useQuery<Event, Error>({
    queryKey: ['event', id],
    queryFn: () => fetchEventById(id!),
    enabled: !!id, // Query hanya akan berjalan jika 'id' ada
  });

  // Tampilan saat loading
  if (isLoading) {
    return (
      <div className="bg-[#003938] min-h-screen text-center py-20">
        <h2 className="text-2xl font-bold text-white">Loading Event...</h2>
      </div>
    );
  }

  // Tampilan jika terjadi error atau event tidak ditemukan
  if (isError || !event) {
    return (
      <div className="bg-[#003938] min-h-screen text-center py-20">
        <h2 className="text-2xl font-bold text-white">Event tidak ditemukan</h2>
        <Link to="/events" className="text-lime-400 mt-4 inline-block hover:underline">Kembali ke daftar event</Link>
      </div>
    );
  }

  // Format tanggal dan waktu dari data API
  const eventDate = new Date(event.startDate);
  const displayDate = eventDate.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
  const displayTime = eventDate.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

  return (
    <div className="bg-[#003938] min-h-screen">
       <VerticalAd position="left" />
       <VerticalAd position="right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-16">
        
        <Link to="/events" className="inline-flex items-center gap-2 text-lime-400 font-semibold hover:underline mb-8">
          <ArrowLeft size={20} />
          {t('eventPage.detail.backLink')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
          
          <div className="lg:col-span-2">
            <img src={event.imageUrl} alt={event.title[lang]} className="w-full h-64 object-cover rounded-2xl shadow-lg mb-6 lg:hidden border-2 border-lime-400" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-8">{event.title[lang]}</h1>
            <h2 className="font-serif text-2xl font-bold text-lime-400 mb-4 border-b-2 border-lime-400 pb-4">{t('eventPage.detail.descriptionTitle')}</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{event.description[lang]}</p>
          </div>

          <div className="lg:col-span-1 mt-12 lg:mt-0">
            <div className="lg:sticky lg:top-24">
              <img src={event.imageUrl} alt={event.title[lang]} className="hidden lg:block w-full h-56 object-cover rounded-2xl shadow-lg mb-6 border-2 border-lime-400" />
              <div className="bg-[#004A49]/60 border-2 border-lime-400 p-6 rounded-2xl shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-lime-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-bold text-gray-200">{t('eventPage.detail.dateLabel')}</h3>
                      <p className="text-gray-300">{displayDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="text-lime-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-bold text-gray-200">{t('eventPage.detail.timeLabel')}</h3>
                      <p className="text-gray-300">{displayTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="text-lime-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-bold text-gray-200">{t('eventPage.detail.locationLabel')}</h3>
                      <p className="text-gray-300">{event.location}</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-3 border-t border-lime-400/30 pt-4">
                    <User className="text-lime-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-bold text-gray-200">{t('eventPage.detail.organizerLabel')}</h3>
                      <p className="text-gray-300">{event.organizer}</p>
                    </div>
                  </div>
                </div>
                <a href={event.externalUrl || '#'} target="_blank" rel="noopener noreferrer" className="mt-6 w-full text-center inline-block bg-lime-300 text-lime-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-400 transition-colors duration-300">
                  {t('eventPage.registerButton')}
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventDetail;