// src/assets/events.i18n.ts

// PERBAIKAN: Tipe disesuaikan dengan kebutuhan komponen
type EventTranslation = {
	title: string;
	description: string;
	no_events_title: string;
	no_events_desc: string;
	featured_badge: string;
	register_button: string;
	other_events: string;
	past_events: string;
	finished_badge: string;
	loading: string;
	error: string;
	// Kunci baru untuk paginasi
	previous_button: string;
	next_button: string;
	page_info: string;
};

export const eventsTranslations: { [key in "id" | "en"]: EventTranslation } = {
	id: {
		title: "Event & Lomba",
		description:
			"Ikuti beragam event dan lomba seru, hasil kolaborasi dengan berbagai pihak. Tunjukkan karyamu dan raih hadiahnya!",
		no_events_title: "Tidak Ada Event Tersedia",
		no_events_desc: "Silakan periksa kembali nanti untuk jadwal terbaru.",
		featured_badge: "EVENT UNGGULAN",
		register_button: "Lihat Detail & Daftar",
		other_events: "Event Akan Datang Lainnya",
		past_events: "Event yang Telah Selesai",
		finished_badge: "SELESAI",
		loading: "Memuat data event...",
		error: "Gagal memuat data event.",
		// Terjemahan baru untuk paginasi
		previous_button: "Sebelumnya",
		next_button: "Berikutnya",
		page_info: "Hal {currentPage} dari {totalPages}",
	},
	en: {
		title: "Events & Competitions",
		description:
			"Participate in various art events and competitions, in collaboration with various parties. Showcase your work and win prizes!",
		no_events_title: "No Events Available",
		no_events_desc: "Please check back later for the latest schedule.",
		featured_badge: "FEATURED EVENT",
		register_button: "View Details & Register",
		other_events: "Other Upcoming Events",
		past_events: "Past Events",
		finished_badge: "FINISHED",
		loading: "Loading events...",
		error: "Failed to load events.",
		// New translations for pagination
		previous_button: "Previous",
		next_button: "Next",
		page_info: "Page {currentPage} of {totalPages}",
	},
};
