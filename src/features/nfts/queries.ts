import { keepPreviousData, queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Nft, PaginatedNfts } from "@/types/api";

export interface CatalogSearch {
  search?: string;
  category?: "all" | "art" | "collectible" | "gaming";
  edition?: "all" | "unique" | "limited" | "open";
  sort?: "featured" | "price-asc" | "price-desc" | "name";
  page?: number;
}

export function nftsQueryOptions(search: CatalogSearch) {
  return queryOptions({
    queryKey: ["nfts", search],
    queryFn: async ({ signal }) => (await api.get<PaginatedNfts>("/nfts", { params: search, signal })).data,
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  });
}

export function nftQueryOptions(nftId: string) {
  return queryOptions({
    queryKey: ["nft", nftId],
    queryFn: async ({ signal }) => (await api.get<Nft>(`/nfts/${nftId}`, { signal })).data,
    staleTime: 30_000,
  });
}

export function useFavorites(enabled: boolean) {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => (await api.get<{ ids: string[] }>("/favorites")).data.ids,
    enabled,
    staleTime: 30_000,
    retry: false,
  });
}

export function useToggleFavorite() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ nftId, favorite }: { nftId: string; favorite: boolean }) =>
      favorite
        ? api.delete<{ ids: string[] }>(`/favorites/${nftId}`)
        : api.post<{ ids: string[] }>(`/favorites/${nftId}`),
    onMutate: async ({ nftId, favorite }) => {
      await client.cancelQueries({ queryKey: ["favorites"] });
      const previous = client.getQueryData<string[]>(["favorites"]) ?? [];
      client.setQueryData<string[]>(
        ["favorites"],
        favorite ? previous.filter((id) => id !== nftId) : [...previous, nftId],
      );
      return { previous };
    },
    onError: (_error, _variables, context) => client.setQueryData(["favorites"], context?.previous),
    onSettled: () => client.invalidateQueries({ queryKey: ["favorites"] }),
  });
}
