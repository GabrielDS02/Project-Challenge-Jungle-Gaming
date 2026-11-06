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

## Tempo real

O app usa `socket.io-client`. O MSW intercepta o WebSocket e o binding traduz os
frames Engine.IO/Socket.IO. Eventos têm `resourceId`, `version` e `occurredAt`.
O cliente ignora versões antigas/duplicadas; ao reconectar invalida dados ativos
para reconciliar com REST. O mock suporta namespace padrão e eventos de texto.

## Figma e acessibilidade

A composição, tons espresso, acento âmbar, tipografia editorial e proporções
seguem os frames públicos do Figma. As artes foram substituídas por imagens
originais geradas para evitar dependências e direitos de coleções existentes.
Contraste/foco e reflow receberam pequenos ajustes em relação ao frame.

## Segurança

O frontend não guarda segredos. Netlify adiciona CSP e headers de isolamento.
Mocks são ativados por build apenas na demonstração. Produção real exigiria API
servidora, cookies HttpOnly/SameSite, hashing Argon2id e autorização por recurso.
