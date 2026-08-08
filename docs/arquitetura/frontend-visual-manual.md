---
doc_id: DOC-ARCH-006
title: Manual Visual do Frontend
type: guide
status: draft
version: 1.0.0
owner: TBD
created_at: 2026-08-07
updated_at: 2026-08-07
review_due:
domain: frontend
audited_by: TBD
summary: Manual normativo da linguagem visual do produto, baseado na relacao entre materiais metalicos, vidro e informacao financeira.
rag_ready: false
tags:
  - frontend
  - design-system
  - visual-language
  - liquid-glass
  - accessibility
related_docs:
  - "[[docs/planos/frontend-design-system-plan]]"
  - "[[docs/planos/frontend-implementation-plan]]"
  - "[[docs/regras_de_negocio/movimentacoes-imediatas-e-buckets-fase-2]]"
---

# Manual Visual do Frontend

## Ideia central

> O metal protege o valor; o vidro revela a informação.

Esta é a regra-mãe do sistema visual.

- Metal representa permanência, patrimônio, proteção e valor acumulado.
- Vidro representa controle, navegação, filtro e interação transitória.
- Superfícies sólidas representam dados que precisam de leitura estável.
- Cor representa significado financeiro; não deve ser usada apenas para ornamentação.

O produto deve parecer preciso e valioso, como um cartão de prata bem construído, mas continuar sendo um instrumento claro para decisões financeiras.

## Personalidade

O sistema deve transmitir:

- precisão
- calma
- confiança
- sofisticação discreta
- sensação de objeto bem acabado

Evitar uma aparência de cassino, banco agressivo, dashboard gamer ou joalheria. Premium aqui significa acabamento e clareza, não excesso de brilho.

## Materiais

### Metal

Use o material metal em elementos de destaque patrimonial:

- saldo livre
- patrimônio investido
- cartões e contas importantes
- metas relevantes
- números heroicos

O metal deve ser majoritariamente opaco. Sua aparência nasce da combinação de gradiente curto, borda especular, sombra interna suave e textura quase imperceptível.

Não usar textura fotográfica, cromado espelhado ou reflexo animado permanente.

### Vidro

Use vidro em uma camada funcional que flutua sobre o conteúdo:

- navegação
- dock
- seletor de mês
- filtros
- menus
- ações rápidas
- controles que aparecem temporariamente

O vidro não deve ser o fundo padrão de tabelas, listas ou gráficos. A transparência nunca pode ser necessária para compreender um valor.

### Conteúdo sólido

Use superfícies sólidas para:

- transações
- formulários
- tabelas
- gráficos
- alertas
- estados vazios e de erro

O conteúdo financeiro precisa de contraste previsível, especialmente em telas densas.

## Paleta semântica

Valores iniciais para o tema `Platinum Night`:

| Token | Hex | Função |
| --- | --- | --- |
| `canvas` | `#090B0F` | fundo global |
| `canvas-elevated` | `#10141A` | áreas elevadas |
| `surface` | `#151A21` | conteúdo principal |
| `surface-strong` | `#1B222C` | tabelas e formulários |
| `silver-100` | `#F4F7FA` | texto forte e reflexos |
| `silver-300` | `#C8D0D8` | prata principal |
| `silver-500` | `#89939F` | texto secundário e bordas |
| `ice` | `#B9E7FF` | foco e ação primária |
| `positive` | `#79D6A3` | entradas e saldo positivo |
| `negative` | `#FF8C92` | saídas, risco e atraso |
| `warning` | `#F3C878` | atenção e compromisso |

Esses tokens são candidatos iniciais, não uma autorização para ignorar contraste. Toda cor de texto e controle deve ser validada em contexto real.

### Uso semântico das cores

- Verde comunica entrada, saldo favorável ou conclusão.
- Vermelho comunica saída, risco, falha ou atraso.
- Amarelo comunica atenção, vencimento próximo ou compromisso.
- Azul-gelo comunica foco, seleção e ação primária.
- Prata e branco comunicam estrutura, conteúdo e importância semântica neutra.

Estados financeiros nunca podem depender apenas da cor. Usar também rótulo, ícone, sinal ou mudança de estrutura.

## Tipografia

- Fonte sans-serif funcional e legível.
- Números monetários com alinhamento tabular.
- Peso semibold para hierarquia; evitar excesso de bold.
- Valores heroicos podem receber tratamento editorial prateado.
- Texto operacional, labels, alertas e tabelas não devem usar gradiente metálico.
- Corpo de texto deve priorizar contraste e tamanho antes de personalidade visual.

## Geometria

### Raios

Usar uma escala pequena e consistente:

| Token | Valor | Uso |
| --- | --- | --- |
| `radius-sm` | `10px` | inputs, badges e controles compactos |
| `radius-md` | `16px` | cards e campos principais |
| `radius-lg` | `24px` | card heroico e painéis |
| `radius-pill` | `999px` | filtros e ações compactas |

Não criar um raio novo para cada componente. Controles agrupados devem manter concentricidade com o contêiner.

### Bordas

- borda padrão: prata com baixa opacidade
- borda de foco: azul-gelo, claramente visível
- borda de erro: negativa e acompanhada de mensagem
- borda especular: exclusiva de superfícies metálicas e elementos de destaque

Preferir borda e espaçamento a sombras pesadas para separar conteúdo.

## Profundidade e luz

Manter três planos perceptíveis:

1. ambiente/fundo
2. conteúdo financeiro
3. controles flutuantes

Sombras devem ser curtas, frias e suaves. O brilho deve indicar importância ou interação, nunca ficar pulsando sem motivo.

## Movimento

- resposta de interação: `100ms` a `160ms`
- transição de layout: `180ms` a `260ms`
- usar `prefers-reduced-motion`
- não usar parallax ou animação decorativa como requisito de compreensão
- reflexo e lensing devem responder a uma ação, não executar continuamente

## Responsividade

No mobile, priorizar uma coluna, dock inferior, sheets para formulários e cards que preservem a leitura do saldo livre. No desktop, usar navegação lateral compacta e uma grade de até doze colunas.

Nenhuma decisão visual deve esconder a diferença entre `livre`, `VR`, `VT`, `disponível` e `comprometido`.

## Acessibilidade

- manter contraste WCAG AA
- preservar foco de teclado
- garantir alvos de pelo menos `44px` no mobile
- oferecer fallback opaco para transparência reduzida
- oferecer conteúdo textual equivalente para gráficos
- usar texto e ícone além da cor
- validar com blur desativado, alto contraste e redução de movimento

## Componentes canônicos

Primitivos:

- `GlassSurface`
- `MetalSurface`
- `ContentSurface`
- `SpecularBorder`
- `MoneyText`
- `StatusMark`
- `FocusRing`

Produto:

- `BalanceCard`
- `BucketCard`
- `CommitmentCard`
- `MetricTile`
- `MonthControl`
- `AppDock`
- `QuickAction`
- `TransactionRow`
- `ChartPanel`
- `FormSheet`

Novos componentes devem primeiro reutilizar esses papéis. Criar nova variação visual apenas quando existir uma necessidade semântica real.

## Checklist de revisão visual

Antes de aprovar um componente, verificar:

- o material escolhido comunica a função?
- o conteúdo continua legível sem blur?
- a cor tem significado ou está decorando?
- o foco de teclado é evidente?
- o componente funciona em mobile?
- o estado não depende somente de cor?
- a hierarquia continua clara em uma tela cheia de dados?
- o efeito ainda parece premium quando reduzido ou desativado?
