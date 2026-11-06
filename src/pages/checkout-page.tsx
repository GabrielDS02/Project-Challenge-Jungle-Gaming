import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { CircleAlert, Radio, ShieldCheck, WalletCards } from "lucide-react";
import { type FormEvent, useMemo, useRef, useState } from "react";
import { NftArtwork } from "@/components/nft-artwork";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSession } from "@/features/auth/queries";
import { quoteQueryOptions } from "@/features/cart/queries";
import { api } from "@/lib/api";
import { formatEth, getErrorMessage, makeIdempotencyKey, shortAddress } from "@/lib/utils";
import type { Order, Wallet } from "@/types/api";

export function CheckoutPage() {
  const search = useSearch({ from: "/_authenticated/checkout" });
  const session = useSession();
  const quote = useQuery(quoteQueryOptions(search.coupon));
  const wallets = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => (await api.get<{ items: Wallet[] }>("/wallets")).data.items,
  });
  const [walletId, setWalletId] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [reviewedVersion, setReviewedVersion] = useState("");
  const idempotencyKey = useRef(makeIdempotencyKey());
  const navigate = useNavigate();
  const client = useQueryClient();
  const effectiveWalletId =
    walletId || wallets.data?.find((wallet) => wallet.primary)?.id || wallets.data?.[0]?.id || "";
  const changed =
    Boolean(quote.data?.changedItems.length) || (reviewedVersion && quote.data?.version !== reviewedVersion);
  const order = useMutation({
    mutationFn: async () =>
      (
        await api.post<Order>(
          "/orders",
          {
            walletId: effectiveWalletId,
            quoteVersion: quote.data!.version,
            buyer: { name: session.data!.name, email: session.data!.email },
            coupon: search.coupon,
          },
          { headers: { "Idempotency-Key": idempotencyKey.current } },
        )
      ).data,
    onSuccess: async (data) => {
      client.setQueryData(["order", data.id], data);
      await navigate({ to: "/orders/$orderId", params: { orderId: data.id } });
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!quote.data || !accepted) return;
    if (reviewedVersion !== quote.data.version) {
      setReviewedVersion(quote.data.version);
      return;
    }
    order.mutate();
  };
  const steps = useMemo(() => ["Identificação", "Carteira", "Revisão"], []);
  if (quote.isError)
    return (
      <ErrorState
        title="Cotação indisponível"
        message={getErrorMessage(quote.error)}
        onRetry={() => void quote.refetch()}
      />
    );
  return (
    <>
      <Seo
        title="Pagamento"
        description="Revise seus dados, conecte uma carteira fictícia e confirme a cotação do pedido."
      />
      <div className="container py-12">
        <p className="eyebrow">Checkout protegido</p>
        <h1 className="section-title mt-3">Pagamento</h1>
        <ol className="mt-8 grid grid-cols-3 gap-2" aria-label="Etapas do checkout">
          {steps.map((step, index) => (
            <li
              key={step}
              className="flex items-center gap-2 border-t border-white/10 pt-3 text-[10px] font-bold uppercase tracking-wider text-sand/45"
            >
              <span className="grid size-6 place-items-center rounded-full bg-ember text-ink">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <form onSubmit={submit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <section className="border border-white/8 bg-roast p-6">
              <h2 className="font-display text-2xl">Dados do colecionador</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field id="buyer-name" label="Nome">
                  <Input id="buyer-name" value={session.data?.name ?? ""} readOnly />
                </Field>
                <Field id="buyer-email" label="E-mail">
                  <Input id="buyer-email" type="email" value={session.data?.email ?? ""} readOnly />
                </Field>
              </div>
            </section>
            <section className="border border-white/8 bg-roast p-6">
              <div className="flex items-center gap-3">
                <WalletCards className="text-ember" />
                <h2 className="font-display text-2xl">Carteira e rede</h2>
              </div>
              {wallets.isPending ? (
                <Skeleton className="mt-5 h-24" />
              ) : !wallets.data?.length ? (
                <div className="mt-5 border border-dashed border-white/15 p-5 text-sm text-sand/50">
                  Cadastre uma carteira no perfil antes de comprar.{" "}
                  <Button asChild variant="secondary" size="sm" className="mt-4">
                    <a href="/wallets">Cadastrar carteira</a>
                  </Button>
                </div>
              ) : (
                <div className="mt-5 grid gap-3">
                  {wallets.data.map((wallet) => (
                    <label
                      key={wallet.id}
                      className={`flex cursor-pointer items-center justify-between border p-4 transition ${effectiveWalletId === wallet.id ? "border-ember bg-ember/5" : "border-white/10 hover:border-white/25"}`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="wallet"
                          value={wallet.id}
                          checked={effectiveWalletId === wallet.id}
                          onChange={() => setWalletId(wallet.id)}
                          className="accent-[#e89045]"
                        />
                        <span>
                          <span className="block text-sm font-bold">{wallet.label}</span>
                          <span className="mt-1 block text-xs text-sand/40">
                            {shortAddress(wallet.address)} · {wallet.network}
                          </span>
                        </span>
                      </span>
                      {wallet.primary && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-ember">
                          Principal
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
              <div className="mt-5 flex items-center gap-3 border border-emerald-400/15 bg-emerald-400/5 p-4 text-xs text-emerald-200">
                <Radio size={16} />
                Conexão de carteira simulada e pronta.
              </div>
            </section>
          </div>
          <aside className="h-fit border border-ember/25 bg-roast p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-2xl">Revisão do pedido</h2>
            {quote.isPending ? (
              <div className="mt-6 space-y-3">
                <Skeleton className="h-20" />
                <Skeleton />
                <Skeleton />
              </div>
            ) : (
              quote.data && (
                <>
                  <div className="mt-5 max-h-56 space-y-3 overflow-y-auto pr-2">
                    {quote.data.items.map((line) => (
                      <div key={line.nftId} className="flex gap-3">
                        <NftArtwork
                          index={line.nft.imageIndex}
                          alt={line.nft.name}
                          className="size-16 shrink-0"
                        />
                        <div>
                          <p className="text-sm font-bold">{line.nft.name}</p>
                          <p className="mt-1 text-xs text-sand/40">
                            {line.quantity} × {formatEth(line.nft.priceEth)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
                    <div className="flex justify-between text-sand/50">
                      <dt>Subtotal</dt>
                      <dd>{formatEth(quote.data.subtotalEth)}</dd>
                    </div>
                    <div className="flex justify-between text-sand/50">
                      <dt>Desconto</dt>
                      <dd>- {formatEth(quote.data.discountEth)}</dd>
                    </div>
                    <div className="flex justify-between text-sand/50">
                      <dt>Taxa de rede</dt>
                      <dd>{formatEth(quote.data.networkFeeEth)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-4 font-bold">
                      <dt>Total</dt>
                      <dd className="text-ember">{formatEth(quote.data.totalEth)}</dd>
                    </div>
                  </dl>
                </>
              )
            )}
            {changed && (
              <div
                role="alert"
                className="mt-5 flex gap-3 border border-amber-300/25 bg-amber-300/5 p-4 text-xs leading-5 text-amber-200"
              >
                <CircleAlert className="shrink-0" size={18} />A cotação mudou. Revise os valores antes de
                confirmar novamente.
              </div>
            )}
            <label className="mt-6 flex items-start gap-3 text-xs leading-5 text-sand/55">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="mt-1 accent-[#e89045]"
              />
              Revisei os itens e autorizo a simulação deste pedido.
            </label>
            {order.isError && (
              <p role="alert" className="mt-4 text-sm text-red-300">
                {getErrorMessage(order.error)}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="mt-6 w-full"
              disabled={!accepted || !effectiveWalletId || quote.isPending || order.isPending}
            >
              {order.isPending
                ? "Enviando pedido…"
                : reviewedVersion !== quote.data?.version
                  ? "Revisar valores"
                  : "Confirmar compra"}
            </Button>
            <p className="mt-4 flex items-center justify-center gap-2 text-[10px] text-sand/35">
              <ShieldCheck size={13} />
              Envio idempotente: cliques repetidos não duplicam pedidos.
            </p>
          </aside>
        </form>
      </div>
    </>
  );
}
