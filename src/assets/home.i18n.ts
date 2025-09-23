// File: src/assets/home.i18n.ts

type Translation = {
    loading: string;
    error: string;
    all_categories: string;
    all_plant_types: string;
    view_news_button: string;
    latest_news: string;
    top_headlines: string;
    more_for_you: string;
    no_articles_found: string;
    plant_of_the_week: string;
    view_plant_detail_button: string;
    view_event_button: string;
    running_event_badge: string;
    more_news_button: string;
    back_to_top_button: string;
    
    // --- Penambahan dari card.i18n.ts ---
    view_detail_button: string; // Menggantikan view_detail dari card
    min_read: string;

    // --- Penambahan untuk Featured Event ---
    featured_event_badge: string;
    view_details_register_button: string;
};

export const homeTranslations: { [key in 'id' | 'en']: Translation } = {
    id: {
        loading: "Memuat Halaman...",
        error: "Gagal memuat data halaman.",
        all_categories: "Semua Kategori Artikel",
        all_plant_types: "Semua Tipe Tanaman",
        view_news_button: "Lihat Berita",
        latest_news: "Berita Terbaru",
        top_headlines: "Berita Utama",
        more_for_you: "Lebih Banyak Untukmu 🌿",
        no_articles_found: "Tidak ada artikel yang cocok dengan filter Anda.",
        plant_of_the_week: "Tanaman Trending",
        view_plant_detail_button: "Lihat Detail Tanaman",
        view_event_button: "Lihat Event",
        running_event_badge: "EVENT BERJALAN",
        more_news_button: "Lihat Berita Lebih Banyak",
        back_to_top_button: "Kembali ke Atas",

        // --- Penambahan dari card.i18n.ts ---
        view_detail_button: "Lihat Detail",
        min_read: "menit baca",

        // --- Penambahan untuk Featured Event ---
        featured_event_badge: "EVENT UNGGULAN",
        view_details_register_button: "Lihat Detail & Daftar",
    },
    en: {
        loading: "Loading Page...",
        error: "Failed to load page data.",
        all_categories: "All Article Categories",
        all_plant_types: "All Plant Types",
        view_news_button: "View News",
        latest_news: "Latest News",
        top_headlines: "Top Headlines",
        more_for_you: "More For You 🌿",
        no_articles_found: "No articles match your filters.",
        plant_of_the_week: "Plant Trending",
        view_plant_detail_button: "View Plant Details",
        view_event_button: "View Event",
        running_event_badge: "ONGOING EVENT",
        more_news_button: "View More News",
        back_to_top_button: "Back to Top",

        // --- Penambahan dari card.i18n.ts ---
        view_detail_button: "View Detail",
        min_read: "min read",

        // --- Penambahan untuk Featured Event ---
        featured_event_badge: "FEATURED EVENT",
        view_details_register_button: "View Details & Register",
    }
};