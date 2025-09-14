import type { FC } from 'react';
import { useOutletContext } from 'react-router-dom'; // Untuk mendapatkan bahasa
import { useLayoutData } from '../hooks/useLayoutData';
// Impor file translasi yang baru dibuat
import { adsTranslations } from '../assets/ads.i18n';

const BannerAd: FC = () => {
  const { lang: currentLang } = useOutletContext<{ lang: 'id' | 'en' }>();
  const { data: layoutData, isLoading, isError } = useLayoutData();

  // Fungsi untuk mendapatkan teks berdasarkan bahasa yang aktif
  const t = (key: keyof typeof adsTranslations.id): string => {
    return adsTranslations[currentLang]?.[key] || key;
  };

  // Tampilkan placeholder saat data sedang dimuat
  if (isLoading) {
    return (
      <div className="my-6 w-full h-[180px] bg-gray-700/50 rounded-lg animate-pulse" />
    );
  }

  // Ambil data iklan dan ID Google Ads dengan aman
  const bannerAds = layoutData?.ads?.banner;
  const googleAdsId = layoutData?.settings.googleAdsId;

  // REVISI: Kondisi untuk menampilkan placeholder
  // Tampilkan jika ada error, tidak ada ID Google Ads, atau tidak ada data iklan banner
  if (isError || !googleAdsId || !bannerAds || bannerAds.length === 0) {
    return (
      <div className="my-6 w-full h-[180px] border-2 border-dashed border-lime-400/50 rounded-lg flex items-center justify-center">
        <p className="text-gray-400 text-sm">{t('no_ad_available')}</p>
      </div>
    );
  }

  // Pilih satu iklan secara acak
  const randomAd = bannerAds[Math.floor(Math.random() * bannerAds.length)];

  // Tampilkan komponen iklan jika semua valid
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
          alt="Iklan Banner"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </a>
    </div>
  );
};

export default BannerAd;