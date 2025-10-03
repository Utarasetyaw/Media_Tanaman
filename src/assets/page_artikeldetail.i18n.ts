// src/assets/page_artikeldetail.i18n.ts

type Translation = {
	// Teks dari halaman detail
	loading: string;
	error_title: string;
	back_link: string;
	by: string;
	published_on: string;
	related_articles: string;

	// Teks dari kartu
	view_detail: string;
};

export const articleDetailPageTranslations: {
	[key in "id" | "en"]: Translation;
} = {
	id: {
		loading: "Memuat Artikel...",
		error_title: "Artikel Tidak Ditemukan",
		back_link: "Kembali ke Semua Artikel",
		by: "Oleh",
		published_on: "Diterbitkan pada",
		related_articles: "Artikel Terkait Lainnya",
		view_detail: "Lihat Detail",
	},
	en: {
		loading: "Loading Article...",
		error_title: "Article Not Found",
		back_link: "Back to All Articles",
		by: "By",
		published_on: "Published on",
		related_articles: "Other Related Articles",
		view_detail: "View Detail",
	},
};
