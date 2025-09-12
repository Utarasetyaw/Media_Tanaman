import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard } from 'lucide-react';

// Anda bisa membuat komponen Footer terpisah jika diinginkan
const Footer: React.FC = () => (
    <footer className="bg-[#002a29] text-gray-400 text-center p-4 mt-auto">
        <p>&copy; {new Date().getFullYear()} Narapati Flora. All rights reserved.</p>
    </footer>
);

const UserLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // Arahkan ke halaman utama setelah logout
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <header className="bg-[#003938] text-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="text-xl font-serif font-bold">
                        Narapati Flora
                    </Link>

                    {/* Navigasi & User Info */}
                    <nav className="flex items-center gap-4 sm:gap-6">
                        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                           <LayoutDashboard size={16} />
                           <span className='hidden sm:inline'>Dashboard Saya</span>
                        </Link>
                        
                        {user && (
                            <div className="flex items-center gap-4">
                                <span className="text-sm hidden md:inline">
                                    Halo, <span className="font-semibold">{user.name}</span>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-lime-400/20 text-lime-300 hover:bg-lime-400/40 font-semibold text-sm py-2 px-3 rounded-md flex items-center gap-2 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={16} />
                                    <span className='hidden sm:inline'>Logout</span>
                                </button>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-grow">
                {/* <Outlet/> akan merender komponen anak sesuai rute, contoh: UserDashboardPage */}
                <Outlet />
            </main>
            
            <Footer />
        </div>
    );
};

export default UserLayout;