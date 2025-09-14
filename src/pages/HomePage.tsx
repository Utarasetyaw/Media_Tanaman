import type { FC } from 'react';
import { Fragment, useState, useRef, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Calendar, MapPin, ChevronDown, ListFilter, ChevronLeft, ChevronRight, Sprout } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useHomePage } from '../hooks/useHomePage';
import type { Article, Event, Plant, Category, BannerImage, LocalizedString } from '../hooks/useHomePage';
import { homeTranslations } from '../assets/home.i18n';
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';
import BannerAd from '../components/BannerAd';
import ArticleCard from '../components/ArticlesCard';

// --- Sub-Komponen ---

const SidebarLink: FC<{ article: { id: number; title: LocalizedString }, lang: 'id' | 'en' }> = ({ article, lang }) => (
    <Link to={`/news/${article.id}`} className="font-serif font-semibold text-gray-200 py-3 border-b-2 border-lime-400/50 block transition-colors duration-200 hover:text-lime-400">
        {article.title[lang]}
    </Link>
);

// REVISI: Komponen HeroBanner sekarang menampilkan slider otomatis
const HeroBanner: FC<{ banners: BannerImage[] }> = ({ banners }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Jangan jalankan interval jika hanya ada satu atau tidak ada banner
        if (!banners || banners.length <= 1) return;

        // Atur interval untuk mengubah banner setiap 5 detik
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
        }, 5000);

        // Bersihkan interval saat komponen tidak lagi ditampilkan
        return () => clearInterval(timer);
    }, [banners]);

    if (!banners || banners.length === 0) {
        return <div className="w-full rounded-lg shadow-xl bg-gray-800 aspect-[2/1] sm:aspect-[3/1]"></div>;
    }

    return (
        <div className="w-full rounded-lg shadow-xl overflow-hidden relative aspect-[2/1] sm:aspect-[3/1]">
            {banners.map((banner, index) => (
                <img
                    key={banner.id}
                    src={banner.imageUrl}
                    alt={`Banner ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                        index === currentIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            ))}
        </div>
    );
};

const CustomDropdown: FC<{ options: { value: string | number; label: string }[], selectedValue: string | number, onSelect: (value: string) => void, placeholder: string, icon?: React.ReactNode }> = ({ options, selectedValue, onSelect, placeholder, icon }) => {
    const selectedLabel = options.find(opt => opt.value.toString() === selectedValue.toString())?.label || placeholder;
    return (
        <Menu as="div" className="relative inline-block text-left w-full">
            <Menu.Button className="inline-flex w-full justify-between items-center rounded-lg bg-[#003938] border border-lime-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-lime-400">
                <div className="flex items-center overflow-hidden">
                    {icon && <span className="mr-2 opacity-80 flex-shrink-0">{icon}</span>}
                    <span className="truncate">{selectedLabel}</span>
                </div>
                <ChevronDown className="ml-2 -mr-1 h-5 w-5 flex-shrink-0" />
            </Menu.Button>
            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute left-0 mt-2 w-full origin-top-right rounded-md bg-[#003938] border-2 border-lime-400/50 shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                    <div className="px-1 py-1 max-h-60 overflow-y-auto">
                        <Menu.Item>{({ active }) => (<button type="button" onClick={() => onSelect('all')} className={`${active ? 'bg-[#004A49] text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}>{placeholder}</button>)}</Menu.Item>
                        {options.map((option) => (<Menu.Item key={option.value}>{({ active }) => (<button type="button" onClick={() => onSelect(String(option.value))} className={`${active ? 'bg-[#004A49] text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}>{option.label}</button>)}</Menu.Item>))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

const EventCard: FC<{ event: Event, lang: 'id' | 'en', t: (key: keyof typeof homeTranslations.id) => string }> = ({ event, lang, t }) => {
    if (!event || !event.title) return null;
    const formattedDate = new Date(event.startDate).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
    return (
        <div className="bg-[#004A49]/60 rounded-lg shadow-md overflow-hidden border-2 border-lime-400/80">
            <div className="flex flex-col md:flex-row"><Link to={`/events/${event.id}`} className="block md:w-2/5 flex-shrink-0"><img src={event.imageUrl} alt={event.title[lang]} className="w-full h-48 md:h-full object-cover" /></Link>
                <div className="p-4 sm:p-6 flex flex-col justify-center flex-grow">
                    <div><p className="font-sans inline-block bg-lime-100 text-lime-800 text-xs font-bold px-3 py-1 rounded-full mb-3">{t('running_event_badge')}</p><h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-gray-100"><Link to={`/events/${event.id}`} className="hover:text-lime-400 transition-colors">{event.title[lang]}</Link></h3>
                        <div className="font-sans mt-4 space-y-2 text-gray-300"><div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-gray-400" /><span>{formattedDate}</span></div><div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-gray-400" /><span>{event.location}</span></div></div>
                    </div>
                    <div className="mt-6"><Link to={`/events/${event.id}`} className="font-sans inline-block bg-lime-300 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-lime-400 transition-colors">{t('view_event_button')}</Link></div>
                </div>
            </div>
        </div>
    );
};

const UpcomingEvent: FC<{ event: Event, lang: 'id' | 'en', t: (key: keyof typeof homeTranslations.id) => string }> = ({ event, lang, t }) => (<section className="py-12"><h2 className="font-serif text-2xl sm:text-3xl font-bold text-lime-400 text-center mb-8">{t('community_event')}</h2><div className="max-w-4xl mx-auto"><EventCard event={event} lang={lang} t={t} /></div></section>);
const FeaturedPlant: FC<{ plant: Plant, lang: 'id' | 'en', t: (key: keyof typeof homeTranslations.id) => string }> = ({ plant, lang, t }) => (<section className="py-12"><div className="max-w-4xl mx-auto bg-[#004A49]/60 p-4 sm:p-6 md:p-8 rounded-lg border-2 border-lime-400/80 grid md:grid-cols-2 gap-8 items-center"><div className="w-full aspect-[4/5] md:aspect-square rounded-lg overflow-hidden bg-black/20"><img src={plant.imageUrl} alt={plant.name[lang]} className="w-full h-full object-cover" /></div><div className="flex flex-col justify-center"><h3 className="font-sans text-lime-400 font-bold uppercase text-sm tracking-wider">{t('plant_of_the_week')}</h3><h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-100 my-2">{plant.name[lang]}</h2><p className="font-sans text-gray-300 leading-relaxed line-clamp-4">{plant.description[lang]}</p><div className="mt-6"><Link to={`/plants/${plant.id}`} className="font-sans inline-block bg-lime-300 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-lime-400 transition-colors">{t('view_plant_detail_button')}</Link></div></div></div></section>);

// REVISI: Komponen Filter sekarang responsif
const CategoryFilters: FC<{ categories: Category[]; plantTypes: Category[]; onFilterChange: (newFilters: Partial<{ categoryId?: number | string; plantTypeId?: number | string; }>) => void; lang: 'id' | 'en'; t: (key: keyof typeof homeTranslations.id) => string; filters: { categoryId?: number | string; plantTypeId?: number | string; }; }> = ({ categories, plantTypes, onFilterChange, lang, t, filters }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const plantTypesForFilter = [
        { id: 'all', name: { id: t('all_plant_types'), en: 'All Plant Types' } },
        ...(plantTypes || [])
    ];
    const itemCount = plantTypesForFilter.length;

    const gridColsMap: { [key: number]: string } = {
        1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5',
    };
    const gridClass = gridColsMap[itemCount] || 'grid-cols-5';

    const checkArrows = () => {
        if (scrollRef.current) {
            const { scrollWidth, clientWidth, scrollLeft } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (scrollElement) {
            checkArrows();
            scrollElement.addEventListener('scroll', checkArrows);
            window.addEventListener('resize', checkArrows);
            return () => {
                scrollElement.removeEventListener('scroll', checkArrows);
                window.removeEventListener('resize', checkArrows);
            };
        }
    }, [plantTypesForFilter]);
    
    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * 0.7;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="my-8 flex flex-col md:flex-row items-center gap-4 rounded-lg bg-[#004A49]/60 border-2 border-lime-400/50 p-3">
            {/* Dropdown Kategori (Selalu tampil) */}
            <div className="w-full md:w-auto md:min-w-[200px] flex-shrink-0">
                <CustomDropdown
                    placeholder={t('all_categories')}
                    selectedValue={filters.categoryId || 'all'}
                    onSelect={(val) => onFilterChange({ categoryId: val })}
                    options={categories.map(cat => ({ value: cat.id, label: cat.name[lang] }))}
                    icon={<ListFilter size={16} />}
                />
            </div>

            {/* Dropdown Tipe Tanaman (HANYA TAMPIL DI HP/TABLET) */}
            <div className="w-full md:hidden">
                <CustomDropdown
                    placeholder={t('all_plant_types')}
                    selectedValue={filters.plantTypeId || 'all'}
                    onSelect={(val) => onFilterChange({ plantTypeId: val })}
                    options={plantTypes.map(pt => ({ value: pt.id, label: pt.name[lang] }))}
                    icon={<Sprout size={16} />}
                />
            </div>

            {/* Pemisah (HANYA TAMPIL DI DESKTOP) */}
            <div className="hidden md:block w-px h-8 bg-lime-400/50"></div>
            
            {/* Tombol/Slider Tipe Tanaman (HANYA TAMPIL DI DESKTOP) */}
            <div className="w-full md:flex-1 relative hidden md:block">
                {itemCount <= 5 && (
                    <div className={`grid ${gridClass} gap-2 w-full`}>
                        {plantTypesForFilter.map(pt => (
                            <button key={pt.id} onClick={() => onFilterChange({ plantTypeId: pt.id })} className={`w-full px-4 py-2.5 text-sm font-semibold rounded-md transition-colors duration-200 whitespace-nowrap ${(filters.plantTypeId === pt.id) ? 'bg-lime-300 text-lime-900' : 'bg-[#003938]/80 text-gray-200 hover:bg-[#003938]'}`}>
                                {pt.name[lang]}
                            </button>
                        ))}
                    </div>
                )}
                {itemCount > 5 && (
                    <div className="relative flex items-center">
                        {showLeftArrow && (
                            <button onClick={() => handleScroll('left')} className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-[#003938]/80 text-white hover:bg-[#003938] backdrop-blur-sm">
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <div ref={scrollRef} className="w-full overflow-x-auto scrollbar-hide">
                            <div className="flex items-center gap-2">
                                {plantTypesForFilter.map(pt => (
                                    <button key={pt.id} onClick={() => onFilterChange({ plantTypeId: pt.id })} className={`px-4 py-2.5 text-sm font-semibold rounded-md transition-colors duration-200 whitespace-nowrap ${(filters.plantTypeId === pt.id) ? 'bg-lime-300 text-lime-900' : 'bg-[#003938]/80 text-gray-200 hover:bg-[#003938]'}`}>
                                        {pt.name[lang]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {showRightArrow && (
                             <button onClick={() => handleScroll('right')} className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-[#003938]/80 text-white hover:bg-[#003938] backdrop-blur-sm">
                                <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Komponen Utama ---

const Home: FC = () => {
    const { lang: currentLang } = useOutletContext<{ lang: 'id' | 'en' }>();
    const t = (key: keyof typeof homeTranslations.id): string => homeTranslations[currentLang]?.[key] || key;

    const { staticData, isLoading, isError, filters, handleFilterChange, articleChunks, isScrollButtonVisible, scrollToTop } = useHomePage();

    if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-[#003938] text-white">{t('loading')}</div>;
    if (isError || !staticData) return <div className="h-screen w-full flex items-center justify-center bg-[#003938] text-red-400">{t('error')}</div>;

    const { mostViewedArticle, latestArticles, topHeadlines, runningEvents, plants, bannerImages, categories, plantTypes } = staticData;

    return (
        <div className="relative w-full bg-[#003938]">
            <VerticalAd position="left" />
            <VerticalAd position="right" />
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-60">
                <div className="pt-8">
                    <HeroBanner banners={bannerImages} />
                    <CategoryFilters categories={categories} plantTypes={plantTypes} onFilterChange={handleFilterChange} lang={currentLang} t={t} filters={filters} />
                </div>

                <HorizontalAd />

                <div className="py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-8">
                        <main className="lg:col-span-2">
                            {mostViewedArticle && (
                                <section>
                                    <div className="aspect-video bg-black/20 rounded-lg shadow-md overflow-hidden"><img src={mostViewedArticle.imageUrl} alt={mostViewedArticle.title[currentLang]} className="w-full h-full object-cover" /></div>
                                    <div className="font-sans text-lime-400 font-bold uppercase text-sm tracking-wider mt-4">{mostViewedArticle.category.name[currentLang]}</div>
                                    <h2><Link to={`/news/${mostViewedArticle.id}`} className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-100 my-2 block hover:text-lime-400 transition-colors">{mostViewedArticle.title[currentLang]}</Link></h2>
                                    <p className="font-sans text-base sm:text-lg text-gray-300 leading-relaxed line-clamp-3">{mostViewedArticle.excerpt[currentLang]}</p>
                                    <div className="mt-4"><Link to={`/news/${mostViewedArticle.id}`} className="font-sans inline-block bg-lime-300 text-gray-900 font-bold px-6 py-2 rounded-lg hover:bg-lime-400 transition-colors text-sm">{t('view_news_button')}</Link></div>
                                </section>
                            )}
                            <hr className="my-10 border-t-2 border-lime-400/50" />
                            <section>
                                <h2 className="font-serif text-2xl font-bold text-gray-100 mb-6">{t('latest_news')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {latestArticles.map(article => <ArticleCard key={article.id} article={article} lang={currentLang} />)}
                                </div>
                            </section>
                        </main>
                        <aside className="mt-12 lg:mt-0 lg:pl-8 lg:border-l-2 lg:border-lime-400/50">
                            <h3 className="font-serif text-lg font-bold uppercase text-lime-400 border-b-2 border-lime-400/50 pb-2 mb-6">{t('top_headlines')}</h3>
                            <div className="flex flex-col">{topHeadlines.map(article => <SidebarLink key={`headline-${article.id}`} article={article} lang={currentLang} />)}</div>
                            <div className="mt-6 flex flex-col gap-3"><BannerAd /><div className="hidden lg:flex flex-col gap-3"><BannerAd /><BannerAd /></div></div>
                        </aside>
                    </div>
                </div>

                <section className="mt-12 pt-8 border-t-2 border-lime-400/50">
                    <div className="pb-2">
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-lime-400 text-center mb-8">{t('more_for_you')}</h2>
                        {articleChunks.length > 0 ? (
                            <div className="flex flex-col">
                                {articleChunks.map((chunk, index) => (
                                    <Fragment key={`chunk-${index}`}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                            {chunk.map((article: Article) => <ArticleCard key={article.id} article={article} lang={currentLang} />)}
                                        </div>
                                        {index === 0 && runningEvents.length > 0 && <UpcomingEvent event={runningEvents[0]} lang={currentLang} t={t} />}
                                        {index === 1 && plants.length > 0 && <FeaturedPlant plant={plants[0]} lang={currentLang} t={t} />}
                                        {index < articleChunks.length - 1 && <div className="my-8"><HorizontalAd /></div>}
                                        {index < articleChunks.length - 1 && <hr className="my-10 border-t-2 border-lime-400/50" />}
                                    </Fragment>
                                ))}
                            </div>
                        ) : (!isLoading && <p className="text-center text-gray-400 p-8">{t('no_articles_found')}</p>)}
                    </div>
                </section>

                <div>
                    <hr className="my-10 border-t-2 border-lime-400/50" />
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8">
                        <Link to="/articles" className="font-sans w-full sm:w-auto text-center bg-lime-300 text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-lime-400 transition-colors text-lg">{t('more_news_button')}</Link>
                        {isScrollButtonVisible && (<button onClick={scrollToTop} className="font-sans w-full sm:w-auto bg-gray-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors text-lg shadow-md" aria-label="Kembali ke atas">{t('back_to_top_button')}</button>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
