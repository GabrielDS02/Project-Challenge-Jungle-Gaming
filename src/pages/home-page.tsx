import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
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
    ["gaming", "Jogos"],
  ],
  edition: [
    ["all", "Todas as edições"],
    ["unique", "Única"],
    ["limited", "Limitada"],
    ["open", "Aberta"],
  ],
  sort: [
    ["featured", "Listados recentemente"],
    ["price-asc", "Menor preço"],
    ["price-desc", "Maior preço"],
    ["name", "Nome"],
  ],
} as const;

const categories = [
  ["Arte digital", "33", "art"],
  ["Fotografia", "12", "art"],
  ["Música", "65", "all"],
  ["Arte 3D", "39", "collectible"],
  ["Colecionáveis", "23", "collectible"],
  ["Generativa", "17", "art"],
  ["Jogos", "19", "gaming"],
  ["Assinaturas", "13", "all"],
  ["Utilidade", "18", "all"],
] as const;

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
        title="Marketplace de arte digital"
        description="Explore coleções digitais, filtre NFTs e conclua uma compra simulada de ponta a ponta."
      />
      <section className="grain border-b border-ember/15">
        <div className="container grid min-h-[430px] items-center gap-10 py-10 lg:grid-cols-[1fr_370px]">
          <div className="max-w-2xl">
            <p className="figma-label">Bem-vindo à Kurio</p>
            <h1 className="mt-5 font-display text-[clamp(2.5rem,5.3vw,5rem)] font-black uppercase leading-[.96] tracking-[-.08em] text-sand">
              SEJA DONO DO FUTURO
              <br />
              <span className="text-ember">DA ARTE DIGITAL</span>
            </h1>
            <p className="mt-5 max-w-xl text-xs leading-6 text-sand/55">
              Descubra NFTs selecionados de criadores independentes, acompanhe tendências e construa uma
              coleção com identidade.
            </p>
            <Button asChild className="mt-7">
              <a href="#catalogo">
                Explorar <ArrowRight size={15} />
              </a>
            </Button>
          </div>
          <div className="relative mx-auto w-full max-w-[370px]">
            <div className="overflow-hidden rounded-[18px] border border-ember/25 bg-roast p-2 shadow-2xl">
              <NftArtwork index={0} alt="Emerald Ape, obra de destaque" className="rounded-[12px]" />
            </div>
            <div className="absolute -bottom-5 -left-5 border border-ember/25 bg-ink/95 px-5 py-4 shadow-xl">
              <p className="figma-label">Destaque da semana</p>
              <p className="mt-1 text-sm font-black">Emerald Ape #442</p>
              <p className="mt-1 text-xs text-ember">2.49 ETH</p>
            </div>
          </div>
        </div>
      </section>

      <section id="catalogo" className="container scroll-mt-20 py-14">
        <form onSubmit={onSearch} role="search" className="mb-6 flex gap-2">
          <Input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Explorar coleções"
            aria-label="Buscar no catálogo"
          />
          <Button type="submit" aria-label="Buscar">
            <Search size={16} />
          </Button>
        </form>
        <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="figma-panel hidden h-fit p-5 lg:block" aria-label="Filtros do mercado">
            <h2 className="text-xs font-black">Coleções</h2>
            <ul className="mt-4 space-y-3">
              {categories.map(([label, count, value]) => (
                <li key={label} className="flex items-center justify-between text-[10px]">
                  <button
                    onClick={() => void updateSearch({ category: value })}
                    className={`text-left hover:text-ember ${search.category === value ? "text-ember" : "text-sand/55"}`}
                  >
                    {label}
                  </button>
                  <span className="text-ember">({count})</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-ember/20 pt-5">
              <h2 className="text-xs font-black">Faixa de preço</h2>
              <div className="relative mt-5 h-px bg-ember/40">
                <span className="absolute -top-1 left-[35%] size-2 rounded-full bg-ember" />
                <span className="absolute -top-1 left-[72%] size-2 rounded-full bg-ember" />
              </div>
              <p className="mt-4 text-[9px] text-sand/50">Preço: 0,02 – 12,38 ETH</p>
            </div>
            <div className="mt-6 border-t border-ember/20 pt-5">
              <h2 className="text-xs font-black">Rede</h2>
              <p className="mt-3 text-[10px] leading-7 text-sand/50">
                Ethereum <span className="float-right">(119)</span>
                <br />
                Polygon <span className="float-right">(78)</span>
                <br />
                Solana <span className="float-right">(86)</span>
              </p>
            </div>
          </aside>
          <div className="min-w-0">
            <div className="mb-6 flex flex-col gap-4 border-b border-ember/15 pb-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {(Object.keys(filterOptions) as Array<keyof typeof filterOptions>).map((key) => (
                  <label
                    key={key}
                    className="grid gap-2 text-[9px] font-black uppercase tracking-wider text-sand/45"
                  >
                    <span className="flex items-center gap-2">
                      {key === "category" ? "Categoria" : key === "edition" ? "Edição" : "Ordenar"}
                      {key !== "sort" && <SlidersHorizontal size={11} />}
                    </span>
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
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Carregando catálogo">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="figma-panel p-3">
                    <Skeleton className="aspect-square h-auto" />
                    <Skeleton className="mt-4 h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : nfts.isError ? (
              <ErrorState
                message="Não foi possível carregar o catálogo."
                onRetry={() => void nfts.refetch()}
              />
            ) : !nfts.data.items.length ? (
              <EmptyState
                title="Nada por aqui ainda"
                message="Tente remover filtros ou buscar outro termo."
              />
            ) : (
              <>
                <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                  {nfts.data.items.map((nft) => (
                    <NftCard key={nft.id} nft={nft} favorite={favorites.data?.includes(nft.id)} />
                  ))}
                </div>
                <nav
                  aria-label="Paginação do catálogo"
                  className="mt-10 flex items-center justify-center gap-2"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={nfts.data.page <= 1}
                    onClick={() => void updateSearch({ page: nfts.data.page - 1 }, false)}
                  >
                    Anterior
                  </Button>
                  <span className="grid size-8 place-items-center bg-ember text-xs font-black text-ink">
                    {nfts.data.page}
                  </span>
                  <span className="px-2 text-[10px] text-sand/45">de {nfts.data.totalPages}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={nfts.data.page >= nfts.data.totalPages}
                    onClick={() => void updateSearch({ page: nfts.data.page + 1 }, false)}
                  >
                    Próxima
                  </Button>
                </nav>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="criadores" className="container grid gap-5 py-8 md:grid-cols-2">
        <article className="figma-panel grid grid-cols-[140px_1fr] overflow-hidden sm:grid-cols-[220px_1fr]">
          <NftArtwork index={0} alt="Lançamento Emerald Tribe" />
          <div className="p-5 sm:p-8">
            <p className="figma-label text-ember">Lançamento da coleção</p>
            <h2 className="mt-3 text-xl font-black">Da coleção para o mundo</h2>
            <p className="mt-3 text-[10px] leading-5 text-sand/50">
              Conheça a nova temporada Emerald Tribe e seus criadores.
            </p>
            <a href="#catalogo" className="mt-5 inline-flex text-[10px] font-black text-ember">
              Explorar →
            </a>
          </div>
        </article>
        <article className="figma-panel grid grid-cols-[1fr_140px] overflow-hidden sm:grid-cols-[1fr_220px]">
          <div className="p-5 sm:p-8">
            <p className="figma-label text-ember">Arte digital</p>
            <h2 className="mt-3 text-xl font-black">Identidade que atravessa redes</h2>
            <p className="mt-3 text-[10px] leading-5 text-sand/50">
              Obras com procedência simulada e uma experiência de compra completa.
            </p>
            <a href="#catalogo" className="mt-5 inline-flex text-[10px] font-black text-ember">
              Descobrir →
            </a>
          </div>
          <NftArtwork index={2} alt="Arte digital em destaque" />
        </article>
      </section>

      <section id="diario" className="container py-14">
        <p className="figma-label text-center">Diário da Cunhagem</p>
        <h2 className="mt-3 text-center text-xl font-black">
          Histórias, guias e artistas que transformam a cultura digital.
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [2, "Como funciona a propriedade de NFT"],
            [0, "10 artistas digitais para acompanhar"],
            [4, "Do portfólio à primeira coleção"],
            [6, "Como proteger sua carteira"],
          ].map(([index, title]) => (
            <article key={title as string} className="figma-panel overflow-hidden">
              <NftArtwork index={index as number} alt={title as string} />
              <div className="p-4">
                <p className="text-xs font-black">{title as string}</p>
                <p className="mt-2 text-[9px] leading-4 text-sand/45">
                  Conteúdo editorial demonstrativo alinhado ao universo visual do desafio.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
