import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/apiService"; // Sesuaikan path jika perlu
import type { Article } from "../../types/public/articleDetail.types"; // <-- Impor dari file tipe baru

// --- FUNGSI-FUNGSI API ---

const getArticleById = async (id: string): Promise<Article> => {
    const { data } = await api.get(`/articles/${id}`);
    return data;
};

const getAllArticles = async (params: { categoryId: number }): Promise<Article[]> => {
    const { data } = await api.get('/articles', { params });
    // Asumsi API mengembalikan array artikel di dalam properti 'data' pada endpoint list
    return data.data; 
};

export const getRelatedArticles = async (
    categoryId: number,
    currentArticleId: number
): Promise<Article[]> => {
    const allArticlesInCategory = await getAllArticles({ categoryId });

    const related = allArticlesInCategory.filter(
        (article) => article.id !== currentArticleId
    );

    return related.slice(0, 3);
};


// --- HOOK UTAMA ---
export const useArticleDetail = () => {
    const { id } = useParams<{ id: string }>();

    const {
        data: article,
        isLoading,
        isError,
    } = useQuery<Article, Error>({
        queryKey: ["article", id],
        queryFn: () => getArticleById(id!),
        enabled: !!id,
    });

    const { data: relatedArticles, isLoading: isLoadingRelated } = useQuery<
        Article[],
        Error
    >({
        queryKey: ["relatedArticles", article?.category.id],
        queryFn: () => getRelatedArticles(article!.category.id, article!.id),
        enabled: !!article,
    });

    return {
        article,
        relatedArticles: relatedArticles || [],
        isLoading: isLoading || isLoadingRelated,
        isError,
    };
};