---
doc_id: DOC-PLAN-003
title: Plano de Implementacao do Frontend
type: plan
status: draft
version: 1.3.0
owner: TBD
created_at: 2026-08-07
updated_at: 2026-08-08
review_due:
domain: frontend
audited_by: TBD
summary: Plano tecnico para implementar o frontend do MVP com tokens, CSS nativo, Tailwind, componentes reutilizaveis e progressive enhancement dos efeitos de vidro e metal.
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
  - "[[docs/arquitetura/frontend-data-access-and-error-handling]]"
---

# Plano de Implementacao do Frontend

## Decisao tecnica

Implementar a linguagem visual diretamente com CSS moderno, tokens proprios e componentes React locais. Usar bibliotecas publicas para problemas que ja possuem solucao madura, nao para terceirizar a identidade visual.

### Escolhas

| Necessidade | Decisao |
| --- | --- |
| layout e responsividade | Tailwind CSS 4, ja presente no projeto |
| tokens e materiais | custom properties CSS em `app/globals.css` ou arquivo de estilos dedicado |
| componentes visuais | React/TypeScript locais em `src/components/ui` |
| icones | `lucide-react`, ja instalado |
| graficos | Recharts, ja instalado |
| formularios | React Hook Form + Zod, ja instalados |
| animacoes | CSS transitions primeiro; biblioteca somente se houver necessidade comprovada |
| glass/lensing | `backdrop-filter` e camadas CSS com fallback opaco |
| textura metalica | CSS, gradientes e ruido pequeno reutilizavel; sem Canvas/WebGL no MVP |
| primitives acessiveis | shadcn/ui pode ser adotado seletivamente, sem importar seu tema como identidade final |

Nao adicionar uma biblioteca especifica de glassmorphism ou Liquid Glass no MVP. Esses pacotes tendem a limitar o acabamento, dificultar acessibilidade e criar dependencia de efeitos que conseguimos controlar com poucas regras CSS.

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

Componentes visuais nao devem importar casos de uso de dominio. Paginas e composicao fazem a ponte entre view models e componentes.

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

Os nomes usados em JSX devem ser semanticos (`surface`, `positive`, `negative`) e nao dependentes de uma cor fisica. Isso mantem a implementacao alinhada ao manual visual.

## Primitivos

### `GlassSurface`

Responsabilidade: criar uma superficie funcional flutuante.

Implementacao inicial:

- `background: var(--glass-fill)`
- `border: 1px solid var(--glass-border)`
- `backdrop-filter: blur(var(--glass-blur)) saturate(135%)`
- sombra curta
- fallback opaco por padrao quando `backdrop-filter` nao existir
- variante `reduced-transparency` sem transparencia

Usar em navegacao e controles. Nao usar automaticamente como wrapper de todo card.

### `MetalSurface`

Responsabilidade: representar valor ou patrimonio.

Implementacao inicial:

- fundo opaco com gradiente de prata de baixa amplitude
- pseudo-elemento de highlight estatico
- borda especular com baixa opacidade
- sombra interna suave
- textura opcional pequena e estatica

O componente deve aceitar conteudo normal sem forcar texto com gradiente.

### `ContentSurface`

Responsabilidade: leitura estavel de dados.

Implementacao inicial:

- fundo `surface` ou `surface-strong`
- borda discreta
- sem blur obrigatorio
- separacao por espacamento e hierarquia tipografica

## Regras de CSS

- nao animar `backdrop-filter`
- nao aplicar blur em cada item de uma lista
- evitar filtros em elementos grandes que cobrem a viewport
- preferir pseudo-elementos para highlight e textura
- respeitar `prefers-reduced-motion`
- usar `@supports (backdrop-filter: blur(1px))` para progressive enhancement
- manter uma versao opaca para `prefers-reduced-transparency` e alto contraste

## Integracao com o Next.js

- manter `AppShell` como composicao de layout
- usar Server Components para dashboard e listas
- usar Client Components apenas para controles, formularios, graficos e efeitos de interacao
- passar view models prontos aos componentes
- nao calcular saldo, disponivel ou comprometido dentro de componentes visuais
- preservar a separacao de dominio definida no projeto

## Ordem de implementacao

### Fase 1 - tokens e laboratorio

Criar tokens, superficies e uma rota interna de laboratorio com exemplos de estados. Validar desktop, mobile, blur ativado, blur desativado e alto contraste.

### Fase 2 - shell

Implementar `AppShell`, navegacao, dock, cabecalho, `MonthControl`, foco, estados de sessao e estrutura responsiva.

Status em 2026-08-08:

- `app/globals.css` consolidado com tokens `Platinum Night`, superficies de vidro, metal e conteudo solido
- `src/components/layout/app-shell.tsx` entregue com navegacao lateral responsiva e cabecalho alinhado ao manual visual

### Fase 3 - dashboard vertical slice

Implementar `BalanceCard`, `BucketCard`, `CommitmentCard`, `MetricTile`, `ChartPanel` e transacoes recentes usando o view model financeiro existente.

Status em 2026-08-08:

- `app/(dashboard)/dashboard/page.tsx` criado como Server Component com seletor de competencia, `loading.tsx` e tratamento de `VALIDATION_ERROR`, `UNAUTHENTICATED` e falha interna
- `loadMonthlyDashboard` conectado ao slice inicial de saldo livre, buckets, compromissos, insights e cartoes
- `src/components/finance/monthly-dashboard-overview.tsx` centraliza a leitura visual sem mover regra financeira para React
- refinamento visual aplicado com dock inferior no mobile, navegacao lateral compacta no desktop e hierarquia de leitura aderente ao manual
- `liquid glass` restrito a navegacao e controle de competencia, com fallback opaco, foco visivel e transparencia reduzida
- textura de prata implementada em CSS no saldo heroico com gradientes curtos, borda especular e ruido monocromatico sutil, sem dependencia visual externa
- graficos e transacoes recentes ainda nao foram conectados; permanecem como expansao desta fase

### Fase 4 - movimentacoes

Implementar lista, filtros, entrada, saida imediata, estados de formulario e retornos das Server Actions. Usar `FormSheet` no mobile e painel contextual no desktop.

### Fase 5 - planejamento, carteira e credito

Adicionar planejamento mensal, contas, beneficios, cartoes, compromissos, investimentos e categorias secundarias conforme os contratos do dominio forem expostos pela aplicacao.

### Fase 6 - autenticacao e hardening

Finalizar login, protecao de rotas, skeletons, erros, modo de privacidade, acessibilidade, performance e testes de viewport.

## Criterios de aceite tecnicos

- todos os componentes principais tem estados de loading, vazio, erro, disabled e foco
- nenhuma regra financeira reside em componente React
- layout utilizavel em viewport mobile e desktop
- funciona sem `backdrop-filter`
- funciona com movimento e transparencia reduzidos
- graficos possuem valor textual e legenda
- `npm run lint`, `npm test` e `npm run build` passam ao final de cada fase relevante
- a quantidade de camadas de blur e o custo visual sao verificados antes de expandir o uso do material

## Estrategia de bibliotecas

Bibliotecas existentes devem ser aproveitadas: Tailwind, Lucide, Recharts, React Hook Form, Zod e date-fns. Adocao de shadcn/ui e opcional e limitada a primitives acessiveis, como dialog, sheet, dropdown e tabs.

Nao usar uma biblioteca visual pronta como base da identidade. Componentes prontos podem fornecer comportamento, mas o acabamento, tokens, materiais e estados pertencem ao design system do projeto.

## Riscos e contencoes

| Risco | Contencao |
| --- | --- |
| glass ilegivel sobre dados | vidro apenas em controles; conteudo opaco |
| baixo desempenho | blur restrito, sem animacao de filtros, fallback solido |
| aparencia generica | tokens e componentes proprios, sem tema pronto |
| excesso de abstracao | iniciar com poucos primitivos e extrair apos repeticao real |
| design desconectado do dominio | validar dashboard com `livre`, `VR`, `VT`, `disponivel` e `comprometido` |
| acessibilidade tratada tarde | testar reduced transparency, motion, keyboard e contraste no laboratorio |

## Primeira entrega tecnica

A primeira entrega deixou de ser apenas uma recomendacao estatica e passou a ser um slice funcional do dashboard mensal. O baseline atual precisa demonstrar e preservar:

- `GlassSurface`
- `MetalSurface`
- `ContentSurface`
- leitura de `saldo livre`, `VR`, `VT`, `comprometido` e `limite seguro`
- estados de foco, erro, loading e modo opaco
