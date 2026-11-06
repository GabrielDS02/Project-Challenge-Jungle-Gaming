import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LockKeyhole, Save, UserRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { NftArtwork } from "@/components/nft-artwork";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { ErrorState, PageLoader } from "@/components/ui/feedback";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import type { Profile } from "@/types/api";

export function ProfilePage() {
  const client = useQueryClient();
  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get<Profile>("/profile")).data,
  });
  const [draft, setDraft] = useState<Partial<Profile>>({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const save = useMutation({
    mutationFn: async (input: Profile) => (await api.put<Profile>("/profile", input)).data,
    onSuccess: async (value) => {
      client.setQueryData(["profile"], value);
      setDraft({});
      await client.invalidateQueries({ queryKey: ["session"] });
    },
  });
  const password = useMutation({
    mutationFn: () => api.post("/profile/password", { currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
    },
  });
  if (profile.isPending) return <PageLoader />;
  if (profile.isError || !profile.data)
    return <ErrorState message={getErrorMessage(profile.error)} onRetry={() => void profile.refetch()} />;
  const data = { ...profile.data, ...draft };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate(data);
  };
  return (
    <>
      <Seo title="Perfil" description="Gerencie dados e avatar da conta fictícia de colecionador." />
      <div className="container py-12">
        <div className="flex items-center gap-3">
          <UserRound className="text-ember" />
          <div>
            <p className="eyebrow">Área do colecionador</p>
            <h1 className="section-title mt-2">Meu perfil</h1>
          </div>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit border border-white/8 bg-roast p-5">
            <NftArtwork index={data.avatarIndex} alt={`Avatar de ${data.name}`} />
            <p className="mt-4 text-center font-display text-xl">{data.name}</p>
            <p className="mt-1 text-center text-xs text-sand/40">{data.email}</p>
            <nav className="mt-6 border-t border-white/8 pt-4 text-sm">
              <a href="#dados" className="block border-l-2 border-ember px-3 py-2 text-ember">
                Perfil do colecionador
              </a>
              <a
                href="/wallets"
                className="block border-l-2 border-transparent px-3 py-2 text-sand/50 hover:text-sand"
              >
                Carteiras
              </a>
            </nav>
          </aside>
          <div className="space-y-6">
            <form id="dados" onSubmit={submit} className="border border-white/8 bg-roast p-6 sm:p-8">
              <h2 className="font-display text-2xl">Informações pessoais</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field id="profile-name" label="Nome">
                  <Input
                    id="profile-name"
                    value={data.name}
                    onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                    required
                  />
                </Field>
                <Field id="profile-email" label="E-mail" hint="O e-mail da conta demo não pode ser alterado.">
                  <Input id="profile-email" type="email" value={data.email} readOnly />
                </Field>
                <Field id="profile-phone" label="Telefone">
                  <Input
                    id="profile-phone"
                    value={data.phone}
                    onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
                  />
                </Field>
                <Field id="profile-country" label="País">
                  <Input
                    id="profile-country"
                    value={data.country}
                    onChange={(event) => setDraft({ ...draft, country: event.target.value })}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field id="profile-bio" label="Bio">
                    <Input
                      id="profile-bio"
                      value={data.bio}
                      onChange={(event) => setDraft({ ...draft, bio: event.target.value })}
                    />
                  </Field>
                </div>
              </div>
              <fieldset className="mt-7">
                <legend className="text-[11px] font-bold uppercase tracking-widest text-sand/65">
                  Escolha seu avatar
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.from({ length: 8 }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Usar avatar ${index + 1}`}
                      aria-pressed={data.avatarIndex === index}
                      onClick={() => setDraft({ ...draft, avatarIndex: index })}
                      className={`w-16 border-2 p-1 ${data.avatarIndex === index ? "border-ember" : "border-transparent hover:border-white/25"}`}
                    >
                      <NftArtwork index={index} alt="" />
                    </button>
                  ))}
                </div>
              </fieldset>
              {save.isError && (
                <p role="alert" className="mt-4 text-sm text-red-300">
                  {getErrorMessage(save.error)}
                </p>
              )}
              {save.isSuccess && (
                <p role="status" className="mt-4 text-sm text-emerald-300">
                  Perfil atualizado com sucesso.
                </p>
              )}
              <Button className="mt-7" disabled={save.isPending}>
                <Save size={16} />
                {save.isPending ? "Salvando…" : "Salvar alterações"}
              </Button>
            </form>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                password.mutate();
              }}
              className="border border-white/8 bg-roast p-6 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <LockKeyhole className="text-ember" />
                <h2 className="font-display text-2xl">Alterar senha</h2>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field id="current-password" label="Senha atual">
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required
                  />
                </Field>
                <Field id="new-password" label="Nova senha">
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    minLength={8}
                    required
                  />
                </Field>
              </div>
              {password.isError && (
                <p role="alert" className="mt-4 text-sm text-red-300">
                  {getErrorMessage(password.error)}
                </p>
              )}
              {password.isSuccess && (
                <p role="status" className="mt-4 text-sm text-emerald-300">
                  Senha atualizada. O mock armazena apenas o hash demonstrativo.
                </p>
              )}
              <Button className="mt-6" variant="secondary" disabled={password.isPending}>
                Atualizar senha
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
