import React, { useState, useEffect } from 'react';

// 1. Mengambil semua gambar dari folder 'banner'
const imageModules = import.meta.glob('../assets/Iklan/banner/*.{png,jpg,jpeg}', { eager: true });
const adImages: string[] = Object.values(imageModules).map((module: any) => module.default || module);

const BannerAd: React.FC = () => {
  // 2. State untuk menyimpan URL gambar yang dipilih secara acak
  const [randomAdImage, setRandomAdImage] = useState<string | null>(null);

  // 3. Logika untuk memilih gambar acak saat komponen dimuat
  useEffect(() => {
    if (adImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * adImages.length);
      setRandomAdImage(adImages[randomIndex]);
    }
  }, []);

  // 4. Tampilan jika tidak ada gambar di dalam folder
  if (!randomAdImage) {
    return (
      <div className="w-full my-6 h-[90px] bg-gray-100 flex items-center justify-center text-center text-sm text-gray-400 rounded-lg shadow-sm">
        Tidak ada Banner Iklan
      </div>
    );
  }

  // 5. Tampilan iklan gambar banner
  return (
    <div className="my-6">
      <a href="#" target="_blank" rel="noopener noreferrer" className="block w-full h-[180px] rounded-lg shadow-sm overflow-hidden">
        <img
          src={randomAdImage}
          alt="Iklan Banner"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </a>
    </div>
  );
};

export default BannerAd;