import { useState, Fragment } from 'react';
import type { FC } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useLayoutData } from '../hooks/useLayoutData';
import GlobalSearch from './GlobalSearch';
// Pastikan path ke file i18n ini benar
import { navTranslations } from '../assets/nav.i18n';

// REVISI 1: Definisikan tipe untuk props yang akan diterima dari MainLayout
interface NavbarProps {
  currentLang: 'id' | 'en';
  changeLanguage: (lang: 'id' | 'en') => void;
}

// Tipe data lain (tidak berubah)
interface NavItemProps { to: string; text: string; end?: boolean; }
interface MobileNavItemProps extends NavItemProps { onClick: () => void; }
interface NavLinkItem { to: string; textKey: keyof typeof navTranslations.id; end?: boolean; }
interface LanguageSwitcherProps {
  displayType?: 'dropdown' | 'inline';
  currentLang: 'id' | 'en';
  changeLanguage: (lng: 'id' | 'en') => void;
  t: (key: keyof typeof navTranslations.id) => string;
}

// Komponen kecil (tidak berubah)
const MenuIcon: FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>);
const CloseIcon: FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const FlagIndonesia: FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" className="w-8 h-auto rounded-md shadow-sm flex-shrink-0"><path fill="#fff" d="M0 0h640v480H0z"/><path fill="#ce1126" d="M0 0h640v240H0z"/></svg> );
const FlagUSA: FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 48" className="w-8 h-auto rounded-md shadow-sm flex-shrink-0"><path fill="#b22234" d="M0 0h72v48H0z"/><path fill="#fff" d="M0 8h72v8H0zm0 16h72v8H0zm0 16h72v8H0z"/><path fill="#3c3b6e" d="M0 0h36v24H0z"/>{[...Array(4)].map((_, r) => [...Array(5)].map((_, c) => ( <path key={`${r}-${c}`} fill="#fff" d={`m${c*7+3.5},${r*6+3} l2,0 -1.5,1.5 0.5,2 -1.5,-1.5 -1.5,1.5 0.5,-2 -1.5,-1.5 2,0`}/> )))}</svg> );
const TopBar: FC<{ t: (key: keyof typeof navTranslations.id) => string }> = ({ t }) => ( <div className="bg-[#003938] text-white text-xs sm:text-sm py-2"><div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center"><span>{t('announcement')}<Link to="/events" className="font-bold underline ml-2 whitespace-nowrap hover:opacity-80 transition-opacity">{t('read_detail')}</Link></span></div></div>);
const LanguageSwitcher: FC<LanguageSwitcherProps> = ({ displayType = 'dropdown', currentLang, changeLanguage, t }) => {
  if (displayType === 'inline') {
    return (
      <div className="flex items-center justify-center gap-4 py-2">
        <button onClick={() => changeLanguage('id')} className={`transition-transform duration-200 ease-in-out ${currentLang === 'id' ? 'scale-110 opacity-100' : 'opacity-60 hover:opacity-100'}`} aria-label={t('indonesian')}><FlagIndonesia /></button>
        <button onClick={() => changeLanguage('en')} className={`transition-transform duration-200 ease-in-out ${currentLang === 'en' ? 'scale-110 opacity-100' : 'opacity-60 hover:opacity-100'}`} aria-label={t('english')}><FlagUSA /></button>
      </div>
    );
  }
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div><Menu.Button className="flex items-center p-1.5 rounded-full text-gray-300 transition-colors duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-lime-400">{currentLang === 'id' ? <FlagIndonesia /> : <FlagUSA />}</Menu.Button></div>
      <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-52 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20"><div className="py-1"><Menu.Item>{({ active }) => ( <button onClick={() => changeLanguage('id')} className={`${ active ? 'bg-gray-100 text-gray-900' : 'text-gray-700' } group flex rounded-md items-center w-full px-4 py-2 text-sm`}><FlagIndonesia /><span className="ml-3 whitespace-nowrap">{t('indonesian')}</span></button> )}</Menu.Item><Menu.Item>{({ active }) => ( <button onClick={() => changeLanguage('en')} className={`${ active ? 'bg-gray-100 text-gray-900' : 'text-gray-700' } group flex rounded-md items-center w-full px-4 py-2 text-sm`}><FlagUSA /><span className="ml-3 whitespace-nowrap">{t('english')}</span></button> )}</Menu.Item></div></Menu.Items>
      </Transition>
    </Menu>
  );
};
const NavItem: FC<NavItemProps> = ({ to, text, end }) => (<li><NavLink to={to} end={end} className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${ isActive ? 'bg-lime-400 text-lime-900' : 'text-gray-200 hover:text-white' }`}>{text}</NavLink></li>);
const MobileNavItem: FC<MobileNavItemProps> = ({ to, text, end, onClick }) => (<li><NavLink to={to} end={end} onClick={onClick} className={({ isActive }) => `block w-full rounded-md py-2.5 px-4 text-left text-base font-medium transition-colors duration-200 ${ isActive ? 'bg-lime-400 text-lime-900' : 'text-gray-200 hover:bg-white/10' }`}>{text}</NavLink></li>);

// REVISI 2: Komponen utama Navbar sekarang menerima props
const Navbar: FC<NavbarProps> = ({ currentLang, changeLanguage }) => {
  const { data: layoutData, isLoading } = useLayoutData();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  
  // REVISI 3: State lokal untuk bahasa dihapus
  // const [currentLang, setCurrentLang] = useState<'id' | 'en'>('id');

  const t = (key: keyof typeof navTranslations.id): string => {
    return navTranslations[currentLang][key] || key;
  };
  
  const mainNavLinks: NavLinkItem[] = [
    { to: "/", textKey: 'home', end: true }, { to: "/plants", textKey: 'plant' }, { to: "/articles", textKey: 'article' },
    { to: "/events", textKey: 'event' }, { to: "/about", textKey: 'about' },
  ];

  return (
    <>
      <TopBar t={t} />
      <header className="sticky top-0 z-50 bg-[#003938] border-b-2 border-lime-400">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2 sm:gap-6">
              <Link to="/" className="flex-shrink-0 flex items-center gap-3 text-xl font-bold text-white">
                {isLoading ? ( <span className="h-8 w-40 bg-gray-700 rounded animate-pulse"></span> ) : (
                  <>
                    {layoutData?.settings.logoUrl && ( <img src={layoutData.settings.logoUrl} alt="Logo" className="h-8 w-auto" /> )}
                    <span className="font-extrabold whitespace-nowrap">{layoutData?.settings.name || 'Narapati Flora'}</span>
                  </>
                )}
              </Link>
              <div className="w-full hidden lg:block"><GlobalSearch lang={currentLang} t={t} /></div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <ul className="flex items-baseline space-x-2">{mainNavLinks.map((link) => (<NavItem key={link.to} to={link.to} text={t(link.textKey)} end={link.end} />))}</ul>
              <LanguageSwitcher currentLang={currentLang} changeLanguage={changeLanguage} t={t} />
            </div>
            <div className="flex md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-300 hover:bg-white/10 hover:text-white" ><span className="sr-only">{t('open_menu')}</span>{isMenuOpen ? <CloseIcon /> : <MenuIcon />}</button>
            </div>
          </div>
          <div className="hidden md:block lg:hidden py-3 border-t border-lime-400/20"><GlobalSearch lang={currentLang} t={t} /></div>
        </nav>
        <Transition show={isMenuOpen} as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 -translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-1" >
          <div className="md:hidden absolute top-full left-0 w-full bg-[#003938] border-b-2 border-lime-400 shadow-lg">
            <div className="p-4 border-b border-white/20"><GlobalSearch lang={currentLang} t={t} /></div>
            <ul className="space-y-1 px-4 pt-2 pb-3">{mainNavLinks.map((link) => (<MobileNavItem key={link.to} to={link.to} text={t(link.textKey)} end={link.end} onClick={() => setIsMenuOpen(false)} />))}</ul>
            <div className="border-t border-white/20 py-3"><LanguageSwitcher displayType="inline" currentLang={currentLang} changeLanguage={changeLanguage} t={t} /></div>
          </div>
        </Transition>
      </header>
    </>
  );
};

export default Navbar;