import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Settings2, ArrowLeft, Save, PlusCircle, Trash2 } from 'lucide-react';
import type { Article, SEO, Backlink } from '../../types';
import * as apiArticles from '../../services/apiArticles';

const initialSeoData: Partial<SEO> = {
    metaTitle: { id: '', en: '' },
    metaDescription: { id: '', en: '' },
    keywords: '',
    metaRobots: '',
    structuredData: '',
    metaViewport: '',
    canonicalURL: '',
    ogTitle: { id: '', en: '' },
    ogDescription: { id: '', en: '' },
    ogImageUrl: '',
    twitterHandle: '',
    backlinks: [],
};

export const ArticleSeoPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const articleId = Number(id);

    const [seoData, setSeoData] = useState<Partial<SEO>>(initialSeoData);

    const { data: articleData, isLoading } = useQuery<Article>({
        queryKey: ['articleSeo', articleId],
        queryFn: () => apiArticles.getArticleById(articleId),
        enabled: !!articleId,
    });

    useEffect(() => {
        if (articleData?.seo) {
            setSeoData({
                metaTitle: articleData.seo.metaTitle || { id: '', en: '' },
                metaDescription: articleData.seo.metaDescription || { id: '', en: '' },
                keywords: articleData.seo.keywords || '',
                metaRobots: articleData.seo.metaRobots || '',
                structuredData: articleData.seo.structuredData || '',
                metaViewport: articleData.seo.metaViewport || '',
                canonicalURL: articleData.seo.canonicalURL || '',
                ogTitle: articleData.seo.ogTitle || { id: '', en: '' },
                ogDescription: articleData.seo.ogDescription || { id: '', en: '' },
                ogImageUrl: articleData.seo.ogImageUrl || '',
                twitterHandle: articleData.seo.twitterHandle || '',
                // --- PERBAIKAN DI SINI ---
                backlinks: articleData.seo.backlinks?.map((b: any, i: number) => ({ ...b, id: i })) || [],
            });
        }
    }, [articleData]);
    
    const mutation = useMutation({
        mutationFn: (updatedSeoData: Partial<SEO>) => apiArticles.updateArticle({ id: articleId, seo: updatedSeoData }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allAdminArticles'] });
            queryClient.invalidateQueries({ queryKey: ['articleSeo', articleId] });
            alert('Pengaturan SEO berhasil disimpan!');
            navigate('/admin/articles');
        },
        onError: (error: any) => {
            alert(`Gagal menyimpan SEO: ${error.response?.data?.error || error.message}`);
        }
    });

    const handleSeoChange = (field: keyof Omit<SEO, 'backlinks'>, lang: 'id' | 'en', value: string) => {
        setSeoData(prev => ({ ...prev, [field]: { ...(prev[field] as object), [lang]: value } }));
    };
    const handleSimpleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSeoData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleBacklinkChange = (index: number, field: keyof Omit<Backlink, 'id'>, value: string) => {
        const newBacklinks = [...(seoData.backlinks || [])];
        newBacklinks[index] = { ...newBacklinks[index], [field]: value };
        setSeoData(prev => ({ ...prev, backlinks: newBacklinks }));
    };

    const addBacklink = () => {
        const newBacklink: Backlink = { id: Date.now(), sourceUrl: '', anchorText: '', status: 'Pending' };
        setSeoData(prev => ({ ...prev, backlinks: [...(prev.backlinks || []), newBacklink] }));
    };

    const removeBacklink = (indexToRemove: number) => {
        setSeoData(prev => ({
            ...prev,
            backlinks: (prev.backlinks || []).filter((_, index) => index !== indexToRemove),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalSeoData = {
            ...seoData,
            // Pass backlinks as-is, including 'id'
            backlinks: seoData.backlinks
        };
        mutation.mutate(finalSeoData);
    };

    if (isLoading) { return <div className="text-white p-8 text-center">Memuat data SEO...</div>; }

    return (
        <div>
            <Link to="/admin/articles" className="inline-flex items-center gap-2 text-lime-300 hover:text-lime-200 mb-6 transition-colors">
                <ArrowLeft size={20} />
                Kembali ke Manajemen Artikel
            </Link>
            <h2 className="text-3xl font-bold text-lime-200/90 flex items-center gap-3 mb-2">
                <Settings2 /> Pengaturan SEO
            </h2>
            <p className="text-gray-300 mb-6">
                Untuk artikel: <span className="font-bold text-white">{articleData?.title.id}</span>
            </p>

            <form onSubmit={handleSubmit} className="bg-[#004A49]/60 border-2 border-lime-400/50 shadow-lg rounded-lg p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Meta Title (Indonesia)</label><input value={seoData.metaTitle?.id} onChange={(e) => handleSeoChange('metaTitle', 'id', e.target.value)} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Meta Title (English)</label><input value={seoData.metaTitle?.en} onChange={(e) => handleSeoChange('metaTitle', 'en', e.target.value)} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-300 mb-1">Meta Description (Indonesia)</label><textarea value={seoData.metaDescription?.id} onChange={(e) => handleSeoChange('metaDescription', 'id', e.target.value)} rows={3} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-1">Meta Description (English)</label><textarea value={seoData.metaDescription?.en} onChange={(e) => handleSeoChange('metaDescription', 'en', e.target.value)} rows={3} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/></div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Keywords</label>
                    <input name="keywords" value={seoData.keywords} onChange={handleSimpleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/>
                    <p className="text-xs text-gray-400 mt-1">Pisahkan dengan koma, contoh: tanaman hias, monstera, tips merawat.</p>
                </div>

                <div className="pt-4 border-t border-lime-400/30">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Pengaturan SEO Lanjutan</h3>
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-300 mb-1">Meta Robots</label><input name="metaRobots" value={seoData.metaRobots} onChange={handleSimpleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" placeholder="index, follow"/></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-1">Canonical URL</label><input name="canonicalURL" type="url" value={seoData.canonicalURL} onChange={handleSimpleInputChange} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200" placeholder="https://..."/></div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Structured Data (JSON-LD)</label>
                            <textarea name="structuredData" value={seoData.structuredData} onChange={handleSimpleInputChange} rows={5} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200 font-mono" placeholder='{ "@context": "https://schema.org", ... }'/>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-lime-400/30">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Manajemen Backlink</h3>
                    <div className="space-y-4">
                        {(seoData.backlinks || []).map((backlink, index) => (
                            <div key={backlink.id} className="p-4 border border-lime-400/20 rounded-lg space-y-3 relative bg-gray-900/20">
                                <button type="button" onClick={() => removeBacklink(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><Trash2 size={18}/></button>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Source URL</label>
                                    <input value={backlink.sourceUrl} onChange={(e) => handleBacklinkChange(index, 'sourceUrl', e.target.value)} type="url" placeholder="https://contohwebsite.com/artikel-mereka" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Anchor Text</label>
                                        <input value={backlink.anchorText} onChange={(e) => handleBacklinkChange(index, 'anchorText', e.target.value)} placeholder="Teks yang diberi link" className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                                        <select value={backlink.status} onChange={(e) => handleBacklinkChange(index, 'status', e.target.value)} className="w-full px-4 py-2 bg-transparent border border-lime-400/60 rounded-lg text-gray-200">
                                            <option>Pending</option>
                                            <option>Live</option>
                                            <option>Broken</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addBacklink} className="mt-2 flex items-center gap-2 text-sm font-semibold text-lime-300 hover:text-lime-200">
                            <PlusCircle size={18}/> Tambah Backlink
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-lime-400/30">
                    <button type="submit" disabled={mutation.isPending} className="bg-lime-400 text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-lime-500 flex items-center gap-2 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                        <Save size={18} /> {mutation.isPending ? 'Menyimpan...' : 'Simpan SEO'}
                    </button>
                </div>
            </form>
        </div>
    );
};