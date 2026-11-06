import { cn } from "@/lib/utils";

const positions = [
  "0% 0%",
  "33.333% 0%",
  "66.667% 0%",
  "100% 0%",
  "0% 100%",
  "33.333% 100%",
  "66.667% 100%",
  "100% 100%",
];

export function NftArtwork({ index, alt, className }: { index: number; alt: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("aspect-square bg-cover bg-no-repeat", className)}
      style={{
        backgroundImage: "url('/assets/jungle-collectibles.jpg')",
        backgroundSize: "400% 200%",
        backgroundPosition: positions[index % 8],
      }}
    />
  );
}
