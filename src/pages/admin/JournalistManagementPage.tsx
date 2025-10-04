import type { FC } from 'react';
import { useJournalistManager } from '../../hooks/useJournalistManager';
import { Plus, X, Users, LoaderCircle } from 'lucide-react';

// Helper untuk menerjemahkan status dan memberikan warna
const getStatusProps = (status: string) => {
    switch (status) {
        case 'PUBLISHED': return { text: 'DITERBITKAN', className: 'bg-green-400 text-green-300' };
        case 'IN_REVIEW': return { text: 'DALAM TINJAUAN', className: 'bg-blue-400 text-blue-300' };
        case 'NEEDS_REVISION': return { text: 'PERLU REVISI', className: 'bg-yellow-400 text-yellow-300' };
        case 'REJECTED': return { text: 'DITOLAK', className: 'bg-red-400 text-red-300' };
        default: return { text: 'DRAF', className: 'bg-gray-400 text-gray-300' };
    }
};

export const JournalistManagementPage: FC = () => {
    const {
        journalists, isLoading, error, viewingJournalist, isLoadingDetail,
        isModalOpen, isArticleModalOpen, selectedJournalistId, formData,
        openModal, closeModal, openArticleModal, closeArticleModal,
        handleInputChange, handleSave, handleDelete, handleStatusChange, isMutating
    } = useJournalistManager();

    if (isLoading) return <div className="text-white text-center p-8">Memuat data jurnalis...</div>;
    if (error) return <div className="text-red-400 text-center p-8">Terjadi Kesalahan: {(error as Error).message}</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-lime-200/90 flex items-center gap-3">
                    <Users /> Manajemen Jurnalis
                </h2>
                {/* ▼▼▼ PERUBAHAN DI SINI ▼▼▼ */}
                <button
                    onClick={() => openModal()}
                    className="bg-lime-400 text-lime-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
                >
                {/* ▲▲▲ AKHIR PERUBAHAN ('justify-center' ditambahkan) ▲▲▲ */}
                    <Plus size={20} /> Tambah Jurnalis
                </button>
            </div>

            {/* Tampilan Tabel untuk Desktop (md ke atas) */}
            <div className="hidden md:block bg-[#004A49]/60 border-2 border-lime-400/50 shadow-lg rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y-2 divide-lime-400/30">
                    <thead className="bg-black/20">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-lime-300 uppercase tracking-wider">Nama Jurnalis</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-lime-300 uppercase tracking-wider">Statistik Artikel</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-lime-300 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-lime-400/30">
                        {journalists?.map(j => (
                            <tr key={j.id} onClick={() => openArticleModal(j.id)} className="hover:bg-[#004A49] transition-colors cursor-pointer">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-white">{j.name}</div>
                                    <div className="text-sm text-gray-400">{j.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                    <div className="flex flex-wrap items-start gap-x-3 gap-y-1 text-xs">
                                        {j.articleStats && (
                                            <>
                                                <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Diterbitkan: {j.articleStats.published}</span>
                                                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Tinjauan: {j.articleStats.inReview}</span>
                                                <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">Revisi: {j.articleStats.needsRevision}</span>
                                                <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">Ditolak: {j.articleStats.rejected}</span>
                                                <span className="bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded-full">Draf: {j.articleStats.draft}</span>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => openModal(j)} className="text-xs bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded">Ubah</button>
                                        <button onClick={() => handleDelete(j.id)} className="text-xs bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded">Hapus</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Tampilan Kartu untuk Mobile (di bawah md) */}
            <div className="md:hidden space-y-4">
                {journalists?.map(j => (
                    <div key={j.id} className="bg-[#004A49]/60 border-2 border-lime-400/50 shadow-lg rounded-lg p-4">
                        <div onClick={() => openArticleModal(j.id)} className="cursor-pointer">
                            <div className="font-medium text-white text-lg">{j.name}</div>
                            <div className="text-sm text-gray-400 mb-3">{j.email}</div>
                            <div className="border-t border-lime-400/20 pt-3 flex flex-wrap items-start gap-x-2 gap-y-1.5 text-xs">
                                 {j.articleStats && (
                                    <>
                                        <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Diterbitkan: {j.articleStats.published}</span>
                                        <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Tinjauan: {j.articleStats.inReview}</span>
                                        <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">Revisi: {j.articleStats.needsRevision}</span>
                                        <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">Ditolak: {j.articleStats.rejected}</span>
                                        <span className="bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded-full">Draf: {j.articleStats.draft}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-lime-400/20">
                            <button onClick={() => openModal(j)} className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-4 rounded">Ubah</button>
                            <button onClick={() => handleDelete(j.id)} className="text-sm bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-4 rounded">Hapus</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Tambah/Edit Jurnalis */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#003938] rounded-lg shadow-xl w-full max-w-md p-6 relative border-2 border-lime-400">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                        <h3 className="text-2xl font-bold mb-4 text-lime-400">{selectedJournalistId ? 'Ubah Data Jurnalis' : 'Tambah Jurnalis Baru'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Nama Lengkap</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white shadow-sm py-2 px-3 focus:ring-lime-400 focus:border-lime-400"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Alamat Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white shadow-sm py-2 px-3 focus:ring-lime-400 focus:border-lime-400"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Kata Sandi Baru</label>
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="mt-1 block w-full bg-white/10 border-2 border-lime-400/50 rounded-md text-white shadow-sm py-2 px-3 focus:ring-lime-400 focus:border-lime-400" placeholder={selectedJournalistId ? 'Kosongkan jika tidak diubah' : ''} />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={closeModal} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Batal</button>
                            <button onClick={handleSave} disabled={isMutating} className="bg-lime-400 text-lime-900 font-bold py-2 px-4 rounded-lg hover:bg-lime-500 disabled:bg-gray-500 disabled:cursor-wait flex items-center gap-2">
                                {isMutating && <LoaderCircle size={18} className="animate-spin" />}
                                {isMutating ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Lihat Detail Artikel */}
            {isArticleModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#003938] rounded-lg shadow-xl w-full max-w-3xl p-6 relative border-2 border-lime-400">
                        <button onClick={closeArticleModal} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                        {isLoadingDetail && <p className="text-white text-center py-8">Memuat detail artikel...</p>}
                        {viewingJournalist && (
                            <>
                                <h3 className="text-2xl font-bold mb-1 text-lime-400">Artikel oleh {viewingJournalist.name}</h3>
                                <p className="text-gray-400 mb-4">Total: {viewingJournalist.articles?.length || 0} artikel</p>
                                
                                <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2">
                                    {viewingJournalist.articles && viewingJournalist.articles.length > 0 ? (
                                        <ul className="space-y-3">
                                            {viewingJournalist.articles.map(article => {
                                                const status = getStatusProps(article.status);
                                                return (
                                                <li key={article.id} className="block sm:flex items-center justify-between p-3 bg-[#004A49]/80 rounded-md gap-4">
                                                    <div>
                                                        <span className="text-gray-200">{article.title.id}</span>
                                                        <span className={`block sm:inline-block ml-0 sm:ml-2 mt-1 sm:mt-0 px-2 text-xs font-semibold rounded-full bg-opacity-20 ${status.className}`}>
                                                            {status.text}
                                                        </span>
                                                    </div>
                                                    {article.status === 'IN_REVIEW' && (
                                                        <div className="flex gap-2 mt-2 sm:mt-0 flex-shrink-0">
                                                            <button onClick={() => handleStatusChange(article.id, 'PUBLISHED')} className="text-xs bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded">Setujui</button>
                                                            <button onClick={() => handleStatusChange(article.id, 'NEEDS_REVISION')} className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded">Minta Revisi</button>
                                                            <button onClick={() => handleStatusChange(article.id, 'REJECTED')} className="text-xs bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded">Tolak</button>
                                                        </div>
                                                    )}
                                                </li>
                                            )})}
                                        </ul>
                                    ) : (
                                        <p className="text-center text-gray-400 py-8">Jurnalis ini belum memiliki artikel.</p>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button onClick={closeArticleModal} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700">Tutup</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};