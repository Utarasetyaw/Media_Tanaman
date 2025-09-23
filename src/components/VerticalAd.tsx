import type { FC } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLayoutData } from '../hooks/useLayoutData';
// REVISI: Impor hook dan tipe data khusus untuk iklan
import { useAdsData, type Ad } from '../hooks/useAdsData'; 
import { adsTranslations } from '../assets/ads.i18n';

// Komponen AdBlock untuk menampilkan satu iklan (tidak ada perubahan)
const AdBlock: FC<{ ad: Ad; t: (key: keyof typeof adsTranslations.id) => string }> = ({ ad, t }) => {
  return (
    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-40 h-[400px] rounded shadow overflow-hidden">
      <img
        src={ad.imageUrl}
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
  
  // REVISI: Panggil dua hook terpisah untuk data yang berbeda
  const { data: layoutData } = useLayoutData(); // Hook untuk data layout umum
  const { data: verticalAds, isLoading, isError } = useAdsData('vertical'); // Hook khusus untuk data iklan

  const t = (key: keyof typeof adsTranslations.id): string => {
    return adsTranslations[currentLang]?.[key] || key;
  };

  // Logika untuk menampilkan iklan berdasarkan data dari kedua hook
  const googleAdsId = layoutData?.settings.googleAdsId;
  const shouldShowAds = !isError && googleAdsId && verticalAds && verticalAds.length > 0;

  // Logika untuk mengacak dan memilih iklan (tidak ada perubahan)
  const shuffledAds = shouldShowAds 
    ? [...verticalAds].sort(() => 0.5 - Math.random()) 
    : [];
  
  const ad1 = shuffledAds[0];
  const ad2 = shuffledAds.length > 1 ? shuffledAds[1] : shuffledAds[0];

  // Render JSX (tidak ada perubahan fungsional)
  return (
    <div className={`hidden 2xl:flex flex-col gap-4 fixed top-36 z-10 ${position === 'left' ? 'left-10' : 'right-10'}`}>
      {isLoading ? (
        <>
          <div className="w-40 h-[400px] bg-gray-700/50 rounded shadow animate-pulse" />
          <div className="w-40 h-[400px] bg-gray-700/50 rounded shadow animate-pulse" />
        </>
      ) : shouldShowAds ? (
        <>
          <AdBlock ad={ad1} t={t} />
          <AdBlock ad={ad2} t={t} />
        </>
      ) : (
        <>
          <div className="w-40 h-[400px] border-2 border-dashed border-lime-400/50 rounded-lg flex items-center justify-center p-4">
            <p className="text-gray-400 text-xs text-center">{t('no_ad_available')}</p>
          </div>
          <div className="w-40 h-[400px] border-2 border-dashed border-lime-400/50 rounded-lg flex items-center justify-center p-4">
            <p className="text-gray-400 text-xs text-center">{t('no_ad_available')}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default VerticalAd;