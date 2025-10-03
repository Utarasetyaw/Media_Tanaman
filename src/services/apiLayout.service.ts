// src/services/apiLayout.service.ts

import api from "./apiService";
import type { LayoutData } from "../types/layout.types";

/**
 * Mengambil data layout global (pengaturan situs, kategori, dll.) dari API.
 * @returns {Promise<LayoutData>}
 */
export const fetchLayoutData = async (): Promise<LayoutData> => {
	const { data } = await api.get("/layout");
	return data;
};
