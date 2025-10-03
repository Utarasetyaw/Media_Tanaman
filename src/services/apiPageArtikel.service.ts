// src/services/apiPageArtikel.service.ts

import api from "./apiService";
import type { Article, Pagination } from "../types/page_artikel.types";

// Tipe untuk mendeskripsikan struktur respons dari endpoint /articles
export interface ArticlesApiResponse {
	data: Article[];
	pagination: Pagination;
}

// Tipe untuk parameter fungsi getArticles agar lebih jelas dan aman
export interface GetArticlesParams {
	page: number;
	limit: number;
	sortBy: string;
	query?: string;
	categoryId?: string | number;
	plantTypeId?: string | number;
}

/**
 * Mengambil daftar artikel dari API dengan filter, sort, dan paginasi.
 */
export const getArticles = async (
	params: GetArticlesParams
): Promise<ArticlesApiResponse> => {
	const queryParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== "") {
			queryParams.append(key, String(value));
		}
	});
	const { data } = await api.get(`/articles?${queryParams.toString()}`);
	return data;
};
