import React, { useState } from 'react'; // useEffect dihapus karena tidak digunakan
import { Trash2, PlusCircle, Save, LoaderCircle, Edit } from 'lucide-react';
import { useTaxonomyManager } from '../../../hooks/useTaxonomyManager';
import type { TaxonomyItem } from '../../../hooks/useTaxonomyManager';

// --- Tipe Data Props (tidak berubah) ---
interface TaxonomyManagerProps {
  queryKey: string;
  title: string;
  itemName: string;
  api: {
    getAll: () => Promise<TaxonomyItem[]>;
    create: (data: { name: { id: string; en: string } }) => Promise<TaxonomyItem>;
    update: (id: number, data: Partial<{ name: { id: string; en: string } }>) => Promise<TaxonomyItem>;
    delete: (id: number) => Promise<void>;
  };
}

// --- Komponen UI Kecil (tidak berubah) ---
const inputClassName = "w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-lime-400 transition-colors";

export const TaxonomyManager: React.FC<TaxonomyManagerProps> = ({ queryKey, title, itemName, api }) => {
  const { items, isLoading, isError, isMutating, createItem, updateItem, deleteItem } = useTaxonomyManager(queryKey, api);

  // REVISI: Sesuaikan state form agar cocok dengan struktur data { name: { id, en } }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaxonomyItem | null>(null);
  // State untuk data di dalam form modal
  const [formData, setFormData] = useState({ id: '', en: '' });
  // State untuk form "Tambah Baru" di atas
  const [newItemName, setNewItemName] = useState({ id: '', en: '' });


  // --- Handlers ---
  const handleOpenModal = (item: TaxonomyItem | null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item.name); // Isi form dengan item.name
    } else {
      setEditingItem(null);
      setFormData({ id: '', en: '' }); // Form kosong untuk item baru via modal
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ id: '', en: '' });
  };
  
  const handleCreate = async () => {
    if (!newItemName.id || !newItemName.en) {
        alert(`${itemName} dalam kedua bahasa wajib diisi.`);
        return;
    }
    try {
        // REVISI: Bungkus data dalam properti 'name'
        await createItem({ name: newItemName });
        setNewItemName({ id: '', en: '' }); // Reset form
    } catch (e) {
        console.error("Gagal membuat item:", e);
    }
  };

  const handleUpdate = async () => {
    if (!formData.id || !formData.en) {
        alert(`${itemName} dalam kedua bahasa wajib diisi.`);
        return;
    }
    if (!editingItem) return;
    
    try {
        // REVISI: Bungkus data dalam properti 'name'
        await updateItem({ id: editingItem.id, data: { name: formData } });
        handleCloseModal(); // Tutup modal setelah berhasil
    } catch (e) {
        console.error("Gagal memperbarui item:", e);
    }
  };
  
  const handleDelete = (id: number) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${itemName} ini?`)) {
      deleteItem(id);
    }
  };

  if (isLoading) return <div className="text-white text-center p-4">Memuat {title}...</div>;
  if (isError) return <div className="text-red-400 text-center p-4">Gagal memuat data.</div>;

  return (
    <div className="bg-[#0b5351]/30 p-6 rounded-lg border border-lime-400/50">
      <h3 className="text-xl font-bold text-gray-200 mb-4">{title}</h3>
      
      {/* Form Tambah Cepat di Atas */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 border border-lime-400/20 rounded-md">
        <input
          type="text"
          placeholder={`${itemName} (Indonesia)`}
          value={newItemName.id}
          onChange={(e) => setNewItemName(prev => ({ ...prev, id: e.target.value }))}
          className={inputClassName}
        />
        <input
          type="text"
          placeholder={`${itemName} (English)`}
          value={newItemName.en}
          onChange={(e) => setNewItemName(prev => ({ ...prev, en: e.target.value }))}
          className={inputClassName}
        />
        <button 
            onClick={handleCreate}
            disabled={isMutating}
            className="bg-lime-400 text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 shrink-0 transition-colors disabled:bg-gray-500 disabled:cursor-wait"
        >
          {isMutating ? <LoaderCircle size={18} className="animate-spin" /> : <PlusCircle size={18} />}
          Tambah
        </button>
      </div>

      {isMutating && <div className="text-sm text-lime-300 text-center mb-2">Memproses...</div>}

      {/* Daftar Item */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 items-center p-3 border border-gray-700/50 rounded-md">
            <div className="flex-grow">
                <p className="text-gray-200 font-medium">{item.name.id}</p>
                <p className="text-gray-400 text-sm">{item.name.en}</p>
            </div>
            <div className='flex gap-2 shrink-0'>
              <button onClick={() => handleOpenModal(item)} disabled={isMutating} className="text-blue-400 hover:text-blue-300 p-2 transition-colors disabled:text-gray-500"><Edit size={20}/></button>
              <button onClick={() => handleDelete(item.id)} disabled={isMutating} className="text-red-500 hover:text-red-400 p-2 transition-colors disabled:text-gray-500"><Trash2 size={20}/></button>
            </div>
          </div>
        ))}
        {items.length === 0 && !isLoading && <p className='text-gray-400 text-center py-4'>Belum ada data.</p>}
      </div>

      {/* Modal untuk Edit */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#073f3d] rounded-lg shadow-xl w-full max-w-lg border border-lime-400/50">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Edit {itemName}</h3>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder={`${itemName} (Indonesia)`}
                value={formData.id}
                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                className={inputClassName}
              />
              <input
                type="text"
                placeholder={`${itemName} (English)`}
                value={formData.en}
                onChange={(e) => setFormData(prev => ({ ...prev, en: e.target.value }))}
                className={inputClassName}
              />
            </div>
            <div className="p-4 flex justify-end gap-3 bg-black/20 rounded-b-lg">
              <button onClick={handleCloseModal} disabled={isMutating} className="bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-500 disabled:opacity-70">Batal</button>
              <button onClick={handleUpdate} disabled={isMutating} className="bg-lime-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-lime-600 disabled:opacity-50 flex items-center gap-2">
                {isMutating ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};