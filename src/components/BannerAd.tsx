import React from 'react';
import { useLayoutData } from '../hooks/useLayoutData';

const BannerAd: React.FC = () => {
  // 1. Ambil data layout (yang berisi info iklan) menggunakan hook
  const { data: layoutData, isLoading, isError } = useLayoutData();

  // 2. Ambil data khusus untuk iklan banner dengan aman (optional chaining)
  const bannerAds = layoutData?.ads?.banner;

  // 3. Tampilkan placeholder saat data sedang dimuat
  if (isLoading) {
    return (
      <div className="my-6 w-full h-[180px] bg-gray-700/50 rounded-lg animate-pulse" />
    );
  }

  // 4. Jangan tampilkan apa-apa jika ada error atau tidak ada data iklan banner
  if (isError || !bannerAds || bannerAds.length === 0) {
    return null; 
  }

  // 5. Pilih satu iklan secara acak dari data yang diterima dari API
  const randomAd = bannerAds[Math.floor(Math.random() * bannerAds.length)];

  // 6. Tampilkan komponen iklan dengan data dinamis
  return (
    <div className="my-6">
      <a 
        href={randomAd.linkUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block w-full h-[180px] rounded-lg shadow-sm overflow-hidden"
      >
        <img
          src={randomAd.imageUrl}
          alt="Iklan Banner"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </a>
    </div>
  );
};

export default BannerAd;