import React, { useState } from 'react';
import { Trash2, PlusCircle } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface InputFieldProps {
    label: string;
    type?: string;
    value: string;
    name: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}

interface TextareaFieldProps {
    label: string;
    value: string;
    name: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
    rows?: number;
}

// Komponen kecil untuk input field
const InputField: React.FC<InputFieldProps> = ({ label, type = 'text', value, name, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            name={name}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        />
    </div>
);

// Komponen untuk Textarea
const TextareaField: React.FC<TextareaFieldProps> = ({ label, value, name, onChange, placeholder, rows = 4 }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea
            value={value}
            name={name}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        />
    </div>
);


export const CompanyManagementPage: React.FC = () => {
    // State untuk semua data perusahaan
    const [companyData, setCompanyData] = useState({
        name: 'Portal Tanaman Indonesia',
        logoUrl: '',
        faviconUrl: '',
        // videoUrl dihapus, akan dikelola terpisah jika perlu
        description: 'Portal Tanaman Indonesia adalah sumber informasi terdepan untuk para pecinta tanaman, dari pemula hingga ahli. Kami menyediakan panduan perawatan, tips, dan berita terbaru seputar dunia botani.',
        address: 'Jl. Kebun Raya No. 123, Jakarta, Indonesia',
        phone: '0812-3456-7890',
        email: 'kontak@portaltanaman.id',
        socialMedia: {
            facebook: 'https://facebook.com/portaltanaman',
            instagram: 'https://instagram.com/portaltanaman',
            twitter: 'https://twitter.com/portaltanaman',
        },
        faqs: [
            { id: 1, question: 'Bagaimana cara merawat tanaman hias dalam ruangan?', answer: 'Pastikan mendapat cukup cahaya tidak langsung, siram saat media tanam mulai kering, dan berikan pupuk sebulan sekali.' },
            { id: 2, question: 'Apakah semua tanaman di sini dijual?', answer: 'Tidak, kami adalah portal informasi. Namun, kami terkadang merekomendasikan penjual terpercaya.' },
        ],
        values: [
            { id: 1, title: 'Edukasi', description: 'Memberikan informasi yang akurat dan mudah dipahami.' },
            { id: 2, title: 'Komunitas', description: 'Membangun komunitas pecinta tanaman yang solid.' },
            { id: 3, title: 'Konservasi', description: 'Mendukung pelestarian keanekaragaman hayati tanaman.' },
        ],
    });

    // Handler untuk perubahan input sederhana
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCompanyData(prev => ({ ...prev, [name]: value }));
    };
    
    // Handler untuk perubahan input media sosial
    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCompanyData(prev => ({
            ...prev,
            socialMedia: { ...prev.socialMedia, [name]: value }
        }));
    };

    // Handler untuk FAQ
    const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
        const newFaqs = [...companyData.faqs];
        newFaqs[index][field] = value;
        setCompanyData(prev => ({ ...prev, faqs: newFaqs }));
    };

    const addFaq = () => {
        setCompanyData(prev => ({
            ...prev,
            faqs: [...prev.faqs, { id: Date.now(), question: '', answer: '' }]
        }));
    };
    
    const removeFaq = (index: number) => {
        const newFaqs = companyData.faqs.filter((_, i) => i !== index);
        setCompanyData(prev => ({ ...prev, faqs: newFaqs }));
    };

    const handleSave = () => {
        // Logika untuk menyimpan data ke server
        console.log('Data Disimpan:', companyData);
        alert('Perubahan telah disimpan!');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Manajemen Perusahaan</h2>
                <button 
                    onClick={handleSave}
                    className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                >
                    Simpan Perubahan
                </button>
            </div>

            <div className="space-y-8">
                {/* Informasi Dasar */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Informasi Dasar</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Nama Perusahaan" name="name" value={companyData.name} onChange={handleInputChange} placeholder="Masukkan nama perusahaan" />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Video Utama</label>
                            <input 
                                type="file" 
                                accept="video/*" 
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            />
                        </div>
                        <div className="md:col-span-2">
                           <TextareaField label="Deskripsi Singkat Perusahaan" name="description" value={companyData.description} onChange={handleInputChange} placeholder="Jelaskan tentang perusahaan Anda" />
                        </div>
                    </div>
                </div>

                {/* Aset Visual */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Aset Visual</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo Perusahaan</label>
                            <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Favicon</label>
                            <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">FAQ (Tanya Jawab)</h3>
                    <div className="space-y-4">
                        {companyData.faqs.map((faq, index) => (
                            <div key={faq.id} className="p-4 border rounded-md space-y-2 relative">
                                <button onClick={() => removeFaq(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                                <InputField label={`Pertanyaan ${index + 1}`} name="question" value={faq.question} onChange={(e) => handleFaqChange(index, 'question', e.target.value)} placeholder="Tulis pertanyaan"/>
                                <TextareaField label={`Jawaban ${index + 1}`} name="answer" value={faq.answer} onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} placeholder="Tulis jawaban" rows={2}/>
                            </div>
                        ))}
                    </div>
                    <button onClick={addFaq} className="mt-4 flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-800">
                        <PlusCircle size={18}/> Tambah FAQ
                    </button>
                </div>

                {/* Kontak & Alamat */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Kontak & Alamat</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Nomor Telepon" name="phone" value={companyData.phone} onChange={handleInputChange} placeholder="08xx-xxxx-xxxx"/>
                        <InputField label="Email Kontak" type="email" name="email" value={companyData.email} onChange={handleInputChange} placeholder="admin@example.com"/>
                        <div className="md:col-span-2">
                            <TextareaField label="Alamat Kantor" name="address" value={companyData.address} onChange={handleInputChange} placeholder="Alamat lengkap perusahaan"/>
                        </div>
                    </div>
                </div>

                {/* Media Sosial */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Media Sosial</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Facebook URL" name="facebook" value={companyData.socialMedia.facebook} onChange={handleSocialChange} placeholder="https://facebook.com/username"/>
                        <InputField label="Instagram URL" name="instagram" value={companyData.socialMedia.instagram} onChange={handleSocialChange} placeholder="https://instagram.com/username"/>
                        <InputField label="Twitter URL" name="twitter" value={companyData.socialMedia.twitter} onChange={handleSocialChange} placeholder="https://twitter.com/username"/>
                    </div>
                </div>
            </div>
        </div>
    );
};
