import { useState, useMemo, Fragment } from 'react';
import type { FC } from 'react';
import { Plus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { usePlantManager } from '../../hooks/admin/usePlantManager';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const lang: 'id' | 'en' = 'id';

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

const CustomDropdown: FC<{ options: { id: string | number; name: string }[]; selectedValue: string; onSelect: (value: string) => void; placeholder: string; }> = ({ options, selectedValue, onSelect, placeholder }) => {
    const selectedLabel = options.find(opt => opt.id.toString() === selectedValue)?.name || placeholder;
    return (
        <Menu as="div" className="relative inline-block text-left w-full">
            <div><Menu.Button className="inline-flex w-full justify-between items-center rounded-lg bg-transparent border border-lime-400/60 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-[#004A49]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400">{selectedLabel}<ChevronDown className="ml-2 -mr-1 h-5 w-5 text-lime-200/70" aria-hidden="true" /></Menu.Button></div>
            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute left-0 mt-2 w-full origin-top-right divide-y divide-gray-600 rounded-md bg-[#003938] border-2 border-lime-400/50 shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                    <div className="px-1 py-1 max-h-60 overflow-y-auto">
                        <Menu.Item>{({ active }) => (<button onClick={() => onSelect('all')} className={`${active ? 'bg-[#004A49] text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}>{placeholder}</button>)}</Menu.Item>
                        {options.map((option) => (<Menu.Item key={option.id}>{({ active }) => (<button onClick={() => onSelect(option.id.toString())} className={`${active ? 'bg-[#004A49] text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}>{option.name}</button>)}</Menu.Item>))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export const PlantManagementPage: FC = () => {
    const navigate = useNavigate();
    const { plants, plantTypes, isLoading, handleDelete } = usePlantManager();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlantType, setSelectedPlantType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const PLANTS_PER_PAGE = 12;

    const filteredPlants = useMemo(() => {
        if (!plants) return [];
        return plants.filter(plant => {
            const searchMatch = searchTerm.trim() === '' ||
                plant.name[lang].toLowerCase().includes(searchTerm.toLowerCase()) ||
                plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
            const plantTypeMatch = selectedPlantType === 'all' || plant.plantType?.id.toString() === selectedPlantType;
            return searchMatch && plantTypeMatch;
        });
    }, [plants, searchTerm, selectedPlantType]);

    const totalPages = Math.ceil(filteredPlants.length / PLANTS_PER_PAGE);
    const paginatedPlants = useMemo(() => {
        const startIndex = (currentPage - 1) * PLANTS_PER_PAGE;
        return filteredPlants.slice(startIndex, startIndex + PLANTS_PER_PAGE);
    }, [filteredPlants, currentPage]);

    const confirmDelete = (plantId: number) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-2">
                <p className="font-semibold text-white">Yakin ingin menghapus tanaman ini?</p>
                <div className="flex gap-2">
                    <button
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-sm"
                        onClick={() => { handleDelete(plantId); toast.dismiss(t.id); }}
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

    if (isLoading) return <div className="text-center text-gray-300 p-8">Memuat data tanaman...</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90">Manajemen Tanaman</h2>
                <button onClick={() => navigate('/admin/plants/new')} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 transition-colors"><Plus size={20} /> Tambah Tanaman</button>
            </div>

            <div className="mb-6 p-4 bg-[#0b5351]/30 border border-lime-400/30 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Cari nama tanaman..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-400" />
                    <CustomDropdown placeholder="Semua Tipe Tanaman" selectedValue={selectedPlantType} onSelect={(value) => { setSelectedPlantType(value); setCurrentPage(1); }} options={plantTypes.map(pt => ({ id: pt.id, name: pt.name[lang] }))} />
                </div>
            </div>

            {/* ▼▼▼ PERUBAHAN DI SINI ▼▼▼ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPlants.map(plant => (
                    <div key={plant.id} className="bg-[#0b5351]/30 border border-lime-400/30 shadow-md rounded-lg overflow-hidden flex flex-col">
                        <div className="w-full aspect-video bg-black/20">
                            <img 
                                src={plant.imageUrl || 'https://placehold.co/1280x720/eeeeee/cccccc?text=Gambar+Tidak+Tersedia'} 
                                alt={plant.name[lang]} 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold text-gray-200">{plant.name[lang] || plant.name.en}</h3>
                                <p className="text-sm text-gray-400 italic mb-2">{plant.scientificName}</p>
                            </div>
                            <div className="flex justify-end items-center gap-3 pt-2">
                                <button onClick={() => navigate(`/admin/plants/view/${plant.id}`)} className="text-xs bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded">Lihat</button>
                                <button onClick={() => navigate(`/admin/plants/edit/${plant.id}`)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">Ubah</button>
                                <button onClick={() => confirmDelete(plant.id)} className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">Hapus</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {plants.length > 0 && filteredPlants.length === 0 && (<div className="col-span-full text-center py-12 text-gray-400 bg-[#0b5351]/30 rounded-lg"><p className="text-lg">Tidak Ditemukan</p><p>Tidak ada tanaman yang cocok dengan kriteria filter Anda.</p></div>)}
            
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />
        </div>
    );
};