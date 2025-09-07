import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: 'admin' | 'jurnalis') => {
    login(role);
    // Arahkan berdasarkan peran pengguna
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/jurnalis');
    }
  };

  if (user) {
    // Jika sudah login, arahkan ke dashboard yang sesuai
    if (user.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/jurnalis" replace />;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-green-800">Login Panel</h2>
        <p className="text-center text-gray-600">Pilih peran Anda untuk melanjutkan</p>
        <div className="flex flex-col gap-4">
          <button onClick={() => handleLogin('admin')} className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">Login sebagai Admin</button>
          <button onClick={() => handleLogin('jurnalis')} className="w-full py-3 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700">Login sebagai Jurnalis</button>
        </div>
      </div>
    </div>
  );
};
