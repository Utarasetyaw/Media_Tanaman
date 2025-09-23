type Translation = {
    title: string;
    description: string;
    all_plant_types: string; // <-- Diubah dari all_families
    no_plants_title: string;
    no_plants_desc: string;
    loading_plants: string;
    error_plants: string;
    page_info: string;
    previous_button: string;
    next_button: string;
    fetching: string;
};

export const plantsTranslations: { [key in 'id' | 'en']: Translation } = {
    id: {
        title: "Galeri Tanaman",
        description: "Jelajahi koleksi tanaman kami yang beragam, dari yang paling umum hingga yang paling langka.",
        all_plant_types: "Semua Tipe Tanaman", // <-- Diubah dari "Semua Famili"
        no_plants_title: "Tanaman Tidak Ditemukan",
        no_plants_desc: "Tidak ada tanaman yang cocok dengan filter yang Anda pilih saat ini.",
        loading_plants: "Memuat data tanaman...",
        error_plants: "Gagal memuat data tanaman.",
        page_info: "Halaman {currentPage} dari {totalPages}",
        previous_button: "Sebelumnya",
        next_button: "Berikutnya",
        fetching: "Memuat...",
    },
    en: {
        title: "Plant Gallery",
        description: "Explore our diverse collection of plants, from the most common to the rarest.",
        all_plant_types: "All Plant Types", // <-- Changed from "All Families"
        no_plants_title: "No Plants Found",
        no_plants_desc: "There are no plants that match your selected filters.",
        loading_plants: "Loading plants data...",
        error_plants: "Failed to load plants data.",
        page_info: "Page {currentPage} of {totalPages}",
        previous_button: "Previous",
        next_button: "Next",
        fetching: "Fetching...",
    }
};