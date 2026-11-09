# Changelog

Todas as mudanças relevantes seguem [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### Adicionado

- PWA instalável com ícones próprios, atalhos, prompt contextual e suporte iOS.
- Cache offline integrado ao worker do MSW, validado em desktop e mobile.
- Galeria de NFT interativa com miniaturas, transições e visualização ampliada.
- Identidade Kurio fiel aos frames desktop/mobile, com home completa, sidebar de mercado e rodapé funcional.
- Login e cadastro com Google/Facebook simulados pela API MSW.
- Edição da carteira principal e de carteiras secundárias no fluxo protegido de conta.
- Formulário completo do colecionador no checkout e recibo visual de confirmação.

### Corrigido

- Sobreposição entre arte e informações na página de detalhes em telas largas.
- Miniaturas que não alteravam a imagem principal do NFT.
- Menus nativos com fundo branco e opções ilegíveis no tema escuro.
- Estoque de edições únicas que podia ultrapassar o suprimento total.
- Reflow e overflow horizontal da página de detalhes em dispositivos móveis.
- Overflow e intercepção de controles no perfil mobile.
- Links inativos do rodapé e navegação inferior cobrindo formulários transacionais.

## [1.0.0] - 2026-11-06

### Adicionado

- Catálogo responsivo com busca, filtros, ordenação, paginação e URL persistente.
- Detalhe do NFT, favoritos otimistas e carrinho persistente de visitante/usuário.
- Cadastro, login, sessão, perfil, senha e carteiras fictícias.
- Cotação precisa em ETH, cupom, checkout e pedidos idempotentes.
- Confirmação, recusa e recuperação de pedido após timeout/reload.
- REST com Axios, estado remoto com TanStack Query e rotas protegidas.
- MSW com cenários determinísticos e Socket.IO real via binding do MSW.
- Eventos versionados `nft.updated` e `order.updated` com reconciliação REST.
- Skeleton shimmer, foco visível, navegação por teclado e movimento reduzido.
- Suite Playwright desktop/tablet/mobile e regressão visual.
- Lighthouse CI, Netlify, SEO/OG, sitemap, manifest e headers de segurança.
- Documentação, licença MIT, autoria, contribuição e política de segurança.

[1.0.0]: https://github.com/GabrielDS02/Project-Challenge-Jungle-Gaming/releases/tag/v1.0.0
[Não lançado]: https://github.com/GabrielDS02/Project-Challenge-Jungle-Gaming/compare/v1.0.0...HEAD
