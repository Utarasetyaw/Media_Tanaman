import React, { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Book, Leaf, Calendar, X } from 'lucide-react';
import api from '../services/apiService';
import type { LocalizedString } from '../types/article';
import { navTranslations } from '../assets/nav.i18n';

// --- Tipe Data (REVISI DI SINI) ---
interface SearchResultItem { id: number; title: LocalizedString; imageUrl: string; }
// Tipe baru untuk tanaman yang menggunakan properti "name"
interface PlantSearchResultItem { id: number; name: LocalizedString; imageUrl: string; }

interface SearchResult {
  articles: SearchResultItem[];
  // Menggunakan tipe baru untuk tanaman
  plants: PlantSearchResultItem[];
  events: SearchResultItem[];
}
interface ResultItemProps { to: string; imageUrl: string; title: string; icon: React.ReactNode; onClick: () => void; }
interface GlobalSearchProps {
  lang: 'id' | 'en';
  t: (key: keyof typeof navTranslations.id) => string;
}

// Komponen ResultItem
const ResultItem: FC<ResultItemProps> = ({ to, imageUrl, title, icon, onClick }) => (
  <Link to={to} onClick={onClick} className="flex items-center gap-3 p-2 rounded-md hover:bg-lime-400/20 transition-colors">
    <img src={imageUrl} alt={title} className="w-10 h-10 object-cover rounded" />
    <div className="flex-grow"><p className="font-semibold text-gray-100">{title}</p></div>
    <div className="text-lime-400 flex-shrink-0">{icon}</div>
  </Link>
);

// --- Komponen Utama Pencarian ---
const GlobalSearch: FC<GlobalSearchProps> = ({ lang, t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchSearchResults = async (query: string): Promise<SearchResult> => {
    const { data } = await api.get(`/search?q=${query}`);
    return data;
  };

  const { data, isLoading } = useQuery<SearchResult, Error>({
    queryKey: ['siteSearch', debouncedSearchTerm],
    queryFn: () => fetchSearchResults(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length >= 2,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setIsResultsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeResults = () => { setIsResultsOpen(false); setSearchTerm(''); };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
      <input
        type="search"
        className="block w-full bg-white/10 border-2 border-transparent rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white/20 sm:text-sm"
        placeholder={t('search_placeholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsResultsOpen(true)}
      />
      
      {isResultsOpen && searchTerm.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-[#004A49] border-2 border-lime-400 rounded-lg shadow-xl z-50 max-h-96 flex flex-col">
          <div className="p-2 flex justify-between items-center border-b border-lime-400/20 flex-shrink-0">
            <span className="text-xs text-gray-400 ml-2">Hasil Pencarian</span>
            <button onClick={closeResults} className="p-1 text-gray-400 hover:text-white rounded-full transition-colors"><X size={18} /></button>
          </div>
          
          <div className="p-2 overflow-y-auto">
            {isLoading && <p className="text-gray-300 text-center py-4">{t('searching')}</p>}
            {!isLoading && data && (
              <div className="space-y-3">
                {data.articles.length === 0 && data.plants.length === 0 && data.events.length === 0 && (<p className="text-gray-400 text-center py-4">{t('no_results')}</p>)}
                
                {data.articles.length > 0 && (<div><h4 className="font-bold text-lime-400 text-sm mb-1 px-2">{t('articles_section')}</h4>{data.articles.map(item => <ResultItem key={`article-${item.id}`} to={`/news/${item.id}`} imageUrl={item.imageUrl} title={item.title[lang]} icon={<Book size={16}/>} onClick={closeResults} />)}</div>)}
                
                {/* --- BAGIAN RENDER TANAMAN DIPERBAIKI DI SINI --- */}
                {/* Menggunakan "item.name" bukan "item.title" */}
                {data.plants.length > 0 && (<div><h4 className="font-bold text-lime-400 text-sm mb-1 px-2">{t('plants_section')}</h4>{data.plants.map(item => <ResultItem key={`plant-${item.id}`} to={`/plants/${item.id}`} imageUrl={item.imageUrl} title={item.name[lang]} icon={<Leaf size={16}/>} onClick={closeResults} />)}</div>)}
                
                {data.events.length > 0 && (<div><h4 className="font-bold text-lime-400 text-sm mb-1 px-2">{t('events_section')}</h4>{data.events.map(item => <ResultItem key={`event-${item.id}`} to={`/events/${item.id}`} imageUrl={item.imageUrl} title={item.title[lang]} icon={<Calendar size={16}/>} onClick={closeResults} />)}</div>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;