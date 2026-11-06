import { useEffect } from "react";

/** Keeps client-side route titles and descriptions accurate after SPA navigation. */
export function Seo({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = `${title} | Jungle NFT Marketplace`;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    meta?.setAttribute("content", description);
    return () => {
      document.title = "Jungle — NFT Marketplace";
    };
  }, [description, title]);
  return null;
}
