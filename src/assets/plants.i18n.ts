type Translation = {
    title: string;
    description: string;
    all_families: string;
    all_categories: string;
    no_plants_title: string;
    no_plants_desc: string;
    loading_plants: string;
    error_plants: string;
    loading_filters: string;
    page_info: string;
    previous_button: string;
    next_button: string;
    fetching: string;
};

export const plantsTranslations: { [key in 'id' | 'en']: Translation } = {
    id: {
        title: "Galeri Tanaman",
        description: "Jelajahi koleksi tanaman kami yang beragam, dari yang paling umum hingga yang paling langka.",
        all_families: "Semua Tipe Tanaman",
        all_categories: "Semua Kategori",
        no_plants_title: "Tanaman Tidak Ditemukan",
        no_plants_desc: "Tidak ada tanaman yang cocok dengan filter yang Anda pilih saat ini.",
        loading_plants: "Memuat data tanaman...",
        error_plants: "Gagal memuat data tanaman.",
        loading_filters: "Memuat filter...",
        page_info: "Halaman {currentPage} dari {totalPages}",
        previous_button: "Sebelumnya",
        next_button: "Berikutnya",
        fetching: "Memuat...",
    },
    en: {
        title: "Plant Gallery",
        description: "Explore our diverse collection of plants, from the most common to the rarest.",
        all_families: "All Plant Types",
        all_categories: "All Categories",
        no_plants_title: "No Plants Found",
        no_plants_desc: "There are no plants that match your selected filters.",
        loading_plants: "Loading plants data...",
        error_plants: "Failed to load plants data.",
        loading_filters: "Loading filters...",
        page_info: "Page {currentPage} of {totalPages}",
        previous_button: "Previous",
        next_button: "Next",
        fetching: "Fetching...",
    }
};