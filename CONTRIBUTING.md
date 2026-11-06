# Como contribuir

Obrigado pelo interesse em melhorar o Jungle NFT Marketplace.

## Fluxo recomendado

1. Crie uma branch a partir de `main`: `feat/nome-curto` ou `fix/nome-curto`.
2. Instale com `pnpm install` e mantenha o lockfile.
3. Faça alterações pequenas, tipadas e acessíveis.
4. Execute `pnpm typecheck`, `pnpm lint`, `pnpm build` e `pnpm test:e2e`.
5. Abra um PR usando Conventional Commits e descreva risco, testes e screenshots.

## Padrões

- TypeScript estrito; evite `any` em código de domínio.
- Respostas fictícias pertencem aos handlers MSW, nunca aos componentes.
- Valores ETH trafegam como strings e são calculados com `decimal.js`.
- Componentes interativos devem funcionar por teclado e expor nome acessível.
- Comentários explicam decisões e invariantes, não repetem a sintaxe.
- Nenhum segredo, token ou dado pessoal deve entrar em commits.

## Commits

Use mensagens como `feat(checkout): add idempotent order recovery` ou
`fix(realtime): ignore stale nft updates`.
