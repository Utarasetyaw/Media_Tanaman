import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Impor fungsi API yang asli dari file layanan Anda
import { registerJournalist } from '../../services/apiAuth';

// Komponen UI Form Registrasi yang bisa dipakai ulang
const RegistrationForm: React.FC<any> = ({ 
    title, 
    subtitle,
    name, setName, 
    email, setEmail, 
    password, setPassword, 
    error, success, isRegistering, 
    handleSubmit 
}) => (
  <div className="flex items-center justify-center min-h-screen bg-[#003938] p-4 font-sans">
    <div className="relative w-full max-w-md p-6 sm:p-8 space-y-4 bg-[#004A49]/80 rounded-lg shadow-2xl border-2 border-lime-400">
      <div className="pt-4 text-center">
        <h2 className="font-serif text-3xl font-bold text-white">{title}</h2>
        <p className="text-gray-300 mt-1">{subtitle}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-200">Nama Lengkap</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={isRegistering} className="w-full px-4 py-2 mt-1 bg-white/10 border-2 border-lime-400/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isRegistering} className="w-full px-4 py-2 mt-1 bg-white/10 border-2 border-lime-400/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-200">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isRegistering} className="w-full px-4 py-2 mt-1 bg-white/10 border-2 border-lime-400/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50" />
        </div>
        
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        {success && <p className="text-sm text-green-400 text-center">{success}</p>}

        <div>
          <button type="submit" className="w-full py-3 px-4 bg-lime-300 text-lime-900 font-bold rounded-lg hover:bg-lime-400 transition-colors disabled:bg-lime-200" disabled={isRegistering || !!success}>
            {isRegistering ? "Mendaftarkan..." : "Daftar"}
          </button>
        </div>
      </form>
      <div className="text-center space-y-2 pt-2">
            <p className="text-sm text-gray-300">
                Sudah punya akun?{' '}
                <Link to="/journalist/login" className="font-medium text-lime-300 hover:text-lime-400 underline">
                    Login di sini
                </Link>
            </p>
            <Link to="/" className="text-sm font-medium text-gray-300 hover:text-lime-300 hover:underline transition-colors">
                &#8592; Kembali ke Beranda
            </Link>
        </div>
    </div>
  </div>
);

export const JournalistRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError("Password minimal harus 8 karakter.");
      return;
    }

    setIsRegistering(true);
    try {
      // Panggil fungsi registerJournalist yang sudah diimpor
      await registerJournalist({ name, email, password });
      setSuccess("Registrasi berhasil! Anda akan diarahkan ke halaman login.");
      setTimeout(() => navigate('/journalist/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Registrasi gagal, coba lagi.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <RegistrationForm
      title="Daftar Akun Jurnalis"
      subtitle="Buat akun untuk meliput dan mempublikasikan berita."
      name={name}
      setName={setName}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      error={error}
      success={success}
      isRegistering={isRegistering}
      handleSubmit={handleSubmit}
    />
  );
};