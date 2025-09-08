import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Event } from '../data/events'; // Sesuaikan path jika perlu
import { Calendar, MapPin } from 'lucide-react';

interface EventCardProps {
  event: Event;
  isPast?: boolean;
}

const EventCard: FC<EventCardProps> = ({ event, isPast = false }) => {
  const { t } = useTranslation();

  return (
    // PERUBAHAN: Latar belakang dan border disesuaikan untuk tema gelap
    <div className={`bg-[#004A49]/60 border-2 border-lime-400 rounded-lg shadow-lg overflow-hidden flex flex-col group transition-all duration-300 ${isPast ? 'opacity-70' : 'hover:shadow-xl hover:-translate-y-1'}`}>
      <div className="relative">
        <Link to={`/events/${event.id}`}>
          <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
        </Link>
        {isPast && (
          // Styling badge "SELESAI" sudah cocok, tidak perlu diubah
          <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
            {t('eventPage.statusFinished')}
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <Link to={`/events/${event.id}`}>
            {/* PERUBAHAN: Warna teks dan hover disesuaikan */}
            <h3 className="text-xl font-bold text-gray-100 mb-2 group-hover:text-lime-400">{event.title}</h3>
          </Link>
          {/* PERUBAHAN: Warna teks dan ikon disesuaikan */}
          <div className="space-y-2 text-gray-300 text-sm">
            <p className="flex items-center"><Calendar size={16} className="mr-2 text-lime-400" /> {event.displayDate}</p>
            <p className="flex items-center"><MapPin size={16} className="mr-2 text-lime-400" /> {event.location}</p>
          </div>
        </div>
        
        {/* PERUBAHAN: Warna border internal dan tombol disesuaikan */}
        <div className="mt-4 pt-4 border-t border-lime-400/30">
            <Link 
              to={`/events/${event.id}`}
              className={`w-full inline-block text-center font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${isPast 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' // Style untuk tombol event lampau
                : 'bg-lime-300 text-lime-900 hover:bg-lime-400' // Style untuk tombol event aktif
              }`}
            >
              {isPast ? t('eventPage.statusFinished') : t('eventPage.detailsButton')}
            </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;