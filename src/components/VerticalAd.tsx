import type { FC } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLayoutData } from '../hooks/useLayoutData';
import { adsTranslations } from '../assets/ads.i18n';

// Definisikan tipe untuk satu item iklan
interface Ad {
  imageUrl: string;
  linkUrl: string;
}

// Komponen untuk satu blok iklan gambar
const AdBlock: FC<{ ads: Ad[]; t: (key: keyof typeof adsTranslations.id) => string }> = ({ ads, t }) => {
  if (!ads || ads.length === 0) return null;
  
  const randomAd = ads[Math.floor(Math.random() * ads.length)];

  return (
    <a href={randomAd.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-40 h-[400px] rounded shadow overflow-hidden">
      <img
        src={randomAd.imageUrl}
        alt={t('vertical_ad_alt')}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
    </a>
  );
};

interface VerticalAdProps {
  position: 'left' | 'right';
}

const VerticalAd: FC<VerticalAdProps> = ({ position }) => {
  const { lang: currentLang } = useOutletContext<{ lang: 'id' | 'en' }>();
  const { data: layoutData, isLoading, isError } = useLayoutData();
  
  const t = (key: keyof typeof adsTranslations.id): string => {
    return adsTranslations[currentLang]?.[key] || key;
  };

  const verticalAds = layoutData?.ads?.vertical;
  const googleAdsId = layoutData?.settings.googleAdsId;

  // Tampilkan placeholder saat memuat
  if (isLoading) {
    return (
      <div className={`hidden 2xl:flex flex-col gap-4 fixed top-36 z-10 ${position === 'left' ? 'left-10' : 'right-10'}`}>
        <div className="w-40 h-[400px] bg-gray-700/50 rounded shadow animate-pulse" />
      </div>
    );
  }

  // Tampilkan placeholder jika iklan tidak valid
  if (isError || !googleAdsId || !verticalAds || verticalAds.length === 0) {
    return (
        <div className={`hidden 2xl:flex flex-col gap-4 fixed top-36 z-10 ${position === 'left' ? 'left-10' : 'right-10'}`}>
            <div className="w-40 h-[400px] border-2 border-dashed border-lime-400/50 rounded-lg flex items-center justify-center p-4">
                <p className="text-gray-400 text-xs text-center">{t('no_ad_available')}</p>
            </div>
      </div>
    );
  }

  // Tampilkan iklan jika valid
  return (
    <div className={`hidden 2xl:flex flex-col gap-4 fixed top-36 z-10 ${position === 'left' ? 'left-10' : 'right-10'}`}>
      {/* REVISI: Selalu tampilkan dua blok iklan */}
      <AdBlock ads={verticalAds} t={t} />
      <AdBlock ads={verticalAds} t={t} />
    </div>
  );
};

export default VerticalAd;