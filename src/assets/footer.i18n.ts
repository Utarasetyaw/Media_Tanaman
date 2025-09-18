// Tipe untuk memastikan semua bahasa memiliki key yang sama
type FooterTranslation = {
    description: string;
    explore: string;
    copyright: string;
    home: string;
    news: string;
    plants: string;
    events: string;
    about: string;
    login_journalist: string;
    login_participant: string;
    register_journalist: string;
    register_participant: string;
    // Kunci yang ditambahkan agar sesuai dengan footer baru
    support_journalist: string;
    support_participant: string;
    support_help: string;
};

// Objek yang berisi semua teks dalam dua bahasa
export const footerTranslations: { [key in 'id' | 'en']: FooterTranslation } = {
    id: {
        description: "Menghadirkan keindahan dan kesegaran alam ke dalam hidup Anda melalui koleksi tanaman pilihan dan wawasan ahli.",
        explore: "Jelajahi",
        copyright: "Hak Cipta Dilindungi.",
        home: "Beranda",
        news: "Berita",
        plants: "Tanaman",
        events: "Event",
        about: "Tentang Kami",
        login_journalist: "Login Jurnalis",
        login_participant: "Login Peserta",
        register_journalist: "Daftar Jurnalis",
        register_participant: "Daftar Peserta",
        // Terjemahan untuk kunci baru
        support_journalist: "Jurnalis",
        support_participant: "Peserta",
        support_help: "Bantuan"
    },
    en: {
        description: "Bringing the beauty and freshness of nature into your life through a curated collection of plants and expert insights.",
        explore: "Explore",
        copyright: "All Rights Reserved.",
        home: "Home",
        news: "News",
        plants: "Plants",
        events: "Events",
        about: "About Us",
        login_journalist: "Journalist Login",
        login_participant: "Participant Login",
        register_journalist: "Journalist Register",
        register_participant: "Participant Register",
        // Translations for new keys
        support_journalist: "Journalist",
        support_participant: "Participant",
        support_help: "Help"
    }
};