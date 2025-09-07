import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Newspaper, Users, Building, Leaf, Calendar, LogOut, ShieldCheck } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = user?.role === 'admin' ? [
    { icon: Home, label: 'Dashboard', to: '/admin' },
    { icon: Building, label: 'Perusahaan', to: '/admin/company' },
    { icon: Users, label: 'Jurnalis', to: '/admin/journalists' },
    { icon: Newspaper, label: 'Artikel', to: '/admin/articles' },
    { icon: Leaf, label: 'Tanaman', to: '/admin/plants' },
    { icon: Calendar, label: 'Event', to: '/admin/events' },
  ] : [
    { icon: Home, label: 'Dashboard', to: '/admin' },
    { icon: Newspaper, label: 'Artikel', to: '/admin/articles' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex-col hidden md:flex">
        <div className="p-6 text-2xl font-bold text-green-800 flex items-center gap-2">
          <ShieldCheck /> Admin Panel
        </div>
        <nav className="flex-grow p-4">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isActive ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-green-50'}`}>
              <item.icon size={20} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg font-semibold">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Selamat Datang, {user?.name}!</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
          <Outlet /> {/* Ini akan merender halaman admin (Dashboard, Artikel, dll.) */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
