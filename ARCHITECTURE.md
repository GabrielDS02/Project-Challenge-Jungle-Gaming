# Arquitetura

## Visão geral

```text
UI / TanStack Router
        │
TanStack Query + mutations otimistas
        │
Axios ───────────── socket.io-client
        │                    │
MSW REST handlers ─── @mswjs/socket.io-binding
        │                    │
        └──── estado simulado persistente ────┘
```

## Responsabilidades

- `src/app`: composição de rotas, proteção e políticas globais de cache.
- `src/components`: UI reutilizável e primitives adaptadas do shadcn/Radix.
- `src/features`: queries, mutations e integração Socket.IO.
- `src/pages`: composição de fluxos; não contém fixtures ou atalhos de negócio.
- `src/mocks`: fixtures, persistência, contratos REST e servidor de tempo real.
- `tests/e2e`: validações pela interface e pelos limites de rede públicos.

## Estado, cache e concorrência

As chaves incluem recurso, usuário implícito da sessão e parâmetros de consulta.
Listagens têm `staleTime` curto; sessão/perfil são mais estáveis. O `AbortSignal`
do TanStack Query é entregue ao Axios, cancelando respostas obsoletas. Falhas
transitórias repetem no máximo duas vezes com backoff; 4xx de domínio não repetem.

Favoritos usam atualização otimista: snapshot, cancelamento da query, atualização
imediata e rollback no erro. Mutations de pedido nunca repetem automaticamente.

## Sessão e carrinho

O mock persiste apenas um hash demonstrativo. O carrinho `guest` sobrevive ao
refresh e é mesclado no login. Logout limpa o QueryClient, impedindo vazamento de
cache privado. Expiração redireciona rotas privadas e preserva o destino.

## Dinheiro e pedidos

ETH é string decimal no transporte e `decimal.js` no cálculo. O pedido recebe
`Idempotency-Key`; repetir chave e corpo recupera o mesmo pedido, enquanto corpo
diferente retorna 409. O recibo contém um snapshot imutável da cotação.
Durante o checkout, a chave fica no `sessionStorage` até uma resposta bem-sucedida;
assim um timeout seguido de reload recupera a mesma tentativa em vez de criar
uma compra duplicada. Preços/estoque alterados passam por `/cart/reprice` e uma
segunda confirmação explícita.

## Tempo real

O app usa `socket.io-client`. O MSW intercepta o WebSocket e o binding traduz os
frames Engine.IO/Socket.IO. Eventos têm `resourceId`, `version` e `occurredAt`.
O cliente ignora versões antigas/duplicadas; ao reconectar invalida dados ativos
para reconciliar com REST. O mock suporta namespace padrão e eventos de texto.
Como fallback exclusivo da demonstração, o emissor também publica um
`CustomEvent` e o cliente mantém uma reconciliação REST de baixa frequência.
O mesmo controle de versão elimina duplicatas quando Socket.IO, fallback e REST
chegam juntos, mantendo a interface responsiva em proxies que bloqueiam WebSocket
ou perdem um frame durante a reconexão.

## Figma e acessibilidade

A composição Kurio, tons espresso, acento âmbar, tipografia monoespaçada e proporções
seguem os frames públicos do Figma. Início, detalhe, carrinho, pagamento,
confirmação, login, cadastro, perfil e carteiras compartilham os mesmos tokens,
breakpoints e componentes de navegação. As artes foram substituídas por imagens
originais geradas para evitar dependências e direitos de coleções existentes.
Contraste/foco e reflow receberam pequenos ajustes em relação ao frame.

O shell usa cabeçalho compacto no desktop e navegação inferior em início,
detalhe e conta no mobile. Carrinho, checkout, autenticação e recibo omitem a
barra inferior para preservar o espaço dos controles críticos. O grid usa
`min-width: 0`, containers fluidos e bloqueio de overflow no eixo horizontal;
os regressivos observam 390×844 e 1440×1000, e a inspeção intermediária cobre
768 px.

Google e Facebook são ações sociais simuladas pelo mesmo contrato REST de
sessão. Não há OAuth real, popup externo ou promessa de integração fora do
escopo; ambos autenticam de forma determinística a conta fictícia da demo.

## PWA e cache offline

Uma origem aceita apenas um service worker controlador por escopo. Como a
demonstração também depende do worker do MSW, `mockServiceWorker.js` concentra as
duas responsabilidades sem registrar workers concorrentes:

- requisições `/api` continuam passando pelo protocolo do MSW;
- navegações usam estratégia network-first com fallback para o shell;
- scripts, estilos, imagens, fontes e manifest usam cache-first em produção;
- `Vary: Origin` dos módulos Vite é ignorado somente para assets same-origin;
- caches antigos com prefixo `jungle-pwa-` são removidos na ativação.

O navegador envia ao worker a lista real de bundles com hash após o primeiro
carregamento. Um `MessageChannel` confirma a conclusão antes de marcar o shell
como pronto para uso offline.

## Limitações e decisões de escopo

- Blockchain, assinatura de carteira, OAuth social e pagamento são simulações
  determinísticas; nenhuma credencial ou transação real é solicitada.
- Editorial, suporte, atividade, ofertas e downloads não foram transformados em
  páginas fictícias porque o enunciado os declara fora da entrega.
- As artes são assets locais originais. A composição acompanha o Figma, mas foco,
  contraste, mensagens de erro, estados vazios e reflow recebem ajustes de UX.
- O MSW usa armazenamento do navegador; para produção real, sessão, autorização,
  idempotência e persistência pertencem a uma API segura.

## Segurança

O frontend não guarda segredos. Netlify adiciona CSP e headers de isolamento.
Mocks são ativados por build apenas na demonstração. Produção real exigiria API
servidora, cookies HttpOnly/SameSite, hashing Argon2id e autorização por recurso.
