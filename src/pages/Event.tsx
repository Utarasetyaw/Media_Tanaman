import type { FC } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { useEventsPage } from '../hooks/useEventsPage';
import { eventsTranslations } from '../assets/events.i18n';
import type { Event } from '../types/event';
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';
import BannerAd from '../components/BannerAd';

// --- Komponen Kartu Event ---
const EventCard: FC<{ event: Event; isPast?: boolean; lang: 'id' | 'en' }> = ({ event, isPast, lang }) => {
  const t = (key: keyof typeof eventsTranslations.id) => eventsTranslations[lang]?.[key] || key;
  const displayDate = new Date(event.startDate).toLocaleDateString(lang, {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <Link to={`/events/${event.id}`} className="block group">
      <div className={`bg-[#004A49]/60 border-2 border-lime-400/50 rounded-lg shadow-lg overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:shadow-lime-400/20 group-hover:-translate-y-1 ${isPast ? 'opacity-70' : ''}`}>
        <div className="relative">
            <div className="aspect-video bg-black/20">
              <img 
                src={event.imageUrl} 
                alt={event.title[lang]} 
                className={`w-full h-full object-cover ${isPast ? 'grayscale' : ''}`} 
              />
            </div>
          {isPast && (
            <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
              {t('finished_badge')}
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

// --- Komponen Halaman Utama ---
const EventPage: FC = () => {
  const { lang: currentLang } = useOutletContext<{ lang: 'id' | 'en' }>();
  const t = (key: keyof typeof eventsTranslations.id) => eventsTranslations[currentLang]?.[key] || key;
  
  const { isLoading, isError, featuredEvent, otherUpcomingEvents, pastEvents } = useEventsPage();

  if (isLoading) return <div className="bg-[#003938] min-h-screen text-center py-16 text-white">{t('loading')}</div>;
  if (isError) return <div className="bg-[#003938] min-h-screen text-center py-16 text-red-400">{t('error')}</div>;
  
  return (
    <div className="relative w-full bg-[#003938] min-h-screen">
      <VerticalAd position="left" />
      <VerticalAd position="right" />

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-60 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-lime-400 mb-4">{t('title')}</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">{t('description')}</p>
        </div>
        
        <div className="mb-12"><BannerAd/></div>

        {!featuredEvent && otherUpcomingEvents.length === 0 && pastEvents.length === 0 ? (
            <div className="text-center text-gray-400 py-16"><h3 className="text-2xl font-semibold mb-2 text-white">{t('no_events_title')}</h3><p>{t('no_events_desc')}</p></div>
        ) : (
            <div className="space-y-16 sm:space-y-24">
                {featuredEvent && (
                  <section>
                    <div className="bg-[#004A49]/60 border-2 border-lime-400 rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row md:items-stretch">
                      <div className="w-full md:w-1/2 aspect-video bg-black/20">
                        <img src={featuredEvent.imageUrl} alt={featuredEvent.title[currentLang]} className="w-full h-full object-cover" />
                      </div>
                      <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
                        <div>
                          <span className="inline-block bg-lime-200 text-lime-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">{t('featured_badge')}</span>
                          <h3 className="font-serif text-3xl font-bold text-white mb-3">{featuredEvent.title[currentLang]}</h3>
                          <div className="space-y-3 text-gray-300 mb-6">
                            <p className="flex items-center"><Calendar size={20} className="mr-2 text-lime-400" /> {new Date(featuredEvent.startDate).toLocaleDateString(currentLang, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p className="flex items-center"><MapPin size={20} className="mr-2 text-lime-400" /> {featuredEvent.location}</p>
                          </div>
                          <Link to={`/events/${featuredEvent.id}`} className="inline-block bg-lime-300 text-lime-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-400 transition-colors duration-300">{t('register_button')}</Link>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {(otherUpcomingEvents.length > 0 || pastEvents.length > 0) && (<div className="my-12"><HorizontalAd /></div>)}

                {otherUpcomingEvents.length > 0 && (
                  <section>
                    <h3 className="font-serif text-3xl font-bold text-center text-lime-400 mb-8">{t('other_events')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                      {otherUpcomingEvents.map(event => <EventCard key={event.id} event={event} lang={currentLang}/>)}
                    </div>
                  </section>
                )}
                {pastEvents.length > 0 && (
                  <section>
                    <h3 className="font-serif text-3xl font-bold text-center text-lime-400 mb-8">{t('past_events')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                      {pastEvents.map(event => <EventCard key={event.id} event={event} isPast lang={currentLang}/>)}
                    </div>
                  </section>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default EventPage;