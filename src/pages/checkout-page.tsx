import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { CircleAlert, ShieldCheck } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { NftArtwork } from "@/components/nft-artwork";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { useSession } from "@/features/auth/queries";
import { quoteQueryOptions } from "@/features/cart/queries";
import { api } from "@/lib/api";
import { formatEth, getErrorMessage, makeIdempotencyKey, shortAddress } from "@/lib/utils";
import type { Order, Wallet } from "@/types/api";

function getPersistentCheckoutKey() {
  const stored = sessionStorage.getItem("kurio-checkout-idempotency-key");
  if (stored) return stored;
  const created = makeIdempotencyKey();
  sessionStorage.setItem("kurio-checkout-idempotency-key", created);
  return created;
}

export function CheckoutPage() {
  const search = useSearch({ from: "/_authenticated/checkout" });
  const session = useSession();
  const quote = useQuery(quoteQueryOptions(search.coupon));
  const wallets = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => (await api.get<{ items: Wallet[] }>("/wallets")).data.items,
  });
  const [walletId, setWalletId] = useState("");
  const [network, setNetwork] = useState("ethereum");
  const [walletType, setWalletType] = useState("self-custody");
  const [accepted, setAccepted] = useState(false);
  const [connected, setConnected] = useState(true);
  const [reviewedVersion, setReviewedVersion] = useState("");
  const [idempotencyKey] = useState(getPersistentCheckoutKey);
  const navigate = useNavigate();
  const client = useQueryClient();
  const recoveredOrder = useQuery({
    queryKey: ["order-recovery", idempotencyKey],
    queryFn: async () =>
      (
        await api.get<Order>("/orders/recover", {
          params: { key: idempotencyKey },
        })
      ).data,
    retry: false,
  });
  const effectiveWalletId =
    walletId || wallets.data?.find((wallet) => wallet.primary)?.id || wallets.data?.[0]?.id || "";
  const effectiveWallet = wallets.data?.find((wallet) => wallet.id === effectiveWalletId);
  const changed =
    Boolean(quote.data?.changedItems.length) ||
    Boolean(reviewedVersion && quote.data?.version !== reviewedVersion);
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
          { headers: { "Idempotency-Key": idempotencyKey } },
        )
      ).data,
    onSuccess: async (data) => {
      sessionStorage.removeItem("kurio-checkout-idempotency-key");
      client.setQueryData(["order", data.id], data);
      await navigate({ to: "/orders/$orderId", params: { orderId: data.id } });
    },
  });
  const acceptChanges = useMutation({
    mutationFn: () => api.post("/cart/reprice"),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["cart"] });
      await client.invalidateQueries({ queryKey: ["quote"] });
    },
  });
  useEffect(() => {
    if (!recoveredOrder.data) return;
    sessionStorage.removeItem("kurio-checkout-idempotency-key");
    client.setQueryData(["order", recoveredOrder.data.id], recoveredOrder.data);
    void navigate({
      to: "/orders/$orderId",
      params: { orderId: recoveredOrder.data.id },
      replace: true,
    });
  }, [client, navigate, recoveredOrder.data]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!quote.data || !accepted) return;
    if (reviewedVersion !== quote.data.version) {
      setReviewedVersion(quote.data.version);
      if (quote.data.changedItems.length) acceptChanges.mutate();
      return;
    }
    order.mutate();
  };
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
        description="Revise seus dados, escolha uma carteira fictícia e confirme a cotação do pedido."
      />
      <div className="container py-10">
        <p className="text-[9px] text-sand/45">Início / Mercado / Pagamento</p>
        <form onSubmit={submit} className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section>
            <h1 className="text-base font-black">Perfil do colecionador</h1>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field id="buyer-display-name" label="Nome de exibição">
                <Input id="buyer-display-name" defaultValue={session.data?.name ?? ""} required />
              </Field>
              <Field id="buyer-username" label="Nome de usuário">
                <Input id="buyer-username" defaultValue="adasilva" required />
              </Field>
              <Field id="buyer-network" label="Rede">
                <SelectField
                  id="buyer-network"
                  ariaLabel="Rede do pagamento"
                  value={network}
                  options={[
                    { value: "ethereum", label: "Ethereum" },
                    { value: "polygon", label: "Polygon" },
                    { value: "arbitrum", label: "Arbitrum" },
                  ]}
                  onValueChange={setNetwork}
                />
              </Field>
              <Field id="buyer-profile-name" label="Nome do perfil">
                <Input id="buyer-profile-name" defaultValue={session.data?.name ?? ""} required />
              </Field>
              <Field id="buyer-wallet-address" label="Endereço da carteira">
                <Input
                  id="buyer-wallet-address"
                  value={effectiveWallet?.address ?? ""}
                  placeholder="Selecione uma carteira"
                  readOnly
                  required
                />
              </Field>
              <Field id="buyer-secondary-wallet" label="ENS ou carteira secundária (opcional)">
                <Input id="buyer-secondary-wallet" placeholder="ada.eth" />
              </Field>
              <Field id="buyer-wallet-type" label="Tipo de carteira">
                <SelectField
                  id="buyer-wallet-type"
                  ariaLabel="Tipo de carteira"
                  value={walletType}
                  options={[
                    { value: "self-custody", label: "Autocustódia" },
                    { value: "managed", label: "Gerenciada" },
                    { value: "hardware", label: "Hardware" },
                  ]}
                  onValueChange={setWalletType}
                />
              </Field>
              <Field id="buyer-referral" label="Código de indicação">
                <Input id="buyer-referral" defaultValue="KURIO2026" required />
              </Field>
              <Field id="buyer-email" label="E-mail">
                <Input id="buyer-email" type="email" value={session.data?.email ?? ""} readOnly required />
              </Field>
              <Field id="buyer-ens" label="Nome ENS">
                <div className="flex">
                  <span className="grid place-items-center border border-r-0 border-white/12 px-3 text-xs text-sand/45">
                    .eth
                  </span>
                  <Input id="buyer-ens" defaultValue="ada" required />
                </div>
              </Field>
            </div>
            <label className="mt-5 flex items-center gap-3 text-xs text-sand/60">
              <input type="checkbox" className="accent-[#e89045]" /> Usar outra carteira?
            </label>
            <label className="mt-5 block text-[10px] font-black text-sand/65" htmlFor="buyer-note">
              Observação do colecionador (opcional)
            </label>
            <textarea
              id="buyer-note"
              className="mt-2 min-h-28 w-full border border-white/12 bg-transparent p-3 text-xs outline-none focus:border-ember sm:max-w-sm"
            />
          </section>

          <aside className="h-fit lg:sticky lg:top-20">
            <h2 className="text-xs font-black">Seus NFTs</h2>
            {quote.isPending ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-20" />
                <Skeleton />
                <Skeleton />
              </div>
            ) : (
              quote.data && (
                <>
                  <div className="mt-3 space-y-2">
                    {quote.data.items.map((line) => (
                      <div key={line.nftId} className="figma-panel flex items-center gap-3 p-2">
                        <NftArtwork
                          index={line.nft.imageIndex}
                          alt={line.nft.name}
                          className="size-12 shrink-0 rounded-[6px]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-black">{line.nft.name}</p>
                          <p className="mt-1 text-[8px] text-sand/40">ID do token: #{line.nftId.slice(-4)}</p>
                        </div>
                        <p className="text-[9px] text-sand/55">(x {line.quantity})</p>
                        <p className="text-[10px] font-black text-ember">
                          {formatEth((Number(line.nft.priceEth) * line.quantity).toFixed(3))}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-[9px] text-sand/45">
                    Tem um código promocional?{" "}
                    <span className="text-ember">{search.coupon || "Aplique no carrinho"}</span>
                  </p>
                  <dl className="mt-4 space-y-2 border-b border-ember/20 pb-4 text-[10px]">
                    <div className="flex justify-between text-sand/55">
                      <dt>Subtotal</dt>
                      <dd>{formatEth(quote.data.subtotalEth)}</dd>
                    </div>
                    <div className="flex justify-between text-sand/55">
                      <dt>Desconto do lançamento</dt>
                      <dd>- {formatEth(quote.data.discountEth)}</dd>
                    </div>
                    <div className="flex justify-between text-sand/55">
                      <dt>Taxa de rede</dt>
                      <dd>{formatEth(quote.data.networkFeeEth)}</dd>
                    </div>
                    <div className="flex justify-between pt-2 font-black">
                      <dt>Total</dt>
                      <dd className="text-ember">{formatEth(quote.data.totalEth)}</dd>
                    </div>
                  </dl>
                </>
              )
            )}
            <div className="mt-5 flex items-center justify-between gap-3">
              <h2 className="text-xs font-black">Carteira e rede</h2>
              <button
                type="button"
                onClick={() => setConnected((value) => !value)}
                className="text-[9px] font-black text-ember hover:underline"
              >
                {connected ? "Desconectar carteira" : "Conectar carteira"}
              </button>
            </div>
            {wallets.isPending ? (
              <Skeleton className="mt-3 h-20" />
            ) : !wallets.data?.length ? (
              <a
                href="/wallets"
                className="mt-3 block border border-dashed border-ember/30 p-4 text-center text-xs text-ember"
              >
                Cadastrar carteira
              </a>
            ) : (
              <div className="mt-3 grid gap-2">
                {wallets.data.map((wallet) => (
                  <label
                    key={wallet.id}
                    className={`flex cursor-pointer items-center justify-between border px-3 py-2 text-[10px] ${effectiveWalletId === wallet.id ? "border-ember bg-ember/5" : "border-white/12"}`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="wallet"
                        checked={effectiveWalletId === wallet.id}
                        onChange={() => setWalletId(wallet.id)}
                        className="accent-[#e89045]"
                      />
                      {wallet.label}
                    </span>
                    <span className="text-sand/35">{shortAddress(wallet.address)}</span>
                  </label>
                ))}
              </div>
            )}
            {!connected && (
              <div role="status" className="mt-4 border border-amber-300/25 p-3 text-[10px] text-amber-200">
                Carteira desconectada. Reconecte para confirmar a compra.
              </div>
            )}
            {changed && (
              <div
                role="alert"
                className="mt-4 flex gap-2 border border-amber-300/25 p-3 text-[10px] leading-4 text-amber-200"
              >
                <CircleAlert className="shrink-0" size={15} />A cotação mudou. Revise os valores antes de
                confirmar novamente.
              </div>
            )}
            <label className="mt-4 flex items-start gap-2 text-[10px] leading-4 text-sand/55">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="mt-0.5 accent-[#e89045]"
              />
              Revisei os itens e autorizo a simulação deste pedido.
            </label>
            {order.isError && (
              <p role="alert" className="mt-3 text-xs text-red-300">
                {getErrorMessage(order.error)}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="mt-4 w-full"
              disabled={
                !accepted ||
                !connected ||
                !effectiveWalletId ||
                !quote.data?.items.length ||
                quote.isPending ||
                order.isPending ||
                acceptChanges.isPending
              }
            >
              {order.isPending
                ? "Enviando pedido…"
                : acceptChanges.isPending
                  ? "Atualizando cotação…"
                  : !quote.data?.items.length
                    ? "Carrinho vazio"
                    : reviewedVersion !== quote.data?.version
                      ? "Revisar valores"
                      : "Confirmar compra"}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-2 text-[9px] text-sand/35">
              <ShieldCheck size={12} />
              Envio idempotente e carteira simulada.
            </p>
          </aside>
        </form>
      </div>
    </>
  );
}
