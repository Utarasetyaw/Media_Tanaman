export interface LocalizedString {
  id: string;
  en: string;
}

export type ArticleStatus = 
  | 'PUBLISHED'
  | 'IN_REVIEW'
  | 'NEEDS_REVISION'
  | 'JOURNALIST_REVISING'
  | 'REVISED'
  | 'REJECTED'
  | 'DRAFT';

export type AdminEditRequestStatus = 
  | 'NONE'
  | 'PENDING'
  | 'APPROVED'
  | 'DENIED';

export interface Article {
  id: number;
  title: LocalizedString;
  status: ArticleStatus;
  adminEditRequest?: AdminEditRequestStatus;
  feedback?: string | null;
  updatedAt: string; // Diperlukan untuk sorting
}