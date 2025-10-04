import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// --- Layouts ---
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import { JournalistLayout } from './layouts/JournalistLayout';
import UserLayout from './layouts/UserLayout';

// --- Halaman Publik ---
import HomePage from './pages/HomePage';
import About from './pages/About';
import ArticlePage from './pages/Articles';
import ArticleDetail from './pages/ArticlesDetail';
import EventPage from './pages/Event';
import EventDetail from './pages/EventDetail';
import PlantPage from './pages/Plant';
import PlantDetail from './pages/PlantDetail';

// --- Halaman Auth (Menggunakan URL Spesifik) ---
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { JournalistLoginPage } from './pages/auth/JournalistLoginPage';
import { ParticipantLoginPage } from './pages/auth/ParticipantLoginPage';
import { JournalistRegisterPage } from './pages/auth/JournalistRegisterPage';
import { ParticipantRegisterPage } from './pages/auth/ParticipantRegisterPage';

// --- Halaman Admin ---
import { DashboardPage } from './pages/admin/DashboardPage';
import { ArticleManagementPage } from './pages/admin/ArticleManagementPage';
import { CompanyManagementPage } from './pages/admin/CompanyManagementPage';
import { JournalistManagementPage } from './pages/admin/JournalistManagementPage';
import { PlantManagementPage } from './pages/admin/PlantManagementPage';
import { EventManagementPage } from './pages/admin/EventManagementPage';
import { EventDetailPage } from './pages/admin/EventDetailPage';
import { ArticleEditorPage } from './pages/admin/ArticleEditorPage';
import { ArticleSeoPage } from './pages/admin/ArticleSeoPage';
import { ArticleAnalyticsPage } from './pages/admin/ArticleAnalyticsPage';

// --- Halaman Jurnalis ---
import { JournalistDashboardPage } from './pages/journalist/JournalistDashboardPage';
import { JournalistArticleManagementPage } from './pages/journalist/JournalistArticleManagementPage';
import { JournalistArticleEditorPage } from './pages/journalist/JournalistArticleEditorPage';
import { JournalistArticleAnalyticsPage } from './pages/journalist/JournalistArticleAnalyticsPage';

// --- Halaman User ---
import { UserDashboardPage } from './pages/user/UserDashboardPage';


// --- Komponen Pelindung Rute yang Fleksibel ---
const ProtectedRoute: React.FC<{ allowedRoles: string[] }> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-[#003938] text-white">Memeriksa sesi...</div>;
  }

  // Cek jika user tidak ada atau perannya tidak diizinkan
  if (!user || !allowedRoles.includes(user.role)) {
    // Tentukan halaman login tujuan berdasarkan peran yang diharapkan
    const expectedRole = allowedRoles[0]; 
    let loginPath = '/participant/login'; // Default

    if (expectedRole === 'ADMIN') {
      loginPath = '/admin/login';
    } else if (expectedRole === 'JOURNALIST') {
      loginPath = '/journalist/login';
    } else if (expectedRole === 'USER') {
      loginPath = '/participant/login';
    }
    
    // Arahkan ke halaman login yang sesuai
    return <Navigate to={loginPath} replace />;
  }

  // Jika otentikasi dan otorisasi berhasil, tampilkan konten halaman
  return <Outlet />;
};


// --- Komponen Aplikasi Utama ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* === Rute Publik dengan Layout Utama === */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<About />} />
          <Route path="articles" element={<ArticlePage />} />
          <Route path="articles/:id" element={<ArticleDetail />} />
          <Route path="events" element={<EventPage />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="plants" element={<PlantPage />} />
          <Route path="plants/:id" element={<PlantDetail />} />
        </Route>

        {/* === Rute Autentikasi Spesifik === */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/journalist/login" element={<JournalistLoginPage />} />
        <Route path="/journalist/register" element={<JournalistRegisterPage />} />
        <Route path="/participant/login" element={<ParticipantLoginPage />} />
        <Route path="/participant/register" element={<ParticipantRegisterPage />} />


        {/* === Rute Terproteksi untuk Admin === */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="company" element={<CompanyManagementPage />} />
            <Route path="journalists" element={<JournalistManagementPage />} />
            <Route path="articles" element={<ArticleManagementPage />} />
            <Route path="articles/new" element={<ArticleEditorPage />} />
            <Route path="articles/edit/:id" element={<ArticleEditorPage />} />
            <Route path="articles/seo/:id" element={<ArticleSeoPage />} />
            <Route path="articles/analytics/:id" element={<ArticleAnalyticsPage />} />
            <Route path="plants" element={<PlantManagementPage />} />
            <Route path="events" element={<EventManagementPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
          </Route>
        </Route>

        {/* === Rute Terproteksi untuk Jurnalis === */}
        <Route element={<ProtectedRoute allowedRoles={['JOURNALIST']} />}>
          <Route path="/jurnalis" element={<JournalistLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<JournalistDashboardPage />} />
            <Route path="articles" element={<JournalistArticleManagementPage />} />
            <Route path="articles/new" element={<JournalistArticleEditorPage />} />
            <Route path="articles/edit/:id" element={<JournalistArticleEditorPage />} />
            <Route path="articles/analytics/:id" element={<JournalistArticleAnalyticsPage />} />
          </Route>
        </Route>
        
        {/* === Rute Terproteksi untuk User (Peserta) === */}
        <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
          <Route path="/dashboard" element={<UserLayout />}>
             <Route index element={<UserDashboardPage />} />
          </Route>
        </Route>

        {/* === Rute Halaman Tidak Ditemukan (404) === */}
        <Route path="*" element={<div className="flex items-center justify-center h-screen bg-[#003938] text-white">404 - Halaman Tidak Ditemukan</div>} />
      </Routes>
    </AuthProvider>
  );
};

export default App;