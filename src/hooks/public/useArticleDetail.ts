import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/apiService";
import type { Article } from "../../types/public/articleDetail.types";
import { toast } from 'react-hot-toast';

// --- FUNGSI-FUNGSI API ---

const getArticleById = async (id: string): Promise<Article> => {
    const { data } = await api.get(`/articles/${id}`);
    return data;
};

// Fungsi baru untuk mengirim 'like'
const likeArticle = async (id: string): Promise<{ likeCount: number }> => {
    const { data } = await api.post(`/articles/${id}/like`);
    return data;
};

const getAllArticles = async (params: { categoryId: number }): Promise<Article[]> => {
    const { data } = await api.get('/articles', { params });
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
    const queryClient = useQueryClient();
    const queryKey = ["article", id];

    const {
        data: article,
        isLoading,
        isError,
    } = useQuery<Article, Error>({
        queryKey,
        queryFn: () => getArticleById(id!),
        enabled: !!id,
    });

    // ▼▼▼ TAMBAHKAN MUTASI UNTUK LIKE ▼▼▼
    const likeMutation = useMutation({
        mutationFn: () => likeArticle(id!),
        onSuccess: (data) => {
            // Perbarui data 'likeCount' di cache setelah berhasil
            queryClient.setQueryData<Article>(queryKey, (oldData) => {
                if (!oldData) return oldData;
                return { ...oldData, likeCount: data.likeCount };
            });
            toast.success('Terima kasih telah menyukai artikel ini!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Gagal menyukai artikel.');
        },
    });
    // ▲▲▲ AKHIR PENAMBAHAN ▲▲▲

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
        handleLike: likeMutation.mutate, // Ekspor fungsi 'like'
        isLiking: likeMutation.isPending, // Ekspor status loading
    };
};