import React, { useState } from 'react';
import { TaxonomyManager } from './components/TaxonomyManager';
import { GeneralSettingsComponent } from './components/GeneralSettingsComponent'; // <-- Impor komponen baru
import * as api from '../../services/apiAdmin';

type ActiveTab = 'categories' | 'plantTypes' | 'general';

export const CompanyManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('general'); // Default ke Pengaturan Umum

    const renderContent = () => {
        switch (activeTab) {
            case 'categories':
                return (
                    <TaxonomyManager
                        title="Manajemen Kategori"
                        itemName="Kategori"
                        api={{
                            getAll: api.getCategories,
                            create: api.createCategory,
                            update: api.updateCategory,
                            delete: api.deleteCategory,
                        }}
                    />
                );
            case 'plantTypes':
                return (
                    <TaxonomyManager
                        title="Manajemen Tipe Tanaman"
                        itemName="Tipe Tanaman"
                        api={{
                            getAll: api.getPlantTypes,
                            create: api.createPlantType,
                            update: api.updatePlantType,
                            delete: api.deletePlantType,
                        }}
                    />
                );
            case 'general':
                return <GeneralSettingsComponent />; // <-- Gunakan komponen baru di sini
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