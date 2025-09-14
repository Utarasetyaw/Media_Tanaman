type EventTranslation = {
    title: string;
    description: string;
    all_plants: string;
    all_categories: string;
    no_events_title: string;
    no_events_desc: string;
    featured_badge: string;
    register_button: string;
    other_events: string;
    past_events: string;
    finished_badge: string;
    loading: string;
    error: string;
};

export const eventsTranslations: { [key in 'id' | 'en']: EventTranslation } = {
    id: {
        title: "Event & Lomba",
        description: "Ikuti berbagai event seru dan lomba menarik yang kami adakan. Tunjukkan karyamu dan menangkan hadiahnya!",
        all_plants: "Semua Tipe Tanaman",
        all_categories: "Semua Kategori",
        no_events_title: "Tidak Ada Event",
        no_events_desc: "Saat ini tidak ada event yang cocok dengan filter yang Anda pilih.",
        featured_badge: "EVENT UNGGULAN",
        register_button: "Lihat Detail & Daftar",
        other_events: "Event Akan Datang Lainnya",
        past_events: "Event yang Telah Selesai",
        finished_badge: "SELESAI",
        loading: "Memuat data event...",
        error: "Gagal memuat data event."
    },
    en: {
        title: "Events & Competitions",
        description: "Join our exciting events and interesting competitions. Show off your work and win prizes!",
        all_plants: "All Plant Types",
        all_categories: "All Categories",
        no_events_title: "No Events Found",
        no_events_desc: "There are no events that match your selected filters.",
        featured_badge: "FEATURED EVENT",
        register_button: "View Details & Register",
        other_events: "Other Upcoming Events",
        past_events: "Past Events",
        finished_badge: "FINISHED",
        loading: "Loading events...",
        error: "Failed to load events."
    }
};