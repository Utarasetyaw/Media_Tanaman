import { useState, Fragment } from 'react';
import type { FC } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';

// --- Interface & Tipe Data ---
interface NavItemProps {
  to: string;
  text: string;
  end?: boolean;
}
interface MobileNavItemProps extends NavItemProps {
  onClick: () => void;
}
interface NavLinkItem {
  to: string;
  textKey: string;
  end?: boolean;
}
interface LanguageSwitcherProps {
  displayType?: 'dropdown' | 'inline';
  currentLang: 'id' | 'en';
  changeLanguage: (lng: 'id' | 'en') => void;
}

// --- Komponen Ikon ---
const MenuIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const CloseIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SearchIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const FlagIndonesia: FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" className="w-8 h-auto rounded-md shadow-sm flex-shrink-0"><path fill="#fff" d="M0 0h640v480H0z"/><path fill="#ce1126" d="M0 0h640v240H0z"/></svg> );
const FlagUSA: FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 48" className="w-8 h-auto rounded-md shadow-sm flex-shrink-0"><path fill="#b22234" d="M0 0h72v48H0z"/><path fill="#fff" d="M0 8h72v8H0zm0 16h72v8H0zm0 16h72v8H0z"/><path fill="#3c3b6e" d="M0 0h36v24H0z"/>{[...Array(4)].map((_, r) => [...Array(5)].map((_, c) => ( <path key={`${r}-${c}`} fill="#fff" d={`m${c*7+3.5},${r*6+3} l2,0 -1.5,1.5 0.5,2 -1.5,-1.5 -1.5,1.5 0.5,-2 -1.5,-1.5 2,0`}/> )))}</svg> );

const TopBar: FC = () => (
    <div className="bg-[#003938] text-white text-xs sm:text-sm py-2">
        <div className="container mx-auto px-4 sm:px-6 lg:px-4 text-center">
            <span>
                TechCrunch: Narapati Flora raises $30M from Menlo Ventures for its AI-powered platform.
                <a href="#" className="font-bold underline ml-2 whitespace-nowrap hover:opacity-80 transition-opacity">Read Article ›</a>
            </span>
        </div>
    </div>
);

const LanguageSwitcher: FC<LanguageSwitcherProps> = ({ displayType = 'dropdown', currentLang, changeLanguage }) => {
  if (displayType === 'inline') {
    return (
      <div className="flex items-center justify-center gap-6 py-2">
        <button onClick={() => changeLanguage('id')} className={`transition-transform duration-200 ease-in-out ${currentLang === 'id' ? 'scale-110 opacity-100' : 'opacity-60 hover:opacity-100'}`} aria-label="Ubah ke Bahasa Indonesia"><FlagIndonesia /></button>
        <button onClick={() => changeLanguage('en')} className={`transition-transform duration-200 ease-in-out ${currentLang === 'en' ? 'scale-110 opacity-100' : 'opacity-60 hover:opacity-100'}`} aria-label="Switch to English"><FlagUSA /></button>
      </div>
    );
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center p-1.5 rounded-full text-gray-300 transition-colors duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-lime-400">
          {currentLang === 'id' ? <FlagIndonesia /> : <FlagUSA />}
        </Menu.Button>
      </div>
      <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-52 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>{({ active }) => ( <button onClick={() => changeLanguage('id')} className={`${ active ? 'bg-gray-100 text-gray-900' : 'text-gray-700' } group flex rounded-md items-center w-full px-4 py-2 text-sm`}><FlagIndonesia /><span className="ml-3 whitespace-nowrap">Bahasa Indonesia</span></button> )}</Menu.Item>
            <Menu.Item>{({ active }) => ( <button onClick={() => changeLanguage('en')} className={`${ active ? 'bg-gray-100 text-gray-900' : 'text-gray-700' } group flex rounded-md items-center w-full px-4 py-2 text-sm`}><FlagUSA /><span className="ml-3 whitespace-nowrap">English</span></button> )}</Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};


// --- Komponen Navigasi ---
const NavItem: FC<NavItemProps> = ({ to, text, end }) => (
  <li>
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
          isActive
            ? 'bg-lime-400 text-lime-900'
            : 'text-gray-200 hover:text-white'
        }`
      }
    >
      {text}
    </NavLink>
  </li>
);

const MobileNavItem: FC<MobileNavItemProps> = ({ to, text, end, onClick }) => (
  <li>
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `block w-full rounded-md py-2.5 px-4 text-left text-base font-medium transition-colors duration-200 ${
          isActive
            ? 'bg-lime-400 text-lime-900'
            : 'text-gray-200 hover:bg-white/10'
        }`
      }
    >
      {text}
    </NavLink>
  </li>
);

// --- Komponen Utama Navbar ---
const Navbar: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [currentLang, setCurrentLang] = useState<'id' | 'en'>('id');
  
  const t = (key: string) => {
    return key.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  const mainNavLinks: NavLinkItem[] = [
    { to: "/", textKey: 'home', end: true },
    { to: "/plants", textKey: 'plant' },
    { to: "/news", textKey: 'news' },
    { to: "/events", textKey: 'event' },
    { to: "/about", textKey: 'about' },
  ];

  return (
    <>
      <TopBar />
      {/* PERUBAHAN: Menambahkan border-b-2 border-lime-400 */}
      <header className="sticky top-0 z-50 bg-[#003938] border-b-2 border-lime-400">
        <nav className="container mx-auto px-2 sm:px-2 lg:px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Grup Kiri: Logo & Pencarian */}
            <div className="flex flex-1 items-center gap-6">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 text-xl font-bold text-white">
                <span className="font-extrabold">Narapati</span>
                <span className="font-light">Flora</span>
              </Link>
              {/* Pencarian Desktop */}
              <div className="relative w-full hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="search"
                  name="search"
                  id="search"
                  className="block w-full bg-white/20 border border-transparent rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white/25 sm:text-sm"
                  placeholder="Cari tanaman..."
                />
              </div>
            </div>

            {/* Grup Kanan: Navigasi & Bahasa */}
            <div className="hidden md:flex items-center gap-6">
              <ul className="flex items-baseline space-x-2">
                  {mainNavLinks.map((link) => (
                    <NavItem key={link.to} to={link.to} text={t(link.textKey)} end={link.end} />
                  ))}
              </ul>
              <LanguageSwitcher currentLang={currentLang} changeLanguage={setCurrentLang} />
            </div>

            {/* Tombol Menu Mobile */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-lime-400"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </nav>

        {/* Panel Menu Mobile */}
        <Transition
          show={isMenuOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 -translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-1"
        >
          {/* PERUBAHAN: Mengganti border-gray-800 menjadi border-lime-400 */}
          <div className="md:hidden absolute top-full left-0 w-full bg-[#003938] border-b-2 border-lime-400 shadow-lg" id="mobile-menu">
             {/* Pencarian Mobile */}
            <div className="p-4 border-b border-white/20">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="search"
                  name="search-mobile"
                  id="search-mobile"
                  className="block w-full bg-white/20 border border-transparent rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white/25 sm:text-sm"
                  placeholder="Cari tanaman..."
                />
              </div>
            </div>
            <ul className="space-y-1 px-4 pt-2 pb-3">
              {mainNavLinks.map((link) => (
                <MobileNavItem
                  key={link.to}
                  to={link.to}
                  text={t(link.textKey)}
                  end={link.end}
                  onClick={() => setIsMenuOpen(false)}
                />
              ))}
            </ul>
            <div className="border-t border-white/20 py-3">
                 <LanguageSwitcher displayType="inline" currentLang={currentLang} changeLanguage={setCurrentLang} />
            </div>
          </div>
        </Transition>
      </header>
    </>
  );
};

export default Navbar;