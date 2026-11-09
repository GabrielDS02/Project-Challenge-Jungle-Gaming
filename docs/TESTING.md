# Testes e cenários

## Comandos

```bash
pnpm build
pnpm test:e2e
pnpm test:visual
pnpm lighthouse
```

O Playwright inicia `pnpm preview`, usa Chromium em 1440×1000, 768×900 e 390×844,
mantém trace/video/screenshot em falhas e gera relatório HTML. A execução usa um
worker para que resets do banco MSW e do service worker PWA sejam determinísticos.

Os testes de interface também verificam que a galeria troca de imagem, o zoom é
acessível, as colunas não se sobrepõem e os menus Radix preservam contraste em
desktop/mobile.

A suíte contém 76 execuções — 26 cenários em desktop e mobile, além dos 24
cenários não visuais em tablet — e inclui autenticação social simulada, perfil,
carteiras, PWA/offline,
Socket.IO e quatro baselines por viewport: início, detalhe, carrinho e pagamento.
Além dos perfis automatizados de 390×844 e 1440×1000, o reflow é inspecionado a
768 px antes da entrega.

## PWA

`tests/e2e/pwa.spec.ts` valida o manifest, os ícones 192/512, a versão maskable,
o escopo do service worker e a criação do cache. Em seguida desliga a rede do
contexto do navegador, recarrega a aplicação e confirma que o shell React volta
a funcionar inteiramente pelo cache.

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
