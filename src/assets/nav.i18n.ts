type NavTranslation = {
    home: string;
    plant: string;
    article: string;
    event: string;
    about: string;
    announcement: string;
    read_detail: string;
    open_menu: string;
    indonesian: string;
    english: string;
    // --- KEY BARU UNTUK PENCARIAN ---
    search_placeholder: string;
    searching: string;
    no_results: string;
    articles_section: string;
    plants_section: string;
    events_section: string;
};

export const navTranslations: { [key in 'id' | 'en']: NavTranslation } = {
    id: {
        home: "Beranda",
        plant: "Tanaman",
        article: "Artikel",
        event: "Event",
        about: "Tentang Kami",
        announcement: "Pengumuman: Kami akan mengadakan event spesial bulan depan!",
        read_detail: "Lihat Detail ›",
        open_menu: "Buka menu utama",
        indonesian: "Bahasa Indonesia",
        english: "English (Inggris)",
        // --- Teks Bahasa Indonesia ---
        search_placeholder: "Cari tanaman, artikel...",
        searching: "Mencari...",
        no_results: "Tidak ada hasil ditemukan.",
        articles_section: "Artikel",
        plants_section: "Tanaman",
        events_section: "Event",
    },
    en: {
        home: "Home",
        plant: "Plants",
        article: "Articles",
        event: "Events",
        about: "About Us",
        announcement: "Announcement: We will be holding a special event next month!",
        read_detail: "Read Detail ›",
        open_menu: "Open main menu",
        indonesian: "Bahasa Indonesia",
        english: "English",
        // --- Teks Bahasa Inggris ---
        search_placeholder: "Search for plants, articles...",
        searching: "Searching...",
        no_results: "No results found.",
        articles_section: "Articles",
        plants_section: "Plants",
        events_section: "Events",
    }
};