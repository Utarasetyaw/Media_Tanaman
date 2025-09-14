import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, UserCircle } from 'lucide-react';

const Footer: React.FC = () => (
    <footer className="bg-[#021a19] text-gray-400 text-center p-4 mt-auto border-t border-green-400/20">
        <p className="text-sm">&copy; {new Date().getFullYear()} Narapati Flora. Hak Cipta Dilindungi.</p>
    </footer>
);

export const UserLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#042f2e] text-gray-200">
            <header className="bg-[#042f2e]/80 backdrop-blur-sm text-white shadow-lg sticky top-0 z-50 border-b border-green-400/40">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    {/* REVISI: Ukuran font brand dibuat responsif */}
                    <Link 
                        to="/" 
                        className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-green-400 hover:text-white transition-colors duration-300"
                    >
                        Narapati Flora
                    </Link>

                    {/* REVISI: Jarak antar item navigasi disesuaikan untuk mobile */}
                    <nav className="flex items-center gap-3 sm:gap-4">
                        <Link 
                            to="/dashboard" 
                            className="flex items-center gap-2 text-sm font-semibold text-gray-200 hover:text-white bg-black/20 hover:bg-black/40 px-3 sm:px-4 py-2 rounded-lg transition-all"
                        >
                           <LayoutDashboard size={18} />
                           <span className='hidden sm:inline'>Dashboard</span>
                        </Link>
                        
                        {user ? (
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
                                    <UserCircle size={20} />
                                    <span>{user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="bg-transparent border border-green-400 text-green-400 hover:bg-green-400 hover:text-white font-bold text-sm py-2 px-3 rounded-lg flex items-center gap-2 transition-all duration-300"
                                    title="Keluar"
                                >
                                    <LogOut size={16} />
                                    <span className='hidden sm:inline'>Keluar</span>
                                </button>
                            </div>
                        ) : (
                             <Link to="/login" className="bg-green-500 text-gray-900 font-bold py-2 px-3 sm:px-4 rounded-lg hover:bg-green-400 transition-colors text-sm">
                                Masuk
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-grow w-full">
                <Outlet />
            </main>
            
            <Footer />
        </div>
    );
};

export default UserLayout;