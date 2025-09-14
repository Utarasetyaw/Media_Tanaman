import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Article } from '../types/article'; // Pastikan path tipe data sudah benar
import api from '../services/apiService';   // Pastikan path API service sudah benar

// Fungsi untuk mengambil detail satu artikel dari API
const fetchArticleById = async (id: string): Promise<Article> => {
  const { data } = await api.get(`/articles/${id}`);
  return data;
};

// Fungsi untuk mengambil artikel terkait (berdasarkan kategori)
const fetchRelatedArticles = async (categoryId: number, currentArticleId: number): Promise<Article[]> => {
  // Ambil 4 artikel terkait, lalu filter artikel yang sedang dilihat
  const { data } = await api.get(`/articles?categoryId=${categoryId}&limit=4`);
  return data.data.filter((article: Article) => article.id !== currentArticleId);
};

// Hook utama untuk halaman detail artikel
export const useArticleDetail = () => {
  const { id } = useParams<{ id: string }>();

  // Query pertama untuk mengambil data artikel utama
  const { data: article, isLoading, isError } = useQuery<Article, Error>({
    queryKey: ['article', id],
    queryFn: () => fetchArticleById(id!),
    enabled: !!id,
  });

  // Query kedua untuk mengambil artikel terkait, hanya berjalan setelah query pertama berhasil
  const { data: relatedArticles, isLoading: isLoadingRelated } = useQuery<Article[], Error>({
    queryKey: ['relatedArticles', article?.category.id],
    queryFn: () => fetchRelatedArticles(article!.category.id, article!.id),
    enabled: !!article, // Hanya berjalan jika 'article' sudah ada
  });

  return {
    article,
    relatedArticles,
    isLoading: isLoading || isLoadingRelated, // Gabungkan state loading
    isError,
  };
};