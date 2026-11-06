import { Github, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/8 bg-black/15">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <p className="font-display text-2xl font-bold tracking-[.16em]">JUNGLE</p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-sand/45">
            Arte digital com personalidade. Uma experiência simulada criada para o desafio Frontend da Jungle
            Gaming.
          </p>
        </div>
        {[
          ["Marketplace", ["Início", "Coleções", "Criadores"]],
          ["Conta", ["Meu perfil", "Carteiras", "Pedidos"]],
          ["Ajuda", ["Documentação", "Acessibilidade", "Cenários mock"]],
        ].map(([title, items]) => (
          <div key={title as string}>
            <p className="eyebrow">{title as string}</p>
            <ul className="mt-4 space-y-3 text-sm text-sand/50">
              {(items as string[]).map((item) => (
                <li key={item}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container flex flex-col gap-4 border-t border-white/8 py-6 text-xs text-sand/35 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Jungle Marketplace. Projeto demonstrativo.</p>
        <div className="flex gap-3" aria-label="Redes sociais">
          <Github size={16} />
          <Linkedin size={16} />
          <Instagram size={16} />
        </div>
      </div>
    </footer>
  );
}
