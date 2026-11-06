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
      <div className="container py-12">
        <p className="eyebrow">Sua seleção</p>
        <h1 className="section-title mt-3">Carrinho de NFTs</h1>
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
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <section className="space-y-3" aria-label="Itens do carrinho">
              {cart.data.items.map((line) => (
                <article
                  key={line.nftId}
                  className="grid grid-cols-[96px_1fr] gap-4 border border-white/8 bg-roast p-3 sm:grid-cols-[120px_1fr_auto] sm:items-center"
                >
                  <NftArtwork index={line.nft.imageIndex} alt={line.nft.name} />
                  <div>
                    <p className="eyebrow">{line.nft.collection}</p>
                    <Link
                      to="/nfts/$nftId"
                      params={{ nftId: line.nftId }}
                      className="mt-1 block font-display text-xl hover:text-ember"
                    >
                      {line.nft.name}
                    </Link>
                    <p className="mt-2 text-sm font-bold">{formatEth(line.nft.priceEth)}</p>
                    {line.priceSnapshot !== line.nft.priceEth && (
                      <p role="status" className="mt-2 text-xs text-amber-300">
                        Preço atualizado de {formatEth(line.priceSnapshot)}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-1">
                    <div className="flex h-10 items-center border border-white/12">
                      <button
                        aria-label={`Diminuir ${line.nft.name}`}
                        className="grid size-9 place-items-center"
                        disabled={line.quantity <= 1 || update.isPending}
                        onClick={() => update.mutate({ nftId: line.nftId, quantity: line.quantity - 1 })}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm">{line.quantity}</span>
                      <button
                        aria-label={`Aumentar ${line.nft.name}`}
                        className="grid size-9 place-items-center"
                        disabled={line.quantity >= line.nft.available || update.isPending}
                        onClick={() => update.mutate({ nftId: line.nftId, quantity: line.quantity + 1 })}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      aria-label={`Remover ${line.nft.name}`}
                      onClick={() => remove.mutate(line.nftId)}
                      className="rounded p-3 text-sand/45 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </section>
            <aside className="h-fit border border-ember/25 bg-roast p-6 lg:sticky lg:top-24">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-ember" />
                <h2 className="font-display text-2xl">Resumo</h2>
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
                <Link to="/checkout" search={{ coupon: coupon || undefined }}>
                  Continuar para pagamento
                </Link>
              </Button>
              <p className="mt-4 text-center text-[11px] leading-5 text-sand/35">
                A cotação será revalidada antes do pedido.
              </p>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
