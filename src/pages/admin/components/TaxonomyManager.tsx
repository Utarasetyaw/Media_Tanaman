import React, { useState } from 'react';
import { Trash2, PlusCircle, Save, LoaderCircle, Edit } from 'lucide-react';
import { useTaxonomyManager } from '../../../hooks/admin/useTaxonomyManager';
import type { TaxonomyItem } from '../../../hooks/admin/useTaxonomyManager';

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

const inputClassName = "w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-lime-400 transition-colors";

export const TaxonomyManager: React.FC<TaxonomyManagerProps> = ({ queryKey, title, itemName, api }) => {
  const { items, isLoading, isError, isMutating, createItem, updateItem, deleteItem } = useTaxonomyManager(queryKey, api);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaxonomyItem | null>(null);
  const [formData, setFormData] = useState({ id: '', en: '' });
  const [newItemName, setNewItemName] = useState({ id: '', en: '' });

  const handleOpenModal = (item: TaxonomyItem | null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item.name);
    } else {
      setEditingItem(null);
      setFormData({ id: '', en: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ id: '', en: '' });
  };
  
  const handleCreate = async () => {
    if (!newItemName.id) {
        alert(`${itemName} dalam Bahasa Indonesia wajib diisi.`);
        return;
    }
    try {
        await createItem({ name: { id: newItemName.id, en: newItemName.en || newItemName.id } });
        setNewItemName({ id: '', en: '' });
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
        await updateItem({ id: editingItem.id, data: { name: formData } });
        handleCloseModal();
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
    <div className="bg-[#0b5351]/30 p-4 sm:p-6 rounded-lg border border-lime-400/50">
      <h3 className="text-xl font-bold text-gray-200 mb-4">{title}</h3>
      
      {/* ▼▼▼ PERUBAHAN DI SINI ▼▼▼ */}
      <div className="flex flex-col gap-4 mb-6 p-4 border border-lime-400/20 rounded-md">
        <h4 className="font-semibold text-gray-200">Tambah {itemName} Baru</h4>
        <div>
          {/* Label untuk input Indonesia */}
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {itemName} (ID)
          </label>
          <input
            type="text"
            placeholder={`${itemName} dalam Bahasa Indonesia`}
            value={newItemName.id}
            onChange={(e) => setNewItemName(prev => ({ ...prev, id: e.target.value }))}
            className={inputClassName}
          />
        </div>
        <div>
          {/* Label untuk input English */}
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {itemName} (EN)
          </label>
           <input
            type="text"
            placeholder={`${itemName} dalam Bahasa Inggris (Opsional)`}
            value={newItemName.en}
            onChange={(e) => setNewItemName(prev => ({ ...prev, en: e.target.value }))}
            className={inputClassName}
          />
        </div>
        <button 
            onClick={handleCreate}
            disabled={isMutating}
            className="w-full bg-lime-400 text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 shrink-0 transition-colors disabled:bg-gray-500 disabled:cursor-wait mt-2"
        >
          {isMutating ? <LoaderCircle size={18} className="animate-spin" /> : <PlusCircle size={18} />}
          <span>Tambah</span>
        </button>
      </div>
      {/* ▲▲▲ AKHIR PERUBAHAN ▲▲▲ */}

      {isMutating && <div className="text-sm text-lime-300 text-center mb-2">Memproses...</div>}

      <div className="divide-y divide-lime-400/30 border border-lime-400/30 rounded-md">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center p-3 transition-colors hover:bg-lime-500/10">
            <div className="flex-grow">
                <p className="text-gray-200 font-medium">{item.name.id}</p>
                <p className="text-gray-400 text-sm">{item.name.en}</p>
            </div>
            <div className='flex gap-2 shrink-0 self-end sm:self-center'>
              <button onClick={() => handleOpenModal(item)} disabled={isMutating} className="text-blue-400 hover:text-blue-300 p-2 transition-colors disabled:text-gray-500"><Edit size={20}/></button>
              <button onClick={() => handleDelete(item.id)} disabled={isMutating} className="text-red-500 hover:text-red-400 p-2 transition-colors disabled:text-gray-500"><Trash2 size={20}/></button>
            </div>
          </div>
        ))}
        {items.length === 0 && !isLoading && <p className='text-gray-400 text-center py-4'>Belum ada data.</p>}
      </div>

      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#073f3d] rounded-lg shadow-xl w-full max-w-lg border border-lime-400/50">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Ubah {itemName}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {itemName} (ID)
                </label>
                <input
                  type="text"
                  placeholder={`${itemName} (Indonesia)`}
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {itemName} (EN)
                </label>
                <input
                  type="text"
                  placeholder={`${itemName} (English)`}
                  value={formData.en}
                  onChange={(e) => setFormData(prev => ({ ...prev, en: e.target.value }))}
                  className={inputClassName}
                />
              </div>
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