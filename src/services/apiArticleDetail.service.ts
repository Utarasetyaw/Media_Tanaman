// src/services/apiArticleDetail.service.ts

import api from "./apiService";
import type { Article } from "../types/page_artikel.types";

// Kita juga mengimpor 'getArticles' untuk mengambil artikel terkait
import { getArticles } from "./apiPageArtikel.service";

/**
 * Mengambil detail satu artikel berdasarkan ID.
 * @param id - ID dari artikel yang ingin diambil.
 * @returns {Promise<Article>}
 */
export const getArticleById = async (id: string): Promise<Article> => {
	const { data } = await api.get(`/articles/${id}`);
	return data;
};

/**
 * Mengambil artikel terkait berdasarkan ID kategori.
 * @param categoryId - ID kategori untuk mencari artikel terkait.
 * @param currentArticleId - ID artikel saat ini untuk dikecualikan dari hasil.
 * @returns {Promise<Article[]>}
 */
export const getRelatedArticles = async (
	categoryId: number,
	currentArticleId: number
): Promise<Article[]> => {
	// Memanggil fungsi getArticles yang sudah ada untuk konsistensi
	const response = await getArticles({
		page: 1,
		limit: 4, // Ambil 4 artikel
		sortBy: "newest", // Urutkan berdasarkan terbaru
		categoryId: categoryId,
	});

	// Filter untuk membuang artikel yang sedang dibuka
	const related = response.data.filter(
		(article) => article.id !== currentArticleId
	);

	// Kembalikan maksimal 3 artikel terkait
	return related.slice(0, 3);
};
