import type { FC } from 'react';
import { Fragment } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useLayoutData } from '../hooks/useLayoutData';
import { usePlantsPage } from '../hooks/usePlantsPage';
import { plantsTranslations } from '../assets/plants.i18n';
import PlantCard from '../components/PlantCard';
import VerticalAd from '../components/VerticalAd';
import HorizontalAd from '../components/HorizontalAd';

// Komponen Dropdown Custom
interface CustomDropdownProps {
    options: { value: string | number; label: string }[];
    selectedValue: string | number;
    onSelect: (value: string) => void;
    placeholder: string;
}
const CustomDropdown: FC<CustomDropdownProps> = ({ options, selectedValue, onSelect, placeholder }) => {
    const selectedLabel = options.find(opt => opt.value.toString() === selectedValue.toString())?.label || placeholder;
    return (
        <Menu as="div" className="relative inline-block text-left w-full">
            <Menu.Button className="inline-flex w-full justify-between items-center rounded-lg bg-[#003938] border border-lime-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-80 focus:outline-none">
                {selectedLabel}
                <ChevronDown className="ml-2 -mr-1 h-5 w-5" />
            </Menu.Button>
            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute left-0 mt-2 w-full origin-top-right rounded-md bg-[#003938] border-2 border-lime-400/50 shadow-lg ring-1 ring-black/5 focus:outline-none z-10"><div className="px-1 py-1 max-h-60 overflow-y-auto"><Menu.Item>{({ active }) => (<button type="button" onClick={() => onSelect('all')} className={`${active ? 'bg-[#004A49] text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}>{placeholder}</button>)}</Menu.Item>{options.map((option) => (<Menu.Item key={option.value}>{({ active }) => (<button type="button" onClick={() => onSelect(String(option.value))} className={`${active ? 'bg-[#004A49] text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}>{option.label}</button>)}</Menu.Item>))}</div></Menu.Items></Transition>
        </Menu>
    );
};


const PlantPage: FC = () => {
  const { lang: currentLang } = useOutletContext<{ lang: 'id' | 'en' }>();
  const t = (key: keyof typeof plantsTranslations.id) => plantsTranslations[currentLang]?.[key] || key;
  
  const { data: layoutData } = useLayoutData();
  const { page, setPage, filters, handleFilterChange, plants, pagination, isLoading, isError, isFetching } = usePlantsPage();

  const renderContent = () => {
    if (isLoading) return <p className="text-center text-gray-300 py-16">{t('loading_plants')}</p>;
    if (isError) return <p className="text-center text-red-400 py-16">{t('error_plants')}</p>;
    if (plants.length === 0) {
      return (
        <div className="text-center text-gray-400 py-16"><h3 className="text-2xl font-semibold mb-2 text-white">{t('no_plants_title')}</h3><p>{t('no_plants_desc')}</p></div>
      );
    }
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {plants.map(plant => <PlantCard key={plant.id} plant={plant} lang={currentLang} />)}
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
        
        <div className="mb-12 p-4 bg-[#004A49]/60 border-2 border-lime-400/50 rounded-lg flex flex-col sm:flex-row items-center gap-4">
          <SlidersHorizontal className="text-lime-400 hidden sm:block flex-shrink-0" size={24} />
          {/* --- BAGIAN INI YANG DIPERBAIKI --- */}
          {/* Kelas sm:max-w-xs dan sm:mx-auto dihapus agar dropdown menjadi panjang */}
          <div className="w-full">
            <CustomDropdown 
              placeholder={t('all_families')} 
              selectedValue={filters.familyId} 
              onSelect={(val) => handleFilterChange('familyId', val)} 
              options={layoutData?.plantTypes.map(pt => ({ value: pt.id, label: pt.name[currentLang] })) || []} 
            />
          </div>
        </div>

        <div className="mb-12"><HorizontalAd /></div>
        {renderContent()}
      </div>
    </div>
  );
};

export default PlantPage;