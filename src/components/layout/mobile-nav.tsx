import { Heart, Home, ShoppingBag, UserRound } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useSession } from "@/features/auth/queries";
import { useCart } from "@/features/cart/queries";

/** Mobile navigation mirrors the compact bottom bar from the Figma frames. */
export function MobileNav() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const session = useSession();
  const cart = useCart();
  const count = cart.data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
  if (/^\/(login|register|cart|checkout|orders)(\/|$)/.test(pathname)) return null;
  return (
    <nav
      aria-label="Navegação móvel principal"
      className="fixed inset-x-0 bottom-0 z-40 grid h-[4.5rem] grid-cols-4 border-t border-ember/25 bg-ink/95 px-4 backdrop-blur-xl md:hidden"
    >
      <Link to="/" aria-label="Início" className="grid place-items-center text-sand/60 hover:text-ember">
        <Home size={19} />
      </Link>
      <a
        href="/#catalogo"
        aria-label="Lista de interesse"
        className="grid place-items-center text-sand/60 hover:text-ember"
      >
        <Heart size={19} />
      </a>
      <Link
        to="/cart"
        aria-label={`Carrinho mobile com ${count} itens`}
        className="relative grid place-items-center text-sand/60 hover:text-ember"
      >
        <ShoppingBag size={19} />
        {count > 0 && (
          <span className="absolute right-[30%] top-3 grid size-4 place-items-center rounded-full bg-ember text-[9px] font-black text-ink">
            {count}
          </span>
        )}
      </Link>
      <Link
        to={session.data ? "/profile" : "/login"}
        search={session.data ? undefined : { redirect: "/profile" }}
        aria-label={session.data ? "Meu perfil" : "Entrar"}
        className="grid place-items-center text-sand/60 hover:text-ember"
      >
        <UserRound size={19} />
      </Link>
    </nav>
  );
}
