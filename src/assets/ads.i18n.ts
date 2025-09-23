// ads.i18n.ts (Sudah Benar)

type AdTranslation = {
    no_ad_available: string;
    horizontal_ad_alt: string;
    vertical_ad_alt: string;
    banner_ad_alt: string;
};

export const adsTranslations: { [key in 'id' | 'en']: AdTranslation } = {
    id: {
        no_ad_available: "Tidak ada iklan yang tersedia saat ini.",
        horizontal_ad_alt: "Iklan horizontal",
        vertical_ad_alt: "Iklan vertikal",
        banner_ad_alt: "Iklan banner"
    },
    en: {
        no_ad_available: "No ad available at this moment.",
        horizontal_ad_alt: "Horizontal ad",
        vertical_ad_alt: "Vertical ad",
        banner_ad_alt: "Banner ad"
    }
};