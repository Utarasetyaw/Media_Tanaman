// src/types/layout.types.ts

// Tipe Data Umum yang bisa digunakan di banyak tempat
export interface LocalizedString {
	id: string;
	en: string;
}

export interface Category {
	id: number;
	name: LocalizedString;
}

export interface PlantType {
	id: number;
	name: LocalizedString;
}

// Interface untuk data SEO umum dari backend
export interface SiteSeo {
	id: number;
	metaTitle?: LocalizedString | null;
	metaDescription?: LocalizedString | null;
	metaKeywords?: string | null;
	ogDefaultTitle?: LocalizedString | null;
	ogDefaultDescription?: LocalizedString | null;
	ogDefaultImageUrl?: string | null;
	twitterSite?: string | null;
	googleSiteVerificationId?: string | null;
}

// Interface untuk data settings utama
export interface SiteSettings {
	name: string;
	logoUrl: string;
	faviconUrl: string;
	businessDescription: LocalizedString;
	contactInfo: {
		email?: string;
		phone?: string;
		address?: string;
		socialMedia?: {
			instagram?: string;
			facebook?: string;
			tiktok?: string;
		};
	};
	googleAdsId?: string | null;
	seo: SiteSeo | null;
}

// Tipe data utama dari API /api/layout
export interface LayoutData {
	settings: SiteSettings;
	categories: Category[];
	plantTypes: PlantType[];
}
