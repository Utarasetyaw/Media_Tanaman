import React, { useState, useEffect } from 'react';
import { Trash2, PlusCircle, Save } from 'lucide-react';

interface TaxonomyItem {
  id: number;
  name: { id: string; en: string };
}

interface TaxonomyManagerProps {
  title: string;
  itemName: string;
  api: {
    getAll: () => Promise<TaxonomyItem[]>;
    create: (name: { id: string; en: string }) => Promise<TaxonomyItem>;
    update: (id: number, name: { id: string; en: string }) => Promise<TaxonomyItem>;
    delete: (id: number) => Promise<void>;
  };
}

const inputClassName = "w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-lime-400 transition-colors";

export const TaxonomyManager: React.FC<TaxonomyManagerProps> = ({ title, itemName, api }) => {
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [newItemName, setNewItemName] = useState({ id: '', en: '' });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAll();
      setItems(data);
    } catch (error) {
      console.error(`Failed to fetch ${itemName}s`, error);
      alert(`Gagal memuat ${itemName}.`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- REVISI DI SINI ---
  useEffect(() => {
    fetchData();
  }, [itemName]); // Dependensi ditambahkan agar data di-fetch ulang saat tab berubah

  const handleCreate = async () => {
    if (!newItemName.id || !newItemName.en) {
      alert(`${itemName} dalam kedua bahasa wajib diisi.`);
      return;
    }
    try {
      await api.create(newItemName);
      setNewItemName({ id: '', en: '' });
      fetchData();
    } catch (error) {
      alert(`Gagal membuat ${itemName} baru.`);
    }
  };

  const handleUpdate = async (id: number, name: { id: string; en: string }) => {
     try {
      await api.update(id, name);
      alert(`${itemName} berhasil diperbarui!`);
      fetchData();
    } catch (error) {
      alert(`Gagal memperbarui ${itemName}.`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${itemName} ini?`)) {
      try {
        await api.delete(id);
        fetchData();
      } catch (error: any) {
        alert(error.response?.data?.error || `Gagal menghapus ${itemName}. Mungkin sedang digunakan.`);
      }
    }
  };
  
  const handleItemChange = (index: number, lang: 'id' | 'en', value: string) => {
    const updatedItems = [...items];
    updatedItems[index].name[lang] = value;
    setItems(updatedItems);
  };


  if (isLoading) return <div className="text-white text-center p-4">Loading {title}...</div>

  return (
    <div className="bg-[#0b5351]/30 p-6 rounded-lg border border-lime-400/50">
      <h3 className="text-xl font-bold text-gray-200 mb-4">{title}</h3>
      
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
            className="bg-lime-400 text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 shrink-0 transition-colors"
        >
          <PlusCircle size={18} /> Tambah
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-center p-3 border border-gray-700/50 rounded-md">
            <input
              type="text"
              value={item.name.id}
              onChange={(e) => handleItemChange(index, 'id', e.target.value)}
              className={inputClassName}
            />
            <input
              type="text"
              value={item.name.en}
              onChange={(e) => handleItemChange(index, 'en', e.target.value)}
              className={inputClassName}
            />
            <div className='flex gap-2 shrink-0'>
              <button onClick={() => handleUpdate(item.id, item.name)} className="text-blue-400 hover:text-blue-300 p-2 transition-colors"><Save size={20}/></button>
              <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400 p-2 transition-colors"><Trash2 size={20}/></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className='text-gray-400 text-center py-4'>Belum ada data.</p>}
      </div>
    </div>
  );
};