// src/pages/auth/RegisterPage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/apiAuth';

const translations = {
  id: {
    userTab: 'Daftar Peserta',
    journalistTab: 'Daftar Jurnalis',
    title: 'Daftar Akun Baru',
    subtitle: 'Buat akun untuk mengikuti event kami.',
    nameLabel: 'Nama Lengkap',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    registerButton: 'Daftar',
    registeringButton: 'Mendaftarkan...',
    successMessage: 'Registrasi berhasil! Anda akan diarahkan ke halaman login.',
    failureError: 'Registrasi gagal. Coba lagi.',
    passwordError: 'Password minimal harus 8 karakter.',
    helperText: 'Sudah punya akun?',
    loginLink: 'Login di sini',
    journalistInfoTitle: 'Informasi Pendaftaran Jurnalis',
    journalistInfoText: 'Untuk menjaga kualitas konten, akun Jurnalis dibuat dan diverifikasi langsung oleh Administrator. Silakan hubungi admin untuk melakukan pendaftaran.',
    backToHome: 'Kembali ke Beranda'
  },
  en: {
    userTab: 'Participant Register',
    journalistTab: 'Journalist Register',
    title: 'Create New Account',
    subtitle: 'Create an account to join our events.',
    nameLabel: 'Full Name',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    registerButton: 'Register',
    registeringButton: 'Registering...',
    successMessage: 'Registration successful! You will be redirected to the login page.',
    failureError: 'Registration failed. Please try again.',
    passwordError: 'Password must be at least 8 characters.',
    helperText: 'Already have an account?',
    loginLink: 'Login here',
    journalistInfoTitle: 'Journalist Registration Information',
    journalistInfoText: 'To maintain content quality, Journalist accounts are created and verified directly by an Administrator. Please contact an admin to register.',
    backToHome: 'Back to Home'
  },
};

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'user' | 'journalist'>('user');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsRegistering(true);

    if (password.length < 8) {
      setError(t.passwordError);
      setIsRegistering(false);
      return;
    }

    try {
      await registerUser({ name, email, password });
      setSuccess(t.successMessage);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || t.failureError);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#003938] p-4 font-sans">
      <div className="relative w-full max-w-md p-6 sm:p-8 space-y-4 bg-[#004A49]/80 rounded-lg shadow-2xl border-2 border-lime-400">
        
        <div className="absolute top-4 right-4 flex items-center space-x-2">
            <button onClick={() => setLanguage('id')} className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${language === 'id' ? 'bg-lime-300 text-lime-900' : 'text-gray-300 hover:bg-white/10'}`}>ID</button>
            <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${language === 'en' ? 'bg-lime-300 text-lime-900' : 'text-gray-300 hover:bg-white/10'}`}>EN</button>
        </div>

        <div className="pt-4">
            <h2 className="font-serif text-3xl font-bold text-center text-white">{t.title}</h2>
        </div>
        
        <div className="flex border-b-2 border-lime-400/50">
          <button onClick={() => setActiveTab('user')} className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'user' ? 'text-lime-300 border-b-2 border-lime-300' : 'text-gray-300 hover:text-white'}`}>{t.userTab}</button>
          <button onClick={() => setActiveTab('journalist')} className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'journalist' ? 'text-lime-300 border-b-2 border-lime-300' : 'text-gray-300 hover:text-white'}`}>{t.journalistTab}</button>
        </div>

        {activeTab === 'user' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-center text-gray-300 text-sm">{t.subtitle}</p>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200">{t.nameLabel}</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={isRegistering} className="w-full px-4 py-2 mt-1 bg-white/10 border-2 border-lime-400/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">{t.emailLabel}</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isRegistering} className="w-full px-4 py-2 mt-1 bg-white/10 border-2 border-lime-400/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">{t.passwordLabel}</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isRegistering} className="w-full px-4 py-2 mt-1 bg-white/10 border-2 border-lime-400/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50" />
            </div>
            
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            {success && <p className="text-sm text-green-400 text-center">{success}</p>}

            <div>
              <button type="submit" className="w-full py-3 px-4 bg-lime-300 text-lime-900 font-bold rounded-lg hover:bg-lime-400 transition-colors disabled:bg-lime-200" disabled={isRegistering || !!success}>
                {isRegistering ? t.registeringButton : t.registerButton}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center text-gray-200 p-4 border border-lime-400/50 rounded-lg">
            <h3 className="font-bold text-lg text-white mb-2">{t.journalistInfoTitle}</h3>
            <p className="text-sm">{t.journalistInfoText}</p>
          </div>
        )}
        
        <div className="text-center space-y-2 pt-2">
            <p className="text-sm text-gray-300 h-10 flex items-center justify-center">
                {t.helperText}{' '}
                <Link to="/login" className="font-medium text-lime-300 hover:text-lime-400 underline">
                    {t.loginLink}
                </Link>
            </p>
            <Link to="/" className="text-sm font-medium text-gray-300 hover:text-lime-300 hover:underline transition-colors">
                &#8592; {t.backToHome}
            </Link>
        </div>
      </div>
    </div>
  );
};