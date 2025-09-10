import React, { useState, Fragment } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext'; // Import dinonaktifkan untuk perbaikan
import { LayoutDashboard, Newspaper, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { Transition } from '@headlessui/react';

// --- Simulasi (Mock) dari AuthContext ---
// Ini menggantikan import yang gagal agar komponen bisa berjalan.
const useAuth = () => ({
  user: { name: 'Budi Santoso' }, // Contoh nama pengguna
  logout: () => console.log('Logout dipanggil'),
});
// --- Akhir dari Simulasi ---

// Komponen Sidebar terpisah untuk Jurnalis
const SidebarContent: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/jurnalis' },
    { icon: Newspaper, label: 'Artikel Saya', to: '/jurnalis/articles' },
  ];

  return (
    <>
      <div className="p-6 text-2xl font-bold text-lime-400 flex items-center gap-2">
        <ShieldCheck /> Jurnalis Panel
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/jurnalis'}
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
          <LogOut size={20} /> Logout
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
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-[#003938] text-gray-100">
      {/* --- Sidebar untuk Mobile (Slide-out) --- */}
      <Transition show={isSidebarOpen} as={Fragment}>
        <div className="md:hidden">
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-black/60 z-30"
              onClick={() => setIsSidebarOpen(false)}
            />
          </Transition.Child>
          
          {/* Konten Sidebar */}
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <aside className="fixed inset-y-0 left-0 w-64 bg-[#004A49] z-40 flex flex-col">
               <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-gray-300 hover:text-white">
                  <X size={24} />
               </button>
              <SidebarContent onLogout={handleLogout} />
            </aside>
          </Transition.Child>
        </div>
      </Transition>

      {/* --- Sidebar untuk Desktop (Statis) --- */}
      <aside className="w-64 bg-[#004A49]/80 border-r-2 border-lime-400 flex-col hidden md:flex">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="p-4 flex justify-between items-center border-b-2 border-lime-400/30">
          <button
            className="md:hidden text-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold text-white">Selamat Datang, {user?.name}!</h1>
           <div className="w-6 md:hidden"></div> {/* Spacer for mobile */}
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#003938] p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

