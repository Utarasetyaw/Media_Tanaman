import React from 'react';
import { useLayoutData } from '../hooks/useLayoutData';

const HorizontalAd: React.FC = () => {
  // 1. Ambil data layout (yang berisi info iklan) menggunakan hook
  const { data: layoutData, isLoading, isError } = useLayoutData();

  // 2. Ambil data khusus untuk iklan horizontal dengan aman
  const horizontalAds = layoutData?.ads?.horizontal;

  // 3. Tampilkan placeholder saat data sedang dimuat
  if (isLoading) {
    return (
      <div className="my-8 w-full h-[130px] bg-gray-700/50 rounded-lg animate-pulse" />
    );
  }

  // 4. Jangan tampilkan apa-apa jika ada error atau tidak ada data iklan
  if (isError || !horizontalAds || horizontalAds.length === 0) {
    return null;
  }

  // 5. Pilih satu iklan secara acak dari data yang diterima dari API
  const randomAd = horizontalAds[Math.floor(Math.random() * horizontalAds.length)];

  // 6. Tampilkan komponen iklan dengan data dinamis
  return (
    <div className="my-8">
      <a 
        href={randomAd.linkUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block w-full h-[130px] rounded-lg shadow-sm overflow-hidden"
      >
        <img
          src={randomAd.imageUrl}
          alt="Iklan Horizontal"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </a>
    </div>
  );
};

export default HorizontalAd;