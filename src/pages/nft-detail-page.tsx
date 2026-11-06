import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Heart, Minus, Plus, ShieldCheck, ShoppingBag, Zap } from "lucide-react";
import { useState } from "react";
import { NftArtwork } from "@/components/nft-artwork";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { useSession } from "@/features/auth/queries";
import { useAddToCart } from "@/features/cart/queries";
import { nftQueryOptions, useFavorites, useToggleFavorite } from "@/features/nfts/queries";
import { formatEth, getErrorMessage } from "@/lib/utils";

export function NftDetailPage() {
  const { nftId } = useParams({ from: "/nfts/$nftId" });
  const [quantity, setQuantity] = useState(1);
  const nft = useQuery(nftQueryOptions(nftId));
  const session = useSession();
  const favorites = useFavorites(Boolean(session.data));
  const toggle = useToggleFavorite();
  const add = useAddToCart();
  const navigate = useNavigate();
  if (nft.isPending)
    return (
      <div className="container grid gap-8 py-14 lg:grid-cols-2">
        <Skeleton className="aspect-square h-auto" />
        <div className="space-y-5">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-20" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  if (nft.isError)
    return (
      <ErrorState
        title="NFT indisponível"
        message={getErrorMessage(nft.error, "Esta obra não existe ou não está disponível.")}
        onRetry={() => void nft.refetch()}
      />
    );
  const item = nft.data;
  const favorite = favorites.data?.includes(item.id) ?? false;
  const onFavorite = () => {
    if (!session.data) {
      void navigate({ to: "/login", search: { redirect: `/nfts/${item.id}` } });
      return;
    }
    toggle.mutate({ nftId: item.id, favorite });
  };
  return (
    <>
      <Seo
        title={item.name}
        description={`Conheça ${item.name}, da coleção ${item.collection}, disponível por ${formatEth(item.priceEth)}.`}
      />
      <div className="container py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
          <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
            <div className="order-2 flex gap-3 sm:order-1 sm:flex-col">
              {[item.imageIndex, (item.imageIndex + 1) % 8, (item.imageIndex + 4) % 8].map(
                (index, position) => (
                  <button
                    key={index}
                    className={`w-20 border p-1 ${position === 0 ? "border-ember" : "border-white/10"}`}
                    aria-label={`Visualização ${position + 1}`}
                  >
                    <NftArtwork index={index} alt={`${item.name}, visualização ${position + 1}`} />
                  </button>
                ),
              )}
            </div>
            <NftArtwork
              index={item.imageIndex}
              alt={`Arte principal do NFT ${item.name}`}
              className="order-1 w-full border border-white/10 sm:order-2"
            />
          </div>
          <section className="lg:pt-6">
            <p className="eyebrow">{item.collection}</p>
            <h1 className="mt-3 font-display text-5xl font-bold leading-none sm:text-6xl">{item.name}</h1>
            <p className="mt-3 text-sm text-sand/45">
              Criado por <span className="text-ember">{item.creator}</span>
            </p>
            <div className="mt-8 grid grid-cols-3 gap-2 border-y border-white/10 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-sand/40">Preço atual</p>
                <p className="mt-2 font-bold">{formatEth(item.priceEth)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-sand/40">Disponíveis</p>
                <p className="mt-2 font-bold">
                  {item.available}/{item.totalSupply}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-sand/40">Edição</p>
                <p className="mt-2 font-bold capitalize">{item.edition}</p>
              </div>
            </div>
            <p className="mt-7 text-sm leading-7 text-sand/58">{item.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex h-12 items-center border border-white/12">
                <button
                  aria-label="Diminuir quantidade"
                  className="grid size-11 place-items-center hover:text-ember"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => value - 1)}
                >
                  <Minus size={15} />
                </button>
                <output className="w-9 text-center text-sm font-bold" aria-label={`Quantidade ${quantity}`}>
                  {quantity}
                </output>
                <button
                  aria-label="Aumentar quantidade"
                  className="grid size-11 place-items-center hover:text-ember"
                  disabled={quantity >= item.available}
                  onClick={() => setQuantity((value) => value + 1)}
                >
                  <Plus size={15} />
                </button>
              </div>
              <Button
                className="min-w-[220px] flex-1"
                size="lg"
                disabled={!item.available || add.isPending}
                onClick={() => add.mutate({ nftId: item.id, quantity })}
              >
                <ShoppingBag size={17} />
                {add.isPending ? "Adicionando…" : "Adicionar ao carrinho"}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                aria-pressed={favorite}
                onClick={onFavorite}
              >
                <Heart size={18} fill={favorite ? "currentColor" : "none"} />
              </Button>
            </div>
            {add.isError && (
              <p role="alert" className="mt-3 text-sm text-red-300">
                {getErrorMessage(add.error)}
              </p>
            )}
            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              <div className="flex gap-3 border border-white/8 p-4">
                <ShieldCheck className="shrink-0 text-ember" size={20} />
                <div>
                  <p className="text-xs font-bold">Compra simulada segura</p>
                  <p className="mt-1 text-xs leading-5 text-sand/40">Revalidação antes do pedido.</p>
                </div>
              </div>
              <div className="flex gap-3 border border-white/8 p-4">
                <Zap className="shrink-0 text-ember" size={20} />
                <div>
                  <p className="text-xs font-bold">Atualização em tempo real</p>
                  <p className="mt-1 text-xs leading-5 text-sand/40">Preço e estoque sincronizados.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
        <section className="mt-16 border-t border-white/10 pt-10">
          <p className="eyebrow">Detalhes do ativo</p>
          <div className="mt-5 grid gap-4 text-sm text-sand/55 sm:grid-cols-3">
            <div className="bg-roast p-5">
              <p className="text-[10px] uppercase tracking-widest text-sand/35">Contrato simulado</p>
              <p className="mt-2 break-all">0x7A1c…{item.id.slice(-4).toUpperCase()}</p>
            </div>
            <div className="bg-roast p-5">
              <p className="text-[10px] uppercase tracking-widest text-sand/35">Padrão</p>
              <p className="mt-2">ERC-721 demonstrativo</p>
            </div>
            <div className="bg-roast p-5">
              <p className="text-[10px] uppercase tracking-widest text-sand/35">Rede</p>
              <p className="mt-2">Ethereum simulado</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
