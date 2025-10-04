import type { FC } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Home } from 'lucide-react';

// Objek untuk menyimpan terjemahan dalam Bahasa Indonesia dan Inggris
const notFoundPageTranslations = {
  id: {
    title: "Oops! Halaman Tidak Ditemukan",
    description: "Maaf, halaman yang Anda cari tidak ada atau mungkin telah dipindahkan.",
    button_text: "Kembali ke Beranda"
  },
  en: {
    title: "Oops! Page Not Found",
    description: "Sorry, the page you are looking for does not exist or may have been moved.",
    button_text: "Back to Homepage"
  }
};

const NotFoundPage: FC = () => {
  // Ambil bahasa saat ini dari context.
  // Fallback ke 'id' jika halaman ini dirender di luar layout utama.
  const { lang = 'id' } = useOutletContext<{ lang: "id" | "en" }>() || {};

  // Fungsi helper untuk mendapatkan teks terjemahan yang sesuai
  const t = (key: keyof typeof notFoundPageTranslations.id) => {
    return notFoundPageTranslations[lang][key] || notFoundPageTranslations['id'][key];
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#003938] text-white text-center px-4">
      <h1 className="text-8xl sm:text-9xl font-bold text-lime-400 font-serif drop-shadow-lg">
        404
      </h1>
      <h2 className="mt-4 text-2xl sm:text-4xl font-semibold text-gray-100">
        {t('title')}
      </h2>
      <p className="mt-2 text-base sm:text-lg text-gray-300 max-w-md">
        {t('description')}
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 bg-lime-300 text-lime-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-400 transition-colors shadow-md"
      >
        <Home size={20} />
        <span>{t('button_text')}</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;

