import React, { useState, Fragment } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Newspaper, Users, Building, Leaf, Calendar, LogOut, ShieldCheck, Menu } from 'lucide-react';
import { Transition } from '@headlessui/react';

// --- Komponen Konten Sidebar ---
const SidebarContent: React.FC<{ onLogout: () => void; onLinkClick?: () => void }> = ({ onLogout, onLinkClick }) => {
  const navItems = [
    { icon: Home, label: 'Dashboard', to: '/admin' },
    { icon: Building, label: 'Perusahaan', to: '/admin/company' },
    { icon: Users, label: 'Jurnalis', to: '/admin/journalists' },
    { icon: Newspaper, label: 'Artikel', to: '/admin/articles' },
    { icon: Leaf, label: 'Tanaman', to: '/admin/plants' },
    { icon: Calendar, label: 'Event', to: '/admin/events' },
  ];

  return (
    <>
      <div className="p-6 text-2xl font-bold text-lime-400 flex items-center gap-2">
        <ShieldCheck /> Admin Panel
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            onClick={onLinkClick}
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

// --- Komponen Layout Utama ---
const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-[#003938] text-gray-100">
      
      {/* --- Sidebar untuk Mobile & Tablet (Slide-out) --- */}
      {/* REVISI: diubah dari md:hidden menjadi lg:hidden */}
      <Transition show={isSidebarOpen} as={Fragment}>
        <div className="fixed inset-0 flex z-40 lg:hidden">
          {/* Lapisan Overlay Gelap */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0" enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" onClick={() => setIsSidebarOpen(false)} />
          </Transition.Child>
          
          {/* Konten Sidebar yang bisa slide */}
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full" enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0" leaveTo="-translate-x-full"
          >
            <aside className="relative w-64 bg-[#004A49] flex flex-col">
              <SidebarContent onLogout={handleLogout} onLinkClick={() => setIsSidebarOpen(false)} />
            </aside>
          </Transition.Child>
        </div>
      </Transition>

      {/* --- Sidebar untuk Desktop (Statis) --- */}
      {/* REVISI: diubah dari md:flex menjadi lg:flex */}
      <aside className="w-64 bg-[#004A49]/80 border-r-2 border-lime-400/50 flex-col hidden lg:flex">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* REVISI: Header dengan hamburger sekarang tampil di mobile & tablet, dan hilang di desktop */}
        <header className="p-4 flex items-center border-b-2 border-lime-400/30 shadow-lg lg:hidden">
          <button
            className="text-white hover:text-lime-300 transition-colors"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Buka menu"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#003938] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;