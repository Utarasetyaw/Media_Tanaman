import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Sesuaikan path jika perlu
import Footer from '../components/Footer'; // Sesuaikan path jika perlu

const MainLayout: React.FC = () => {
  // 1. Tambahkan State untuk Bahasa
  // State ini akan membaca pilihan bahasa terakhir dari localStorage,
  // atau menggunakan 'id' (Indonesia) sebagai default jika tidak ada.
  const [currentLang, setCurrentLang] = useState<'id' | 'en'>(() => {
    const storedLang = localStorage.getItem('appLanguage');
    if (storedLang === 'id' || storedLang === 'en') {
      return storedLang;
    }
    return 'id';
  });

  // 2. Buat Fungsi untuk Mengubah Bahasa
  // Fungsi ini akan memperbarui state dan juga menyimpan pilihan baru ke localStorage.
  const changeLanguage = (lang: 'id' | 'en') => {
    localStorage.setItem('appLanguage', lang);
    setCurrentLang(lang);
  };

  return (
    <div>
      {/* 3. Kirim State dan Fungsi ke Komponen Anak sebagai Props */}
      <Navbar currentLang={currentLang} changeLanguage={changeLanguage} />
      <main>
        <Outlet context={{ lang: currentLang }} /> {/* Ini akan merender halaman (Home, About, dll.) */}
      </main>
      <Footer currentLang={currentLang} />
    </div>
  );
};

export default MainLayout;