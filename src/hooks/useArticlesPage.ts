// src/hooks/useArticlesPage.ts

import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

// ▼▼▼ MENGIMPOR SERVICE DAN TIPE DARI FILE BARU ▼▼▼
import { getArticles } from "../services/apiPageArtikel.service";
import type { ArticlesApiResponse } from "../services/apiPageArtikel.service";

// --- Tipe Data Spesifik untuk State di Hook Ini ---
type Filters = {
	categoryId: string | number;
	plantTypeId: string | number;
};
type SortOption = "newest" | "oldest" | "popular";

// --- Fungsi Fetching Lokal SUDAH DIHAPUS dan dipindahkan ke service ---

// --- Hook Helper untuk Mendeteksi Lebar Layar ---
const useWindowWidth = () => {
	const [width, setWidth] = useState(window.innerWidth);
	useEffect(() => {
		const handleResize = () => setWidth(window.innerWidth);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);
	return width;
};

// ========================================================================
// HOOK UTAMA (SEKARANG LEBIH RAMPING)
// ========================================================================
export const useArticlesPage = () => {
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState<Filters>({
		categoryId: "all",
		plantTypeId: "all",
	});
	const [sortBy, setSortBy] = useState<SortOption>("newest");
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

	const width = useWindowWidth();
	const limit = useMemo(() => {
		if (width < 768) return 6;
		if (width < 1024) return 8;
		return 12;
	}, [width]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 500);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	useEffect(() => {
		setPage(1);
	}, [filters, sortBy, debouncedSearchTerm, limit]);

	const { data, isLoading, isError, isFetching } =
		useQuery<ArticlesApiResponse>({
			queryKey: ["articles", page, filters, sortBy, debouncedSearchTerm, limit],
			// ▼▼▼ queryFn SEKARANG MEMANGGIL FUNGSI DARI SERVICE ▼▼▼
			queryFn: () =>
				getArticles({
					page,
					limit,
					sortBy,
					query: debouncedSearchTerm || undefined,
					categoryId:
						filters.categoryId === "all" ? undefined : filters.categoryId,
					plantTypeId:
						filters.plantTypeId === "all" ? undefined : filters.plantTypeId,
				}),
			placeholderData: keepPreviousData,
		});

	const handleFilterChange = useCallback(
		(filterName: keyof Filters, value: string | number) => {
			setFilters((prev) => ({ ...prev, [filterName]: value }));
		},
		[]
	);

	const handleSearchChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setSearchTerm(event.target.value);
		},
		[]
	);

	const handleSortChange = useCallback((value: SortOption) => {
		setSortBy(value);
	}, []);

	const handleReset = useCallback(() => {
		setFilters({ categoryId: "all", plantTypeId: "all" });
		setSortBy("newest");
		setSearchTerm("");
	}, []);

	return {
		articles: data?.data || [],
		pagination: data?.pagination,
		isLoading,
		isError,
		isFetching,
		page,
		filters,
		sortBy,
		searchTerm,
		setPage,
		handleFilterChange,
		handleSortChange,
		handleSearchChange,
		handleReset,
	};
};
