type Translation = {
    loading: string;
    error_title: string;
    back_link: string;
    by: string;
    published_on: string;
    related_articles: string;
};

export const articleDetailTranslations: { [key in 'id' | 'en']: Translation } = {
    id: {
        loading: "Memuat Artikel...",
        error_title: "Artikel Tidak Ditemukan",
        back_link: "Kembali ke daftar artikel",
        by: "Oleh",
        published_on: "Diterbitkan pada",
        related_articles: "Artikel Terkait Lainnya",
    },
    en: {
        loading: "Loading Article...",
        error_title: "Article Not Found",
        back_link: "Back to articles list",
        by: "By",
        published_on: "Published on",
        related_articles: "Other Related Articles",
    }
};