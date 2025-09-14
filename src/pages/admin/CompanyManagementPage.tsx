import React, { useState } from 'react';
import { TaxonomyManager } from './components/TaxonomyManager';
import { GeneralSettingsComponent } from './components/GeneralSettingsComponent';
import api from '../../services/apiService'; 

// Tipe data untuk payload API taksonomi
type TaxonomyPayload = { name: { id: string; en: string } };

// Fungsi-fungsi API untuk Kategori
const categoryApi = {
  getAll: () => api.get('/categories').then(res => res.data),
  create: (data: TaxonomyPayload) => api.post('/categories', data).then(res => res.data),
  update: (id: number, data: Partial<TaxonomyPayload>) => api.put(`/categories/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/categories/${id}`).then(res => res.data),
};

// Fungsi-fungsi API untuk Tipe Tanaman
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
                        api={categoryApi}
                    />
                );
            case 'plantTypes':
                return (
                    <TaxonomyManager
                        queryKey="adminPlantTypes"
                        title="Manajemen Tipe Tanaman"
                        itemName="Tipe Tanaman"
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
            <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90 mb-4">Pengaturan Situs</h2>
            
            <div className="mb-6 border-b border-lime-400/30">
                {/* REVISI: Navigasi dibuat flex-col di mobile dan flex-row di layar lebih besar */}
                <nav className="-mb-px flex flex-col sm:flex-row sm:space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`text-left sm:text-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'general' ? 'border-lime-400 text-lime-300' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        Pengaturan Umum
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`text-left sm:text-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'categories' ? 'border-lime-400 text-lime-300' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        Manajemen Kategori
                    </button>
                    <button
                        onClick={() => setActiveTab('plantTypes')}
                        className={`text-left sm:text-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'plantTypes' ? 'border-lime-400 text-lime-300' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        Manajemen Tipe Tanaman
                    </button>
                </nav>
            </div>

            <div>
                {renderContent()}
            </div>
        </div>
    );
};