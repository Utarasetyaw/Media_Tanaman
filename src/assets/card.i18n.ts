type CardTranslation = {
    view_detail: string;
};

export const cardTranslations: { [key in 'id' | 'en']: CardTranslation } = {
    id: {
        view_detail: "Lihat Detail"
    },
    en: {
        view_detail: "View Detail"
    }
};