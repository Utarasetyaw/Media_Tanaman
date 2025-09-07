import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Sesuaikan path jika perlu
import Footer from '../components/Footer'; // Sesuaikan path jika perlu

const MainLayout: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet /> {/* Ini akan merender halaman (Home, About, dll.) */}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
