---
doc_id: DOC-PLAN-002
title: Plano de Design System e Frontend do MVP
type: plan
status: draft
version: 1.0.0
owner: TBD
created_at: 2026-08-07
updated_at: 2026-08-07
review_due:
domain: frontend
audited_by: TBD
summary: Define a direcao visual premium baseada em vidro liquido e prata, os componentes reutilizaveis e as fases de implementacao do frontend do MVP.
rag_ready: false
tags:
  - frontend
  - design-system
  - ui
  - ux
  - liquid-glass
  - mvp
related_docs:
  - "[[docs/arquitetura/frontend-visual-manual]]"
  - "[[docs/planos/frontend-implementation-plan]]"
  - "[[docs/planos/backend-mvp-plan]]"
  - "[[docs/regras_de_negocio/movimentacoes-imediatas-e-buckets-fase-2]]"
  - "[[docs/regras_de_negocio/credito-e-compromissos-fase-3]]"
---

# Plano de Design System e Frontend do MVP

> Este documento é a visão geral do trabalho. As regras normativas de aparência estão em [[docs/arquitetura/frontend-visual-manual]] e as decisões de execução técnica estão em [[docs/planos/frontend-implementation-plan]].

## Objetivo

Construir uma interface financeira autoral, clara e premium, inspirada nas propriedades de `Liquid Glass` e em objetos de prata escovada, sem reproduzir literalmente a interface de um sistema operacional.

A experiencia deve transmitir:

- controle e seguranca
- precisao e confiabilidade
- valor tangivel
- tranquilidade para tomar decisoes financeiras
- acabamento premium sem ostentacao

O dashboard continua sendo uma ferramenta de decisao. O tratamento visual nunca deve competir com valores, alertas, vencimentos ou a diferenca entre os buckets `livre`, `VR` e `VT`.

## Conceito Criativo

### Nome de trabalho: Argent

`Argent` e o nome interno sugerido para a linguagem visual. Ele referencia prata sem transformar a marca em uma imitacao de cartao bancario ou joalheria.

### Frase de direcao

> O metal protege o valor; o vidro revela a informacao.

Essa frase define a distribuicao dos materiais:

- `metal` representa patrimonio, saldo, seguranca e estrutura
- `vidro` representa navegacao, filtros, controles e interacao
- `superficies neutras` representam conteudo denso, tabelas e formularios
- `cor` representa significado financeiro, nunca decoracao aleatoria

## Principios de Experiencia

### 1. Premium pela precisao

O aspecto premium deve vir primeiro de alinhamento, tipografia, espacamento, estados de interacao e consistencia. Brilho, blur e gradientes sao acabamento, nao fundacao.

### 2. Materiais com funcao

Cada material deve comunicar uma camada da interface. Evitar aplicar vidro em todos os cards ou metal em todo texto.

### 3. Informacao financeira permanece solida

Valores, rotulos, tabelas e graficos precisam de contraste estavel. Conteudo principal deve usar superficies opacas ou quase opacas.

### 4. Movimento com peso fisico

Interacoes podem sugerir reflexo e deslocamento de luz, mas devem ser curtas e discretas. O usuario deve sentir resposta, nao assistir a uma animacao.

### 5. Cor com significado

Verde, vermelho, azul e amarelo devem comunicar estados financeiros. A base visual permanece neutra para que esses sinais tenham destaque.

### 6. Profundidade limitada

A interface deve trabalhar com no maximo tres planos perceptiveis:

1. ambiente e fundo
2. conteudo financeiro
3. controles flutuantes

## Direcao Visual

### Aparencia principal

Recomenda-se iniciar com uma experiencia `dark-first`, chamada provisoriamente de `Platinum Night`.

- fundo grafite profundo com iluminacao fria e muito sutil
- superficies de conteudo em grafite azulado quase opaco
- bordas finas com contraste de prata
- reflexos em cinza frio, branco e azul-gelo
- textura metalica quase imperceptivel, sem fotografia de metal
- pontos de cor reservados aos dados e estados

Um tema claro pode ser desenvolvido depois da validacao do MVP. O design system deve usar tokens semanticos desde o inicio para nao bloquear essa evolucao.

### Paleta inicial para prototipacao

Os valores abaixo sao ponto de partida, sujeitos a teste de contraste:

| Token | Valor inicial | Uso |
| --- | --- | --- |
| `canvas` | `#090B0F` | fundo global |
| `canvas-elevated` | `#10141A` | zonas elevadas |
| `surface` | `#151A21` | conteudo principal |
| `surface-strong` | `#1B222C` | tabela e formulario |
| `silver-100` | `#F4F7FA` | reflexo e texto forte |
| `silver-300` | `#C8D0D8` | prata principal |
| `silver-500` | `#89939F` | texto secundario e borda |
| `ice` | `#B9E7FF` | foco e acao primaria |
| `positive` | `#79D6A3` | entrada e saldo positivo |
| `negative` | `#FF8C92` | saida, risco e atraso |
| `warning` | `#F3C878` | compromisso e atencao |

### Tipografia

- usar uma sans-serif funcional e altamente legivel como base
- aplicar numeros tabulares em valores monetarios e tabelas
- usar pesos medios e semibold em vez de excesso de bold
- reservar texto com acabamento metalico apenas para marca, titulo editorial ou um valor heroico
- nunca aplicar gradiente metalico em textos operacionais, rotulos pequenos ou dados criticos

### Forma

- cantos arredondados generosos, mas nao identicos em todos os componentes
- controles em capsula apenas quando a forma indicar agrupamento ou acao rapida
- cards de patrimonio podem lembrar discretamente as proporcoes e o peso visual de um cartao fisico
- bordas internas e externas devem manter concentricidade

### Textura metalica

O efeito de prata deve ser construido com:

- gradientes de baixa amplitude
- highlight especular fino nas bordas
- sombra interna controlada
- ruido monocromatico extremamente sutil
- variacao de luz ligada ao estado de hover apenas em dispositivos precisos

Evitar:

- cromado espelhado
- alto contraste em zigue-zague
- textura realista de chapa
- brilho constante em movimento
- efeito metalico em grandes blocos de texto

## Sistema de Materiais

### `glass-control`

Uso: navegacao, seletor de mes, filtros, botoes flutuantes, menus e controles transitorios.

Caracteristicas:

- transparencia moderada
- `backdrop-filter` controlado
- borda luminosa contextual
- sombra curta de separacao
- estado opaco alternativo para acessibilidade e compatibilidade

### `metal-asset`

Uso: card principal de saldo, cartoes, patrimonio investido e momentos de destaque.

Caracteristicas:

- superficie predominantemente opaca
- gradiente prateado de baixo contraste
- borda especular
- textura estatica sutil
- texto escuro ou claro conforme contraste medido

### `solid-content`

Uso: transacoes, graficos, formularios, tabelas, mensagens e detalhes.

Caracteristicas:

- fundo opaco ou com transparencia minima
- leitura estavel
- pouca ou nenhuma textura
- separacao por espacamento antes de sombra

### `semantic-glow`

Uso: foco, alerta e confirmacao.

Caracteristicas:

- halo pequeno e temporario
- sempre acompanhado por icone, texto ou mudanca estrutural
- nunca usado como unica forma de comunicar estado

## Componentes Reutilizaveis

### Primitivos visuais

| Componente | Responsabilidade |
| --- | --- |
| `GlassSurface` | material de vidro para controles e navegacao |
| `MetalSurface` | superficie metalica para ativos e destaques |
| `ContentSurface` | superficie legivel para conteudo denso |
| `SpecularBorder` | acabamento de borda compartilhado sem duplicar CSS |
| `MoneyText` | valor monetario com alinhamento e numeros tabulares |
| `StatusMark` | estado semantico com cor, icone e rotulo |
| `FocusRing` | foco de teclado consistente e visivel |

Os primitivos devem oferecer poucas variantes semanticas. Evitar uma API que permita combinar livremente dezenas de efeitos.

### Componentes de produto

| Componente | Papel no produto | Material dominante |
| --- | --- | --- |
| `BalanceCard` | saldo livre e disponibilidade real | metal |
| `BucketCard` | saldo de `livre`, `VR` ou `VT` | solido com detalhe metalico |
| `CommitmentCard` | fatura, parcelas e compromissos | solido |
| `MetricTile` | economizado, investido e variacao | solido |
| `MonthControl` | troca de competencia mensal | vidro |
| `AppDock` | navegacao principal responsiva | vidro |
| `QuickAction` | nova entrada, saida ou compra | vidro com foco semantico |
| `TransactionRow` | leitura rapida de movimentacao | solido |
| `ChartPanel` | grafico e legenda | solido |
| `FormSheet` | cadastro sem perder contexto | solido sob controle de vidro |
| `EmptyState` | orientar a primeira acao | solido |

## Arquitetura de Informacao do MVP

### Navegacao principal

Manter no primeiro nivel apenas:

- Visao geral
- Movimentacoes
- Planejamento
- Carteira

Categorias, contas e preferencias ficam em fluxos secundarios. Investimentos podem iniciar dentro de `Carteira`, evitando uma navegacao fragmentada antes de haver volume funcional.

### Dashboard

Ordem de leitura proposta:

1. contexto do mes e saudacao curta
2. saldo livre disponivel como elemento heroico
3. buckets `livre`, `VR` e `VT`
4. compromissos proximos e limite seguro no credito
5. entradas, saidas, economizado e investido
6. distribuicao de gastos por categoria
7. transacoes recentes
8. acoes rapidas persistentes, sem cobrir conteudo

O total agregado pode existir como resumo, mas nunca substitui a separacao dos buckets.

### Mobile

- uma coluna principal
- card heroico reduzido, sem perder o saldo livre
- dock inferior com quatro destinos
- formularios apresentados em sheet de altura adaptavel
- graficos com resumo textual e detalhamento sob demanda
- tabelas transformadas em linhas ou cards, sem rolagem horizontal obrigatoria

### Desktop

- navegacao lateral flutuante ou trilho compacto
- conteudo em grade de ate doze colunas
- painel principal com largura de leitura controlada
- detalhes podem abrir em painel lateral, preservando o contexto

## Estados Essenciais

Cada componente de dados deve definir antes da implementacao:

- carregando
- vazio inicial
- vazio por filtro
- sucesso
- erro recuperavel
- erro de permissao ou sessao
- valor indisponivel
- conteudo oculto pelo modo de privacidade

O modo de privacidade, que mascara valores financeiros rapidamente, e uma oportunidade de produto coerente com a proposta premium e segura.

## Movimento e Interacao

### Comportamento recomendado

- feedback de pressao entre `100ms` e `160ms`
- transicoes de layout entre `180ms` e `260ms`
- easing suave com desaceleracao clara
- reflexo responde ao ponteiro somente em componentes de destaque
- componentes de vidro elevam ou ganham definicao durante interacao
- contadores podem animar apenas em mudancas importantes, sem executar em toda renderizacao

### Restricoes

- respeitar `prefers-reduced-motion`
- nao animar continuamente `filter`, blur, ruido ou gradiente
- nao usar parallax como requisito de compreensao
- nao bloquear uma acao ate o fim de uma animacao decorativa

## Acessibilidade e Legibilidade

- contraste minimo WCAG AA para texto e controles
- foco de teclado sempre visivel
- alvos interativos com pelo menos `44px` no mobile
- estado financeiro nunca comunicado somente por cor
- alternativa opaca quando `prefers-reduced-transparency` estiver disponivel e classe manual para navegadores sem suporte
- modo de alto contraste deve remover texturas e reforcar bordas
- graficos devem ter legenda, valor textual e padroes distinguiveis
- blur nunca pode ser necessario para ler o conteudo da frente

## Performance e Compatibilidade

- limitar `backdrop-filter` a controles flutuantes e pequenas regioes
- evitar varias camadas de blur sobrepostas
- nao aplicar blur individual a cada linha ou card de uma lista
- fornecer fundo opaco como fallback
- usar textura de ruido pequena e reutilizavel ou CSS, sem imagens grandes
- testar primeiro em Safari, Chrome e Firefox atuais, incluindo dispositivos moveis medianos
- medir o custo dos efeitos no prototipo antes de expandir o sistema

## Fases de Trabalho

### Fase 0 - Exploracao visual

Entregas:

- moodboard com referencias de vidro, prata, cartoes e instrumentos de precisao
- dois style tiles: `Platinum Night` e uma alternativa mais clara
- teste de tipografia, saldo heroico e contraste
- escolha do nome visual definitivo

Criterio de saida:

- uma direcao aprovada com exemplos de uso correto e incorreto dos materiais

### Fase 1 - Fundacao do design system

Entregas:

- tokens de cor, espacamento, raio, elevacao, material e movimento
- primitivas visuais
- estados de foco, hover, active, disabled, loading e error
- pagina de laboratorio local para validar combinacoes

Criterio de saida:

- componentes funcionam com teclado, reduced motion, fallback sem blur e breakpoints principais

### Fase 2 - Vertical slice do dashboard

Entregas:

- `AppShell` e navegacao responsiva
- seletor de mes
- saldo heroico
- cards de bucket
- compromissos e limite seguro
- resumo mensal
- transacoes recentes com dados simulados ou view model existente

Criterio de saida:

- uma tela completa valida hierarquia, materiais, responsividade e densidade real de dados

### Fase 3 - Movimentacoes e formularios

Entregas:

- lista e filtros de transacoes
- cadastro de entrada
- cadastro de saida imediata
- estados de validacao e retorno das Server Actions
- experiencia de vazio e erro

Criterio de saida:

- fluxo completo pode ser realizado por teclado e em viewport mobile

### Fase 4 - Planejamento, carteira e credito

Entregas:

- planejamento mensal
- contas e beneficios
- cartoes, fatura e compromissos
- investimentos manuais
- categorias como fluxo secundario

Criterio de saida:

- conceitos financeiros distintos possuem hierarquia visual coerente e nao dependem apenas de cor

### Fase 5 - Autenticacao e acabamento

Entregas:

- login alinhado a identidade
- skeletons e transicoes entre rotas
- modo de privacidade
- revisao de acessibilidade
- auditoria de performance visual
- revisao de textos e formatacao monetaria

Criterio de saida:

- experiencia consistente do login ao registro e consulta de dados

## Ordem Recomendada de Prototipacao

Embora o login seja necessario para o produto, o dashboard deve ser o primeiro prototipo visual. Ele contem a maior variedade de dados e define se a linguagem de materiais realmente funciona.

Ordem:

1. dashboard desktop
2. dashboard mobile
3. formulario de nova movimentacao
4. lista de movimentacoes
5. planejamento e credito
6. login

## Decisoes que Devem Permanecer Abertas

- nome final da identidade visual
- tema escuro exclusivo no MVP ou suporte inicial a tema claro
- navegacao lateral expandida ou trilho compacto no desktop
- intensidade da textura de prata
- uso de fonte licenciada ou apenas fonte aberta/local
- presenca do modo de privacidade no primeiro release

Essas decisoes devem ser resolvidas com prototipos, nao apenas por preferencia verbal.

## Anti-padroes

- aplicar glassmorphism em todos os cards
- usar texto cinza claro sobre vidro sem contraste previsivel
- transformar prata em cinza uniforme sem luz, profundidade ou textura
- adicionar reflexos animados permanentes
- usar verde para toda acao positiva e vermelho para toda despesa sem considerar o contexto
- esconder informacoes importantes para preservar uma composicao minimalista
- criar componentes altamente configuraveis antes de haver casos reais de reutilizacao
- imitar componentes ou marcas da Apple de forma literal

## Validacao da Direcao

Antes de consolidar o design system, testar o prototipo com tarefas concretas:

1. identificar quanto existe de saldo livre
2. diferenciar saldo livre, VR e VT
3. entender quanto ja esta comprometido
4. registrar uma saida
5. localizar uma transacao recente
6. identificar um alerta de fatura ou limite seguro

Metas iniciais:

- informacao financeira principal encontrada sem exploracao da tela
- nenhum erro entre saldo total e saldo livre
- fluxo principal utilizavel em teclado e mobile
- leitura preservada com transparencia e movimento reduzidos
- ausencia de queda perceptivel de fluidez causada pelos materiais

## Referencias de Base

- Apple Human Interface Guidelines, `Materials`: Liquid Glass deve formar uma camada funcional para controles e navegacao, separada do conteudo.
- Apple, `Meet Liquid Glass`: adaptatividade, lensing, resposta a interacao e legibilidade sao propriedades do sistema, nao apenas blur decorativo.
- WCAG deve orientar contraste, foco, comunicacao de estados e alternativas acessiveis.

As referencias servem como principio de estudo. A implementacao web deve formar identidade propria e respeitar as necessidades especificas de um organizador financeiro.
