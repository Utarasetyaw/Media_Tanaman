// src/assets/page_artikeldetail.i18n.ts

type Translation = {
    // Teks dari halaman detail
    loading: string;
    error_title: string;
    back_link: string;
    by: string;
    published_on: string;
    related_articles: string;
    views: string; // <-- Baru
    likes: string; // <-- Baru
    like_button: string; // <-- Baru
    liked_button: string; // <-- Baru

    // Teks dari kartu
    view_detail: string;
};

export const articleDetailPageTranslations: {
    [key in "id" | "en"]: Translation;
} = {
    id: {
        loading: "Memuat Artikel...",
        error_title: "Artikel Tidak Ditemukan",
        back_link: "Kembali ke Semua Artikel",
        by: "Oleh",
        published_on: "Diterbitkan pada",
        related_articles: "Artikel Terkait Lainnya",
        views: "Dilihat", // <-- Baru
        likes: "Suka", // <-- Baru
        like_button: "Sukai Artikel Ini", // <-- Baru
        liked_button: "Anda Menyukai Ini", // <-- Baru
        view_detail: "Lihat Detail",
    },
    en: {
        loading: "Loading Article...",
        error_title: "Article Not Found",
        back_link: "Back to All Articles",
        by: "By",
        published_on: "Published on",
        related_articles: "Other Related Articles",
        views: "Views", // <-- Baru
        likes: "Likes", // <-- Baru
        like_button: "Like This Article", // <-- Baru
        liked_button: "You Liked This", // <-- Baru
        view_detail: "View Detail",
    },
};