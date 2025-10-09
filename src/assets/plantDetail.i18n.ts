// src/assets/plantDetail.i18n.ts

type Translation = {
    loading: string;
    error_title: string;
    back_link: string;
    family: string;
    description: string;
    where_to_buy: string;
    visit_store: string;
    online_stores: string;
    offline_stores: string;
    no_stores_available: string; // <-- Ditambahkan
};

export const plantDetailTranslations: { [key in "id" | "en"]: Translation } = {
    id: {
        loading: "Memuat Detail Tanaman...",
        error_title: "Tanaman Tidak Ditemukan",
        back_link: "Kembali ke galeri tanaman",
        family: "Tipe Tanaman",
        description: "Deskripsi",
        where_to_buy: "Tempat Membeli",
        visit_store: "Kunjungi Toko",
        online_stores: "Toko Online",
        offline_stores: "Toko Offline",
        no_stores_available: "Toko belum tersedia untuk tanaman ini.", // <-- Ditambahkan
    },
    en: {
        loading: "Loading Plant Details...",
        error_title: "Plant Not Found",
        back_link: "Back to plant gallery",
        family: "Plant Type",
        description: "Description",
        where_to_buy: "Where to Buy",
        visit_store: "Visit Store",
        online_stores: "Online Stores",
        offline_stores: "Offline Stores",
        no_stores_available: "No stores are available for this plant yet.", // <-- Ditambahkan
    },
};