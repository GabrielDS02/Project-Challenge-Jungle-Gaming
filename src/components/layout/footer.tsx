import { BellRing, Github, Instagram, Linkedin, ShieldCheck, UsersRound } from "lucide-react";
import { type FormEvent, useState } from "react";

const footerGroups = [
  [
    "Meu perfil",
    [
      ["Meu perfil", "/profile"],
      ["Minha coleção", "/#catalogo"],
      ["Atividade", "https://github.com/GabrielDS02/Project-Challenge-Jungle-Gaming/activity"],
      ["Lista de interesse", "/#catalogo"],
    ],
  ],
  [
    "Central de ajuda",
    [
      ["Como comprar NFTs", "/#diario"],
      ["Carteira e segurança", "/wallets"],
      [
        "Política do mercado",
        "https://github.com/GabrielDS02/Project-Challenge-Jungle-Gaming/blob/main/SECURITY.md",
      ],
      ["Denunciar item", "mailto:contato@kurio.test?subject=Denunciar%20item"],
    ],
  ],
  [
    "Coleções",
    [
      ["Arte digital", "/?category=art"],
      ["Colecionáveis", "/?category=collectible"],
      ["Jogos", "/?category=gaming"],
      ["Utilidade", "/#catalogo"],
    ],
  ],
] as const;

/** Dense marketplace footer reproduced from the desktop frames. */
export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const subscribe = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };
  return (
    <footer className="mt-16 border-t border-ember/20 bg-[#1d100b]">
      <section
        className="container grid gap-0 border-x border-ember/15 lg:grid-cols-4"
        aria-label="Benefícios e novidades"
      >
        {[
          [
            ShieldCheck,
            "Segurança da carteira",
            "Proteja sua carteira e colecione arte digital verificada com confiança.",
          ],
          [
            UsersRound,
            "Criadores em destaque",
            "Conheça artistas, estúdios e comunidades que moldam a cultura digital.",
          ],
          [
            BellRing,
            "Alertas de lançamentos",
            "Receba calendários de cunhagem, novidades e listas de acesso.",
          ],
        ].map(([Icon, title, description]) => (
          <article key={title as string} className="border-b border-ember/20 p-6 lg:border-b-0 lg:border-r">
            <Icon className="text-ember" size={24} />
            <h2 className="mt-4 text-sm font-black text-sand">{title as string}</h2>
            <p className="mt-2 text-[11px] leading-5 text-sand/75">{description as string}</p>
          </article>
        ))}
        <form onSubmit={subscribe} className="p-6">
          <h2 className="text-sm font-black">Antecipe-se ao próximo lançamento</h2>
          {subscribed ? (
            <p role="status" className="mt-4 text-xs text-emerald-300">
              E-mail cadastrado para a demonstração.
            </p>
          ) : (
            <div className="mt-4 flex">
              <input
                aria-label="Receber novidades"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="digite seu e-mail..."
                className="min-w-0 flex-1 border border-ember/25 bg-ink px-3 py-2 text-xs text-sand outline-none focus:border-ember"
              />
              <button className="bg-ember px-3 text-[10px] font-black text-ink">Enviar</button>
            </div>
          )}
          <p className="mt-3 text-[10px] leading-4 text-sand/70">
            Receba apenas novidades da experiência demonstrativa.
          </p>
        </form>
      </section>
      <div className="border-y border-ember/15 bg-[#2a160d]">
        <div className="container grid gap-5 py-5 text-[10px] text-sand/65 sm:grid-cols-4">
          <strong className="tracking-[.18em] text-sand">KURIO</strong>
          <span>
            Feito para colecionadores,
            <br />
            criadores e cultura.
          </span>
          <a href="mailto:contato@kurio.test" className="hover:text-ember">
            contato@kurio.test
          </a>
          <span>+55 11 4002 8922</span>
        </div>
      </div>
      <div className="container grid gap-8 py-9 md:grid-cols-4">
        {footerGroups.map(([title, items]) => (
          <nav key={title} aria-label={title}>
            <h2 className="text-xs font-black">{title}</h2>
            <ul className="mt-3 space-y-1 text-[10px] text-sand/75">
              {items.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="inline-flex min-h-6 items-center hover:text-ember">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <h2 className="text-xs font-black">Redes sociais</h2>
          <div className="mt-3 flex gap-2">
            <a
              href="https://github.com/GabrielDS02/Project-Challenge-Jungle-Gaming"
              aria-label="GitHub do projeto"
              target="_blank"
              rel="noreferrer"
              className="grid size-7 place-items-center border border-ember/35 text-ember"
            >
              <Github size={14} />
            </a>
            <span
              title="Link demonstrativo"
              className="grid size-7 place-items-center border border-ember/20 text-ember/60"
            >
              <Instagram size={14} />
            </span>
            <span
              title="Link demonstrativo"
              className="grid size-7 place-items-center border border-ember/20 text-ember/60"
            >
              <Linkedin size={14} />
            </span>
          </div>
          <h2 className="mt-5 text-xs font-black">Carteiras compatíveis</h2>
          <p className="mt-2 text-[9px] uppercase tracking-wider text-ember">
            MetaMask · WalletConnect · Coinbase
          </p>
        </div>
      </div>
      <p className="border-t border-ember/10 py-4 text-center text-[9px] text-sand/65">
        © 2026 Kurio. Propriedade digital para todos.
      </p>
    </footer>
  );
}
