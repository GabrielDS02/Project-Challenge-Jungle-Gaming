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
    <article
      className="group relative overflow-hidden border border-white/8 bg-roast transition duration-300 hover:-translate-y-1 hover:border-ember/45 hover:shadow-glow"
      data-testid="nft-card"
    >
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
        className="absolute right-3 top-3 grid size-10 place-items-center rounded-full border border-white/10 bg-ink/80 text-sand backdrop-blur transition hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
      >
        <Heart size={17} fill={favorite ? "currentColor" : "none"} />
      </button>
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-ember">{nft.collection}</p>
        <Link
          to="/nfts/$nftId"
          params={{ nftId: nft.id }}
          className="mt-1 block font-display text-xl text-sand hover:text-ember"
        >
          {nft.name}
        </Link>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/8 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-sand/65">Preço</p>
            <p className="mt-1 text-sm font-bold text-sand">{formatEth(nft.priceEth)}</p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            disabled={!nft.available || add.isPending}
            onClick={() => add.mutate({ nftId: nft.id, quantity: 1 })}
            aria-label={`Adicionar ${nft.name} ao carrinho`}
          >
            <ShoppingBag size={14} /> {nft.available ? "Adicionar" : "Esgotado"}
          </Button>
        </div>
      </div>
    </article>
  );
}
