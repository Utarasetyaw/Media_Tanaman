// Tipe untuk memastikan semua bahasa memiliki key yang sama
type FooterTranslation = {
    description: string;
    explore: string;
    support: string;
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
};

// Objek yang berisi semua teks dalam dua bahasa
export const footerTranslations: { [key in 'id' | 'en']: FooterTranslation } = {
    id: {
        description: "Menghadirkan keindahan dan kesegaran alam ke dalam hidup Anda melalui koleksi tanaman pilihan dan wawasan ahli.",
        explore: "Jelajahi",
        support: "Dukungan",
        copyright: "Hak Cipta Dilindungi.",
        home: "Beranda",
        news: "Berita",
        plants: "Tanaman",
        events: "Event",
        about: "Tentang Kami",
        login_journalist: "Login Jurnalis",
        login_participant: "Login Peserta",
        register_journalist: "Daftar Jurnalis",
        register_participant: "Daftar Peserta"
    },
    en: {
        description: "Bringing the beauty and freshness of nature into your life through a curated collection of plants and expert insights.",
        explore: "Explore",
        support: "Support",
        copyright: "All Rights Reserved.",
        home: "Home",
        news: "News",
        plants: "Plants",
        events: "Events",
        about: "About Us",
        login_journalist: "Journalist Login",
        login_participant: "Participant Login",
        register_journalist: "Journalist Register",
        register_participant: "Participant Register"
    }
};