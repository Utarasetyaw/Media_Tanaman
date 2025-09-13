import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css'; // Pastikan path ini benar

// 1. Buat instance client untuk Tanstack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Opsi global untuk tidak fetch ulang saat window di-fokus
      staleTime: 1000 * 60 * 5,   // Data dianggap fresh selama 5 menit
    },
  },
});

// 2. Render aplikasi utama
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 3. Sediakan QueryClient ke seluruh aplikasi */}
    <QueryClientProvider client={queryClient}>
      {/* 4. Sediakan fungsionalitas routing */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);