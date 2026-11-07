<div align="center">
  <img src="./public/assets/social-banner.jpg" alt="Jungle NFT Marketplace" width="100%" />

# Jungle NFT Marketplace

**Uma experiência de descoberta e compra de arte digital, construída para o Frontend Challenge da Jungle Gaming.**

[![React](https://img.shields.io/badge/React-19-160d08?style=for-the-badge&logo=react&logoColor=e89045)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-160d08?style=for-the-badge&logo=typescript&logoColor=e89045)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-160d08?style=for-the-badge&logo=playwright&logoColor=e89045)](https://playwright.dev/)
[![MIT](https://img.shields.io/badge/license-MIT-e89045?style=for-the-badge)](./LICENSE)

[Aplicação](https://jungle-gaming-challenge.netlify.app) · [Arquitetura](./ARCHITECTURE.md) · [API](./docs/API.md) · [Testes](./docs/TESTING.md)
</div>

---

## Sobre o projeto

O Jungle é um marketplace fictício de NFTs que cobre a jornada completa do
colecionador: descoberta, detalhe, favorito, carrinho, cotação, autenticação,
carteira, pedido e recibo. A implementação segue o Figma do desafio e trata os
estados não desenhados com a mesma linguagem visual espresso/âmbar.

Não é uma maquete estática. REST passa pelo Axios/MSW, estado remoto pelo
TanStack Query, navegação pelo TanStack Router e tempo real pelo
`socket.io-client` com o binding Socket.IO do MSW.

## O que está incluído

- Catálogo com busca, filtros combináveis, ordenação, paginação e histórico da URL.
- Detalhe direto/404, galeria interativa, zoom, disponibilidade, quantidade e favorito otimista.
- Carrinho de visitante persistente, merge no login, cupom e precisão decimal.
- Login, cadastro, expiração, logout, perfil, avatar, senha e carteiras.
- Checkout com revalidação, chave idempotente e prevenção de clique duplicado.
- Pedido pendente, confirmado/recusado e recuperação após timeout/reload.
- `nft.updated` e `order.updated` versionados, deduplicados e reconciliados com REST.
- Cenários de latência, offline, 4xx/5xx, conflito, cupom, preço, estoque e pagamento.
- Layouts desktop/mobile, skeleton shimmer, foco, teclado, reflow e movimento reduzido.
- PWA instalável e offline com ícones `any`/`maskable`, atalhos e prompt de instalação.
- Open Graph/WhatsApp, Twitter Card, JSON-LD, sitemap, robots, favicon e manifest.
- Netlify SPA com CSP, headers de segurança e cache de assets.
- Playwright E2E/visual e Lighthouse CI.

## Stack

| Camada        | Tecnologia                                    |
| ------------- | --------------------------------------------- |
| Interface     | React 19 + TypeScript strict                  |
| Rotas         | TanStack Router                               |
| Estado remoto | TanStack Query                                |
| HTTP          | Axios                                         |
| Estilos       | Tailwind CSS + primitives shadcn/Radix        |
| Mock          | MSW                                           |
| Tempo real    | Socket.IO Client + `@mswjs/socket.io-binding` |
| Testes        | Playwright                                    |
| Auditoria     | Lighthouse CI                                 |
| Deploy        | Netlify                                       |

## Início rápido

Requisitos: Node.js 22+ e pnpm 11+.

```bash
git clone https://github.com/GabrielDS02/Project-Challenge-Jungle-Gaming.git
cd Project-Challenge-Jungle-Gaming
pnpm install
cp .env.example .env.local
pnpm dev
```

Acesse `http://localhost:5173`. Os mocks vêm ativados por padrão e não exigem
backend, carteira ou serviço privado.

### Contas fictícias

| Perfil      | E-mail             | Senha        |
| ----------- | ------------------ | ------------ |
| Ada Silva   | `ada@jungle.test`  | `Jungle@123` |
| Caio Santos | `caio@jungle.test` | `Jungle@123` |

Cupom válido: `JUNGLE10`. Cupom expirado: `EXPIRED10`.

> Use somente dados fictícios. A aplicação não cria NFTs, pagamentos ou
> transações reais.

## Comandos

```bash
pnpm dev            # desenvolvimento com MSW
pnpm build          # typecheck + bundle otimizado
pnpm preview        # serve o build
pnpm typecheck      # TypeScript estrito
pnpm lint           # ESLint
pnpm test:e2e       # Playwright desktop/mobile
pnpm test:visual    # regressão visual
pnpm test:report    # relatório HTML
pnpm lighthouse     # 3 auditorias por rota
pnpm quality        # pipeline local completo
```

## Laboratório de cenários

O botão de frasco no canto inferior esquerdo abre controles de avaliação:

| Cenário            | Evidência                                        |
| ------------------ | ------------------------------------------------ |
| Sucesso            | fluxo completo e pagamento confirmado            |
| Rede lenta         | skeletons e shimmer sem layout shift             |
| Offline / 503      | erro acessível e nova tentativa                  |
| Sessão expirada    | proteção de rota e retomada                      |
| Favorito falha     | rollback otimista                                |
| Pagamento recusado | pedido terminal e carrinho preservado            |
| Timeout            | recuperação pela mesma chave idempotente         |
| `nft.updated`      | preço/estoque via Socket.IO e cotação invalidada |

**Resetar dados** restaura usuários, catálogo, favoritos, carrinhos, carteiras e
pedidos. A seleção persiste apenas no navegador da demonstração.

## Arquitetura e resiliência

```text
React + Router
     │
TanStack Query ── optimistic rollback / cache por parâmetros
     │
Axios REST                   socket.io-client
     │                              │
MSW handlers ─── estado ─── Socket.IO binding
```

- Queries cancelam Axios com `AbortSignal` e descartam respostas obsoletas.
- Retries usam backoff apenas para falhas transitórias; mutations não repetem.
- ETH é string no contrato e `decimal.js` no cálculo.
- Logout limpa todo cache privado e subscriptions são desmontadas.
- Eventos antigos/duplicados não regridem versão; reconexão reconcilia REST.
- O recibo preserva o snapshot, mesmo se o catálogo mudar depois.

Detalhes completos em [ARCHITECTURE.md](./ARCHITECTURE.md) e
[docs/API.md](./docs/API.md).

## Acessibilidade e responsividade

Validado para 390, 768 e 1440 px. A aplicação oferece skip link, landmarks,
labels, erros associados, foco visível, foco preso em diálogos, nomes acessíveis,
contraste, teclado e `prefers-reduced-motion`. Skeletons preservam dimensões.

As artes são originais e locais; isso evita dependência externa e respeita o
direito autoral de coleções existentes. O fundo, paleta, hierarquia e composição
seguem o Figma; ajustes de contraste e reflow estão registrados na arquitetura.

## Aplicativo instalável (PWA)

O build de produção registra um service worker persistente que compartilha a
fronteira de rede do MSW com o cache do aplicativo. Isso mantém os mocks REST
funcionando e, ao mesmo tempo, permite reabrir a interface sem conexão após a
primeira visita.

- Chrome/Edge: use o botão **Instalar app** quando ele aparecer no cabeçalho.
- iPhone/iPad: abra o menu móvel e siga **Compartilhar → Adicionar à Tela de Início**.
- Manifest: nome, tema, escopo, atalhos, ícones 192/512 e versão `maskable`.
- Offline: HTML, bundles versionados, estilos, ícones e artes visitadas ficam em cache.

O cache é habilitado somente no build de produção, evitando interferência com o
HMR durante o desenvolvimento.

## Qualidade e segurança

O build do Netlify adiciona CSP, `frame-ancestors 'none'`, `nosniff`, Referrer
Policy e Permissions Policy. Dependências possuem lockfile e somente scripts de
instalação explícitos são aceitos. Veja [SECURITY.md](./SECURITY.md).

As metas Lighthouse são: Performance ≥ 90, Accessibility ≥ 95, Best Practices
≥ 95 e SEO ≥ 90, com três medições de início e detalhe.

## Deploy

O repositório está pronto para Netlify:

- build command: `pnpm build`
- publish directory: `dist`
- SPA fallback e headers: `netlify.toml`
- URL pública: `VITE_PUBLIC_SITE_URL`

Ao conectar o repositório no Netlify, o domínio público definido para a entrega é
`https://jungle-gaming-challenge.netlify.app`.

## Governança

- [Changelog](./CHANGELOG.md)
- [Release v1.0.0](./docs/RELEASE_NOTES_v1.0.0.md)
- [Como contribuir](./CONTRIBUTING.md)
- [Código de conduta](./CODE_OF_CONDUCT.md)
- [Política de segurança](./SECURITY.md)
- [Licença MIT](./LICENSE)
- [Aviso de autoria](./NOTICE)

---

<div align="center">
  Desenvolvido por <strong>Gabriel Silva</strong> para o Frontend Challenge da Jungle Gaming.<br />
  React · TypeScript · qualidade, segurança e experiência como produto.
</div>
