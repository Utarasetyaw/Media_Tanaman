type Translation = {
    loading: string;
    error: string;
    all_categories: string;
    all_plant_types: string;
    view_detail_button: string;
    view_news_button: string;
    latest_news: string;
    top_headlines: string;
    more_for_you: string;
    no_articles_found: string;
    community_event: string;
    plant_of_the_week: string;
    view_plant_detail_button: string;
    view_event_button: string;
    running_event_badge: string;
    more_news_button: string;
    back_to_top_button: string;
};

export const homeTranslations: { [key in 'id' | 'en']: Translation } = {
    id: {
        loading: "Memuat Halaman...",
        error: "Gagal memuat data halaman.",
        all_categories: "Semua Kategori Artikel",
        all_plant_types: "Semua Tipe Tanaman",
        view_detail_button: "Lihat Detail",
        view_news_button: "Lihat Berita",
        latest_news: "Berita Terbaru",
        top_headlines: "Berita Utama",
        more_for_you: "Lebih Banyak Untukmu 🌿",
        no_articles_found: "Tidak ada artikel yang cocok dengan filter Anda.",
        community_event: "Event Komunitas Terdekat",
        plant_of_the_week: "Tanaman Pilihan Minggu Ini",
        view_plant_detail_button: "Lihat Detail Tanaman",
        view_event_button: "Lihat Event",
        running_event_badge: "EVENT BERJALAN",
        more_news_button: "Lihat Berita Lebih Banyak",
        back_to_top_button: "Kembali ke Atas",
    },
    en: {
        loading: "Loading Page...",
        error: "Failed to load page data.",
        all_categories: "All Article Categories",
        all_plant_types: "All Plant Types",
        view_detail_button: "View Detail",
        view_news_button: "View News",
        latest_news: "Latest News",
        top_headlines: "Top Headlines",
        more_for_you: "More For You 🌿",
        no_articles_found: "No articles match your filters.",
        community_event: "Upcoming Community Event",
        plant_of_the_week: "Plant of the Week",
        view_plant_detail_button: "View Plant Details",
        view_event_button: "View Event",
        running_event_badge: "ONGOING EVENT",
        more_news_button: "View More News",
        back_to_top_button: "Back to Top",
    }
};