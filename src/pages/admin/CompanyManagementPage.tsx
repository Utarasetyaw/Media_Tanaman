import React, { useState } from 'react';
import { TaxonomyManager } from './components/TaxonomyManager';
import { GeneralSettingsComponent } from './components/GeneralSettingsComponent';
// REVISI: Impor 'api' dari service utama, bukan dari 'apiAdmin' yang tidak ada
import api from '../../services/apiService'; 

// --- Tipe Data Lokal untuk API ---
// Ini harus cocok dengan tipe 'TaxonomyPayload' di dalam hook
type TaxonomyPayload = { name: { id: string; en: string } };

// REVISI: Definisikan fungsi-fungsi API untuk Kategori di sini
const categoryApi = {
  getAll: () => api.get('/categories').then(res => res.data),
  create: (data: TaxonomyPayload) => api.post('/categories', data).then(res => res.data),
  update: (id: number, data: Partial<TaxonomyPayload>) => api.put(`/categories/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/categories/${id}`).then(res => res.data),
};

// REVISI: Definisikan fungsi-fungsi API untuk Tipe Tanaman di sini
const plantTypeApi = {
  getAll: () => api.get('/plant-types').then(res => res.data),
  create: (data: TaxonomyPayload) => api.post('/plant-types', data).then(res => res.data),
  update: (id: number, data: Partial<TaxonomyPayload>) => api.put(`/plant-types/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/plant-types/${id}`).then(res => res.data),
};

type ActiveTab = 'categories' | 'plantTypes' | 'general';

export const CompanyManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('general');

    const renderContent = () => {
        switch (activeTab) {
            case 'categories':
                return (
                    <TaxonomyManager
                        queryKey="adminCategories" 
                        title="Manajemen Kategori"
                        itemName="Kategori"
                        // REVISI: Berikan objek API yang sudah kita definisikan di atas
                        api={categoryApi}
                    />
                );
            case 'plantTypes':
                return (
                    <TaxonomyManager
                        queryKey="adminPlantTypes"
                        title="Manajemen Tipe Tanaman"
                        itemName="Tipe Tanaman"
                        // REVISI: Berikan objek API yang sudah kita definisikan di atas
                        api={plantTypeApi}
                    />
                );
            case 'general':
                return <GeneralSettingsComponent />;
            default:
                return null;
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-lime-200/90 mb-4">Pengaturan Situs</h2>
            
            <div className="mb-6 border-b border-lime-400/30">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'categories' ? 'border-lime-400 text-lime-300' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        Manajemen Kategori
                    </button>
                    <button
                        onClick={() => setActiveTab('plantTypes')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'plantTypes' ? 'border-lime-400 text-lime-300' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        Manajemen Tipe Tanaman
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'general' ? 'border-lime-400 text-lime-300' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        Pengaturan Umum
                    </button>
                </nav>
            </div>

            <div>
                {renderContent()}
            </div>
        </div>
    );
};