# Testes e cenários

## Comandos

```bash
pnpm build
pnpm test:e2e
pnpm test:visual
pnpm lighthouse
```

O Playwright inicia `pnpm preview`, usa Chromium em 1440×1000 e 390×844,
mantém trace/video/screenshot em falhas e gera relatório HTML.

## Laboratório de mocks

O botão de frasco no canto inferior esquerdo ativa sucesso, rede lenta, offline,
503, sessão expirada, falha de favorito, pagamento recusado e timeout. Também
emite `nft.updated` real e restaura o banco local completo.

Nos testes, o reset é chamado por `fetch` dentro da página para atravessar o MSW.
Relógio e estados sensíveis são controlados por cenários determinísticos.

## Lighthouse

`lighthouserc.cjs` mede início e detalhe três vezes. O diretório
`reports/lighthouse` recebe HTML/JSON locais e não versiona resultados específicos
de máquina. Metas: performance 90, acessibilidade 95, boas práticas 95 e SEO 90.
