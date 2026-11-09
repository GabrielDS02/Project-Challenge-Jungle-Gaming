import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { NftArtwork } from "@/components/nft-artwork";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { quoteQueryOptions, useCart, useRemoveCartItem, useUpdateCartItem } from "@/features/cart/queries";
import { formatEth, getErrorMessage } from "@/lib/utils";

export function CartPage() {
  const cart = useCart();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState("");
  const quote = useQuery({ ...quoteQueryOptions(coupon), enabled: Boolean(cart.data?.items.length) });
  if (cart.isPending)
    return (
      <div className="container py-16">
        <Skeleton className="h-12 w-1/3" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-96" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  if (cart.isError)
    return (
      <ErrorState message="Não foi possível recuperar seu carrinho." onRetry={() => void cart.refetch()} />
    );
  return (
    <>
      <Seo title="Carrinho" description="Revise quantidades, cupom, taxas e total antes de continuar." />
      <div className="container py-10">
        <p className="text-[9px] text-sand/45">Início / Mercado / Carrinho</p>
        <h1 className="mt-3 text-xl font-black">Carrinho de NFTs</h1>
        {!cart.data.items.length ? (
          <div className="mt-10">
            <EmptyState
              title="Sua coleção começa aqui"
              message="O carrinho está vazio. Explore o catálogo para encontrar sua primeira peça."
            />
            <Button asChild className="mx-auto mt-6 flex w-fit">
              <Link to="/">Explorar catálogo</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_350px]">
            <section className="space-y-3" aria-label="Itens do carrinho">
              <div className="hidden grid-cols-[1fr_110px_120px_100px_32px] gap-4 border-b border-ember/25 pb-3 text-[9px] font-black text-sand/55 sm:grid">
                <span>NFTs</span>
                <span>Preço</span>
                <span>Edições</span>
                <span>Total</span>
                <span />
              </div>
              {cart.data.items.map((line) => (
                <article
                  key={line.nftId}
                  className="grid grid-cols-[64px_1fr] gap-3 border-b border-ember/15 py-3 sm:grid-cols-[1fr_110px_120px_100px_32px] sm:items-center sm:gap-4"
                >
                  <div className="contents sm:flex sm:items-center sm:gap-3">
                    <NftArtwork
                      index={line.nft.imageIndex}
                      alt={line.nft.name}
                      className="size-16 shrink-0 rounded-[8px]"
                    />
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-ember">{line.nft.collection}</p>
                      <Link
                        to="/nfts/$nftId"
                        params={{ nftId: line.nftId }}
                        className="mt-1 block text-xs font-black hover:text-ember"
                      >
                        {line.nft.name}
                      </Link>
                      {line.priceSnapshot !== line.nft.priceEth && (
                        <p role="status" className="mt-2 text-xs text-amber-300">
                          Preço atualizado de {formatEth(line.priceSnapshot)}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="hidden text-xs font-bold sm:block">{formatEth(line.nft.priceEth)}</p>
                  <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-1 sm:contents">
                    <div className="flex h-8 w-fit items-center border border-ember/25">
                      <button
                        aria-label={`Diminuir ${line.nft.name}`}
                        className="grid size-8 place-items-center"
                        disabled={line.quantity <= 1 || update.isPending}
                        onClick={() => update.mutate({ nftId: line.nftId, quantity: line.quantity - 1 })}
                      >
                        <Minus size={14} />
                      </button>
                      <output
                        aria-label={`Quantidade de ${line.nft.name}`}
                        className="w-8 text-center text-sm"
                      >
                        {line.quantity}
                      </output>
                      <button
                        aria-label={`Aumentar ${line.nft.name}`}
                        className="grid size-8 place-items-center"
                        disabled={line.quantity >= line.nft.available || update.isPending}
                        onClick={() => update.mutate({ nftId: line.nftId, quantity: line.quantity + 1 })}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-xs font-black text-ember">
                      {formatEth((Number(line.nft.priceEth) * line.quantity).toFixed(3))}
                    </p>
                    <button
                      aria-label={`Remover ${line.nft.name}`}
                      onClick={() => remove.mutate(line.nftId)}
                      className="rounded p-2 text-sand/45 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </section>
            <aside className="h-fit border-t border-ember/25 p-5 lg:sticky lg:top-20">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-ember" />
                <h2 className="text-sm font-black">Resumo da carteira</h2>
              </div>
              <form
                className="mt-6 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  setCoupon(couponInput.trim());
                }}
              >
                <Input
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="Cupom (JUNGLE10)"
                  aria-label="Cupom"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Aplicar
                </Button>
              </form>
              {quote.isError && (
                <p role="alert" className="mt-2 text-xs text-red-300">
                  {getErrorMessage(quote.error)}
                </p>
              )}
              {coupon && !quote.isError && (
                <button
                  type="button"
                  onClick={() => {
                    setCoupon("");
                    setCouponInput("");
                  }}
                  className="mt-2 text-[9px] font-black text-ember hover:underline"
                >
                  Remover cupom
                </button>
              )}
              {quote.isPending ? (
                <div className="mt-6 space-y-3">
                  <Skeleton />
                  <Skeleton />
                  <Skeleton />
                </div>
              ) : (
                quote.data && (
                  <dl className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between text-sand/55">
                      <dt>Subtotal</dt>
                      <dd>{formatEth(quote.data.subtotalEth)}</dd>
                    </div>
                    <div className="flex justify-between text-sand/55">
                      <dt>Desconto</dt>
                      <dd>- {formatEth(quote.data.discountEth)}</dd>
                    </div>
                    <div className="flex justify-between text-sand/55">
                      <dt>Taxa de rede</dt>
                      <dd>{formatEth(quote.data.networkFeeEth)}</dd>
                    </div>
                    <div className="mt-4 flex justify-between border-t border-white/10 pt-4 font-bold">
                      <dt>Total</dt>
                      <dd className="text-ember">{formatEth(quote.data.totalEth)}</dd>
                    </div>
                  </dl>
                )
              )}
              <Button asChild size="lg" className="mt-7 w-full">
                <Link
                  to="/checkout"
                  search={{ coupon: coupon || undefined }}
                  aria-label="Continuar para pagamento"
                >
                  Conectar e finalizar
                </Link>
              </Button>
              <p className="mt-4 text-center text-[11px] leading-5 text-sand/35">
                A cotação será revalidada antes do pedido.
              </p>
            </aside>
          </div>
        )}
      </div>
      {Boolean(cart.data.items.length) && (
        <section className="container border-t border-ember/15 py-10" aria-labelledby="cart-related-title">
          <h2 id="cart-related-title" className="text-xs font-black">
            Colecionadores também viram
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[4, 1, 2, 6, 7].map((index) => (
              <a href="/#catalogo" key={index} className="figma-panel overflow-hidden">
                <NftArtwork index={index} alt={`NFT recomendado ${index + 1}`} />
                <p className="p-3 text-[9px] font-black">Kurio Ape #{118 + index}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
