import React, { useState, useEffect } from 'react';

const imageModules = import.meta.glob('../assets/Iklan/vertikal/*.{png,jpg,jpeg}', { eager: true });
const adImages: string[] = Object.values(imageModules).map((module: any) => module.default || module);

// Komponen untuk satu blok iklan gambar
const AdBlock: React.FC = () => {
  const [randomAdImage, setRandomAdImage] = useState<string | null>(null);

  useEffect(() => {
    if (adImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * adImages.length);
      setRandomAdImage(adImages[randomIndex]);
    }
  }, []);

  if (!randomAdImage) {
    return (
      <div className="w-40 h-[300px] bg-gray-100 flex items-center justify-center text-center text-xs text-gray-400 rounded shadow">
        Tidak ada Iklan Vertikal
      </div>
    );
  }

  return (
    <a href="#" target="_blank" rel="noopener noreferrer" className="block w-40 h-[400px] rounded shadow overflow-hidden">
      <img
        src={randomAdImage}
        alt="Iklan Vertikal"
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
    </a>
  );
};

interface VerticalAdProps {
  position: 'left' | 'right';
}

const VerticalAd: React.FC<VerticalAdProps> = ({ position }) => {
  return (
    <div
      className={`
        hidden 2xl:flex flex-col gap-4 
        fixed top-36 z-10 {/* <-- PERUBAHAN: 'absolute' diganti menjadi 'fixed' */}
        ${position === 'left' ? 'left-10' : 'right-10'}
      `}
    >
      <AdBlock />
      <AdBlock />
    </div>
  );
};

export default VerticalAd;