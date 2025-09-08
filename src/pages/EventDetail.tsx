import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { events } from '../data/events'; // Sesuaikan path
import { ArrowLeft, Calendar, Clock, MapPin, User } from 'lucide-react';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const event = events.find(e => e.id === parseInt(id || ''));

  if (!event) {
    return (
      // PERUBAHAN: Disesuaikan untuk tema gelap
      <div className="bg-[#003938] min-h-screen text-center py-20">
        <h2 className="text-2xl font-bold text-white">Event tidak ditemukan</h2>
        <Link to="/events" className="text-lime-400 mt-4 inline-block hover:underline">Kembali ke daftar event</Link>
      </div>
    );
  }

  return (
    // PERUBAHAN: Latar belakang diubah ke hijau tua
    <div className="bg-[#003938] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-16">
        
        {/* Tombol Kembali */}
        {/* PERUBAHAN: Warna link diubah ke lime */}
        <Link to="/events" className="inline-flex items-center gap-2 text-lime-400 font-semibold hover:underline mb-8">
          <ArrowLeft size={20} />
          {t('eventPage.detail.backLink')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
          
          {/* Kolom Kiri: Konten Utama */}
          <div className="lg:col-span-2">
            {/* Gambar Event (Mobile) */}
            <img src={event.imageUrl} alt={event.title} className="w-full h-64 object-cover rounded-2xl shadow-lg mb-6 lg:hidden border-2 border-lime-400" />
            
            {/* PERUBAHAN: Warna & font judul disesuaikan */}
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-8">{event.title}</h1>
            
            {/* PERUBAHAN: Warna & border judul seksi disesuaikan */}
            <h2 className="font-serif text-2xl font-bold text-lime-400 mb-4 border-b-2 border-lime-400 pb-4">{t('eventPage.detail.descriptionTitle')}</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {/* Kolom Kanan: Info & Pendaftaran */}
          <div className="lg:col-span-1 mt-12 lg:mt-0">
            <div className="lg:sticky lg:top-24">
              {/* Gambar Event (Desktop) */}
              <img src={event.imageUrl} alt={event.title} className="hidden lg:block w-full h-56 object-cover rounded-2xl shadow-lg mb-6 border-2 border-lime-400" />

              {/* PERUBAHAN: Styling kartu info disesuaikan untuk tema gelap */}
              <div className="bg-[#004A49]/60 border-2 border-lime-400 p-6 rounded-2xl shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-lime-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-bold text-gray-200">{t('eventPage.detail.dateLabel')}</h3>
                      <p className="text-gray-300">{event.displayDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="text-lime-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-bold text-gray-200">{t('eventPage.detail.timeLabel')}</h3>
                      <p className="text-gray-300">{event.time}</p>
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
                {/* PERUBAHAN: Warna tombol disesuaikan */}
                <a href={event.url || '#'} target="_blank" rel="noopener noreferrer" className="mt-6 w-full text-center inline-block bg-lime-300 text-lime-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-400 transition-colors duration-300">
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