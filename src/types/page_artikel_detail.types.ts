// src/types/page_artikel_detail.types.ts

export interface LocalizedString {
	id: string;
	en: string;
}

export interface Author {
	name: string;
	role: string;
}

export interface Category {
	id: number;
	name: LocalizedString;
}

export interface PlantType {
	id: number;
	name: LocalizedString;
}

export interface Article {
	id: number;
	title: LocalizedString;
	excerpt: LocalizedString;
	content: LocalizedString;
	imageUrl: string;
	viewCount: number;
	likeCount: number;
	createdAt: string;
	author: Author;
	category: Category;
	plantType: PlantType | null;
}
