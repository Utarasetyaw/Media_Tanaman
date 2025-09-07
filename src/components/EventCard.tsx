import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { FC } from 'react';
import type { Event } from '../data/events'; // Sesuaikan path jika perlu
import { Calendar, MapPin } from 'lucide-react';

interface EventCardProps {
  event: Event;
  isPast?: boolean;
}

const EventCard: FC<EventCardProps> = ({ event, isPast = false }) => {
  const { t } = useTranslation();

  return (
    // UBAH: Wrapper utama diubah menjadi div biasa, bukan link
    <div className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col group transition-all duration-300 ${isPast ? 'opacity-70' : 'hover:shadow-xl hover:-translate-y-1'}`}>
      <div className="relative">
        {/* BARU: Gambar dibuat bisa diklik */}
        <Link to={`/events/${event.id}`}>
          <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
        </Link>
        {isPast && (
          <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
            {t('eventPage.statusFinished')}
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* BARU: Judul dibuat bisa diklik */}
          <Link to={`/events/${event.id}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700">{event.title}</h3>
          </Link>
          <div className="space-y-2 text-gray-600 text-sm">
            <p className="flex items-center"><Calendar size={16} className="mr-2 text-green-700" /> {event.displayDate}</p>
            <p className="flex items-center"><MapPin size={16} className="mr-2 text-green-700" /> {event.location}</p>
          </div>
        </div>
        
        {/* UBAH: Style tombol disesuaikan agar konsisten */}
        <div className="mt-4 pt-4 border-t border-gray-100">
            <Link 
              to={`/events/${event.id}`}
              className={`w-full inline-block text-center font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${isPast ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-700 text-white hover:bg-green-800'}`}
            >
              {isPast ? t('eventPage.statusFinished') : t('eventPage.detailsButton')}
            </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;