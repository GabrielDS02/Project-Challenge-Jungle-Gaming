import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { queryClient, router } from "@/app/router";
import "@/index.css";

async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS === "false") return;
  const { worker } = await import("@/mocks/browser");
  // All demo/test data stays at the network boundary; unhandled static assets pass through.
  await worker.start({ onUnhandledRequest: "bypass", serviceWorker: { url: "/mockServiceWorker.js" } });
}

await enableMocking();

const root = document.getElementById("root");
if (!root) throw new Error("Elemento raiz da aplicação não encontrado.");
createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
