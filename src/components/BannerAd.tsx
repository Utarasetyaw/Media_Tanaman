import type { FC } from 'react';
import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLayoutData } from '../hooks/useLayoutData';
// REVISI: Impor hook dan tipe data khusus untuk iklan
import { useAdsData } from '../hooks/useAdsData'; 
import { adsTranslations } from '../assets/ads.i18n';

const BannerAd: FC = () => {
  const { lang: currentLang } = useOutletContext<{ lang: 'id' | 'en' }>();
  
  // REVISI: Panggil dua hook terpisah untuk data yang berbeda
  const { data: layoutData } = useLayoutData(); // Hook untuk data layout umum
  const { data: bannerAds, isLoading, isError } = useAdsData('banner'); // Hook khusus untuk data iklan

  const t = (key: keyof typeof adsTranslations.id): string => {
    return adsTranslations[currentLang]?.[key] || key;
  };

  const googleAdsId = layoutData?.settings.googleAdsId;
  const shouldShowAd = !isLoading && !isError && googleAdsId && bannerAds && bannerAds.length > 0;

  const randomAd = useMemo(() => {
    if (!shouldShowAd) {
      return null;
    }
    return bannerAds[Math.floor(Math.random() * bannerAds.length)];
  }, [bannerAds, shouldShowAd]);

  // State Loading
  if (isLoading) {
    return (
      <div className="my-6 w-full h-[180px] bg-gray-700/50 rounded-lg animate-pulse" />
    );
  }

  // State Sukses dengan Iklan
  if (shouldShowAd && randomAd) {
    return (
      <div className="my-6">
        <a
          href={randomAd.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-auto sm:h-[180px] rounded-lg shadow-sm overflow-hidden aspect-video sm:aspect-auto"
        >
          <img
            src={randomAd.imageUrl}
            alt={t('banner_ad_alt')} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </a>
      </div>
    );
  }

  // State Gagal atau Tidak Ada Iklan
  return (
    <div className="my-6 w-full h-[180px] border-2 border-dashed border-lime-400/50 rounded-lg flex items-center justify-center">
      <p className="text-gray-400 text-sm">{t('no_ad_available')}</p>
    </div>
  );
};

export default BannerAd;