# Contratos REST e eventos

Base URL: `/api`. Erros usam `{ code, message, fieldErrors? }`.

| Método                | Rota                                             | Resultado principal                     |
| --------------------- | ------------------------------------------------ | --------------------------------------- |
| GET                   | `/session`                                       | `{ user }`                              |
| POST                  | `/session/login`, `/session/logout`, `/accounts` | sessão/conta                            |
| GET                   | `/nfts`, `/nfts/:id`                             | catálogo/detalhe                        |
| GET/POST/DELETE       | `/favorites/:nftId`                              | favoritos                               |
| GET/POST/PATCH/DELETE | `/cart/items/:nftId`                             | carrinho                                |
| POST                  | `/quotes`                                        | subtotal, desconto, taxa, total, versão |
| POST/GET              | `/orders`, `/orders/:id`                         | pedido/recibo                           |
| GET/PUT               | `/profile`                                       | perfil                                  |
| POST                  | `/profile/password`                              | alteração de senha                      |
| GET/POST/PUT          | `/wallets/:id`                                   | carteiras                               |
| PUT/POST              | `/mock/scenario`, `/mock/reset`                  | laboratório de falhas                   |

`POST /orders` exige `Idempotency-Key` e `quoteVersion`. Possíveis erros:
`401 UNAUTHORIZED`, `409 STALE_QUOTE`, `409 IDEMPOTENCY_CONFLICT`,
`422 WALLET_REQUIRED` e falhas transitórias.

## Eventos Socket.IO

- `nft.updated`: `{ resourceId, version, occurredAt, patch: { priceEth, available } }`
- `order.updated`: `{ resourceId, userId, version, occurredAt, status }`

A identidade e a versão são obrigatórias. Pedidos confirmados/recusados são
terminais. O cliente invalida REST após reconexão.
