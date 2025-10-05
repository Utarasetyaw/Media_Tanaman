import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Definisikan tipe LoginRole di sini agar bisa digunakan di komponen
type LoginRole = 'admin' | 'journalist' | 'user';

// Komponen UI Form Login (Tidak ada perubahan)
const LoginForm: React.FC<any> = ({ title, email, setEmail, password, setPassword, error, isLoggingIn, handleSubmit }) => (
  <div className="flex items-center justify-center min-h-screen bg-[#003938] p-4 font-sans">
    <div className="relative w-full max-w-md p-6 sm-p-8 space-y-4 bg-[#004A49]/80 rounded-lg shadow-2xl border-2 border-lime-400">
      <div className="pt-4 text-center">
        <h2 className="font-serif text-3xl font-bold text-white">Narapati Flora</h2>
        <p className="text-xl font-semibold text-gray-200 mt-2">{title}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoggingIn} className="w-full px-4 py-2 mt-1 bg-white/10 border-2 border-lime-400/50 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-200">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoggingIn} className="w-full px-4 py-2 mt-1 bg-white/10 border-2 border-lime-400/50 rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50" />
        </div>
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        <div>
          <button type="submit" className="w-full py-3 px-4 bg-lime-300 text-lime-900 font-bold rounded-lg hover:bg-lime-400 transition-colors disabled:bg-lime-200" disabled={isLoggingIn}>
            {isLoggingIn ? "Masuk..." : "Login"}
          </button>
        </div>
      </form>
       <div className="text-center space-y-2 pt-2">
            <p className="text-sm text-gray-300">
                Belum punya akun?{' '}
                <Link to="/journalist/register" className="font-medium text-lime-300 hover:text-lime-400 underline">
                    Daftar di sini
                </Link>
            </p>
            <Link to="/" className="text-sm font-medium text-gray-300 hover:text-lime-300 hover:underline transition-colors">
                &#8592; Kembali ke Beranda
            </Link>
        </div>
    </div>
  </div>
);

// Komponen baru untuk menampilkan opsi beralih sesi
const SwitchSessionPrompt: React.FC<{ targetRole: LoginRole, targetRoleName: string }> = ({ targetRole, targetRoleName }) => {
    const { user, switchSession, isLoading } = useAuth();
    
    const handleSwitch = async () => {
        await switchSession(targetRole);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#003938] p-4 font-sans">
            <div className="w-full max-w-md p-8 space-y-6 text-center bg-[#004A49]/80 rounded-lg shadow-2xl border-2 border-lime-400">
                <h2 className="text-2xl font-bold text-white">Sesi Ditemukan</h2>
                <p className="text-gray-200">
                    Anda sedang login sebagai <span className="font-bold text-lime-300">{user?.role}</span>. <br/>
                    Apakah Anda ingin beralih ke sesi {targetRoleName}?
                </p>
                <button
                    onClick={handleSwitch}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-lime-300 text-lime-900 font-bold rounded-lg hover:bg-lime-400 transition-colors disabled:bg-lime-200"
                >
                    {isLoading ? "Beralih..." : `Ya, Masuk sebagai ${targetRoleName}`}
                </button>
                 <Link to="/" className="block mt-4 text-sm font-medium text-gray-300 hover:text-lime-300 hover:underline transition-colors">
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
};


export const JournalistLoginPage: React.FC = () => {
  const { user, login, availableSessions, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const isJournalistSessionAvailable = availableSessions.includes('journalist');
  const isOtherUserActive = user && user.role !== 'JOURNALIST';

  // Kondisi 1: Jika user lain aktif TAPI sesi jurnalis tersedia (tokennya ada)
  if (isOtherUserActive && isJournalistSessionAvailable) {
    return <SwitchSessionPrompt targetRole="journalist" targetRoleName="Jurnalis" />;
  }

  // Kondisi 2: Jika pengguna sudah login sebagai jurnalis, langsung alihkan.
  if (user?.role === 'JOURNALIST') {
    return <Navigate to="/jurnalis" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);
    try {
      await login({ email, password }, 'journalist');
    } catch (err: any) {
      setError(err.response?.data?.error || "Login gagal, periksa kembali data Anda.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Kondisi 3: Jika tidak ada kondisi di atas, tampilkan form login
  return (
    <LoginForm
      title="Journalist Login"
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      error={error}
      isLoggingIn={isLoggingIn || isLoading}
      handleSubmit={handleSubmit}
    />
  );
};