import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, SlidersHorizontal } from 'lucide-react';

// Impor hook, tipe data, dan API service
import { useLayoutData } from '../hooks/useLayoutData';
import type { Event, EventsApiResponse } from '../types/event';
import api from '../services/apiService';
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';

const lang: 'id' | 'en' = 'id';

// Tipe untuk state filter
interface EventFilters {
  categoryId: string;
  plantTypeId: string;
}

// Fungsi untuk mengambil data event dari API
const fetchEvents = async (filters: EventFilters): Promise<EventsApiResponse> => {
  const params = new URLSearchParams({ limit: '50' }); // Ambil banyak event sekaligus
  if (filters.categoryId) {
    params.append('categoryId', filters.categoryId);
  }
  if (filters.plantTypeId) {
    params.append('plantTypeId', filters.plantTypeId);
  }
  
  const { data } = await api.get(`/events?${params.toString()}`);
  return data;
};

interface EventCardProps {
  event: Event;
  isPast?: boolean;
}

const EventCard: FC<EventCardProps> = ({ event, isPast }) => {
  const displayDate = new Date(event.startDate).toLocaleDateString(lang, {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <Link to={`/events/${event.id}`} className="block group">
      <div className={`bg-[#004A49]/60 border-2 border-lime-400 rounded-lg shadow-lg overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 ${isPast ? 'opacity-70' : ''}`}>
        <div className="relative">
          <img 
            src={event.imageUrl} 
            alt={event.title[lang]} 
            className={`w-full h-48 object-cover ${isPast ? 'grayscale' : ''}`} 
          />
          {isPast && (
            <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
              SELESAI
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <p className="text-sm text-lime-400 font-semibold">{displayDate}</p>
          <h4 className="text-lg font-bold text-gray-100 mt-1 flex-grow group-hover:text-lime-300">{event.title[lang]}</h4>
          <p className="text-sm text-gray-300 mt-2 flex items-center">
            <MapPin size={16} className="mr-2 flex-shrink-0" />
            {event.location}
          </p>
        </div>
      </div>
    </Link>
  );
};


const EventPage: FC = () => {
  const { t } = useTranslation();

  const [filters, setFilters] = useState<EventFilters>({
    categoryId: '',
    plantTypeId: '',
  });
  
  const { data: layoutData, isLoading: isLoadingLayout } = useLayoutData();
  const categories = layoutData?.categories || [];
  const plantTypes = layoutData?.plantTypes || [];

  const { data, isLoading, isError } = useQuery<EventsApiResponse, Error>({
    queryKey: ['events', filters],
    queryFn: () => fetchEvents(filters),
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const { featuredEvent, otherUpcomingEvents, pastEvents } = useMemo(() => {
    const allEvents = data?.data || [];
    if (allEvents.length === 0) {
      return { upcomingEvents: [], pastEvents: [], featuredEvent: null, otherUpcomingEvents: [] };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = allEvents.filter(event => new Date(event.startDate) >= today).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const past = allEvents.filter(event => new Date(event.startDate) < today).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    const featured = upcoming.length > 0 ? upcoming[0] : null;
    const others = upcoming.slice(1);

    return { upcomingEvents: upcoming, pastEvents: past, featuredEvent: featured, otherUpcomingEvents: others };
  }, [data]);

  if (isLoading || isLoadingLayout) {
    return <div className="bg-[#003938] min-h-screen text-center py-16 text-white">Loading events...</div>;
  }
  if (isError) {
    return <div className="bg-[#003938] min-h-screen text-center py-16 text-red-400">Failed to load events.</div>;
  }
  
  return (
    <div className="bg-[#003938] min-h-screen relative">
      <VerticalAd position="left" />
      <VerticalAd position="right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-lime-400 mb-4">{t('eventPage.title')}</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">{t('eventPage.description')}</p>
        </div>

        <div className="mb-12 p-4 bg-[#004A49]/60 border-2 border-lime-400 rounded-lg flex flex-col sm:flex-row justify-center items-center gap-4">
          <SlidersHorizontal className="text-lime-400 hidden sm:block" size={24} />
          <select 
            name="plantTypeId"
            value={filters.plantTypeId}
            onChange={handleFilterChange}
            className="w-full sm:w-auto bg-[#003938] border border-lime-500 text-white rounded-md px-4 py-2 focus:ring-lime-400 focus:border-lime-400"
          >
            <option value="">Semua Jenis Tanaman</option>
            {plantTypes.map(pt => (
              <option key={pt.id} value={pt.id}>{pt.name[lang]}</option>
            ))}
          </select>
          <select 
            name="categoryId"
            value={filters.categoryId}
            onChange={handleFilterChange}
            className="w-full sm:w-auto bg-[#003938] border border-lime-500 text-white rounded-md px-4 py-2 focus:ring-lime-400 focus:border-lime-400"
          >
            <option value="">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name[lang]}</option>
            ))}
          </select>
        </div>

        {!featuredEvent && otherUpcomingEvents.length === 0 && pastEvents.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
                <h3 className="text-2xl font-semibold mb-2 text-white">Tidak Ada Event</h3>
                <p>Tidak ada event yang cocok dengan filter yang Anda pilih.</p>
            </div>
        ) : (
            <>
                {featuredEvent && (
                  <section className="mb-20">
                    <div className="bg-[#004A49]/60 border-2 border-lime-400 rounded-lg shadow-lg overflow-hidden md:grid md:grid-cols-2 md:gap-8 items-center">
                      <div className="md:col-span-1">
                        <img src={featuredEvent.imageUrl} alt={featuredEvent.title[lang]} className="w-full h-64 md:h-full object-cover" />
                      </div>
                      <div className="md:col-span-1 p-8">
                        <span className="inline-block bg-lime-200 text-lime-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">{t('eventPage.featuredBadge')}</span>
                        <h3 className="font-serif text-3xl font-bold text-white mb-3">{featuredEvent.title[lang]}</h3>
                        <div className="space-y-3 text-gray-300 mb-6">
                          <p className="flex items-center"><Calendar size={20} className="mr-2 text-lime-400" /> {new Date(featuredEvent.startDate).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          <p className="flex items-center"><MapPin size={20} className="mr-2 text-lime-400" /> {featuredEvent.location}</p>
                        </div>
                        <a href={featuredEvent.externalUrl || '#'} target="_blank" rel="noopener noreferrer" className="inline-block bg-lime-300 text-lime-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-400 transition-colors duration-300">
                          {t('eventPage.registerButton')}
                        </a>
                      </div>
                    </div>
                  </section>
                )}

                {(otherUpcomingEvents.length > 0 || pastEvents.length > 0) && (<div className="mb-12"><HorizontalAd /></div>)}

                {otherUpcomingEvents.length > 0 && (
                  <section className="mb-20">
                    <h3 className="font-serif text-3xl font-bold text-center text-lime-400 mb-8">{t('eventPage.otherEvents')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {otherUpcomingEvents.map(event => <EventCard key={event.id} event={event} />)}
                    </div>
                  </section>
                )}

                {pastEvents.length > 0 && (
                  <section>
                    <h3 className="font-serif text-3xl font-bold text-center text-lime-400 mb-8">{t('eventPage.pastEvents')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {pastEvents.map(event => <EventCard key={event.id} event={event} isPast />)}
                    </div>
                  </section>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default EventPage;