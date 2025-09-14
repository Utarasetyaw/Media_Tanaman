import type { FC } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLayoutData } from '../hooks/useLayoutData';
import { adsTranslations } from '../assets/ads.i18n';

const HorizontalAd: FC = () => {
  const { lang: currentLang } = useOutletContext<{ lang: 'id' | 'en' }>();
  const { data: layoutData, isLoading, isError } = useLayoutData();

  // Fungsi untuk mendapatkan teks berdasarkan bahasa yang aktif
  const t = (key: 'no_ad_available' | 'horizontal_ad_alt'): string => {
    return adsTranslations[currentLang]?.[key] || key;
  };

  // Tampilkan placeholder saat data sedang dimuat
  if (isLoading) {
    return (
      <div className="my-8 w-full h-[90px] sm:h-[130px] bg-gray-700/50 rounded-lg animate-pulse" />
    );
  }

  // Ambil data iklan dan ID Google Ads dengan aman
  const horizontalAds = layoutData?.ads?.horizontal;
  const googleAdsId = layoutData?.settings.googleAdsId;

  // Kondisi untuk menampilkan placeholder
  if (isError || !googleAdsId || !horizontalAds || horizontalAds.length === 0) {
    return (
      <div className="my-8 w-full h-[90px] sm:h-[130px] border-2 border-dashed border-lime-400/50 rounded-lg flex items-center justify-center">
        <p className="text-gray-400 text-sm">{t('no_ad_available')}</p>
      </div>
    );
  }

  // Pilih satu iklan secara acak
  const randomAd = horizontalAds[Math.floor(Math.random() * horizontalAds.length)];

  // Tampilkan komponen iklan jika semua valid
  return (
    <div className="my-8">
      <a 
        href={randomAd.linkUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        // REVISI: Tinggi dibuat responsif
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
};

export default HorizontalAd;