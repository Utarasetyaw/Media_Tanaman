// src/assets/page_artikel.i18n.ts

type Translation = {
	// Teks untuk Judul Halaman
	title: string;
	description: string;

	// Teks untuk Filter & Kontrol
	search_placeholder: string;
	all_plants: string;
	all_categories: string;
	sort_by: string;
	sort_newest: string;
	sort_oldest: string;
	sort_popular: string;
	reset_filters_button: string;

	// Teks untuk Status & Kondisi
	loading_articles: string;
	error_articles: string;
	fetching: string;
	no_articles_title: string;
	no_articles_desc: string;
	no_search_results_title: string;
	no_search_results_desc: string;

	// Teks untuk Paginasi
	page_info: string;
	previous_button: string;
	next_button: string;

	// Teks untuk Tombol di Kartu Artikel
	view_detail: string;
};

export const articlePageTranslations: { [key in "id" | "en"]: Translation } = {
	id: {
		title: "Artikel & Berita",
		description:
			"Temukan wawasan terbaru, tips perawatan, dan berita menarik dari dunia tanaman.",
		all_plants: "Semua Tipe Tanaman",
		all_categories: "Semua Kategori",
		no_articles_title: "Artikel Tidak Ditemukan",
		no_articles_desc:
			"Tidak ada artikel yang cocok dengan filter yang Anda pilih saat ini.",
		loading_articles: "Memuat artikel...",
		error_articles: "Gagal memuat artikel.",
		page_info: "Halaman {currentPage} dari {totalPages}",
		previous_button: "Sebelumnya",
		next_button: "Berikutnya",
		fetching: "Memuat...",
		search_placeholder: "Cari artikel berdasarkan judul...",
		sort_by: "Urutkan berdasarkan:",
		sort_newest: "Terbaru",
		sort_oldest: "Terlama",
		sort_popular: "Terpopuler",
		reset_filters_button: "Reset Filter",
		no_search_results_title: "Pencarian Tidak Ditemukan",
		no_search_results_desc:
			"Tidak ada artikel yang cocok dengan kata kunci yang Anda cari.",
		view_detail: "Lihat Detail",
	},
	en: {
		title: "Articles & News",
		description:
			"Discover the latest insights, care tips, and interesting news from the world of plants.",
		all_plants: "All Plant Types",
		all_categories: "All Categories",
		no_articles_title: "No Articles Found",
		no_articles_desc: "There are no articles that match your selected filters.",
		loading_articles: "Loading articles...",
		error_articles: "Failed to load articles.",
		page_info: "Page {currentPage} of {totalPages}",
		previous_button: "Previous",
		next_button: "Next",
		fetching: "Fetching...",
		search_placeholder: "Search articles by title...",
		sort_by: "Sort by:",
		sort_newest: "Newest",
		sort_oldest: "Oldest",
		sort_popular: "Most Popular",
		reset_filters_button: "Reset Filters",
		no_search_results_title: "No Search Results",
		no_search_results_desc:
			"There are no articles that match your search query.",
		view_detail: "View Detail",
	},
};
