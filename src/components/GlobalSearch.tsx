import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Book, Leaf, Calendar } from 'lucide-react';
import api from '../services/apiService';
import type { LocalizedString } from '../types/article'; // Asumsi tipe ini ada

// --- Tipe Data untuk Hasil Pencarian ---
interface SearchResultItem {
  id: number;
  title: LocalizedString;
  imageUrl: string;
}
interface SearchResult {
  articles: SearchResultItem[];
  plants: SearchResultItem[];
  events: SearchResultItem[];
}

const lang: 'id' | 'en' = 'id';

// --- Komponen untuk satu item hasil pencarian ---
interface ResultItemProps {
  to: string;
  imageUrl: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}
const ResultItem: FC<ResultItemProps> = ({ to, imageUrl, title, icon, onClick }) => (
  <Link to={to} onClick={onClick} className="flex items-center gap-3 p-2 rounded-md hover:bg-lime-400/20 transition-colors">
    <img src={imageUrl} alt={title} className="w-10 h-10 object-cover rounded" />
    <div className="flex-grow">
      <p className="font-semibold text-gray-100">{title}</p>
    </div>
    <div className="text-lime-400 flex-shrink-0">{icon}</div>
  </Link>
);

// --- Komponen Utama Pencarian ---
const GlobalSearch: FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debouncing: Tunda pencarian hingga pengguna berhenti mengetik selama 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fungsi untuk mengambil data pencarian
  const fetchSearchResults = async (query: string): Promise<SearchResult> => {
    const { data } = await api.get(`/search?q=${query}`);
    return data;
  };

  // Gunakan Tanstack Query untuk fetch data
  const { data, isLoading } = useQuery<SearchResult, Error>({
    queryKey: ['siteSearch', debouncedSearchTerm],
    queryFn: () => fetchSearchResults(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length >= 3, // Hanya aktifkan query jika input >= 3 karakter
  });

  // Logika untuk menutup dropdown saat klik di luar area pencarian
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsResultsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeResults = () => {
    setIsResultsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="search"
        className="block w-full bg-white/20 border border-transparent rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white/25 sm:text-sm"
        placeholder="Cari tanaman, artikel..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsResultsOpen(true)}
      />
      
      {isResultsOpen && searchTerm.length >= 3 && (
        <div className="absolute top-full mt-2 w-full max-w-lg bg-[#004A49] border-2 border-lime-400 rounded-lg shadow-xl z-50 p-4 max-h-96 overflow-y-auto">
          {isLoading && <p className="text-gray-300 text-center">Mencari...</p>}
          
          {!isLoading && data && (
            <div className="space-y-4">
              {data.articles.length === 0 && data.plants.length === 0 && data.events.length === 0 && (
                <p className="text-gray-400 text-center">Tidak ada hasil ditemukan.</p>
              )}

              {data.articles.length > 0 && (
                <div>
                  <h4 className="font-bold text-lime-400 text-sm mb-2">Artikel</h4>
                  {data.articles.map(item => <ResultItem key={`article-${item.id}`} to={`/news/${item.id}`} imageUrl={item.imageUrl} title={item.title[lang]} icon={<Book size={16}/>} onClick={closeResults} />)}
                </div>
              )}
              {data.plants.length > 0 && (
                 <div>
                  <h4 className="font-bold text-lime-400 text-sm mb-2">Tanaman</h4>
                  {data.plants.map(item => <ResultItem key={`plant-${item.id}`} to={`/plants/${item.id}`} imageUrl={item.imageUrl} title={item.title[lang]} icon={<Leaf size={16}/>} onClick={closeResults} />)}
                </div>
              )}
              {data.events.length > 0 && (
                 <div>
                  <h4 className="font-bold text-lime-400 text-sm mb-2">Event</h4>
                  {data.events.map(item => <ResultItem key={`event-${item.id}`} to={`/events/${item.id}`} imageUrl={item.imageUrl} title={item.title[lang]} icon={<Calendar size={16}/>} onClick={closeResults} />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;