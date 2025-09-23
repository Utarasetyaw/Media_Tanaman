type CardTranslation = {
    view_detail: string;
    min_read: string;
};

export const cardTranslations: { [key in 'id' | 'en']: CardTranslation } = {
    id: {
        view_detail: "Lihat Detail",
        min_read: "min baca"
    },
    en: {
        view_detail: "View Detail",
        min_read: "min read"
    }
};