import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Komponen UI Form Login yang bisa dipakai ulang
const LoginForm: React.FC<any> = ({ title, email, setEmail, password, setPassword, error, isLoggingIn, handleSubmit }) => (
  <div className="flex items-center justify-center min-h-screen bg-[#003938] p-4 font-sans">
    <div className="relative w-full max-w-md p-6 sm:p-8 space-y-4 bg-[#004A49]/80 rounded-lg shadow-2xl border-2 border-lime-400">
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
                <Link to="/participant/register" className="font-medium text-lime-300 hover:text-lime-400 underline">
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

export const ParticipantLoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('peserta@narapati.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Pengecekan role peserta
  if (user?.role === 'USER') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);
    try {
      // Pemanggilan login tetap menggunakan 'participant' sebagai penanda endpoint
      await login({ email, password }, 'user');
    } catch (err: any) {
      setError(err.response?.data?.error || "Login gagal, periksa kembali data Anda.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <LoginForm
      title="Participant Login"
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      error={error}
      isLoggingIn={isLoggingIn}
      handleSubmit={handleSubmit}
    />
  );
};