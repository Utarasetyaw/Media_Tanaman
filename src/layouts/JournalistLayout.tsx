import React, { useState, Fragment } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Pastikan path ini benar
import { LayoutDashboard, Newspaper, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { Transition } from '@headlessui/react';

// Komponen Konten Sidebar untuk Jurnalis
const SidebarContent: React.FC<{ onLogout: () => void; onLinkClick?: () => void }> = ({ onLogout, onLinkClick }) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/jurnalis' },
    { icon: Newspaper, label: 'Artikel Saya', to: '/jurnalis/articles' },
  ];

  return (
    <>
      <div className="p-6 text-2xl font-bold text-lime-400 flex items-center gap-2">
        <ShieldCheck /> Panel Jurnalis
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/jurnalis'}
            onClick={onLinkClick} // Menutup sidebar di mobile saat link diklik
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                isActive
                  ? 'bg-lime-400 text-lime-900'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon size={20} /> {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-lime-400/30">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/20 rounded-lg font-semibold transition-colors"
        >
          <LogOut size={20} /> Keluar
        </button>
      </div>
    </>
  );
};

export const JournalistLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // Arahkan ke halaman login yang sesuai
    navigate('/login'); 
  };

  return (
    <div className="flex h-screen bg-[#003938] text-gray-100">
      {/* --- Sidebar untuk Mobile & Tablet (Slide-out) --- */}
      {/* REVISI: Breakpoint diubah ke 'lg' */}
      <Transition show={isSidebarOpen} as={Fragment}>
        <div className="fixed inset-0 flex z-40 lg:hidden">
          {/* Overlay */}
          <Transition.Child as={Fragment} enter="transition-opacity ease-linear duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="transition-opacity ease-linear duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/60" onClick={() => setIsSidebarOpen(false)} />
          </Transition.Child>
          
          {/* Konten Sidebar */}
          <Transition.Child as={Fragment} enter="transition ease-in-out duration-300 transform" enterFrom="-translate-x-full" enterTo="translate-x-0" leave="transition ease-in-out duration-300 transform" leaveFrom="translate-x-0" leaveTo="-translate-x-full">
            <aside className="relative w-64 bg-[#004A49] z-40 flex flex-col">
               <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-gray-300 hover:text-white"><X size={24} /></button>
              <SidebarContent onLogout={handleLogout} onLinkClick={() => setIsSidebarOpen(false)} />
            </aside>
          </Transition.Child>
        </div>
      </Transition>

      {/* --- Sidebar untuk Desktop (Statis) --- */}
      {/* REVISI: Breakpoint diubah ke 'lg' */}
      <aside className="w-64 bg-[#004A49]/80 border-r-2 border-lime-400/50 flex-col hidden lg:flex">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="p-4 flex justify-between items-center border-b-2 border-lime-400/30">
          {/* Tombol Hamburger, hanya tampil di bawah 'lg' */}
          <button
            className="lg:hidden text-white hover:text-lime-300 transition-colors"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Buka Menu"
          >
            <Menu size={24} />
          </button>

          {/* Sapaan, hanya tampil di 'lg' ke atas */}
          <div className="hidden lg:block">
             <h1 className="text-xl font-semibold text-white">Selamat Datang, {user?.name}!</h1>
          </div>

          {/* Spacer agar sapaan di mobile (jika ada) tetap di tengah */}
           <div className="w-6 lg:hidden"></div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#003938] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};