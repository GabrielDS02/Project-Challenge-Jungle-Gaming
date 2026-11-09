import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Cart, Quote } from "@/types/api";

export const cartQueryOptions = queryOptions({
  queryKey: ["cart"],
  queryFn: async ({ signal }) => (await api.get<Cart>("/cart", { signal })).data,
  staleTime: 5_000,
});

export function useCart() {
  return useQuery(cartQueryOptions);
}

export function useAddToCart() {
  const client = useQueryClient();
  return useMutation({
    scope: { id: "cart" },
    mutationFn: async ({ nftId, quantity }: { nftId: string; quantity: number }) =>
      (await api.post<Cart>("/cart/items", { nftId, quantity })).data,
    onSuccess: (cart) => client.setQueryData(["cart"], cart),
  });
}

export function useUpdateCartItem() {
  const client = useQueryClient();
  return useMutation({
    scope: { id: "cart" },
    mutationFn: async ({ nftId, quantity }: { nftId: string; quantity: number }) =>
      (await api.patch<Cart>(`/cart/items/${nftId}`, { quantity })).data,
    onSuccess: (cart) => {
      client.setQueryData(["cart"], cart);
      void client.invalidateQueries({ queryKey: ["quote"] });
    },
  });
}

export function useRemoveCartItem() {
  const client = useQueryClient();
  return useMutation({
    scope: { id: "cart" },
    mutationFn: (nftId: string) => api.delete(`/cart/items/${nftId}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["cart"] });
      void client.invalidateQueries({ queryKey: ["quote"] });
    },
  });
}

export function quoteQueryOptions(coupon?: string) {
  return queryOptions({
    queryKey: ["quote", coupon ?? ""],
    queryFn: async () => (await api.post<Quote>("/quotes", { coupon: coupon || undefined })).data,
    staleTime: 15_000,
    retry: false,
  });
}
