// src/hooks/useArticleDetail.ts

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
	getArticleById,
	getRelatedArticles,
} from "../services/apiArticleDetail.service";

// ▼▼▼ UBAH PATH IMPOR INI ▼▼▼
import type { Article } from "../types/page_artikel_detail.types";

// Hook utama untuk halaman detail artikel
export const useArticleDetail = () => {
	const { id } = useParams<{ id: string }>();

	// Query pertama untuk mengambil data artikel utama
	const {
		data: article,
		isLoading,
		isError,
	} = useQuery<Article, Error>({
		queryKey: ["article", id],
		queryFn: () => getArticleById(id!),
		enabled: !!id,
	});

	// Query kedua untuk mengambil artikel terkait
	const { data: relatedArticles, isLoading: isLoadingRelated } = useQuery<
		Article[],
		Error
	>({
		queryKey: ["relatedArticles", article?.category.id],
		queryFn: () => getRelatedArticles(article!.category.id, article!.id),
		enabled: !!article,
	});

	return {
		article,
		relatedArticles,
		isLoading: isLoading || isLoadingRelated,
		isError,
	};
};
