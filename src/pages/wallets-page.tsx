import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, WalletCards } from "lucide-react";
import { type FormEvent, useState } from "react";
import { AccountNavigation } from "@/components/layout/account-navigation";
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

const emptyDraft = { label: "", address: "", network: "ethereum" as Network, primary: false };

export function WalletsPage() {
  const client = useQueryClient();
  const wallets = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => (await api.get<{ items: Wallet[] }>("/wallets")).data.items,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Wallet | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [primaryDraft, setPrimaryDraft] = useState<Partial<Wallet>>({});
  const primaryWallet = wallets.data?.find((wallet) => wallet.primary);

  const saveWallet = useMutation({
    mutationFn: async () =>
      editing
        ? (await api.put<Wallet>(`/wallets/${editing.id}`, draft)).data
        : (await api.post<Wallet>("/wallets", draft)).data,
    onSuccess: async () => {
      setOpen(false);
      setEditing(null);
      setDraft(emptyDraft);
      await client.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
  const updatePrimary = useMutation({
    mutationFn: async () => {
      if (!primaryWallet) return;
      return (
        await api.put<Wallet>(`/wallets/${primaryWallet.id}`, {
          ...primaryWallet,
          ...primaryDraft,
          primary: true,
        })
      ).data;
    },
    onSuccess: async () => {
      setPrimaryDraft({});
      await client.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
  const makePrimary = useMutation({
    mutationFn: (wallet: Wallet) => api.put(`/wallets/${wallet.id}`, { primary: true }),
    onSuccess: () => {
      setPrimaryDraft({});
      return client.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
  const launchCreate = () => {
    setEditing(null);
    setDraft(emptyDraft);
    setOpen(true);
  };
  const launchEdit = (wallet: Wallet) => {
    setEditing(wallet);
    setDraft({
      label: wallet.label,
      address: wallet.address,
      network: wallet.network,
      primary: wallet.primary,
    });
    setOpen(true);
  };
  const submitDialog = (event: FormEvent) => {
    event.preventDefault();
    saveWallet.mutate();
  };
  if (wallets.isPending) return <PageLoader />;
  if (wallets.isError)
    return <ErrorState message={getErrorMessage(wallets.error)} onRetry={() => void wallets.refetch()} />;
  const primaryValue = primaryWallet ? { ...primaryWallet, ...primaryDraft } : null;

  return (
    <>
      <Seo title="Carteiras" description="Cadastre e edite carteiras fictícias principais e secundárias." />
      <div className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
          <AccountNavigation active="wallets" />
          <main className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-base font-black">Carteira principal</h1>
                <p className="mt-1 text-[9px] text-sand/45">
                  Esta carteira fica disponível no pagamento e no recebimento dos NFTs comprados.
                </p>
              </div>
              <Button size="sm" onClick={launchCreate}>
                <Plus size={14} />
                Adicionar carteira
              </Button>
            </div>
            {primaryValue ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  updatePrimary.mutate();
                }}
                className="mt-6 grid gap-4 sm:grid-cols-2"
              >
                <Field id="primary-wallet-label" label="Apelido da carteira">
                  <Input
                    id="primary-wallet-label"
                    value={primaryValue.label}
                    onChange={(event) => setPrimaryDraft({ ...primaryDraft, label: event.target.value })}
                    required
                  />
                </Field>
                <Field id="primary-wallet-network" label="Rede">
                  <SelectField
                    id="primary-wallet-network"
                    ariaLabel="Rede da carteira principal"
                    value={primaryValue.network}
                    options={[
                      { value: "ethereum", label: "Ethereum" },
                      { value: "polygon", label: "Polygon" },
                      { value: "arbitrum", label: "Arbitrum" },
                    ]}
                    onValueChange={(value) => setPrimaryDraft({ ...primaryDraft, network: value as Network })}
                  />
                </Field>
                <Field id="primary-wallet-address" label="Endereço da carteira">
                  <Input
                    id="primary-wallet-address"
                    value={primaryValue.address}
                    onChange={(event) => setPrimaryDraft({ ...primaryDraft, address: event.target.value })}
                    pattern="^0x[a-fA-F0-9]{40}$"
                    required
                  />
                </Field>
                <Field id="primary-wallet-type" label="Tipo de carteira">
                  <Input id="primary-wallet-type" value="Autocustódia" readOnly />
                </Field>
                <Field id="primary-wallet-email" label="E-mail">
                  <Input id="primary-wallet-email" type="email" defaultValue="ada@jungle.test" required />
                </Field>
                <Field id="primary-wallet-ens" label="Nome ENS">
                  <Input id="primary-wallet-ens" placeholder="ada.eth (opcional)" />
                </Field>
                {updatePrimary.isError && (
                  <p role="alert" className="sm:col-span-2 text-xs text-red-300">
                    {getErrorMessage(updatePrimary.error)}
                  </p>
                )}
                {updatePrimary.isSuccess && (
                  <p role="status" className="sm:col-span-2 text-xs text-emerald-300">
                    Carteira principal atualizada.
                  </p>
                )}
                <Button className="w-fit" disabled={updatePrimary.isPending}>
                  {updatePrimary.isPending ? "Salvando…" : "Salvar carteira"}
                </Button>
              </form>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="Nenhuma carteira principal"
                  message="Adicione uma carteira para habilitar o checkout."
                />
              </div>
            )}

            <section className="mt-10 border-t border-ember/20 pt-7">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black">Carteira secundária</h2>
                  <p className="mt-1 text-[9px] text-sand/40">
                    Você ainda pode adicionar uma carteira secundária.
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={launchCreate}>
                  <Plus size={14} />
                  Adicionar
                </Button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {wallets.data
                  .filter((wallet) => !wallet.primary)
                  .map((wallet) => (
                    <article key={wallet.id} className="figma-panel p-4">
                      <div className="flex items-center justify-between">
                        <span className="grid size-9 place-items-center border border-ember/25 text-ember">
                          <WalletCards size={17} />
                        </span>
                        <button
                          onClick={() => launchEdit(wallet)}
                          aria-label={`Editar ${wallet.label}`}
                          className="p-2 text-sand/45 hover:text-ember"
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                      <h3 className="mt-4 text-xs font-black">{wallet.label}</h3>
                      <p className="mt-1 text-[9px] text-sand/45">
                        {shortAddress(wallet.address)} · {wallet.network}
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-4"
                        onClick={() => makePrimary.mutate(wallet)}
                        disabled={makePrimary.isPending}
                      >
                        <Check size={13} />
                        Tornar principal
                      </Button>
                    </article>
                  ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span className="hidden" />
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{editing ? "Editar carteira" : "Nova carteira"}</DialogTitle>
          <DialogDescription>
            Use um endereço EVM fictício. Nenhuma conexão blockchain real será feita.
          </DialogDescription>
          <form onSubmit={submitDialog} className="mt-7 space-y-5">
            <Field id="wallet-label" label="Nome da carteira">
              <Input
                id="wallet-label"
                value={draft.label}
                onChange={(event) => setDraft({ ...draft, label: event.target.value })}
                required
              />
            </Field>
            <Field
              id="wallet-address"
              label="Endereço"
              error={saveWallet.isError ? getErrorMessage(saveWallet.error) : undefined}
            >
              <Input
                id="wallet-address"
                value={draft.address}
                onChange={(event) => setDraft({ ...draft, address: event.target.value })}
                placeholder="0x…"
                pattern="^0x[a-fA-F0-9]{40}$"
                required
                error={saveWallet.isError}
              />
            </Field>
            <Field id="wallet-network" label="Rede">
              <SelectField
                id="wallet-network"
                ariaLabel="Rede"
                value={draft.network}
                options={[
                  { value: "ethereum", label: "Ethereum" },
                  { value: "polygon", label: "Polygon" },
                  { value: "arbitrum", label: "Arbitrum" },
                ]}
                onValueChange={(value) => setDraft({ ...draft, network: value as Network })}
              />
            </Field>
            <label className="flex items-center gap-3 text-xs text-sand/60">
              <input
                type="checkbox"
                checked={draft.primary}
                onChange={(event) => setDraft({ ...draft, primary: event.target.checked })}
                className="accent-[#e89045]"
              />
              Definir como principal
            </label>
            <Button className="w-full" disabled={saveWallet.isPending}>
              {saveWallet.isPending ? "Salvando…" : "Salvar carteira"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
