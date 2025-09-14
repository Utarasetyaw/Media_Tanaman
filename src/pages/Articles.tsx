import type { FC } from 'react';
import { Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
// REVISI: Import ikon diperbarui agar sesuai dengan halaman Beranda
import { ListFilter, Sprout, ChevronDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useLayoutData } from '../hooks/useLayoutData';
import { useArticlesPage } from '../hooks/useArticlesPage';
import { articlesTranslations } from '../assets/articles.i18n';
import ArticleCard from '../components/ArticlesCard';
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';

// --- Komponen Dropdown Custom (Diperbarui untuk mendukung ikon) ---
interface CustomDropdownProps {
    options: { value: string | number; label: string }[];
    selectedValue: string | number;
    onSelect: (value: string) => void;
    placeholder: string;
    icon?: React.ReactNode; // Prop ikon ditambahkan
}

const CustomDropdown: FC<CustomDropdownProps> = ({ options, selectedValue, onSelect, placeholder, icon }) => {
    const selectedLabel = options.find(opt => opt.value.toString() === selectedValue.toString())?.label || placeholder;
    return (
        <Menu as="div" className="relative inline-block text-left w-full">
            {/* REVISI: Styling tombol disamakan dengan Beranda */}
            <Menu.Button className="inline-flex w-full justify-between items-center rounded-lg bg-[#003938] border border-lime-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-lime-400">
                <div className="flex items-center overflow-hidden">
                    {/* REVISI: Logika untuk menampilkan ikon ditambahkan */}
                    {icon && <span className="mr-2 opacity-80 flex-shrink-0">{icon}</span>}
                    <span className="truncate">{selectedLabel}</span>
                </div>
                <ChevronDown className="ml-2 -mr-1 h-5 w-5 flex-shrink-0" />
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


const ArticlePage: FC = () => {
  const { lang: currentLang } = useOutletContext<{ lang: 'id' | 'en' }>();
  const t = (key: keyof typeof articlesTranslations.id) => articlesTranslations[currentLang]?.[key] || key;
  
  const { data: layoutData } = useLayoutData();
  const { page, setPage, filters, handleFilterChange, articles, pagination, isLoading, isError, isFetching } = useArticlesPage();

  const renderContent = () => {
    if (isLoading) return <p className="text-center text-gray-300 py-16">{t('loading_articles')}</p>;
    if (isError) return <p className="text-center text-red-400 py-16">{t('error_articles')}</p>;
    if (articles.length === 0) {
      return (
        <div className="text-center text-gray-400 py-16">
          <h3 className="text-2xl font-semibold mb-2 text-white">{t('no_articles_title')}</h3>
          <p>{t('no_articles_desc')}</p>
        </div>
      );
    }
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {articles.map(article => <ArticleCard key={article.id} article={article} lang={currentLang} />)}
        </div>
        
        <div className="flex justify-center items-center gap-4 mt-12">
          <button onClick={() => setPage(old => Math.max(old - 1, 1))} disabled={page === 1 || isFetching} className="px-4 py-2 bg-lime-400 text-gray-900 font-bold rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">{t('previous_button')}</button>
          <span className="text-white font-medium">{t('page_info').replace('{currentPage}', String(pagination?.currentPage)).replace('{totalPages}', String(pagination?.totalPages))}</span>
          <button onClick={() => setPage(old => (pagination && old < pagination.totalPages ? old + 1 : old))} disabled={!pagination || page === pagination.totalPages || isFetching} className="px-4 py-2 bg-lime-400 text-gray-900 font-bold rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">{t('next_button')}</button>
        </div>
        {isFetching && <span className="block text-center text-sm text-gray-400 mt-2">{t('fetching')}</span>}
      </>
    );
  };

  return (
    <div className="relative w-full bg-[#003938] min-h-screen">
      <VerticalAd position="left" />
      <VerticalAd position="right" />

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-60 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-lime-400 mb-4">{t('title')}</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">{t('description')}</p>
        </div>
        
        {/* REVISI: Layout filter diubah menjadi grid 2 kolom dan diberi ikon */}
        <div className="mb-12 p-3 bg-[#004A49]/60 border-2 border-lime-400/50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomDropdown 
            placeholder={t('all_categories')} 
            selectedValue={filters.categoryId} 
            onSelect={(val) => handleFilterChange('categoryId', val)} 
            options={layoutData?.categories.map(cat => ({ value: cat.id, label: cat.name[currentLang] })) || []} 
            icon={<ListFilter size={16} />}
          />
          <CustomDropdown 
            placeholder={t('all_plants')} 
            selectedValue={filters.plantTypeId} 
            onSelect={(val) => handleFilterChange('plantTypeId', val)} 
            options={layoutData?.plantTypes.map(pt => ({ value: pt.id, label: pt.name[currentLang] })) || []} 
            icon={<Sprout size={16} />}
          />
        </div>

        <div className="mb-12"><HorizontalAd /></div>

        {renderContent()}
      </div>
    </div>
  );
};

export default ArticlePage;