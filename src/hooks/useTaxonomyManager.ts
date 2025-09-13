import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// --- Tipe Data ---
export interface TaxonomyItem {
  id: number;
  name: { id: string; en: string };
}

// Tipe untuk data yang dikirim saat membuat atau update
type TaxonomyPayload = Omit<TaxonomyItem, 'id'>;

// Tipe untuk objek API yang akan digunakan oleh hook
interface ApiFunctions {
  getAll: () => Promise<TaxonomyItem[]>;
  create: (data: TaxonomyPayload) => Promise<TaxonomyItem>;
  update: (id: number, data: Partial<TaxonomyPayload>) => Promise<TaxonomyItem>;
  delete: (id: number) => Promise<void>;
}

// --- Custom Hook yang Direfaktor ---
export const useTaxonomyManager = (queryKey: string, api: ApiFunctions) => {
  const queryClient = useQueryClient();

  // 1. Mengambil data langsung dari useQuery.
  //    Menyediakan default array kosong '[]' agar komponen tidak error saat data belum ada.
  const { data: items = [], isLoading, isError } = useQuery<TaxonomyItem[], Error>({
    queryKey: [queryKey], // Gunakan array untuk query key (praktik terbaik)
    queryFn: api.getAll,
  });

  // 2. Opsi umum untuk semua mutation agar tidak ada duplikasi kode
  const mutationOptions = {
    onSuccess: () => {
      // Setelah aksi berhasil, invalidasi query agar data di-refetch secara otomatis.
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || 'Terjadi kesalahan.';
      alert(message);
      console.error(`Mutation error for ${queryKey}:`, error);
    },
  };

  // 3. Definisi Mutations yang lebih sederhana
  const createItemMutation = useMutation({
    mutationFn: api.create,
    ...mutationOptions,
  });

  const updateItemMutation = useMutation({
    mutationFn: (variables: { id: number; data: Partial<TaxonomyPayload> }) =>
      api.update(variables.id, variables.data),
    ...mutationOptions,
  });

  const deleteItemMutation = useMutation({
    mutationFn: api.delete,
    ...mutationOptions,
  });
  
  // Flag loading gabungan untuk semua aksi mutasi (Create, Update, Delete)
  const isMutating = createItemMutation.isPending || updateItemMutation.isPending || deleteItemMutation.isPending;

  // 4. Mengembalikan data dan fungsi-fungsi mutasi yang dibutuhkan oleh komponen
  return {
    items,          // Data daftar item, langsung dari cache React Query
    isLoading,      // Status loading untuk pengambilan data awal
    isError,        // Status error untuk pengambilan data awal
    isMutating,     // Status loading untuk semua proses simpan/hapus
    
    // Kembalikan fungsi 'mutateAsync' dan 'mutate' agar komponen bisa memanggilnya
    createItem: createItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutate,
  };
};