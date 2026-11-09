import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Heart, Maximize2, Minus, Plus, ShieldCheck, ShoppingBag, Zap } from "lucide-react";
import { useState } from "react";
import { NftArtwork } from "@/components/nft-artwork";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { useSession } from "@/features/auth/queries";
import { useAddToCart } from "@/features/cart/queries";
import { nftQueryOptions, useFavorites, useToggleFavorite } from "@/features/nfts/queries";
import { formatEth, getErrorMessage } from "@/lib/utils";

export function NftDetailPage() {
  const { nftId } = useParams({ from: "/nfts/$nftId" });
  return <NftDetailContent key={nftId} nftId={nftId} />;
}

function NftDetailContent({ nftId }: { nftId: string }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedArtwork, setSelectedArtwork] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
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
  const gallery = [item.imageIndex, (item.imageIndex + 1) % 8, (item.imageIndex + 4) % 8];
  const activeArtwork = selectedArtwork ?? gallery[0];
  const activePosition = gallery.indexOf(activeArtwork) + 1;
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
      <div className="detail-page relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute -left-32 top-24 size-96 rounded-full bg-ember/5 blur-3xl" />
        <div className="container relative py-8 sm:py-10 xl:py-12">
          <p className="mb-6 text-[9px] text-sand/45">Início / Mercado / {item.name}</p>
          <div className="grid min-w-0 gap-9 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,.92fr)] lg:items-start lg:gap-10">
            <div className="gallery-intro min-w-0 lg:sticky lg:top-24">
              <div className="grid min-w-0 gap-3 sm:grid-cols-[76px_minmax(0,1fr)]">
                <div className="order-2 flex gap-3 overflow-x-auto pb-1 sm:order-1 sm:flex-col sm:overflow-visible">
                  {gallery.map((index, position) => {
                    const selected = index === activeArtwork;
                    return (
                      <button
                        key={index}
                        type="button"
                        className={`group relative w-[72px] shrink-0 overflow-hidden border p-1 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember sm:w-full ${
                          selected
                            ? "border-ember bg-ember/10 shadow-[0_0_0_1px_rgba(232,144,69,.3)]"
                            : "border-white/10 bg-roast/60 hover:-translate-y-0.5 hover:border-ember/55"
                        }`}
                        aria-label={`Exibir visualização ${position + 1} de ${item.name}`}
                        aria-pressed={selected}
                        onClick={() => setSelectedArtwork(index)}
                      >
                        <NftArtwork
                          index={index}
                          alt={`${item.name}, visualização ${position + 1}`}
                          className="transition duration-500 group-hover:scale-[1.04]"
                        />
                        <span
                          className={`absolute inset-x-1 bottom-1 h-0.5 origin-left bg-ember transition-transform duration-300 ${selected ? "scale-x-100" : "scale-x-0"}`}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="group relative order-1 min-w-0 overflow-hidden border border-white/10 bg-roast text-left shadow-[0_30px_80px_rgba(0,0,0,.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember sm:order-2"
                  aria-label={`Vista ${activePosition} de ${gallery.length}. Ampliar. ${item.name}, visualização ${activePosition}`}
                  onClick={() => setPreviewOpen(true)}
                >
                  <NftArtwork
                    key={activeArtwork}
                    index={activeArtwork}
                    alt={`Arte principal do NFT ${item.name}, visualização ${activePosition}`}
                    className="artwork-reveal w-full transition-transform duration-700 group-hover:scale-[1.015]"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/90 to-transparent px-4 pb-4 pt-16 text-[10px] font-black uppercase tracking-[.18em] text-sand/75">
                    Vista {activePosition} de {gallery.length}
                    <span className="flex items-center gap-2 rounded-full border border-white/15 bg-ink/65 px-3 py-2 text-sand transition group-hover:border-ember/60 group-hover:text-ember">
                      <Maximize2 size={14} /> Ampliar
                    </span>
                  </span>
                </button>
              </div>
              <p className="mt-3 text-right text-[10px] uppercase tracking-[.16em] text-sand/30">
                Selecione uma miniatura ou amplie a obra
              </p>
            </div>

            <section className="detail-intro min-w-0 lg:pt-2">
              <p className="eyebrow">{item.collection}</p>
              <h1 className="mt-3 break-words font-display text-[clamp(2rem,4vw,3.2rem)] font-black leading-[.95] tracking-[-.06em]">
                {item.name}
              </h1>
              <p className="mt-3 text-sm text-sand/45">
                Criado por <span className="text-ember">{item.creator}</span>
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3 border-y border-white/10 py-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-sand/40">Preço atual</p>
                  <p className="mt-2 text-sm font-bold text-sand sm:text-base">{formatEth(item.priceEth)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-sand/40">Disponíveis</p>
                  <p className="mt-2 text-sm font-bold text-sand sm:text-base">
                    {item.available} de {item.totalSupply}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-sand/40">Edição</p>
                  <p className="mt-2 text-sm font-bold capitalize text-sand sm:text-base">{item.edition}</p>
                </div>
              </div>
              <p className="mt-7 max-w-xl text-sm leading-7 text-sand/60">{item.description}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-[auto_minmax(220px,1fr)_auto]">
                <div className="flex h-12 items-center justify-between border border-white/12 bg-black/10 sm:justify-start">
                  <button
                    aria-label="Diminuir quantidade"
                    className="grid size-11 place-items-center transition hover:bg-white/5 hover:text-ember disabled:opacity-30"
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
                    className="grid size-11 place-items-center transition hover:bg-white/5 hover:text-ember disabled:opacity-30"
                    disabled={quantity >= item.available}
                    onClick={() => setQuantity((value) => value + 1)}
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <Button
                  className="w-full"
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
                <div className="group flex gap-3 border border-white/8 bg-roast/35 p-4 transition hover:border-ember/30 hover:bg-roast/70">
                  <ShieldCheck className="shrink-0 text-ember" size={20} />
                  <div>
                    <p className="text-xs font-bold">Compra simulada segura</p>
                    <p className="mt-1 text-xs leading-5 text-sand/40">Revalidação antes do pedido.</p>
                  </div>
                </div>
                <div className="group flex gap-3 border border-white/8 bg-roast/35 p-4 transition hover:border-ember/30 hover:bg-roast/70">
                  <Zap className="shrink-0 text-ember" size={20} />
                  <div>
                    <p className="text-xs font-bold">Atualização em tempo real</p>
                    <p className="mt-1 text-xs leading-5 text-sand/40">Preço e estoque sincronizados.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="container pb-8 pt-10">
        <section className="border-t border-ember/20 pt-8">
          <p className="eyebrow">Detalhes do ativo</p>
          <div className="mt-5 grid gap-4 text-sm text-sand/55 sm:grid-cols-3">
            <div className="bg-roast p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-sand/65">
                Contrato simulado
              </p>
              <p className="mt-2 break-all">0x7A1c…{item.id.slice(-4).toUpperCase()}</p>
            </div>
            <div className="bg-roast p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-sand/65">Padrão</p>
              <p className="mt-2">ERC-721 demonstrativo</p>
            </div>
            <div className="bg-roast p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-sand/65">Rede</p>
              <p className="mt-2">Ethereum simulado</p>
            </div>
          </div>
        </section>
      </div>

      <section className="container border-t border-ember/15 py-10" aria-labelledby="related-title">
        <p className="figma-label">Veja mais da coleção</p>
        <h2 id="related-title" className="mt-2 text-lg font-black">
          Colecionadores também viram
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[4, 1, 2, 6, 7].map((index) => (
            <a key={index} href="/#catalogo" className="group figma-panel overflow-hidden">
              <NftArtwork
                index={index}
                alt={`Colecionável relacionado ${index + 1}`}
                className="transition group-hover:scale-[1.03]"
              />
              <p className="truncate p-3 text-[10px] font-black">Kurio Ape #{118 + index}</p>
            </a>
          ))}
        </div>
      </section>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-[min(94vw,920px)] max-w-none overflow-hidden border-ember/25 bg-ink p-3 sm:p-4">
          <DialogTitle>{item.name}</DialogTitle>
          <p className="mb-3 mt-1 text-xs uppercase tracking-[.16em] text-sand/40">
            Visualização {activePosition} de {gallery.length}
          </p>
          <NftArtwork
            index={activeArtwork}
            alt={`${item.name} ampliado, visualização ${activePosition}`}
            className="w-full border border-white/10"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
