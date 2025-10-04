import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings2, ArrowLeft, Save } from 'lucide-react';
import type { ArticleSeo } from '../../types/admin/adminarticleseo.types';
import { useArticleSeo } from '../../hooks/admin/useArticleSeo';

// Helper komponen
const Input = (props: React.ComponentProps<'input'>) => (
    <input {...props} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-400" />
);

const Textarea = (props: React.ComponentProps<'textarea'>) => (
    <textarea {...props} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-400 font-mono" />
);

const Select = (props: React.ComponentProps<'select'>) => (
    <select {...props} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-lime-400" />
);

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="pt-4 border-t border-lime-400/30">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);


const initialSeoData: Partial<ArticleSeo> = {
    metaTitle: { id: '', en: '' },
    metaDescription: { id: '', en: '' },
    keywords: '',
    canonicalUrl: '',
    metaRobots: 'index, follow',
    ogTitle: { id: '', en: '' },
    ogDescription: { id: '', en: '' },
    ogImageUrl: '',
    ogType: 'article',
    ogUrl: '',
    ogSiteName: '',
    twitterCard: 'summary_large_image',
    twitterTitle: { id: '', en: '' },
    twitterDescription: { id: '', en: '' },
    twitterImageUrl: '',
    twitterSite: '',
    twitterCreator: '',
    structuredData: '',
};

export const ArticleSeoPage: React.FC = () => {
    const { articleData, isLoading, isSaving, saveSeo } = useArticleSeo();
    const [seoData, setSeoData] = useState<Partial<ArticleSeo>>(initialSeoData);

    useEffect(() => {
        if (articleData?.seo) {
            setSeoData(prev => ({ ...prev, ...articleData.seo }));
        }
    }, [articleData]);
    
    const handleLocalizedChange = (field: keyof ArticleSeo, lang: 'id' | 'en', value: string) => {
        setSeoData(prev => ({
            ...prev,
            [field]: { ...(prev[field] as object), [lang]: value }
        }));
    };

    const handleSimpleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setSeoData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { id, articleId, ...cleanedSeoData } = seoData;
        if (typeof cleanedSeoData.structuredData === 'string' && cleanedSeoData.structuredData.trim().startsWith('{')) {
            try {
                cleanedSeoData.structuredData = JSON.parse(cleanedSeoData.structuredData);
            } catch (error) {
                alert('Format JSON pada Data Terstruktur tidak valid.');
                return;
            }
        }
        saveSeo(cleanedSeoData);
    };

    if (isLoading) { return <div className="text-white p-8 text-center">Memuat data SEO...</div>; }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* ▼▼▼ PERUBAHAN TATA LETAK HEADER DI SINI ▼▼▼ */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90 flex items-center gap-3">
                        <Settings2 /> Pengaturan SEO
                    </h2>
                    <p className="text-gray-300 mt-1">
                        Untuk artikel: <span className="font-bold text-white">{articleData?.title.id}</span>
                    </p>
                </div>
                <Link to="/admin/articles" className="w-full sm:w-auto text-lime-300 hover:text-lime-100 flex items-center justify-center sm:justify-start gap-2 bg-black/20 px-4 py-2 rounded-lg border border-lime-400/50 transition-colors">
                    <ArrowLeft size={16} /> Kembali ke Manajemen Artikel
                </Link>
            </div>
            {/* ▲▲▲ AKHIR PERUBAHAN HEADER ▲▲▲ */}


            <form onSubmit={handleSubmit} className="bg-[#004A49]/60 border-2 border-lime-400/50 shadow-lg rounded-lg p-4 sm:p-6 space-y-6">
                
                <Section title="Meta Tags Utama">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Meta Judul (ID)</label>
                            <Input value={seoData.metaTitle?.id || ''} onChange={(e) => handleLocalizedChange('metaTitle', 'id', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Meta Judul (EN)</label>
                            <Input value={seoData.metaTitle?.en || ''} onChange={(e) => handleLocalizedChange('metaTitle', 'en', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Meta Deskripsi (ID)</label>
                        <Textarea value={seoData.metaDescription?.id || ''} onChange={(e) => handleLocalizedChange('metaDescription', 'id', e.target.value)} rows={3} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Meta Deskripsi (EN)</label>
                        <Textarea value={seoData.metaDescription?.en || ''} onChange={(e) => handleLocalizedChange('metaDescription', 'en', e.target.value)} rows={3} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Kata Kunci</label>
                        <Input name="keywords" value={seoData.keywords || ''} onChange={handleSimpleInputChange} />
                        <p className="text-xs text-gray-400 mt-1">Pisahkan dengan koma, contoh: tanaman hias, monstera.</p>
                    </div>
                </Section>
                
                <Section title="Open Graph (Untuk Sharing Media Sosial)">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">OG Judul (ID)</label>
                            <Input value={seoData.ogTitle?.id || ''} onChange={(e) => handleLocalizedChange('ogTitle', 'id', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">OG Judul (EN)</label>
                            <Input value={seoData.ogTitle?.en || ''} onChange={(e) => handleLocalizedChange('ogTitle', 'en', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">OG Deskripsi (ID)</label>
                        <Textarea value={seoData.ogDescription?.id || ''} onChange={(e) => handleLocalizedChange('ogDescription', 'id', e.target.value)} rows={3} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">OG Deskripsi (EN)</label>
                        <Textarea value={seoData.ogDescription?.en || ''} onChange={(e) => handleLocalizedChange('ogDescription', 'en', e.target.value)} rows={3} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">OG URL Gambar</label><Input name="ogImageUrl" type="url" value={seoData.ogImageUrl || ''} onChange={handleSimpleInputChange} placeholder="https://..."/></div>
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">OG Tipe</label><Input name="ogType" value={seoData.ogType || ''} onChange={handleSimpleInputChange} /></div>
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">OG URL</label><Input name="ogUrl" type="url" value={seoData.ogUrl || ''} onChange={handleSimpleInputChange} placeholder="https://..."/></div>
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">OG Nama Situs</label><Input name="ogSiteName" value={seoData.ogSiteName || ''} onChange={handleSimpleInputChange} /></div>
                    </div>
                </Section>

                <Section title="Twitter Card (Untuk Sharing Twitter)">
                     <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Twitter Judul (ID)</label>
                            <Input value={seoData.twitterTitle?.id || ''} onChange={(e) => handleLocalizedChange('twitterTitle', 'id', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Twitter Judul (EN)</label>
                            <Input value={seoData.twitterTitle?.en || ''} onChange={(e) => handleLocalizedChange('twitterTitle', 'en', e.target.value)} />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Twitter Deskripsi (ID)</label>
                        <Textarea value={seoData.twitterDescription?.id || ''} onChange={(e) => handleLocalizedChange('twitterDescription', 'id', e.target.value)} rows={3} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Twitter Deskripsi (EN)</label>
                        <Textarea value={seoData.twitterDescription?.en || ''} onChange={(e) => handleLocalizedChange('twitterDescription', 'en', e.target.value)} rows={3} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">Twitter URL Gambar</label><Input name="twitterImageUrl" type="url" value={seoData.twitterImageUrl || ''} onChange={handleSimpleInputChange} placeholder="https://..."/></div>
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">Twitter Card Type</label>
                            <Select name="twitterCard" value={seoData.twitterCard || ''} onChange={handleSimpleInputChange}>
                                <option value="summary_large_image">Summary with Large Image</option>
                                <option value="summary">Summary</option>
                                <option value="app">App</option>
                                <option value="player">Player</option>
                            </Select>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">Twitter Site (@username)</label><Input name="twitterSite" value={seoData.twitterSite || ''} onChange={handleSimpleInputChange} placeholder="@namasitus"/></div>
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">Twitter Creator (@username)</label><Input name="twitterCreator" value={seoData.twitterCreator || ''} onChange={handleSimpleInputChange} placeholder="@namaauthor"/></div>
                    </div>
                </Section>

                <Section title="Pengaturan Lanjutan">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">Meta Robots</label>
                            <Select name="metaRobots" value={seoData.metaRobots || ''} onChange={handleSimpleInputChange}>
                                <option value="index, follow">Index, Follow</option>
                                <option value="noindex, follow">No Index, Follow</option>
                                <option value="index, nofollow">Index, No Follow</option>
                                <option value="noindex, nofollow">No Index, No Follow</option>
                            </Select>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">URL Kanonis</label><Input name="canonicalUrl" type="url" value={seoData.canonicalUrl || ''} onChange={handleSimpleInputChange} placeholder="https://..."/></div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Data Terstruktur (JSON-LD)</label>
                        <Textarea name="structuredData" value={typeof seoData.structuredData === 'object' ? JSON.stringify(seoData.structuredData, null, 2) : seoData.structuredData || ''} onChange={handleSimpleInputChange} rows={8} placeholder='{ "@context": "https://schema.org", ... }'/>
                    </div>
                </Section>

                <div className="flex flex-col sm:flex-row justify-end pt-4 border-t border-lime-400/30">
                    <button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-lime-400 text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                        <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan SEO'}
                    </button>
                </div>
            </form>
        </div>
    );
};