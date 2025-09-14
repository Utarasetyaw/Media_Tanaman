type AboutTranslation = {
    page_title: string;
    our_values: string;
    faq_title: string;
    contact_title: string;
    contact_subtitle: string;
    privacy_policy_title: string;
    email: string;
    phone: string;
    loading: string;
    error: string;
};

export const aboutTranslations: { [key in 'id' | 'en']: AboutTranslation } = {
    id: {
        page_title: "Tentang Kami",
        our_values: "Nilai-nilai Kami",
        faq_title: "Pertanyaan yang Sering Diajukan",
        contact_title: "Hubungi Kami",
        contact_subtitle: "Punya pertanyaan atau ingin bekerja sama? Jangan ragu untuk menghubungi kami.",
        privacy_policy_title: "Kebijakan Privasi",
        email: "Email",
        phone: "Telepon",
        loading: "Memuat halaman...",
        error: "Gagal memuat data halaman."
    },
    en: {
        page_title: "About Us",
        our_values: "Our Values",
        faq_title: "Frequently Asked Questions",
        contact_title: "Contact Us",
        contact_subtitle: "Have a question or want to work together? Feel free to contact us.",
        privacy_policy_title: "Privacy Policy",
        email: "Email",
        phone: "Phone",
        loading: "Loading page...",
        error: "Failed to load page data."
    }
};