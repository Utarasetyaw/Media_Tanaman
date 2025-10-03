// src/hooks/useLayoutData.ts

import { useQuery } from "@tanstack/react-query";
import { fetchLayoutData } from "../services/apiLayout.service"; // <-- Impor service
import type { LayoutData } from "../types/layout.types"; // <-- Impor tipe

export const useLayoutData = () => {
	return useQuery<LayoutData, Error>({
		// Kunci query untuk caching data di React Query
		queryKey: ["layoutData"],

		// Fungsi yang dijalankan untuk mengambil data, sekarang dari service
		queryFn: fetchLayoutData,

		// Opsi untuk React Query:
		staleTime: 1000 * 60 * 5, // Data dianggap fresh selama 5 menit
		refetchOnWindowFocus: false, // Tidak perlu re-fetch saat user kembali ke tab
	});
};
