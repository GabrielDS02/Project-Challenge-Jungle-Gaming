import { Archive, Heart, HelpCircle, History, LogOut, Tag, UserRound, WalletCards } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useLogout } from "@/features/auth/queries";

const outsideScope = [
  [History, "Atividade"],
  [Heart, "Lista de interesse"],
  [Tag, "Ofertas"],
  [Archive, "Arquivos baixados"],
  [HelpCircle, "Suporte"],
] as const;

/** Shared profile rail. Mandatory routes are links; out-of-scope items are explicitly unavailable. */
export function AccountNavigation({ active }: { active: "profile" | "wallets" }) {
  const logout = useLogout();
  const navigate = useNavigate();
  const signOut = () => logout.mutate(undefined, { onSuccess: () => void navigate({ to: "/" }) });
  const itemClass = "flex shrink-0 items-center gap-2 px-3 py-2 text-[10px] transition";
  return (
    <aside className="min-w-0 max-w-full h-fit overflow-hidden border border-ember/20 bg-roast/45 p-4 lg:sticky lg:top-20">
      <h2 className="mb-3 text-xs font-black">Meu perfil</h2>
      <nav aria-label="Área do colecionador" className="flex max-w-full gap-1 overflow-x-auto lg:grid">
        <Link
          to="/profile"
          className={`${itemClass} ${active === "profile" ? "bg-ember/10 text-ember" : "text-sand/55 hover:text-ember"}`}
        >
          <UserRound size={14} />
          Dados do perfil
        </Link>
        <Link
          to="/wallets"
          className={`${itemClass} ${active === "wallets" ? "bg-ember/10 text-ember" : "text-sand/55 hover:text-ember"}`}
        >
          <WalletCards size={14} />
          Carteiras
        </Link>
        {outsideScope.map(([Icon, label]) => (
          <span
            key={label}
            aria-disabled="true"
            title="Fora do escopo definido no README"
            className={`${itemClass} cursor-help text-sand/30`}
          >
            <Icon size={14} />
            {label}
          </span>
        ))}
        <button
          type="button"
          onClick={signOut}
          disabled={logout.isPending}
          className={`${itemClass} text-left text-ember hover:bg-ember/10`}
        >
          <LogOut size={14} />
          Sair
        </button>
      </nav>
    </aside>
  );
}
