import { useState, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { EventsApiResponse } from "../types/event";
import api from "../services/apiService";

/**
 * Fungsi untuk mengambil data event dari API, dengan parameter halaman dan limit.
 */
const fetchEvents = async (
	page: number,
	limit: number
): Promise<EventsApiResponse> => {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	const { data } = await api.get(`/events?${params.toString()}`);
	return data;
};

/**
 * Hook utama untuk halaman daftar event, dengan dukungan paginasi.
 */
export const useEventsPage = () => {
	// State untuk mengelola halaman saat ini
	const [page, setPage] = useState(1);

	// Menggunakan limit 31 sesuai permintaan Anda
	const limit = 31;

	const { data, isLoading, isError, isFetching } = useQuery<
		EventsApiResponse,
		Error
	>({
		// queryKey menyertakan `page` agar data di-fetch ulang saat halaman berubah
		queryKey: ["events", page, limit],
		queryFn: () => fetchEvents(page, limit),
		// Fitur untuk UX yang lebih baik: data lama tidak hilang saat data baru sedang diambil
		placeholderData: keepPreviousData,
	});

	// Logika untuk memisahkan event menjadi: featured, upcoming, dan past
	const processedEvents = useMemo(() => {
		const allEvents = data?.data || [];
		if (allEvents.length === 0) {
			return { featuredEvent: null, otherUpcomingEvents: [], pastEvents: [] };
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0); // Set waktu ke awal hari untuk perbandingan yang akurat

		const upcoming = allEvents
			.filter((event) => new Date(event.endDate) >= today)
			.sort(
				(a, b) =>
					new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
			);

		const past = allEvents
			.filter((event) => new Date(event.endDate) < today)
			.sort(
				(a, b) =>
					new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
			);

		const featured = upcoming.length > 0 ? upcoming[0] : null;
		const others = upcoming.slice(1);

		return {
			featuredEvent: featured,
			otherUpcomingEvents: others,
			pastEvents: past,
		};
	}, [data]);

	return {
		isLoading,
		isError,
		isFetching, // Berguna untuk menonaktifkan tombol paginasi saat fetching
		page,
		setPage,
		pagination: data?.pagination, // Mengembalikan data paginasi ke komponen
		...processedEvents,
	};
};
