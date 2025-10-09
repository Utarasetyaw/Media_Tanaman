import React, { useState, useMemo, Fragment } from 'react';
import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useEventManager } from '../../hooks/admin/useEventManager';
import { toast } from 'react-hot-toast';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
const Pagination: FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    const commonButtonClasses = "px-3 py-1 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const activeClasses = "bg-lime-400 text-lime-900 border-lime-400";
    const inactiveClasses = "bg-black/20 border-lime-400/50 text-gray-300 hover:bg-lime-400/10";
    const arrowButtonClasses = "flex items-center gap-1 border " + inactiveClasses;
    return (
        <nav className="flex items-center justify-between mt-6" aria-label="Pagination">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`${commonButtonClasses} ${arrowButtonClasses}`}><ChevronLeft size={16} /><span>Sebelumnya</span></button>
            <div className="hidden sm:flex items-center gap-2">{pageNumbers.map(page => (<button key={page} onClick={() => onPageChange(page)} className={`${commonButtonClasses} border ${currentPage === page ? activeClasses : inactiveClasses}`} aria-current={currentPage === page ? 'page' : undefined}>{page}</button>))}</div>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`${commonButtonClasses} ${arrowButtonClasses}`}><span>Selanjutnya</span><ChevronRight size={16} /></button>
        </nav>
    );
};

const formatDateRange = (start: string, end: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const startDate = new Date(start).toLocaleDateString('id-ID', options);
    const endDate = new Date(end).toLocaleDateString('id-ID', options);
    return `${startDate} - ${endDate}`;
};

const CustomDropdown: FC<{
    options: { value: string | number; label: string }[];
    selectedValue: string | number;
    onSelect: (value: any) => void;
    placeholder: string;
    name?: string;
}> = ({ options, selectedValue, onSelect, placeholder, name }) => {
    const selectedLabel = options.find(opt => opt.value.toString() === selectedValue.toString())?.label || placeholder;
    return (
        <Menu as="div" className="relative inline-block text-left w-full">
            <div><Menu.Button name={name} className="inline-flex w-full justify-between items-center rounded-lg bg-transparent border border-lime-400/60 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-[#004A49]/50 focus:outline-none">{selectedLabel}<ChevronDown className="ml-2 -mr-1 h-5 w-5 text-lime-200/70" aria-hidden="true" /></Menu.Button></div>
            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute left-0 mt-2 w-full origin-top-right divide-y divide-gray-600 rounded-md bg-[#003938] border-2 border-lime-400/50 shadow-lg ring-1 ring-black/5 focus:outline-none z-10"><div className="px-1 py-1 max-h-60 overflow-y-auto">{options.map((option) => (<Menu.Item key={option.value}>{({ active }) => (<button type="button" onClick={() => onSelect(option.value)} className={`${active ? 'bg-[#004A49] text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}>{option.label}</button>)}</Menu.Item>))}</div></Menu.Items>
            </Transition>
        </Menu>
    );
};

export const EventManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { events, isLoadingList, filter, setFilter, handleDelete } = useEventManager();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const EVENTS_PER_PAGE = 12;

    const finalFilteredEvents = useMemo(() => {
        if (!events) return [];
        return events.filter(event => {
            return searchTerm.trim() === '' ||
                event.title.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [events, searchTerm]);

    const totalPages = Math.ceil(finalFilteredEvents.length / EVENTS_PER_PAGE);
    const paginatedEvents = useMemo(() => {
        const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
        return finalFilteredEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE);
    }, [finalFilteredEvents, currentPage]);

    const confirmDelete = (eventId: number) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-2">
                <p className="font-semibold text-white">Yakin ingin menghapus event ini?</p>
                <div className="flex gap-2">
                    <button
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-sm"
                        onClick={() => {
                            handleDelete(eventId);
                            toast.dismiss(t.id);
                        }}
                    >
                        Ya, Hapus
                    </button>
                    <button
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md text-sm"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Batal
                    </button>
                </div>
            </div>
        ));
    };

    if (isLoadingList) return <div className="text-center text-gray-300 p-8">Memuat data event...</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90">Manajemen Event</h2>
                <button onClick={() => navigate('/admin/events/new')} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 transition-colors"><Plus size={20} /> Tambah Event</button>
            </div>
            
            <div className="mb-6 p-4 bg-[#0b5351]/30 border border-lime-400/30 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input type="text" placeholder="Cari event..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-400" />
                     <CustomDropdown
                        placeholder="Semua Tipe Event"
                        selectedValue={filter}
                        onSelect={(value) => { setFilter(value); setCurrentPage(1); }}
                        options={[
                            { value: 'ALL', label: 'Semua Tipe Event' },
                            { value: 'INTERNAL', label: 'Internal' },
                            { value: 'EXTERNAL', label: 'Eksternal' }
                        ]}
                     />
                </div>
            </div>

            {/* ▼▼▼ PERUBAHAN DI SINI ▼▼▼ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedEvents.map(event => (
                    <div key={event.id} className="bg-[#0b5351]/30 border border-lime-400/30 shadow-md rounded-lg overflow-hidden flex flex-col">
                        <div className="relative">
                            <div className="w-full aspect-video bg-black/20">
                                <img src={event.imageUrl} alt={event.title.id} className="w-full h-full object-cover"/>
                            </div>
                            <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full ${event.eventType === 'INTERNAL' ? 'bg-blue-200 text-blue-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                {event.eventType === 'INTERNAL' ? 'Internal' : 'Eksternal'}
                            </span>
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <p className="text-sm font-semibold text-lime-300">{formatDateRange(event.startDate, event.endDate)}</p>
                            <h3 className="text-lg font-bold mt-1 text-gray-200 line-clamp-2 flex-grow">{event.title.id || event.title.en}</h3>
                            <p className="text-sm text-gray-400 mt-1">oleh {event.organizer}</p>
                            <div className="flex justify-end gap-2 mt-4 pt-2">
                                <Link to={`/admin/events/${event.id}`} className="text-xs bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded">Detail</Link>
                                <button onClick={() => navigate(`/admin/events/edit/${event.id}`)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">Ubah</button>
                                <button onClick={() => confirmDelete(event.id)} className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">Hapus</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {finalFilteredEvents.length === 0 && (<div className="text-center py-12 text-gray-400 bg-[#0b5351]/30 rounded-lg mt-6"><p className="text-lg">Tidak Ditemukan</p><p>Tidak ada event yang cocok dengan kriteria filter Anda.</p></div>)}
            
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />
        </div>
    );
};