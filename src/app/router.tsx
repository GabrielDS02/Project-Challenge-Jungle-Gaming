import { QueryClient } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "@/components/layout/app-shell";
import { sessionQueryOptions } from "@/features/auth/queries";
import { LoginPage, RegisterPage } from "@/pages/auth-pages";
import { CartPage } from "@/pages/cart-page";
import { CheckoutPage } from "@/pages/checkout-page";
import { HomePage } from "@/pages/home-page";
import { NftDetailPage } from "@/pages/nft-detail-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { OrderPage } from "@/pages/order-page";
import { ProfilePage } from "@/pages/profile-page";
import { WalletsPage } from "@/pages/wallets-page";

interface RouterContext {
  queryClient: QueryClient;
}
const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: AppShell,
  notFoundComponent: NotFoundPage,
});

const catalogSearchSchema = z.object({
  search: z.string().max(80).optional().catch(undefined),
  category: z.enum(["all", "art", "collectible", "gaming"]).optional().catch("all"),
  edition: z.enum(["all", "unique", "limited", "open"]).optional().catch("all"),
  sort: z.enum(["featured", "price-asc", "price-desc", "name"]).optional().catch("featured"),
  page: z.coerce.number().int().min(1).optional().catch(1),
});
const redirectSearchSchema = z.object({ redirect: z.string().optional().catch("/") });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search) => catalogSearchSchema.parse(search),
  component: HomePage,
});
const nftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nfts/$nftId",
  component: NftDetailPage,
});
const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: "/cart", component: CartPage });
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (search) => redirectSearchSchema.parse(search),
  component: LoginPage,
});
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  validateSearch: (search) => redirectSearchSchema.parse(search),
  component: RegisterPage,
});

// A pathless route centralizes private-route enforcement and preserves the intended destination.
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authenticated",
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData(sessionQueryOptions);
    if (!user) throw redirect({ to: "/login", search: { redirect: location.href } });
  },
  component: Outlet,
});
const checkoutRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/checkout",
  validateSearch: (search) => z.object({ coupon: z.string().optional() }).parse(search),
  component: CheckoutPage,
});
const orderRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/orders/$orderId",
  component: OrderPage,
});
const profileRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/profile",
  component: ProfilePage,
});
const walletsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/wallets",
  component: WalletsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  nftRoute,
  cartRoute,
  loginRoute,
  registerRoute,
  authenticatedRoute.addChildren([checkoutRoute, orderRoute, profileRoute, walletsRoute]),
]);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error: any) =>
        ![400, 401, 403, 404, 409, 422].includes(error?.response?.status) && failureCount < 2,
      retryDelay: (attempt) => Math.min(600 * 2 ** attempt, 4_000),
    },
    mutations: { retry: false },
  },
});

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
