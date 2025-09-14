type Translation = {
    loading: string;
    error_title: string;
    back_link: string;
    description_title: string;
    date_label: string;
    time_label: string;
    location_label: string;
    organizer_label: string;
    register_button: string;
};

export const eventDetailTranslations: { [key in 'id' | 'en']: Translation } = {
    id: {
        loading: "Memuat Detail Event...",
        error_title: "Event Tidak Ditemukan",
        back_link: "Kembali ke daftar event",
        description_title: "Deskripsi Event",
        date_label: "Tanggal",
        time_label: "Waktu",
        location_label: "Lokasi",
        organizer_label: "Penyelenggara",
        register_button: "Daftar Sekarang",
    },
    en: {
        loading: "Loading Event Details...",
        error_title: "Event Not Found",
        back_link: "Back to events list",
        description_title: "Event Description",
        date_label: "Date",
        time_label: "Time",
        location_label: "Location",
        organizer_label: "Organizer",
        register_button: "Register Now",
    }
};