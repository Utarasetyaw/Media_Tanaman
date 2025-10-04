import React, { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { TaxonomyManager } from './components/TaxonomyManager';
import { GeneralSettingsComponent } from './components/GeneralSettingsComponent';
import { SeoSettingsComponent } from './components/SeoSettingsComponent';
import { TrackingSettingsComponent } from './components/TrackingSettingsComponent';
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

type ActiveTab = 'categories' | 'plantTypes' | 'general' | 'seo' | 'tracking';

const tabs: { key: ActiveTab, label: string }[] = [
    { key: 'general', label: 'Pengaturan Umum' },
    { key: 'seo', label: 'Pengaturan SEO' },
    { key: 'tracking', label: 'Google & Ads' },
    { key: 'categories', label: 'Manajemen Kategori' },
    { key: 'plantTypes', label: 'Manajemen Tipe Tanaman' },
];

export const CompanyManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('general');

    const renderContent = () => {
        switch (activeTab) {
            case 'categories':
                return <TaxonomyManager queryKey="adminCategories" title="Manajemen Kategori" itemName="Kategori" api={categoryApi} />;
            case 'plantTypes':
                return <TaxonomyManager queryKey="adminPlantTypes" title="Manajemen Tipe Tanaman" itemName="Tipe Tanaman" api={plantTypeApi} />;
            case 'general':
                return <GeneralSettingsComponent />;
            case 'seo':
                return <SeoSettingsComponent />;
            case 'tracking':
                return <TrackingSettingsComponent />;
            default:
                return null;
        }
    };

    const currentTabLabel = tabs.find(tab => tab.key === activeTab)?.label;

    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90 mb-4">Pengaturan Situs</h2>
            
            <div className="mb-6">
                {/* ▼▼▼ PERUBAHAN BREAKPOINT DARI 'md' KE 'lg' ▼▼▼ */}
                {/* Tampilan Dropdown untuk Mobile & Tablet (di bawah breakpoint 'lg') */}
                <div className="lg:hidden"> 
                    <Menu as="div" className="relative inline-block text-left w-full">
                        <div>
                            <Menu.Button className="inline-flex justify-between w-full rounded-md border border-lime-400/50 px-4 py-3 bg-transparent text-sm font-medium text-gray-200 hover:bg-lime-900/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                                {currentTabLabel}
                                <ChevronDown className="-mr-1 ml-2 h-5 w-5 text-lime-300" aria-hidden="true" />
                            </Menu.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute left-0 mt-2 w-full origin-top-right divide-y divide-gray-700 rounded-md bg-[#0b5351] shadow-lg ring-1 ring-black/5 focus:outline-none border border-lime-400/50 z-10">
                                <div className="px-1 py-1">
                                    {tabs.map((tab) => (
                                        <Menu.Item key={tab.key}>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => setActiveTab(tab.key)}
                                                    className={`${active ? 'bg-lime-500/20 text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                >
                                                    {tab.label}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>

                {/* Tampilan Tab untuk Desktop (di atas breakpoint 'lg') */}
                <div className="hidden lg:block border-b border-lime-400/30">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map((tab) => (
                             <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key ? 'border-lime-400 text-lime-300' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                {/* ▲▲▲ AKHIR PERUBAHAN BREAKPOINT ▲▲▲ */}
            </div>

            <div>
                {renderContent()}
            </div>
        </div>
    );
};