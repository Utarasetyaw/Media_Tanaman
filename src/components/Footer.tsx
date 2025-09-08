import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Instagram, Facebook, Twitter } from 'lucide-react'; 

const Footer: FC = () => {
  const { t } = useTranslation();

  return (
    // PERUBAHAN: Menambahkan border-t-2 border-lime-400
    <footer className="bg-[#003938] text-white relative z-30 border-t-2 border-lime-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="md:col-span-2 lg:col-span-2 space-y-4">
            <Link to="/" className="text-2xl font-bold text-white inline-block">
                <span className="font-extrabold">Narapati</span>
                <span className="font-light">Flora</span>
            </Link>
            <p className="text-gray-300 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" aria-label="Instagram" className="text-gray-300 hover:text-white transition-colors duration-300">
                <Instagram size={24} />
              </a>
              <a href="#" aria-label="Facebook" className="text-gray-300 hover:text-white transition-colors duration-300">
                <Facebook size={24} />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-300 hover:text-white transition-colors duration-300">
                <Twitter size={24} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lime-300 mb-6 tracking-wider">{t('footer.explore')}</h4>
            <ul className="space-y-3 text-gray-300">
              <li><Link to="/" className="hover:text-white transition-colors duration-300">{t('home')}</Link></li>
              <li><Link to="/articles" className="hover:text-white transition-colors duration-300">{t('articles')}</Link></li>
              <li><Link to="/plants" className="hover:text-white transition-colors duration-300">{t('footer.gallery')}</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors duration-300">{t('events')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lime-300 mb-6 tracking-wider">{t('footer.support')}</h4>
            <ul className="space-y-3 text-gray-300">
              <li><Link to="/about" className="hover:text-white transition-colors duration-300">{t('about')}</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors duration-300">{t('faq')}</Link></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">{t('footer.contact')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">{t('footer.privacy')}</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-4 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Narapati Flora. {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;