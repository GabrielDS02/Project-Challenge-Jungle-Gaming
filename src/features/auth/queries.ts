import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { api } from "@/lib/api";
import type { User } from "@/types/api";

export const sessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: async ({ signal }) => (await api.get<{ user: User | null }>("/session", { signal })).data.user,
  staleTime: 30_000,
  retry: false,
});

export function useSession() {
  return useQuery(sessionQueryOptions);
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) =>
      (await api.post<{ user: User }>("/session/login", input)).data.user,
    onSuccess: async (user) => {
      queryClient.setQueryData(["session"], user);
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      await router.invalidate();
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (input: { name: string; email: string; password: string }) =>
      (await api.post<{ user: User }>("/accounts", input)).data.user,
    onSuccess: async (user) => {
      queryClient.setQueryData(["session"], user);
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      await router.invalidate();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => api.post("/session/logout"),
    onSuccess: async () => {
      queryClient.clear();
      queryClient.setQueryData(["session"], null);
      await router.invalidate();
    },
  });
}
