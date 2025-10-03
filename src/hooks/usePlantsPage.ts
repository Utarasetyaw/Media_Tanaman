// src/hooks/usePlantsPage.ts

import { useState, useMemo, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "../services/apiService";
import type { PlantsApiResponse, PlantFilters } from "../types/plant";

/**
 * Helper hook untuk mendapatkan lebar window, agar penentuan limit item menjadi responsif.
 */
const useWindowWidth = () => {
	const [width, setWidth] = useState(window.innerWidth);
	useEffect(() => {
		const handleResize = () => setWidth(window.innerWidth);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);
	return width;
};

/**
 * Fungsi untuk mengambil data tanaman dari API.
 */
const fetchPlants = async (
	page: number,
	filters: PlantFilters,
	limit: number
): Promise<PlantsApiResponse> => {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});

	if (filters.plantTypeId && filters.plantTypeId !== "all") {
		params.append("plantTypeId", String(filters.plantTypeId));
	}

	const { data } = await api.get(`/plants?${params.toString()}`);
	return data;
};

/**
 * Hook utama untuk halaman daftar tanaman.
 */
export const usePlantsPage = () => {
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState<PlantFilters>({ plantTypeId: "all" });
	const width = useWindowWidth();

	// Tentukan jumlah item per halaman secara dinamis berdasarkan lebar layar.
	const limit = useMemo(() => {
		if (width < 640) return 6; // Mobile (sm)
		if (width < 1024) return 8; // Tablet (lg)
		return 12; // Desktop
	}, [width]);

	const { data, isLoading, isError, isFetching } = useQuery<
		PlantsApiResponse,
		Error
	>({
		queryKey: ["plants", page, filters, limit],
		queryFn: () => fetchPlants(page, filters, limit),
		placeholderData: keepPreviousData, // Memberikan UX yang lebih baik saat paginasi
	});

	const handleFilterChange = (
		filterType: keyof PlantFilters,
		value: string | number
	) => {
		setFilters((prev) => ({ ...prev, [filterType]: value }));
		setPage(1); // Reset ke halaman pertama setiap kali filter berubah
	};

	return {
		page,
		setPage,
		filters,
		handleFilterChange,
		plants: data?.data || [],
		pagination: data?.pagination,
		isLoading,
		isError,
		isFetching,
	};
};
