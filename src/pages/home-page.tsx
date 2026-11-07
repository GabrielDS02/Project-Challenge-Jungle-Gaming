import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Gem, ShieldCheck, Sparkles } from "lucide-react";
import { type FormEvent, useState } from "react";
import { NftArtwork } from "@/components/nft-artwork";
import { NftCard } from "@/components/nft-card";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { useSession } from "@/features/auth/queries";
import { nftsQueryOptions, useFavorites, type CatalogSearch } from "@/features/nfts/queries";

const filterOptions = {
  category: [
    ["all", "Todas as categorias"],
    ["art", "Arte"],
    ["collectible", "Colecionáveis"],
    ["gaming", "Gaming"],
  ],
  edition: [
    ["all", "Todas as edições"],
    ["unique", "Única"],
    ["limited", "Limitada"],
    ["open", "Aberta"],
  ],
  sort: [
    ["featured", "Destaques"],
    ["price-asc", "Menor preço"],
    ["price-desc", "Maior preço"],
    ["name", "Nome"],
  ],
} as const;

export function HomePage() {
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const [term, setTerm] = useState(search.search ?? "");
  const session = useSession();
  const favorites = useFavorites(Boolean(session.data));
  const nfts = useQuery(nftsQueryOptions(search));

  const updateSearch = (patch: Partial<CatalogSearch>, resetPage = true) =>
    navigate({
      search: (previous) => {
        const current = previous as CatalogSearch;
        return { ...current, ...patch, page: resetPage ? 1 : (patch.page ?? current.page) };
      },
    });
  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    void updateSearch({ search: term || undefined });
  };

  return (
    <>
      <Seo
        title="Descubra arte digital"
        description="Explore NFTs originais, filtre coleções e simule uma compra completa com segurança."
      />
      <section className="grain overflow-hidden border-b border-white/8">
        <div className="container grid min-h-[680px] items-center gap-10 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <div className="relative z-10 max-w-2xl">
            <p className="eyebrow">Arte digital · Propriedade simulada</p>
            <h1 className="mt-5 font-display text-[clamp(3.5rem,8vw,7.5rem)] font-bold leading-[.8] tracking-[-.065em] text-sand">
              SEJA DONO DO <span className="block text-ember">FUTURO</span> DA ARTE DIGITAL
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-7 text-sand/58 sm:text-base">
              Descubra peças raras, conheça novos criadores e construa uma coleção que atravessa mundos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#catalogo">
                  Explorar NFTs <ArrowRight size={16} />
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="#manifesto">Como funciona</a>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-6">
              <div>
                <dt className="text-2xl font-black text-sand">10k+</dt>
                <dd className="mt-1 text-[10px] uppercase tracking-widest text-sand/40">Obras</dd>
              </div>
              <div>
                <dt className="text-2xl font-black text-sand">4.8k</dt>
                <dd className="mt-1 text-[10px] uppercase tracking-widest text-sand/40">Colecionadores</dd>
              </div>
              <div>
                <dt className="text-2xl font-black text-sand">32k</dt>
                <dd className="mt-1 text-[10px] uppercase tracking-widest text-sand/40">Transações</dd>
              </div>
            </dl>
          </div>
          <div
            className="relative mx-auto w-full max-w-[570px] min-h-[480px]"
            aria-label="Coleção em destaque"
          >
            <div className="absolute right-[2%] top-[4%] w-[65%] rotate-3 border border-white/10 bg-bark p-2 shadow-2xl motion-safe:animate-float">
              <NftArtwork index={0} alt="Emerald Ape, obra em destaque" />
              <div className="flex items-center justify-between px-3 py-4">
                <div>
                  <p className="eyebrow">Peça em destaque</p>
                  <p className="mt-1 font-display text-xl">Emerald Ape #442</p>
                </div>
                <p className="text-sm font-black">2.49 ETH</p>
              </div>
            </div>
            <div className="absolute bottom-[8%] left-[2%] w-[38%] -rotate-6 border-4 border-ink shadow-2xl">
              <NftArtwork index={2} alt="Sunset Oracle" />
            </div>
            <div className="absolute bottom-[3%] right-[6%] w-[32%] rotate-6 border-4 border-ink shadow-2xl">
              <NftArtwork index={6} alt="Turquoise Rebel" />
            </div>
            <span className="absolute left-[8%] top-[9%] grid size-24 place-items-center rounded-full border border-ember/50 bg-ember text-center text-[10px] font-black uppercase tracking-widest text-ink shadow-glow">
              Edição
              <br />
              limitada
            </span>
          </div>
        </div>
      </section>

      <section id="destaques" className="container py-20">
        <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr] lg:items-end">
          <div>
            <p className="eyebrow">Curadoria da semana</p>
            <h2 className="section-title mt-3">Do raro ao inesquecível.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-sand/50 lg:ml-auto">
            Uma seleção de identidades digitais com acabamento editorial, criada para demonstrar navegação,
            estados e comércio resiliente.
          </p>
        </div>
      </section>

      <section id="catalogo" className="container scroll-mt-24 pb-16">
        <div className="mb-8 flex flex-col gap-5 border-y border-white/10 py-5">
          <form onSubmit={onSearch} role="search" className="flex gap-2">
            <Input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Busque por obra, coleção ou artista"
              aria-label="Buscar no catálogo"
            />
            <Button type="submit">Buscar</Button>
          </form>
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(filterOptions) as Array<keyof typeof filterOptions>).map((key) => (
              <label
                key={key}
                className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-sand/45"
              >
                <span>{key === "category" ? "Categoria" : key === "edition" ? "Edição" : "Ordenar"}</span>
                <SelectField
                  ariaLabel={key === "category" ? "Categoria" : key === "edition" ? "Edição" : "Ordenar"}
                  value={(search[key] as string) ?? filterOptions[key][0][0]}
                  options={filterOptions[key].map(([value, label]) => ({ value, label }))}
                  onValueChange={(value) => void updateSearch({ [key]: value } as CatalogSearch)}
                />
              </label>
            ))}
          </div>
        </div>
        {nfts.isPending ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Carregando catálogo">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="border border-white/8 bg-roast p-4">
                <Skeleton className="aspect-square h-auto" />
                <Skeleton className="mt-5 h-5 w-2/3" />
                <Skeleton className="mt-3 h-10" />
              </div>
            ))}
          </div>
        ) : nfts.isError ? (
          <ErrorState message="Não foi possível carregar o catálogo." onRetry={() => void nfts.refetch()} />
        ) : !nfts.data.items.length ? (
          <EmptyState title="Nada por aqui ainda" message="Tente remover filtros ou buscar outro termo." />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {nfts.data.items.map((nft) => (
                <NftCard key={nft.id} nft={nft} favorite={favorites.data?.includes(nft.id)} />
              ))}
            </div>
            <nav aria-label="Paginação do catálogo" className="mt-10 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                disabled={nfts.data.page <= 1}
                onClick={() => void updateSearch({ page: nfts.data.page - 1 }, false)}
              >
                Anterior
              </Button>
              <span className="px-3 text-xs text-sand/55">
                Página {nfts.data.page} de {nfts.data.totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={nfts.data.page >= nfts.data.totalPages}
                onClick={() => void updateSearch({ page: nfts.data.page + 1 }, false)}
              >
                Próxima
              </Button>
            </nav>
          </>
        )}
      </section>

      <section id="manifesto" className="bg-roast/70 py-20">
        <div className="container">
          <p className="eyebrow text-center">Uma jornada segura</p>
          <h2 className="section-title mx-auto mt-3 max-w-3xl text-center">Colecione em três movimentos.</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              [Gem, "Descubra o raro", "Combine busca, categoria, edição e ordenação sem perder seu lugar."],
              [
                BadgeCheck,
                "Revise cada detalhe",
                "Preço, disponibilidade e autenticidade simulada ficam claros antes da decisão.",
              ],
              [
                ShieldCheck,
                "Confirme com segurança",
                "Cotação revalidada, chave idempotente e recuperação impedem compras duplicadas.",
              ],
            ].map(([Icon, title, text], index) => (
              <article key={title as string} className="border border-white/8 bg-ink/50 p-7">
                <div className="flex items-center justify-between">
                  <Icon className="text-ember" />
                  <span className="font-display text-4xl text-white/8">0{index + 1}</span>
                </div>
                <h3 className="mt-8 font-display text-2xl">{title as string}</h3>
                <p className="mt-3 text-sm leading-6 text-sand/50">{text as string}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="container py-20">
        <div className="relative overflow-hidden border border-ember/25 bg-ember px-6 py-12 text-ink sm:px-12">
          <Sparkles className="absolute right-6 top-6 opacity-35" />
          <p className="text-xs font-black uppercase tracking-[.22em]">Pronto para explorar?</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-none sm:text-6xl">
            Sua próxima obra favorita já está na selva.
          </h2>
          <Button asChild className="mt-8 bg-ink text-sand hover:bg-bark">
            <a href="#catalogo">Ver coleção</a>
          </Button>
        </div>
      </section>
    </>
  );
}
