import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { events } from '../data/events';
import type { Event } from '../data/events';
import { Calendar, MapPin } from 'lucide-react';

// Import komponen iklan
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';


// PERUBAHAN: Komponen EventCard disesuaikan untuk tema gelap
interface EventCardProps {
  event: Event;
  isPast?: boolean;
}

const EventCard: FC<EventCardProps> = ({ event, isPast }) => {
  return (
    <Link to={`/events/${event.id}`} className="block group">
      <div className={`bg-[#004A49]/60 border-2 border-lime-400 rounded-lg shadow-lg overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 ${isPast ? 'opacity-70' : ''}`}>
        <div className="relative">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className={`w-full h-48 object-cover ${isPast ? 'grayscale' : ''}`} 
          />
          {isPast && (
            <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
              SELESAI
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <p className="text-sm text-lime-400 font-semibold">{event.displayDate}</p>
          <h4 className="text-lg font-bold text-gray-100 mt-1 flex-grow group-hover:text-lime-300">{event.title}</h4>
          <p className="text-sm text-gray-300 mt-2 flex items-center">
            <MapPin size={16} className="mr-2 flex-shrink-0" />
            {event.location}
          </p>
        </div>
      </div>
    </Link>
  );
};


// Komponen Utama Halaman Event
const EventPage: FC = () => {
  const { t } = useTranslation();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter(event => new Date(event.date) >= today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = events.filter(event => new Date(event.date) < today).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const featuredEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  const otherUpcomingEvents = upcomingEvents.slice(1);

  if (events.length === 0) {
    return (
      // PERUBAHAN: Disesuaikan untuk tema gelap
      <div className="bg-[#003938] min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-16 text-center">
        <h2 className="font-serif text-4xl font-bold text-lime-400 mb-4">{t('eventPage.title')}</h2>
        <p className="text-lg text-gray-300">{t('eventPage.noEvents')}</p>
      </div>
    );
  }

  return (
    // PERUBAHAN: Latar belakang diubah ke hijau tua
    <div className="bg-[#003938] min-h-screen relative">
      <VerticalAd position="left" />
      <VerticalAd position="right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-16">
        {/* Header Halaman */}
        <div className="text-center mb-16">
          {/* PERUBAHAN: Warna dan font judul disesuaikan */}
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-lime-400 mb-4">
            {t('eventPage.title')}
          </h2>
          {/* PERUBAHAN: Warna deskripsi disesuaikan */}
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {t('eventPage.description')}
          </p>
        </div>

        {/* --- Event Unggulan (Featured Event) --- */}
        {featuredEvent && (
          <section className="mb-20">
            {/* PERUBAHAN: Styling kartu disesuaikan untuk tema gelap */}
            <div className="bg-[#004A49]/60 border-2 border-lime-400 rounded-lg shadow-lg overflow-hidden md:grid md:grid-cols-2 md:gap-8 items-center">
              <div className="md:col-span-1">
                <img src={featuredEvent.imageUrl} alt={featuredEvent.title} className="w-full h-64 md:h-full object-cover" />
              </div>
              <div className="md:col-span-1 p-8">
                {/* PERUBAHAN: Warna tag disesuaikan */}
                <span className="inline-block bg-lime-200 text-lime-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                  {t('eventPage.featuredBadge')}
                </span>
                {/* PERUBAHAN: Warna teks disesuaikan */}
                <h3 className="font-serif text-3xl font-bold text-white mb-3">{featuredEvent.title}</h3>
                <div className="space-y-3 text-gray-300 mb-6">
                  <p className="flex items-center"><Calendar size={20} className="mr-2 text-lime-400" /> {featuredEvent.displayDate}</p>
                  <p className="flex items-center"><MapPin size={20} className="mr-2 text-lime-400" /> {featuredEvent.location}</p>
                </div>
                {/* PERUBAHAN: Warna tombol disesuaikan */}
                <a href={featuredEvent.url || '#'} target="_blank" rel="noopener noreferrer" className="inline-block bg-lime-300 text-lime-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-400 transition-colors duration-300">
                  {t('eventPage.registerButton')}
                </a>
              </div>
            </div>
          </section>
        )}

        {(otherUpcomingEvents.length > 0 || pastEvents.length > 0) && (
            <div className="mb-12">
                <HorizontalAd />
            </div>
        )}

        {/* --- Event Mendatang Lainnya --- */}
        {otherUpcomingEvents.length > 0 && (
          <section className="mb-20">
            {/* PERUBAHAN: Warna judul seksi disesuaikan */}
            <h3 className="font-serif text-3xl font-bold text-center text-lime-400 mb-8">{t('eventPage.otherEvents')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {otherUpcomingEvents.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          </section>
        )}

        {/* --- Event Lampau --- */}
        {pastEvents.length > 0 && (
          <section>
            {/* PERUBAHAN: Warna judul seksi disesuaikan */}
            <h3 className="font-serif text-3xl font-bold text-center text-lime-400 mb-8">{t('eventPage.pastEvents')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {pastEvents.map(event => <EventCard key={event.id} event={event} isPast />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default EventPage;