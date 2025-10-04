import { useQuery } from "@tanstack/react-query";
import api from "../../services/apiService";
import type { AboutData } from "../../types/public/about.types"; // <-- Impor tipe dari file baru

// --- Fungsi Fetch & Hook ---

const fetchAboutData = async (): Promise<AboutData> => {
    const { data } = await api.get("/about");
    return data;
};

/**
 * Hook untuk mengambil dan mengelola data untuk halaman "About Us".
 */
export const useAboutData = () => {
    return useQuery<AboutData, Error>({
        queryKey: ["aboutData"],
        queryFn: fetchAboutData,
        // Data "About" jarang berubah, jadi staleTime: Infinity adalah pilihan yang baik.
        staleTime: Infinity,
    });
};