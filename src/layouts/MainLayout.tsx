import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLayoutData } from '../hooks/useLayoutData';

const MainLayout: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<'id' | 'en'>(() => {
    const storedLang = localStorage.getItem('appLanguage');
    if (storedLang === 'id' || storedLang === 'en') {
      return storedLang;
    }
    return 'id';
  });

  const { data: layoutData } = useLayoutData();
  const location = useLocation();

  useEffect(() => {
    const faviconUrl = layoutData?.settings?.faviconUrl;
    if (faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
          link = document.createElement('link');
          link.rel = 'shortcut icon';
          document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [layoutData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const changeLanguage = (lang: 'id' | 'en') => {
    localStorage.setItem('appLanguage', lang);
    setCurrentLang(lang);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ▼▼▼ PERBAIKAN DI SINI ▼▼▼ */}
      <Navbar currentLang={currentLang} changeLanguage={changeLanguage} />
      {/* ▲▲▲ AKHIR PERBAIKAN ▲▲▲ */}
      <main className="flex-grow">
        <Outlet context={{ lang: currentLang }} />
      </main>
      <Footer currentLang={currentLang} />
    </div>
  );
};

export default MainLayout;