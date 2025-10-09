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
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16">
          
          {/* ▼▼▼ PERUBAHAN DI SINI: 'md:grid-cols-3' diubah menjadi 'md:grid-cols-4' ▼▼▼ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
            
            {/* ▼▼▼ PERUBAHAN DI SINI: 'md:col-span-3' diubah menjadi 'md:col-span-4' ▼▼▼ */}
            <div className="sm:col-span-2 md:col-span-4 lg:col-span-2 space-y-4">
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
                  layoutData?.settings.shortDescription?.[currentLang] || t('description')
                )}
              </p>
              <div className="flex space-x-4 pt-2">
                {socialMedia?.instagram && ( <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-300 hover:text-white transition-colors duration-300"><Instagram size={24} /></a> )}
                {socialMedia?.facebook && ( <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-300 hover:text-white transition-colors duration-300"><Facebook size={24} /></a> )}
                {socialMedia?.tiktok && ( <a href={socialMedia.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-300 hover:text-white transition-colors duration-300"><Music size={24} /></a> )}
              </div>
            </div>

            {/* Kolom Jelajahi */}
            <div>
              <h4 className="font-bold text-lime-300 mb-6 tracking-wider">{t('explore')}</h4>
              <ul className="space-y-3 text-gray-300">
                <li><Link to="/" className="hover:text-white transition-colors duration-300">{t('home')}</Link></li>
                <li><Link to="/articles" className="hover:text-white transition-colors duration-300">{t('news')}</Link></li>
                <li><Link to="/plants" className="hover:text-white transition-colors duration-300">{t('plants')}</Link></li>
                <li><Link to="/events" className="hover:text-white transition-colors duration-300">{t('events')}</Link></li>
              </ul>
            </div>

            {/* Kolom Jurnalis */}
            <div>
              <h4 className="font-bold text-lime-300 mb-6 tracking-wider">{t('support_journalist')}</h4>
              <ul className="space-y-3 text-gray-300">
                <li><Link to="/journalist/login" className="hover:text-white transition-colors duration-300">{t('login_journalist')}</Link></li>
                <li><Link to="/journalist/register" className="hover:text-white transition-colors duration-300">{t('register_journalist')}</Link></li>
              </ul>
            </div>

            {/* Kolom Peserta */}
            <div>
              <h4 className="font-bold text-lime-300 mb-6 tracking-wider">{t('support_participant')}</h4>
              <ul className="space-y-3 text-gray-300">
                <li><Link to="/participant/login" className="hover:text-white transition-colors duration-300">{t('login_participant')}</Link></li>
                <li><Link to="/participant/register" className="hover:text-white transition-colors duration-300">{t('register_participant')}</Link></li>
              </ul>
            </div>

            {/* Kolom Bantuan */}
            <div>
              <h4 className="font-bold text-lime-300 mb-6 tracking-wider">{t('support_help')}</h4>
              <ul className="space-y-3 text-gray-300">
                <li><Link to="/about" className="hover:text-white transition-colors duration-300">{t('about')}</Link></li>
              </ul>
            </div>
            
          </div>
        </div>
      </div>
      
      <div className="bg-black/20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} {layoutData?.settings.name || 'Narapati Flora'}. {t('copyright')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;