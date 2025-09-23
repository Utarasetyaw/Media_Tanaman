import type { FC } from 'react';
import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLayoutData } from '../hooks/useLayoutData';
// REVISI: Impor hook dan tipe data khusus untuk iklan
import { useAdsData } from '../hooks/useAdsData';
import { adsTranslations } from '../assets/ads.i18n';

const HorizontalAd: FC = () => {
  const { lang: currentLang } = useOutletContext<{ lang: 'id' | 'en' }>();
  
  // REVISI: Panggil dua hook terpisah
  const { data: layoutData } = useLayoutData(); // Untuk mendapatkan setting global
  const { data: horizontalAds, isLoading, isError } = useAdsData('horizontal'); // Hook khusus untuk data iklan

  const t = (key: 'no_ad_available' | 'horizontal_ad_alt'): string => {
    return adsTranslations[currentLang]?.[key] || key;
  };

  const googleAdsId = layoutData?.settings.googleAdsId;
  const shouldShowAd = !isLoading && !isError && googleAdsId && horizontalAds && horizontalAds.length > 0;

  const randomAd = useMemo(() => {
    if (!shouldShowAd) {
      return null;
    }
    // Pilih satu iklan secara acak
    return horizontalAds[Math.floor(Math.random() * horizontalAds.length)];
  }, [horizontalAds, shouldShowAd]); // Bergantung pada data iklan dan kondisi tampil

  // State Loading
  if (isLoading) {
    return (
      <div className="my-8 w-full h-[90px] sm:h-[130px] bg-gray-700/50 rounded-lg animate-pulse" />
    );
  }

  // State Sukses dengan Iklan
  if (shouldShowAd && randomAd) {
    return (
      <div className="my-8">
        <a
          href={randomAd.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-[90px] sm:h-[130px] rounded-lg shadow-sm overflow-hidden"
        >
          <img
            src={randomAd.imageUrl}
            alt={t('horizontal_ad_alt')}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </a>
      </div>
    );
  }

  // State Gagal atau Tidak Ada Iklan
  return (
    <div className="my-8 w-full h-[90px] sm:h-[130px] border-2 border-dashed border-lime-400/50 rounded-lg flex items-center justify-center">
      <p className="text-gray-400 text-sm">{t('no_ad_available')}</p>
    </div>
  );
};

export default HorizontalAd;