---
doc_id: DOC-PLAN-003
title: Plano de Implementação do Frontend
type: plan
status: draft
version: 1.0.0
owner: TBD
created_at: 2026-08-07
updated_at: 2026-08-07
review_due:
domain: frontend
audited_by: TBD
summary: Plano técnico para implementar o frontend do MVP com tokens, CSS nativo, Tailwind, componentes reutilizáveis e progressive enhancement dos efeitos de vidro e metal.
rag_ready: false
tags:
  - frontend
  - implementation
  - nextjs
  - tailwind
  - css
  - design-system
related_docs:
  - "[[docs/arquitetura/frontend-visual-manual]]"
  - "[[docs/planos/frontend-design-system-plan]]"
  - "[[docs/planos/backend-mvp-plan]]"
---

# Plano de Implementação do Frontend

## Decisão técnica

Implementar a linguagem visual diretamente com CSS moderno, tokens próprios e componentes React locais. Usar bibliotecas públicas para problemas que já possuem solução madura, não para terceirizar a identidade visual.

### Escolhas

| Necessidade | Decisão |
| --- | --- |
| layout e responsividade | Tailwind CSS 4, já presente no projeto |
| tokens e materiais | custom properties CSS em `app/globals.css` ou arquivo de estilos dedicado |
| componentes visuais | React/TypeScript locais em `src/components/ui` |
| ícones | `lucide-react`, já instalado |
| gráficos | Recharts, já instalado |
| formulários | React Hook Form + Zod, já instalados |
| animações | CSS transitions primeiro; biblioteca somente se houver necessidade comprovada |
| glass/lensing | `backdrop-filter` e camadas CSS com fallback opaco |
| textura metálica | CSS, gradientes e ruído pequeno reutilizável; sem Canvas/WebGL no MVP |
| primitives acessíveis | shadcn/ui pode ser adotado seletivamente, sem importar seu tema como identidade final |

Não adicionar uma biblioteca específica de “glassmorphism” ou “Liquid Glass” no MVP. Esses pacotes tendem a limitar o acabamento, dificultar acessibilidade e criar dependência de efeitos que conseguimos controlar com poucas regras CSS.

## Estrutura proposta

```txt
app/
  globals.css
  (auth)/
  (dashboard)/

src/
  components/
    ui/
      glass-surface.tsx
      metal-surface.tsx
      content-surface.tsx
      money-text.tsx
      status-mark.tsx
      focus-ring.tsx
    layout/
      app-shell.tsx
      app-dock.tsx
      month-control.tsx
    finance/
      balance-card.tsx
      bucket-card.tsx
      commitment-card.tsx
      metric-tile.tsx
      transaction-row.tsx
      chart-panel.tsx
      quick-action.tsx
      form-sheet.tsx
  lib/
    design-tokens.ts
    utils/
  modules/finance/interface/
    view-models/
    presenters/
```

Componentes visuais não devem importar casos de uso de domínio. Páginas e composição fazem a ponte entre view models e componentes.

## Tokens

Centralizar os tokens em CSS custom properties para permitir tema claro futuro e fallback de acessibilidade.

```css
:root {
  --canvas: #090b0f;
  --canvas-elevated: #10141a;
  --surface: #151a21;
  --surface-strong: #1b222c;
  --silver-100: #f4f7fa;
  --silver-300: #c8d0d8;
  --silver-500: #89939f;
  --ice: #b9e7ff;
  --positive: #79d6a3;
  --negative: #ff8c92;
  --warning: #f3c878;

  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-pill: 999px;

  --glass-blur: 18px;
  --glass-fill: rgb(255 255 255 / 0.08);
  --glass-border: rgb(244 247 250 / 0.18);
  --shadow-float: 0 16px 40px rgb(0 0 0 / 0.24);
}
```

Os nomes usados em JSX devem ser semânticos (`surface`, `positive`, `negative`) e não dependentes de uma cor física. Isso mantém a implementação alinhada ao manual visual.

## Primitivos

### `GlassSurface`

Responsabilidade: criar uma superfície funcional flutuante.

Implementação inicial:

- `background: var(--glass-fill)`
- `border: 1px solid var(--glass-border)`
- `backdrop-filter: blur(var(--glass-blur)) saturate(135%)`
- sombra curta
- fallback opaco por padrão quando `backdrop-filter` não existir
- variante `reduced-transparency` sem transparência

Usar em navegação e controles. Não usar automaticamente como wrapper de todo card.

### `MetalSurface`

Responsabilidade: representar valor ou patrimônio.

Implementação inicial:

- fundo opaco com gradiente de prata de baixa amplitude
- pseudo-elemento de highlight estático
- borda especular com baixa opacidade
- sombra interna suave
- textura opcional pequena e estática

O componente deve aceitar conteúdo normal sem forçar texto com gradiente.

### `ContentSurface`

Responsabilidade: leitura estável de dados.

Implementação inicial:

- fundo `surface` ou `surface-strong`
- borda discreta
- sem blur obrigatório
- separação por espaçamento e hierarquia tipográfica

## Regras de CSS

- não animar `backdrop-filter`
- não aplicar blur em cada item de uma lista
- evitar filtros em elementos grandes que cobrem a viewport
- preferir pseudo-elementos para highlight e textura
- respeitar `prefers-reduced-motion`
- usar `@supports (backdrop-filter: blur(1px))` para progressive enhancement
- manter uma versão opaca para `prefers-reduced-transparency` e alto contraste

Exemplo de fallback:

```css
.glass-surface {
  background: var(--surface-strong);
}

@supports (backdrop-filter: blur(1px)) {
  .glass-surface {
    background: var(--glass-fill);
    backdrop-filter: blur(var(--glass-blur)) saturate(135%);
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

## Integração com o Next.js

- manter `AppShell` como composição de layout
- usar Server Components para dashboard e listas
- usar Client Components apenas para controles, formulários, gráficos e efeitos de interação
- passar view models prontos aos componentes
- não calcular saldo, disponível ou comprometido dentro de componentes visuais
- preservar a separação de domínio definida no projeto

## Ordem de implementação

### Fase 1 — tokens e laboratório

Criar tokens, superfícies e uma rota/página interna de laboratório com exemplos de estados. Validar desktop, mobile, blur ativado, blur desativado e alto contraste.

### Fase 2 — shell

Implementar `AppShell`, navegação, dock, cabeçalho, `MonthControl`, foco, estados de sessão e estrutura responsiva.

### Fase 3 — dashboard vertical slice

Implementar `BalanceCard`, `BucketCard`, `CommitmentCard`, `MetricTile`, `ChartPanel` e transações recentes usando o view model financeiro existente.

O objetivo é validar o sistema em uma tela real antes de produzir dezenas de componentes.

### Fase 4 — movimentações

Implementar lista, filtros, entrada, saída imediata, estados de formulário e retornos das Server Actions. Usar `FormSheet` no mobile e painel contextual no desktop.

### Fase 5 — planejamento, carteira e crédito

Adicionar planejamento mensal, contas, benefícios, cartões, compromissos, investimentos e categorias secundárias conforme os contratos do domínio forem expostos pela aplicação.

### Fase 6 — autenticação e hardening

Finalizar login, proteção de rotas, skeletons, erros, modo de privacidade, acessibilidade, performance e testes de viewport.

## Critérios de aceite técnicos

- todos os componentes principais têm estados de loading, vazio, erro, disabled e foco
- nenhuma regra financeira reside em componente React
- layout utilizável em viewport mobile e desktop
- funciona sem `backdrop-filter`
- funciona com movimento e transparência reduzidos
- gráficos possuem valor textual e legenda
- `npm run lint`, `npm test` e `npm run build` passam ao final de cada fase relevante
- a quantidade de camadas de blur e o custo visual são verificados antes de expandir o uso do material

## Estratégia de bibliotecas

Bibliotecas existentes devem ser aproveitadas: Tailwind, Lucide, Recharts, React Hook Form, Zod e date-fns. Adoção de shadcn/ui é opcional e limitada a primitives acessíveis, como dialog, sheet, dropdown e tabs.

Não usar uma biblioteca visual pronta como base da identidade. Componentes prontos podem fornecer comportamento, mas o acabamento, tokens, materiais e estados pertencem ao design system do projeto.

## Riscos e contenções

| Risco | Contenção |
| --- | --- |
| glass ilegível sobre dados | vidro apenas em controles; conteúdo opaco |
| baixo desempenho | blur restrito, sem animação de filtros, fallback sólido |
| aparência genérica | tokens e componentes próprios, sem tema pronto |
| excesso de abstração | iniciar com poucos primitivos e extrair após repetição real |
| design desconectado do domínio | validar dashboard com `livre`, `VR`, `VT`, `disponível` e `comprometido` |
| acessibilidade tratada tarde | testar reduced transparency, motion, keyboard e contraste no laboratório |

## Primeira entrega técnica

A primeira entrega deve ser um laboratório visual interno e uma versão estática do dashboard. Não começar pela aplicação completa nem por uma biblioteca genérica de componentes.

O laboratório precisa demonstrar:

- `GlassSurface`
- `MetalSurface`
- `ContentSurface`
- `BalanceCard`
- `BucketCard`
- `MonthControl`
- estados de foco, erro, loading e modo opaco
