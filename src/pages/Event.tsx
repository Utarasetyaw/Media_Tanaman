import { Fragment } from 'react';
import type { FC } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Calendar, MapPin, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useLayoutData } from '../hooks/useLayoutData';
import { useEventsPage } from '../hooks/useEventsPage';
import { eventsTranslations } from '../assets/events.i18n';
import type { Event } from '../types/event';
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';
import BannerAd from '../components/BannerAd';

// --- Komponen Dropdown Custom ---
interface CustomDropdownProps {
    options: { value: string | number; label: string }[];
    selectedValue: string | number;
    onSelect: (value: string) => void;
    placeholder: string;
    name?: string;
}

const CustomDropdown: FC<CustomDropdownProps> = ({ options, selectedValue, onSelect, placeholder, name }) => {
    const selectedLabel = options.find(opt => opt.value.toString() === selectedValue.toString())?.label || placeholder;
    return (
        <Menu as="div" className="relative inline-block text-left w-full">
            <Menu.Button name={name} className="inline-flex w-full justify-between items-center rounded-lg bg-[#003938] border border-lime-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-80 focus:outline-none">
                {selectedLabel}
                <ChevronDown className="ml-2 -mr-1 h-5 w-5" />
            </Menu.Button>
            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute left-0 mt-2 w-full origin-top-right rounded-md bg-[#003938] border-2 border-lime-400/50 shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                    <div className="px-1 py-1 max-h-60 overflow-y-auto">
                        <Menu.Item>
                            {({ active }) => (
                                <button type="button" onClick={() => onSelect('all')} className={`${active ? 'bg-[#004A49] text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}>
                                    {placeholder}
                                </button>
                            )}
                        </Menu.Item>
                        {options.map((option) => (
                            <Menu.Item key={option.value}>
                                {({ active }) => (
                                    <button type="button" onClick={() => onSelect(String(option.value))} className={`${active ? 'bg-[#004A49] text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}>
                                        {option.label}
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

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
  
  const { data: layoutData } = useLayoutData();
  const { isLoading, isError, filters, setFilters, featuredEvent, otherUpcomingEvents, pastEvents } = useEventsPage();

  const handleFilterChange = (name: 'categoryId' | 'plantTypeId', value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <div className="bg-[#003938] min-h-screen text-center py-16 text-white">{t('loading')}</div>;
  if (isError) return <div className="bg-[#003938] min-h-screen text-center py-16 text-red-400">{t('error')}</div>;
  
  return (
    <div className="relative w-full bg-[#003938] min-h-screen">
      <VerticalAd position="left" />
      <VerticalAd position="right" />

      {/* --- BAGIAN INI YANG DIPERBAIKI --- */}
      {/* Menambahkan padding "2xl:px-60" untuk konsistensi layout */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-60 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-lime-400 mb-4">{t('title')}</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">{t('description')}</p>
        </div>

        <div className="mb-12 p-4 bg-[#004A49]/60 border-2 border-lime-400/50 rounded-lg flex flex-col sm:flex-row items-center gap-4">
          <SlidersHorizontal className="text-lime-400 hidden sm:block flex-shrink-0" size={24} />
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomDropdown placeholder={t('all_plants')} selectedValue={filters.plantTypeId} onSelect={(val) => handleFilterChange('plantTypeId', val)} options={layoutData?.plantTypes.map(pt => ({ value: pt.id, label: pt.name[currentLang] })) || []} />
            <CustomDropdown placeholder={t('all_categories')} selectedValue={filters.categoryId} onSelect={(val) => handleFilterChange('categoryId', val)} options={layoutData?.categories.map(cat => ({ value: cat.id, label: cat.name[currentLang] })) || []} />
          </div>
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
                  <section><h3 className="font-serif text-3xl font-bold text-center text-lime-400 mb-8">{t('other_events')}</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">{otherUpcomingEvents.map(event => <EventCard key={event.id} event={event} lang={currentLang}/>)}</div></section>
                )}
                {pastEvents.length > 0 && (
                  <section><h3 className="font-serif text-3xl font-bold text-center text-lime-400 mb-8">{t('past_events')}</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">{pastEvents.map(event => <EventCard key={event.id} event={event} isPast lang={currentLang}/>)}</div></section>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default EventPage;