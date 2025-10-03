// src/assets/plantDetail.i18n.ts

// PERBAIKAN: Tipe disesuaikan dengan komponen
type Translation = {
	loading: string;
	error_title: string;
	back_link: string;
	family: string; // Tetap digunakan untuk 'Tipe Tanaman'
	description: string;
	where_to_buy: string;
	visit_store: string;
	online_stores: string; // <-- BARU
	offline_stores: string; // <-- BARU
};

export const plantDetailTranslations: { [key in "id" | "en"]: Translation } = {
	id: {
		loading: "Memuat Detail Tanaman...",
		error_title: "Tanaman Tidak Ditemukan",
		back_link: "Kembali ke galeri tanaman",
		family: "Tipe Tanaman", // Nama heading untuk info box
		description: "Deskripsi",
		where_to_buy: "Tempat Membeli",
		visit_store: "Kunjungi Toko",
		online_stores: "Toko Online", // <-- BARU
		offline_stores: "Toko Offline", // <-- BARU
	},
	en: {
		loading: "Loading Plant Details...",
		error_title: "Plant Not Found",
		back_link: "Back to plant gallery",
		family: "Plant Type", // Heading name for the info box
		description: "Description",
		where_to_buy: "Where to Buy",
		visit_store: "Visit Store",
		online_stores: "Online Stores", // <-- BARU
		offline_stores: "Offline Stores", // <-- BARU
	},
};
