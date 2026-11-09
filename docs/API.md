# Contratos REST e eventos

Base URL: `/api`. Erros usam `{ code, message, fieldErrors? }`.

| Método                | Rota                                             | Resultado principal                     |
| --------------------- | ------------------------------------------------ | --------------------------------------- |
| GET                   | `/session`                                       | `{ user }`                              |
| POST                  | `/session/login`, `/session/logout`, `/accounts` | sessão/conta                            |
| GET                   | `/nfts`, `/nfts/:id`                             | catálogo/detalhe                        |
| GET/POST/DELETE       | `/favorites/:nftId`                              | favoritos                               |
| GET/POST/PATCH/DELETE | `/cart/items/:nftId`                             | carrinho                                |
| POST                  | `/cart/reprice`                                  | aceita preço/estoque revisado           |
| POST                  | `/quotes`                                        | subtotal, desconto, taxa, total, versão |
| POST/GET              | `/orders`, `/orders/:id`                         | pedido/recibo                           |
| GET                   | `/orders/recover?key=…`                          | recuperação idempotente após timeout    |
| GET/PUT               | `/profile`                                       | perfil                                  |
| POST                  | `/profile/password`                              | alteração de senha                      |
| GET/POST              | `/wallets`                                       | consulta/cadastro de carteiras          |
| PUT                   | `/wallets/:id`                                   | edição e definição da principal         |
| PUT/POST              | `/mock/scenario`, `/mock/reset`                  | laboratório de falhas                   |

`POST /orders` exige `Idempotency-Key` e `quoteVersion`. Possíveis erros:
`401 UNAUTHORIZED`, `409 STALE_QUOTE`, `409 IDEMPOTENCY_CONFLICT`,
`422 WALLET_REQUIRED` e falhas transitórias.

`POST /cart/reprice` atualiza o snapshot de preço e reduz/remove quantidades que
deixaram de existir. O checkout só envia o pedido depois que a nova cotação foi
mostrada e confirmada novamente pelo usuário.

## Eventos Socket.IO

- `nft.updated`: `{ resourceId, version, occurredAt, patch: { priceEth, available } }`
- `order.updated`: `{ resourceId, userId, version, occurredAt, status }`

A identidade e a versão são obrigatórias. Pedidos confirmados/recusados são
terminais. O cliente invalida REST após reconexão e mantém reconciliação periódica
de baixa frequência para tolerar frames perdidos ou proxies sem WebSocket.
