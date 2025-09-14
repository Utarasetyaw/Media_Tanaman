type Translation = {
    loading: string;
    error_title: string;
    back_link: string;
    care_level: string;
    size: string;
    family: string;
    description: string;
    where_to_buy: string;
    visit_store: string;
};

export const plantDetailTranslations: { [key in 'id' | 'en']: Translation } = {
    id: {
        loading: "Memuat Detail Tanaman...",
        error_title: "Tanaman Tidak Ditemukan",
        back_link: "Kembali ke galeri tanaman",
        care_level: "Tingkat Perawatan",
        size: "Ukuran Dewasa",
        family: "Tipe",
        description: "Deskripsi",
        where_to_buy: "Tempat Membeli",
        visit_store: "Kunjungi Toko",
    },
    en: {
        loading: "Loading Plant Details...",
        error_title: "Plant Not Found",
        back_link: "Back to plant gallery",
        care_level: "Care Level",
        size: "Mature Size",
        family: "Type",
        description: "Description",
        where_to_buy: "Where to Buy",
        visit_store: "Visit Store",
    }
};