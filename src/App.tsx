import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// --- Layouts ---
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import { JournalistLayout } from './layouts/JournalistLayout';
import UserLayout from './layouts/UserLayout';

// --- Halaman Publik ---
import HomePage from './pages/public/HomePage';
import About from './pages/public/About';
import ArticlesPage from './pages/public/Articles';
import ArticleDetail from './pages/public/ArticlesDetail';
import EventPage from './pages/public/Event';
import EventDetail from './pages/public/EventDetail';
import PlantPage from './pages/public/Plant';
import PlantDetail from './pages/public/PlantDetail';
import NotFoundPage from './pages/NotFoundPage';

// --- Halaman Auth ---
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
import { PlantEditorPage } from './pages/admin/PlantEditorPage';
import { PlantDetailPage } from './pages/admin/PlantDetailPage';
import { EventEditorPage } from './pages/admin/EventEditorPage';

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

  if (!user || !allowedRoles.includes(user.role)) {
    const expectedRole = allowedRoles[0]; 
    let loginPath = '/participant/login'; 

    if (expectedRole === 'ADMIN') {
      loginPath = '/admin/login';
    } else if (expectedRole === 'JOURNALIST') {
      loginPath = '/journalist/login';
    } else if (expectedRole === 'USER') {
      loginPath = '/participant/login';
    }
    
    return <Navigate to={loginPath} replace />;
  }

  return <Outlet />;
};


// --- Komponen Aplikasi Utama ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a202c',
            color: '#e2e8f0',
            border: '1px solid #4a5568',
          },
          success: {
            duration: 2000,
            iconTheme: {
              primary: '#38a169',
              secondary: 'white',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#e53e3e',
              secondary: 'white',
            },
          },
        }}
      />

      <Routes>
        {/* === Rute Publik dengan Layout Utama === */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<About />} />
          <Route path="articles" element={<ArticlesPage />} />
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
            <Route path="plants/new" element={<PlantEditorPage />} />
            <Route path="plants/edit/:id" element={<PlantEditorPage />} />
            <Route path="plants/view/:id" element={<PlantDetailPage />} />
            
            <Route path="events" element={<EventManagementPage />} />
            <Route path="events/new" element={<EventEditorPage />} />
            <Route path="events/edit/:id" element={<EventEditorPage />} />
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;