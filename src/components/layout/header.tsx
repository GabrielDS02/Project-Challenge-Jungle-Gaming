import { Heart, LogOut, Menu, Search, ShoppingBag, UserRound, WalletCards } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/features/cart/queries";
import { useLogout, useSession } from "@/features/auth/queries";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PwaInstall } from "@/components/pwa-install";

const links = [
  ["Início", "/"],
  ["Descobrir", "/#catalogo"],
  ["Destaques", "/#destaques"],
  ["Aprenda", "/#manifesto"],
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const session = useSession();
  const logout = useLogout();
  const cart = useCart();
  const count = cart.data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-ink/88 backdrop-blur-xl">
      <div className="container flex h-[72px] items-center justify-between gap-5">
        <Link
          to="/"
          className="group flex items-center gap-2 font-display text-xl font-black tracking-[.18em] text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          <span className="grid size-9 place-items-center rounded-full border border-ember text-sm text-ember transition group-hover:bg-ember group-hover:text-ink">
            J
          </span>{" "}
          JUNGLE
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-[11px] font-bold uppercase tracking-[.15em] text-sand/60 transition hover:text-ember"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <PwaInstall className="hidden xl:inline-flex" />
          <a
            href="/#catalogo"
            aria-label="Buscar NFTs"
            className="hidden rounded p-2.5 text-sand/65 hover:bg-white/5 hover:text-ember sm:block"
          >
            <Search size={18} />
          </a>
          <Link
            to="/cart"
            aria-label={`Carrinho com ${count} itens`}
            className="relative rounded p-2.5 text-sand/65 hover:bg-white/5 hover:text-ember"
          >
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-ember text-[10px] font-black text-ink">
                {count}
              </span>
            )}
          </Link>
          {session.data ? (
            <div className="hidden items-center gap-1 md:flex">
              <Link
                to="/profile"
                className="rounded px-3 py-2 text-xs font-bold text-sand/70 hover:bg-white/5 hover:text-ember"
              >
                Olá, {session.data.name.split(" ")[0]}
              </Link>
              <button
                onClick={() => logout.mutate()}
                aria-label="Sair da conta"
                className="rounded p-2.5 text-sand/60 hover:bg-white/5 hover:text-ember"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/login" search={{ redirect: "/" }}>
                Entrar
              </Link>
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button aria-label="Abrir menu" className="rounded p-2.5 text-sand lg:hidden">
                <Menu size={20} />
              </button>
            </DialogTrigger>
            <DialogContent className="mobile-menu-sheet inset-y-0 left-auto right-0 top-0 h-[100dvh] max-h-none w-[min(88vw,380px)] max-w-none translate-x-0 translate-y-0 overflow-y-auto border-y-0 border-r-0 p-6 pt-20 sm:p-8 sm:pt-20">
              <DialogTitle>Menu</DialogTitle>
              <nav className="mt-8 grid gap-2" aria-label="Navegação móvel">
                {links.map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="border-b border-white/8 py-4 text-sm font-bold uppercase tracking-widest text-sand"
                  >
                    {label}
                  </a>
                ))}
                {session.data && (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 py-4 text-sm text-sand"
                    >
                      <UserRound size={18} /> Meu perfil
                    </Link>
                    <Link
                      to="/wallets"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 py-4 text-sm text-sand"
                    >
                      <WalletCards size={18} /> Carteiras
                    </Link>
                    <span className="flex items-center gap-3 py-4 text-sm text-sand/40">
                      <Heart size={18} /> Favoritos no catálogo
                    </span>
                  </>
                )}
              </nav>
              <PwaInstall mobile className="mt-6" />
              {session.data ? (
                <Button variant="secondary" className="mt-8 w-full" onClick={() => logout.mutate()}>
                  Sair
                </Button>
              ) : (
                <Button asChild className="mt-8 w-full">
                  <Link to="/login" search={{ redirect: "/" }}>
                    Entrar
                  </Link>
                </Button>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
