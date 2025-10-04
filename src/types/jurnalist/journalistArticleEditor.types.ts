export interface LocalizedString {
  id: string;
  en: string;
}

export interface JournalistArticleFormData {
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  imageUrl: string;
  categoryId: number;
  plantTypeId: number;
}