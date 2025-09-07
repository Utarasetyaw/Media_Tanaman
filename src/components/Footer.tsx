import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Instagram, Facebook, Twitter } from 'lucide-react'; 

const Footer: FC = () => {
  const { t } = useTranslation();

  return (
    // UBAH: Tambahkan 'relative' agar tidak tertutup iklan
    <footer className="bg-green-700 text-white  relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="md:col-span-2 lg:col-span-2 space-y-4">
            {/* UBAH: Nama brand diubah di sini */}
            <h3 className="text-2xl font-bold text-white">🌿 Narapati Flora</h3>
            <p className="text-gray-200 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" aria-label="Instagram" className="text-white hover:text-gray-300 transition-colors duration-300">
                <Instagram size={24} />
              </a>
              <a href="#" aria-label="Facebook" className="text-white hover:text-gray-300 transition-colors duration-300">
                <Facebook size={24} />
              </a>
              <a href="#" aria-label="Twitter" className="text-white hover:text-gray-300 transition-colors duration-300">
                <Twitter size={24} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 tracking-wider">{t('footer.explore')}</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="hover:text-gray-300 transition-colors duration-300">{t('home')}</Link></li>
              <li><Link to="/articles" className="hover:text-gray-300 transition-colors duration-300">{t('articles')}</Link></li>
              <li><Link to="/plants" className="hover:text-gray-300 transition-colors duration-300">{t('footer.gallery')}</Link></li>
              <li><Link to="/events" className="hover:text-gray-300 transition-colors duration-300">{t('events')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 tracking-wider">{t('footer.support')}</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="hover:text-gray-300 transition-colors duration-300">{t('about')}</Link></li>
              <li><Link to="/faq" className="hover:text-gray-300 transition-colors duration-300">{t('faq')}</Link></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors duration-300">{t('footer.contact')}</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors duration-300">{t('footer.privacy')}</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-300">
          {/* UBAH: Nama brand di copyright juga diubah */}
          &copy; {new Date().getFullYear()} Narapati Flora. {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;