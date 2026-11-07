import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Plus, WalletCards } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState, ErrorState, PageLoader } from "@/components/ui/feedback";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { api } from "@/lib/api";
import { getErrorMessage, shortAddress } from "@/lib/utils";
import type { Network, Wallet } from "@/types/api";

export function WalletsPage() {
  const client = useQueryClient();
  const wallets = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => (await api.get<{ items: Wallet[] }>("/wallets")).data.items,
  });
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState<Network>("ethereum");
  const [primary, setPrimary] = useState(false);
  const create = useMutation({
    mutationFn: async () => (await api.post<Wallet>("/wallets", { label, address, network, primary })).data,
    onSuccess: async () => {
      setOpen(false);
      setLabel("");
      setAddress("");
      await client.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
  const makePrimary = useMutation({
    mutationFn: (wallet: Wallet) => api.put(`/wallets/${wallet.id}`, { primary: true }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["wallets"] }),
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate();
  };
  if (wallets.isPending) return <PageLoader />;
  if (wallets.isError)
    return <ErrorState message={getErrorMessage(wallets.error)} onRetry={() => void wallets.refetch()} />;
  return (
    <>
      <Seo
        title="Carteiras"
        description="Cadastre e escolha carteiras fictícias para a simulação de checkout."
      />
      <div className="container py-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Conta do colecionador</p>
            <h1 className="section-title mt-3">Carteiras</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-sand/50">
              Endereços EVM fictícios usados apenas para demonstrar a experiência de pagamento.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} />
                Adicionar carteira
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Nova carteira</DialogTitle>
              <DialogDescription>
                Cadastre um endereço EVM fictício. Nenhuma conexão blockchain real será feita.
              </DialogDescription>
              <form onSubmit={submit} className="mt-7 space-y-5">
                <Field id="wallet-label" label="Nome da carteira">
                  <Input
                    id="wallet-label"
                    value={label}
                    onChange={(event) => setLabel(event.target.value)}
                    placeholder="Ex.: Carteira principal"
                    required
                  />
                </Field>
                <Field
                  id="wallet-address"
                  label="Endereço"
                  error={create.isError ? getErrorMessage(create.error) : undefined}
                >
                  <Input
                    id="wallet-address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="0x…"
                    pattern="^0x[a-fA-F0-9]{40}$"
                    required
                    error={create.isError}
                  />
                </Field>
                <Field id="wallet-network" label="Rede">
                  <SelectField
                    id="wallet-network"
                    ariaLabel="Rede"
                    value={network}
                    options={[
                      { value: "ethereum", label: "Ethereum" },
                      { value: "polygon", label: "Polygon" },
                      { value: "arbitrum", label: "Arbitrum" },
                    ]}
                    onValueChange={setNetwork}
                  />
                </Field>
                <label className="flex items-center gap-3 text-sm text-sand/60">
                  <input
                    type="checkbox"
                    checked={primary}
                    onChange={(event) => setPrimary(event.target.checked)}
                    className="accent-[#e89045]"
                  />
                  Definir como principal
                </label>
                <Button className="w-full" disabled={create.isPending}>
                  {create.isPending ? "Salvando…" : "Salvar carteira"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {!wallets.data.length ? (
          <div className="mt-10">
            <EmptyState
              title="Nenhuma carteira cadastrada"
              message="Adicione uma carteira fictícia para concluir o checkout."
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {wallets.data.map((wallet) => (
              <article
                key={wallet.id}
                className={`relative overflow-hidden border p-6 ${wallet.primary ? "border-ember/50 bg-ember/5" : "border-white/8 bg-roast"}`}
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-full bg-ember/10 text-ember">
                    <WalletCards />
                  </span>
                  {wallet.primary && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-ember">
                      <Check size={13} />
                      Principal
                    </span>
                  )}
                </div>
                <h2 className="mt-6 font-display text-2xl">{wallet.label}</h2>
                <p className="mt-2 font-mono text-sm text-sand/55">{shortAddress(wallet.address)}</p>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-sand/35">
                  Rede {wallet.network}
                </p>
                {!wallet.primary && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-6"
                    onClick={() => makePrimary.mutate(wallet)}
                    disabled={makePrimary.isPending}
                  >
                    Tornar principal
                  </Button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
