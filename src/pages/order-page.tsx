import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { CheckCircle2, CircleX, Clock3, ExternalLink } from "lucide-react";
import { NftArtwork } from "@/components/nft-artwork";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { ErrorState, PageLoader } from "@/components/ui/feedback";
import { api } from "@/lib/api";
import { formatEth, getErrorMessage, shortAddress } from "@/lib/utils";
import type { Order } from "@/types/api";

export function OrderPage() {
  const { orderId } = useParams({ from: "/_authenticated/orders/$orderId" });
  const order = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => (await api.get<Order>(`/orders/${orderId}`)).data,
    refetchInterval: (query) => (query.state.data?.status === "pending" ? 1500 : false),
  });
  if (order.isPending) return <PageLoader label="Recuperando pedido" />;
  if (order.isError)
    return (
      <ErrorState
        title="Pedido indisponível"
        message={getErrorMessage(order.error)}
        onRetry={() => void order.refetch()}
      />
    );
  const data = order.data;
  const pending = data.status === "pending";
  const confirmed = data.status === "confirmed";
  return (
    <>
      <Seo title={`Pedido ${data.id}`} description={`Acompanhe o estado e o recibo do pedido ${data.id}.`} />
      <div className="container py-14">
        <section className="mx-auto max-w-3xl border border-white/8 bg-roast">
          <div className="p-7 text-center sm:p-10">
            {pending ? (
              <Clock3 className="mx-auto animate-pulse text-ember motion-reduce:animate-none" size={52} />
            ) : confirmed ? (
              <CheckCircle2 className="mx-auto text-emerald-300" size={52} />
            ) : (
              <CircleX className="mx-auto text-red-300" size={52} />
            )}
            <p className="eyebrow mt-5">Pedido {data.id}</p>
            <h1 className="mt-3 font-display text-4xl font-bold">
              {pending
                ? "Seu pedido está sendo confirmado"
                : confirmed
                  ? "A obra agora é sua"
                  : "Pagamento recusado"}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-sand/50">
              {pending
                ? "A simulação está processando a assinatura. Você pode recarregar ou voltar mais tarde sem criar outra compra."
                : confirmed
                  ? "A transação simulada foi confirmada e o recibo abaixo preserva o snapshot da compra."
                  : (data.refusalReason ??
                    "A carteira recusou a operação. Seus itens continuam no carrinho.")}
            </p>
          </div>
          <div className="border-t border-white/8 p-6 sm:p-8">
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-sand/35">Transação</p>
                <p className="mt-2 flex items-center gap-2 break-all text-sand/65">
                  {shortAddress(data.transactionId)}
                  <ExternalLink size={13} />
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-sand/35">Data</p>
                <p className="mt-2 text-sand/65">
                  {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(
                    new Date(data.createdAt),
                  )}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-sand/35">Carteira</p>
                <p className="mt-2 text-sand/65">
                  {data.wallet.label} · {shortAddress(data.wallet.address)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-sand/35">Status</p>
                <p className="mt-2 capitalize text-sand/65">{data.status}</p>
              </div>
            </div>
            <div className="mt-7 space-y-3 border-t border-white/8 pt-6">
              {data.quote.items.map((line) => (
                <div key={line.nftId} className="flex items-center gap-4">
                  <NftArtwork index={line.nft.imageIndex} alt={line.nft.name} className="size-16 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold">{line.nft.name}</p>
                    <p className="mt-1 text-xs text-sand/40">Quantidade {line.quantity}</p>
                  </div>
                  <p className="text-sm font-bold">{formatEth(line.nft.priceEth)}</p>
                </div>
              ))}
            </div>
            <dl className="mt-7 space-y-3 border-t border-white/8 pt-6 text-sm">
              <div className="flex justify-between text-sand/50">
                <dt>Subtotal</dt>
                <dd>{formatEth(data.quote.subtotalEth)}</dd>
              </div>
              <div className="flex justify-between text-sand/50">
                <dt>Desconto</dt>
                <dd>- {formatEth(data.quote.discountEth)}</dd>
              </div>
              <div className="flex justify-between text-sand/50">
                <dt>Taxa</dt>
                <dd>{formatEth(data.quote.networkFeeEth)}</dd>
              </div>
              <div className="flex justify-between pt-2 text-lg font-black">
                <dt>Total</dt>
                <dd className="text-ember">{formatEth(data.quote.totalEth)}</dd>
              </div>
            </dl>
          </div>
        </section>
        <div className="mt-8 flex justify-center">
          <Button asChild variant="secondary">
            <Link to="/">Voltar ao marketplace</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
