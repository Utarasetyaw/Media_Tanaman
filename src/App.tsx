import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// --- Layouts ---
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import { JournalistLayout } from './layouts/JournalistLayout';

// --- Halaman Publik ---
import Home from './pages/Home';
import About from './pages/About';
import ArticlePage from './pages/Article';
import ArticleDetail from './pages/ArticleDetail';
import EventPage from './pages/Event';
import EventDetail from './pages/EventDetail';
import PlantPage from './pages/Plant';
import PlantDetail from './pages/PlantDetail';

// --- Halaman Admin & Login ---
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ArticleManagementPage } from './pages/admin/ArticleManagementPage';
import { CompanyManagementPage } from './pages/admin/CompanyManagementPage';
import { JournalistManagementPage } from './pages/admin/JournalistManagementPage';
import { PlantManagementPage } from './pages/admin/PlantManagementPage';
import { EventManagementPage } from './pages/admin/EventManagementPage';

// --- Halaman Jurnalis ---
import { JournalistDashboardPage } from './pages/journalist/JournalistDashboardPage';
import { JournalistArticleManagementPage } from './pages/journalist/JournalistArticleManagementPage';

// --- Komponen Pelindung Rute (Route Guards) ---

// Guard untuk Admin: Memastikan hanya admin yang bisa akses
const AdminRouteGuard: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  // Jika tidak ada user atau perannya bukan admin, alihkan ke login
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Guard untuk Jurnalis: Memastikan hanya jurnalis yang bisa akses
const JournalistRouteGuard: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  // Jika tidak ada user atau perannya bukan jurnalis, alihkan ke login
  if (!user || user.role !== 'jurnalis') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};


// --- Komponen Aplikasi Utama ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* === Rute Publik === */}
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

        {/* === Halaman Login === */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* === Rute Terproteksi untuk Admin === */}
        <Route 
          path="/admin/*" 
          element={
            <AdminRouteGuard>
              <Routes>
                <Route path="/" element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="company" element={<CompanyManagementPage />} />
                  <Route path="journalists" element={<JournalistManagementPage />} />
                  <Route path="articles" element={<ArticleManagementPage />} />
                  <Route path="plants" element={<PlantManagementPage />} />
                  <Route path="events" element={<EventManagementPage />} />
                </Route>
              </Routes>
            </AdminRouteGuard>
          } 
        />

        {/* === Rute Terproteksi untuk Jurnalis === */}
        <Route 
          path="/jurnalis/*" 
          element={
            <JournalistRouteGuard>
              <Routes>
                <Route path="/" element={<JournalistLayout />}>
                  <Route index element={<JournalistDashboardPage />} />
                  <Route path="articles" element={<JournalistArticleManagementPage />} />
                  {/* Tambahkan rute untuk tulis artikel baru di sini jika sudah ada komponennya */}
                  {/* <Route path="articles/new" element={<WriteArticlePage />} /> */}
                </Route>
              </Routes>
            </JournalistRouteGuard>
          } 
        />

        {/* === Rute Halaman Tidak Ditemukan (404) === */}
        <Route path="*" element={<div className="flex items-center justify-center h-screen">404 - Halaman Tidak Ditemukan</div>} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
