import type { FC } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, User } from 'lucide-react';
import { useEventDetail } from '../hooks/useEventDetail';
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';
import { eventDetailTranslations } from '../assets/eventDetail.i18n';

const EventDetail: FC = () => {
  const { lang: currentLang } = useOutletContext<{ lang: 'id' | 'en' }>();
  const t = (key: keyof typeof eventDetailTranslations.id): string => {
      return eventDetailTranslations[currentLang]?.[key] || key;
  };

  const { event, isLoading, isError, handleExternalLinkClick } = useEventDetail();

  if (isLoading) {
    return <div className="bg-[#003938] min-h-screen text-center py-20 text-white"><h2 className="text-2xl font-bold">{t('loading')}</h2></div>;
  }
  if (isError || !event) {
    return (
      <div className="bg-[#003938] min-h-screen text-center py-20">
        <h2 className="text-2xl font-bold text-white">{t('error_title')}</h2>
        <Link to="/events" className="text-lime-400 mt-4 inline-block hover:underline">{t('back_link')}</Link>
      </div>
    );
  }

  const eventDate = new Date(event.startDate);
  const displayDate = eventDate.toLocaleDateString(currentLang, { day: 'numeric', month: 'long', year: 'numeric' });
  const displayTime = eventDate.toLocaleTimeString(currentLang, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
  
  const buttonClassName = "mt-6 w-full text-center inline-block bg-lime-300 text-lime-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-400 transition-colors duration-300";

  return (
    <div className="bg-[#003938] min-h-screen">
       <VerticalAd position="left" />
       <VerticalAd position="right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        <Link to="/events" className="inline-flex items-center gap-2 text-lime-400 font-semibold hover:underline mb-8">
          <ArrowLeft size={20} />{t('back_link')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
          
          <div className="lg:col-span-2">
            {/* REVISI: Ubah rasio aspek menjadi video (16:9) untuk konsistensi */}
            <div className="aspect-video lg:hidden mb-6 bg-black/20 rounded-2xl overflow-hidden">
              <img src={event.imageUrl} alt={event.title[currentLang]} className="w-full h-full object-cover shadow-lg border-2 border-lime-400" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8">{event.title[currentLang]}</h1>
            <h2 className="font-serif text-2xl font-bold text-lime-400 mb-4 border-b-2 border-lime-400/50 pb-4">{t('description_title')}</h2>
            <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-gray-300 leading-relaxed whitespace-pre-line">
              {event.description[currentLang]}
            </div>
          </div>

          <div className="lg:col-span-1 mt-12 lg:mt-0">
            <div className="lg:sticky lg:top-24">
              {/* REVISI: Ubah rasio aspek menjadi video (16:9) untuk konsistensi */}
              <div className="aspect-video hidden lg:block mb-6 bg-black/20 rounded-2xl overflow-hidden">
                 <img src={event.imageUrl} alt={event.title[currentLang]} className="w-full h-full object-cover shadow-lg border-2 border-lime-400" />
              </div>
              <div className="bg-[#004A49]/60 border-2 border-lime-400/80 p-6 rounded-2xl shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-start gap-3"><Calendar className="text-lime-400 mt-1 flex-shrink-0" size={20} /><div><h3 className="font-bold text-gray-200">{t('date_label')}</h3><p className="text-gray-300">{displayDate}</p></div></div>
                  <div className="flex items-start gap-3"><Clock className="text-lime-400 mt-1 flex-shrink-0" size={20} /><div><h3 className="font-bold text-gray-200">{t('time_label')}</h3><p className="text-gray-300">{displayTime}</p></div></div>
                  <div className="flex items-start gap-3"><MapPin className="text-lime-400 mt-1 flex-shrink-0" size={20} /><div><h3 className="font-bold text-gray-200">{t('location_label')}</h3><p className="text-gray-300">{event.location}</p></div></div>
                  <div className="flex items-start gap-3 border-t border-lime-400/30 pt-4"><User className="text-lime-400 mt-1 flex-shrink-0" size={20} /><div><h3 className="font-bold text-gray-200">{t('organizer_label')}</h3><p className="text-gray-300">{event.organizer}</p></div></div>
                </div>
                
                {event.eventType === 'EXTERNAL' && (
                  <button onClick={handleExternalLinkClick} className={buttonClassName}>
                    {t('register_button')}
                  </button>
                )}
                 {event.eventType === 'INTERNAL' && (
                  <Link to={`/dashboard`} className={buttonClassName}>
                    {t('register_button')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16"><HorizontalAd /></div>
      </div>
    </div>
  );
};

export default EventDetail;