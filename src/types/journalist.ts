type ArticleStatus = 'DRAFT' | 'IN_REVIEW' | 'NEEDS_REVISION' | 'PUBLISHED' | 'REJECTED';

export interface Article {
    id: number;
    title: { id: string, en: string }; // Sesuaikan jika title bukan objek
    status: ArticleStatus;
}

export interface ArticleStats {
    published: number;
    needsRevision: number;
    rejected: number;
    inReview: number;
    draft: number;
}

export interface Journalist {
    id: number;
    name: string;
    email: string;
    role: 'JOURNALIST' | 'ADMIN';
    articleStats?: ArticleStats; // Dibuat opsional karena mungkin tidak selalu ada
    articles?: Article[];
}