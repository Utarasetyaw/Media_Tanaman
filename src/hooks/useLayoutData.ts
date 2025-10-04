import { useQuery } from "@tanstack/react-query";
import api from "../services/apiService"; // <-- Impor service utama
import type { LayoutData } from "../types/layout.types";

// ▼▼▼ FUNGSI DARI apiLayout.service.ts DIGABUNG DI SINI ▼▼▼
/**
 * Mengambil data layout global (pengaturan situs, kategori, dll.) dari API.
 * @returns {Promise<LayoutData>}
 */
const fetchLayoutData = async (): Promise<LayoutData> => {
    const { data } = await api.get("/layout");
    return data;
};
// ▲▲▲ AKHIR DARI KODE YANG DIGABUNG ▲▲▲

export const useLayoutData = () => {
    return useQuery<LayoutData, Error>({
        // Kunci query untuk caching data di React Query
        queryKey: ["layoutData"],

        // Fungsi yang dijalankan untuk mengambil data
        queryFn: fetchLayoutData,

        // Opsi untuk React Query:
        staleTime: 1000 * 60 * 5, // Data dianggap fresh selama 5 menit
        refetchOnWindowFocus: false, // Tidak perlu re-fetch saat user kembali ke tab
    });
};