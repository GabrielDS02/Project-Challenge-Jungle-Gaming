import { Outlet } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRealtime } from "@/features/realtime/use-realtime";
import { Header } from "./header";
import { Footer } from "./footer";
import { MockLab } from "@/components/mock-lab";

export function AppShell() {
  useRealtime();
  return (
    <>
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      {import.meta.env.VITE_ENABLE_MOCKS !== "false" && <MockLab />}
      {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-right" initialIsOpen={false} />}
      <div id="live-region" className="sr-only" aria-live="polite" aria-atomic="true" />
    </>
  );
}
