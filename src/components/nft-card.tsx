import { Heart, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { Nft } from "@/types/api";
import { formatEth } from "@/lib/utils";
import { NftArtwork } from "./nft-artwork";
import { Button } from "./ui/button";
import { useAddToCart } from "@/features/cart/queries";
import { useSession } from "@/features/auth/queries";
import { useToggleFavorite } from "@/features/nfts/queries";

export function NftCard({ nft, favorite = false }: { nft: Nft; favorite?: boolean }) {
  const add = useAddToCart();
  const session = useSession();
  const toggle = useToggleFavorite();
  const navigate = useNavigate();

  const onFavorite = () => {
    if (!session.data) {
      void navigate({ to: "/login", search: { redirect: window.location.pathname } });
      return;
    }
    toggle.mutate({ nftId: nft.id, favorite });
  };

  return (
    <article className="group relative min-w-0" data-testid="nft-card">
      <div className="relative overflow-hidden rounded-[3px] border border-ember/15 bg-roast transition duration-300 group-hover:-translate-y-1 group-hover:border-ember/50 group-hover:shadow-glow">
        <Link to="/nfts/$nftId" params={{ nftId: nft.id }} className="block overflow-hidden">
          <NftArtwork
            index={nft.imageIndex}
            alt={`Arte do NFT ${nft.name}`}
            className="transition duration-500 group-hover:scale-[1.035]"
          />
        </Link>
        <button
          type="button"
          onClick={onFavorite}
          aria-label={favorite ? `Remover ${nft.name} dos favoritos` : `Adicionar ${nft.name} aos favoritos`}
          aria-pressed={favorite}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-ember/25 bg-ink/85 text-sand backdrop-blur transition hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          <Heart size={17} fill={favorite ? "currentColor" : "none"} />
        </button>
        <div className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-end gap-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 max-md:translate-y-0 max-md:opacity-100">
          <Button
            size="sm"
            variant="secondary"
            disabled={!nft.available || add.isPending}
            onClick={() => add.mutate({ nftId: nft.id, quantity: 1 })}
            aria-label={`Adicionar ${nft.name} ao carrinho`}
          >
            <ShoppingBag size={14} /> {nft.available ? "Comprar" : "Esgotado"}
          </Button>
        </div>
      </div>
      <p className="mt-3 truncate text-[9px] uppercase tracking-wider text-ember">{nft.collection}</p>
      <Link
        to="/nfts/$nftId"
        params={{ nftId: nft.id }}
        className="mt-1 block truncate text-xs font-black text-sand hover:text-ember"
      >
        {nft.name}
      </Link>
      <p className="mt-1 text-[10px] font-black text-ember">{formatEth(nft.priceEth)}</p>
    </article>
  );
}
