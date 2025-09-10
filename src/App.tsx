import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// --- Layouts ---
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import { JournalistLayout } from './layouts/JournalistLayout';

// --- Halaman Publik ---
import Home from './pages/Home';
import About from './pages/About';
import ArticlePage from './pages/News';
import ArticleDetail from './pages/NewsDetail';
import EventPage from './pages/Event';
import EventDetail from './pages/EventDetail';
import PlantPage from './pages/Plant';
import PlantDetail from './pages/PlantDetail';

// --- Halaman Auth ---
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage'; // <-- Impor halaman baru

// --- Halaman Admin ---
import { DashboardPage } from './pages/admin/DashboardPage';
import { ArticleManagementPage } from './pages/admin/ArticleManagementPage';
import { CompanyManagementPage } from './pages/admin/CompanyManagementPage';
import { JournalistManagementPage } from './pages/admin/JournalistManagementPage';
import { PlantManagementPage } from './pages/admin/PlantManagementPage';
import { EventManagementPage } from './pages/admin/EventManagementPage';
import { ArticleEditorPage } from './pages/admin/ArticleEditorPage';
import { ArticleSeoPage } from './pages/admin/ArticleSeoPage';

// --- Halaman Jurnalis ---
import { JournalistDashboardPage } from './pages/journalist/JournalistDashboardPage';
import { JournalistArticleManagementPage } from './pages/journalist/JournalistArticleManagementPage';
import { JournalistArticleEditorPage } from './pages/journalist/JournalistArticleEditorPage';
import { JournalistArticleAnalyticsPage } from './pages/journalist/JournalistArticleAnalyticsPage';


// --- REVISI: Komponen Pelindung Rute yang Fleksibel ---
const ProtectedRoute: React.FC<{ allowedRoles: string[] }> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-[#003938] text-white">Memeriksa sesi...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Arahkan ke halaman login yang netral
    return <Navigate to="/login" replace />;
  }

  // Outlet akan merender rute anak (child routes) yang cocok
  return <Outlet />;
};


// --- Komponen Aplikasi Utama ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* === Rute Publik dengan Layout Utama === */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="news" element={<ArticlePage />} />
          <Route path="news/:id" element={<ArticleDetail />} />
          <Route path="events" element={<EventPage />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="plants" element={<PlantPage />} />
          <Route path="plants/:id" element={<PlantDetail />} />
        </Route>

        {/* === Rute Autentikasi === */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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
            <Route path="plants" element={<PlantManagementPage />} />
            <Route path="events" element={<EventManagementPage />} />
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
        
        {/* === Rute Halaman Tidak Ditemukan (404) === */}
        <Route path="*" element={<div className="flex items-center justify-center h-screen bg-[#003938] text-white">404 - Halaman Tidak Ditemukan</div>} />
      </Routes>
    </AuthProvider>
  );
};

export default App;