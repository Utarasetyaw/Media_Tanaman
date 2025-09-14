import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Music } from 'lucide-react'; 
import { useLayoutData } from '../hooks/useLayoutData';
import { footerTranslations } from '../assets/footer.i18n';

interface FooterProps {
  currentLang: 'id' | 'en';
}

const Footer: FC<FooterProps> = ({ currentLang }) => {
  const { data: layoutData, isLoading } = useLayoutData();
  
  const t = (key: keyof typeof footerTranslations.id): string => {
    return footerTranslations[currentLang]?.[key] || key;
  };
  
  const socialMedia = layoutData?.settings.contactInfo?.socialMedia;

  return (
    <footer className="bg-[#003938] text-white relative z-30 border-t-2 border-lime-400">
      {/* DIUBAH: Lebar maksimum diganti dari max-w-7xl menjadi max-w-screen-2xl */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
            
            <div className="md:col-span-2 lg:col-span-2 space-y-4">
              <Link to="/" className="text-2xl font-bold text-white inline-block">
                {isLoading ? (
                  <span className="h-8 w-32 bg-gray-700 rounded animate-pulse"></span>
                ) : (
                  <span className="font-extrabold">{layoutData?.settings.name || 'Narapati Flora'}</span>
                )}
              </Link>
              <p className="text-gray-300 leading-relaxed">
                {isLoading ? (
                   <span className="block h-4 w-full bg-gray-700 rounded animate-pulse mt-2"></span>
                ) : (
                  layoutData?.settings.businessDescription?.[currentLang] || t('description')
                )}
              </p>
              <div className="flex space-x-4 pt-2">
                {socialMedia?.instagram && ( <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-300 hover:text-white transition-colors duration-300"><Instagram size={24} /></a> )}
                {socialMedia?.facebook && ( <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-300 hover:text-white transition-colors duration-300"><Facebook size={24} /></a> )}
                {socialMedia?.tiktok && ( <a href={socialMedia.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-300 hover:text-white transition-colors duration-300"><Music size={24} /></a> )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lime-300 mb-6 tracking-wider">{t('explore')}</h4>
              <ul className="space-y-3 text-gray-300">
                <li><Link to="/" className="hover:text-white transition-colors duration-300">{t('home')}</Link></li>
                <li><Link to="/articles" className="hover:text-white transition-colors duration-300">{t('news')}</Link></li>
                <li><Link to="/plants" className="hover:text-white transition-colors duration-300">{t('plants')}</Link></li>
                <li><Link to="/events" className="hover:text-white transition-colors duration-300">{t('events')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lime-300 mb-6 tracking-wider">{t('support')}</h4>
              <ul className="space-y-3 text-gray-300">
                <li><Link to="/about" className="hover:text-white transition-colors duration-300">{t('about')}</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors duration-300">{t('login_participant')}</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors duration-300">{t('register_participant')}</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors duration-300">{t('login_journalist')}</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors duration-300">{t('register_journalist')}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-black/20">
        {/* DIUBAH: Lebar maksimum di sini juga diganti agar sejajar */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} {layoutData?.settings.name || 'Narapati Flora'}. {t('copyright')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;