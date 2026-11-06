# Política de Segurança

## Versões suportadas

| Versão | Suporte |
| ------ | ------- |
| 1.x    | ✅      |
| < 1.0  | ❌      |

## Relato responsável

Não abra uma issue pública para vulnerabilidades. Use o recurso **Private
vulnerability reporting** do GitHub deste repositório. Inclua impacto, cenário
de reprodução, versão/navegador e uma correção sugerida, se houver.

O objetivo é confirmar o recebimento em até 72 horas e publicar uma correção
coordenada. Não inclua senhas, tokens, carteiras reais ou dados pessoais.

## Controles da aplicação

- CSP, `frame-ancestors`, `nosniff`, Referrer Policy e Permissions Policy no Netlify.
- Nenhum segredo no frontend e nenhum armazenamento de senha em claro.
- Sessão e pagamentos são simulações locais; não use dados reais.
- Validação de entrada no cliente e no contrato MSW.
- Pedidos protegidos por chave de idempotência.
- Dependências travadas por `pnpm-lock.yaml` e scripts de instalação limitados.

O hash de senha do mock é educacional e não substitui Argon2/bcrypt em produção.
