import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';

// Objek untuk menyimpan semua teks dalam dua bahasa
const translations = {
  id: {
    welcome: 'Selamat Datang',
    adminTab: 'Admin',
    journalistTab: 'Jurnalis',
    userTab: 'Peserta',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    loginButton: 'Login',
    loggingInButton: 'Masuk...',
    panelHelperText: 'Login ini khusus untuk peran Panel.',
    userHelperText: 'Belum punya akun?',
    userRegisterLink: 'Daftar sebagai peserta',
    loginFailedError: 'Login gagal. Periksa kembali email dan password Anda.',
    backToHome: 'Kembali ke Beranda'
  },
  en: {
    welcome: 'Welcome',
    adminTab: 'Admin',
    journalistTab: 'Journalist',
    userTab: 'Participant',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    loginButton: 'Login',
    loggingInButton: 'Logging in...',
    panelHelperText: 'This login is specifically for Panel roles.',
    userHelperText: "Don't have an account?",
    userRegisterLink: 'Register as a participant',
    loginFailedError: 'Login failed. Please check your email and password again.',
    backToHome: 'Back to Home'
  }
};

type ActiveTab = 'admin' | 'journalist' | 'user';

export const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('admin@narapati.com'); // Default untuk tab admin
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('admin');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const t = translations[language];

  // Fungsi untuk menangani klik tab dan mengubah contoh email
  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setError(null);
    if (tab === 'admin') {
      setEmail('admin@narapati.com');
    } else if (tab === 'journalist') {
      setEmail('jurnalis@narapati.com');
    } else {
      setEmail('user@narapati.com');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.error || t.loginFailedError);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (user) {
    switch (user.role) {
      case 'ADMIN': return <Navigate to="/admin" replace />;
      case 'JOURNALIST': return <Navigate to="/jurnalis" replace />;
      case 'USER': return <Navigate to="/dashboard" replace />; // Arahkan ke dashboard user
      default: return <Navigate to="/" replace />;
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#003938] p-4 font-sans">
      <div className="relative w-full max-w-md p-6 sm:p-8 space-y-4 bg-[#004A49]/80 rounded-lg shadow-2xl border-2 border-lime-400">
        
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <button onClick={() => setLanguage('id')} className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${language === 'id' ? 'bg-lime-300 text-lime-900' : 'text-gray-300 hover:bg-white/10'}`}>ID</button>
          <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${language === 'en' ? 'bg-lime-300 text-lime-900' : 'text-gray-300 hover:bg-white/10'}`}>EN</button>
        </div>

        <div className="pt-4">
            <h2 className="font-serif text-3xl font-bold text-center text-white">Narapati Flora</h2>
            <p className="text-center text-gray-300">{t.welcome}</p>
        </div>

        <div className="flex border-b-2 border-lime-400/50">
          <button onClick={() => handleTabClick('admin')} className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'admin' ? 'text-lime-300 border-b-2 border-lime-300' : 'text-gray-300 hover:text-white'}`}>{t.adminTab}</button>
          <button onClick={() => handleTabClick('journalist')} className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'journalist' ? 'text-lime-300 border-b-2 border-lime-300' : 'text-gray-300 hover:text-white'}`}>{t.journalistTab}</button>
          <button onClick={() => handleTabClick('user')} className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'user' ? 'text-lime-300 border-b-2 border-lime-300' : 'text-gray-300 hover:text-white'}`}>{t.userTab}</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">{t.emailLabel}</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoggingIn} className="w-full px-4 py-2 mt-1 bg-white/10 border-2 border-lime-400/50 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">{t.passwordLabel}</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoggingIn} className="w-full px-4 py-2 mt-1 bg-white/10 border-2 border-lime-400/50 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50" />
          </div>
          
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <div>
            <button type="submit" className="w-full py-3 px-4 bg-lime-300 text-lime-900 font-bold rounded-lg hover:bg-lime-400 transition-colors disabled:bg-lime-200" disabled={isLoggingIn}>
              {isLoggingIn ? t.loggingInButton : t.loginButton}
            </button>
          </div>
        </form>

        <div className="text-center space-y-2">
            <div className="text-sm text-gray-300 h-10 flex items-center justify-center">
                {activeTab === 'user' ? (
                <p>{t.userHelperText}{' '} <Link to="/register" className="font-medium text-lime-300 hover:text-lime-400 underline">{t.userRegisterLink}</Link></p>
                ) : (
                <p>{t.panelHelperText}</p>
                )}
            </div>
            <Link to="/" className="text-sm font-medium text-gray-300 hover:text-lime-300 hover:underline transition-colors">
                &#8592; {t.backToHome}
            </Link>
        </div>
        
      </div>
    </div>
  );
};