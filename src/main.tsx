import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { queryClient, router } from "@/app/router";
import "@/index.css";

async function enableMocking() {
  if (!("serviceWorker" in navigator)) return;
  const serviceWorkerUrl = import.meta.env.PROD ? "/mockServiceWorker.js?pwa=1" : "/mockServiceWorker.js";

  if (import.meta.env.VITE_ENABLE_MOCKS === "false") {
    await navigator.serviceWorker.register(serviceWorkerUrl);
    return;
  }
  const { worker } = await import("@/mocks/browser");
  // The production worker combines the mock network boundary with the PWA application cache.
  await worker.start({ onUnhandledRequest: "bypass", serviceWorker: { url: serviceWorkerUrl } });
}

async function cachePwaShell() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const resourceUrls = performance
    .getEntriesByType("resource")
    .map((entry) => entry.name)
    .filter((url) => {
      const parsed = new URL(url);
      return parsed.origin === location.origin && !parsed.pathname.startsWith("/api/");
    });

  if (!registration.active) return;

  await new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    const timeout = window.setTimeout(resolve, 10_000);
    channel.port1.onmessage = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    registration.active?.postMessage(
      {
        type: "PWA_CACHE_URLS",
        urls: [location.origin, ...resourceUrls],
      },
      [channel.port2],
    );
  });
  document.documentElement.dataset.pwaCache = "ready";
}

await enableMocking();
void cachePwaShell();

const root = document.getElementById("root");
if (!root) throw new Error("Elemento raiz da aplicação não encontrado.");
createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
