import React from 'react';
import { useLayoutData } from '../hooks/useLayoutData';

// Definisikan tipe untuk satu item iklan
interface Ad {
  imageUrl: string;
  linkUrl: string;
}

// Komponen untuk satu blok iklan gambar
const AdBlock: React.FC<{ ads: Ad[] }> = ({ ads }) => {
  // Jika tidak ada data iklan yang diterima, jangan render apa-apa
  if (!ads || ads.length === 0) {
    return null;
  }
  
  // Pilih satu iklan secara acak dari array yang diberikan
  const randomAd = ads[Math.floor(Math.random() * ads.length)];

  return (
    <a 
      href={randomAd.linkUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block w-40 h-[400px] rounded shadow overflow-hidden"
    >
      <img
        src={randomAd.imageUrl}
        alt="Iklan Vertikal"
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
    </a>
  );
};

// Interface untuk props komponen utama
interface VerticalAdProps {
  position: 'left' | 'right';
}

const VerticalAd: React.FC<VerticalAdProps> = ({ position }) => {
  // 1. Ambil data layout (yang berisi info iklan) menggunakan hook
  const { data: layoutData, isLoading, isError } = useLayoutData();

  // 2. Ambil data khusus untuk iklan vertikal dengan aman
  const verticalAds = layoutData?.ads?.vertical;

  // 3. Tampilkan placeholder saat data sedang dimuat
  if (isLoading) {
    return (
       <div
        className={`
          hidden 2xl:flex flex-col gap-4 
          fixed top-36 z-10
          ${position === 'left' ? 'left-10' : 'right-10'}
        `}
      >
        <div className="w-40 h-[400px] bg-gray-700/50 rounded shadow animate-pulse" />
        <div className="w-40 h-[400px] bg-gray-700/50 rounded shadow animate-pulse" />
      </div>
    );
  }

  // 4. Jangan tampilkan apa-apa jika ada error atau tidak ada data iklan
  if (isError || !verticalAds || verticalAds.length === 0) {
    return null;
  }

  // 5. Tampilkan komponen iklan dengan data dinamis
  return (
    <div
      className={`
        hidden 2xl:flex flex-col gap-4 
        fixed top-36 z-10
        ${position === 'left' ? 'left-10' : 'right-10'}
      `}
    >
      {/* Render dua blok iklan, masing-masing akan memilih gambar acak sendiri */}
      <AdBlock ads={verticalAds} />
      <AdBlock ads={verticalAds} />
    </div>
  );
};

export default VerticalAd;