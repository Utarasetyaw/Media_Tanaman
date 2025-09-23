// Tipe definisi diperbarui dengan key baru
type Translation = {
    title: string;
    description: string;
    all_plants: string;
    all_categories: string;
    no_articles_title: string;
    no_articles_desc: string;
    loading_articles: string;
    error_articles: string;
    loading_filters: string;
    page_info: string;
    previous_button: string;
    next_button: string;
    fetching: string;

    // --- Penambahan untuk Fitur Pencarian ---
    search_placeholder: string;

    // --- Penambahan untuk Fitur Pengurutan ---
    sort_by: string;
    sort_newest: string;
    sort_oldest: string;
    sort_popular: string;
    
    // --- Penambahan untuk Filter ---
    reset_filters_button: string;

    // --- Penambahan untuk Hasil Pencarian Kosong ---
    no_search_results_title: string;
    no_search_results_desc: string;
};

export const articlesTranslations: { [key in 'id' | 'en']: Translation } = {
    id: {
        title: "Artikel & Berita",
        description: "Temukan wawasan terbaru, tips perawatan, dan berita menarik dari dunia tanaman.",
        all_plants: "Semua Tipe Tanaman",
        all_categories: "Semua Kategori",
        no_articles_title: "Artikel Tidak Ditemukan",
        no_articles_desc: "Tidak ada artikel yang cocok dengan filter yang Anda pilih saat ini.",
        loading_articles: "Memuat artikel...",
        error_articles: "Gagal memuat artikel.",
        loading_filters: "Memuat filter...",
        page_info: "Halaman {currentPage} dari {totalPages}",
        previous_button: "Sebelumnya",
        next_button: "Berikutnya",
        fetching: "Memuat...",

        // --- Penambahan untuk Fitur Pencarian ---
        search_placeholder: "Cari artikel berdasarkan judul...",

        // --- Penambahan untuk Fitur Pengurutan ---
        sort_by: "Urutkan berdasarkan:",
        sort_newest: "Terbaru",
        sort_oldest: "Terlama",
        sort_popular: "Terpopuler",

        // --- Penambahan untuk Filter ---
        reset_filters_button: "Reset Filter",
        
        // --- Penambahan untuk Hasil Pencarian Kosong ---
        no_search_results_title: "Pencarian Tidak Ditemukan",
        no_search_results_desc: "Tidak ada artikel yang cocok dengan kata kunci yang Anda cari."
    },
    en: {
        title: "Articles & News",
        description: "Discover the latest insights, care tips, and interesting news from the world of plants.",
        all_plants: "All Plant Types",
        all_categories: "All Categories",
        no_articles_title: "No Articles Found",
        no_articles_desc: "There are no articles that match your selected filters.",
        loading_articles: "Loading articles...",
        error_articles: "Failed to load articles.",
        loading_filters: "Loading filters...",
        page_info: "Page {currentPage} of {totalPages}",
        previous_button: "Previous",
        next_button: "Next",
        fetching: "Fetching...",

        // --- Penambahan untuk Fitur Pencarian ---
        search_placeholder: "Search articles by title...",

        // --- Penambahan untuk Fitur Pengurutan ---
        sort_by: "Sort by:",
        sort_newest: "Newest",
        sort_oldest: "Oldest",
        sort_popular: "Most Popular",

        // --- Penambahan untuk Filter ---
        reset_filters_button: "Reset Filters",

        // --- Penambahan untuk Hasil Pencarian Kosong ---
        no_search_results_title: "No Search Results",
        no_search_results_desc: "There are no articles that match your search query."
    }
};