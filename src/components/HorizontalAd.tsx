import React, { useState, useEffect } from 'react';

// ✅ 1. Mengambil semua gambar dari folder 'horizon'
const imageModules = import.meta.glob('../assets/Iklan/horizon/*.{png,jpg,jpeg}', { eager: true });
const adImages: string[] = Object.values(imageModules).map((module: any) => module.default || module);

const HorizontalAd: React.FC = () => {
  // ✅ 2. State untuk menyimpan URL gambar yang dipilih secara acak
  const [randomAdImage, setRandomAdImage] = useState<string | null>(null);

  // ✅ 3. Logika untuk memilih gambar acak saat komponen pertama kali dimuat
  useEffect(() => {
    if (adImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * adImages.length);
      setRandomAdImage(adImages[randomIndex]);
    }
  }, []);

  // ✅ 4. Tampilan jika tidak ada gambar di dalam folder
  if (!randomAdImage) {
    return (
      <div className="my-8 w-full h-[90px] bg-gray-100 flex items-center justify-center text-center text-sm text-gray-400 rounded-lg shadow-sm">
        Tidak ada Iklan Horizontal
      </div>
    );
  }

  // ✅ 5. Tampilan iklan gambar horizontal
  return (
    <div className="my-8">
      <a href="#" target="_blank" rel="noopener noreferrer" className="block w-full h-[130px] rounded-lg shadow-sm overflow-hidden">
        <img
          src={randomAdImage}
          alt="Iklan Horizontal"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </a>
    </div>
  );
};

export default HorizontalAd;