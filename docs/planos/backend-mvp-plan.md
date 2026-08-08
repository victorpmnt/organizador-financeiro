---
doc_id: DOC-PLAN-001
title: Plano Tecnico de Implementacao do Backend do MVP
type: plan
status: draft
version: 1.3.0
owner: TBD
created_at: 2026-08-05
updated_at: 2026-08-07
review_due:
domain: backend
audited_by: TBD
summary: Plano tecnico para implementar o backend do MVP, cobrindo modulos, casos de uso, fases e riscos principais.
rag_ready: false
tags:
  - backend
  - mvp
  - plan
  - architecture
related_docs:
  - "[[docs/arquitetura/monthly-planning-schema]]"
  - "[[docs/arquitetura/supabase-cli]]"
  - "[[docs/arquitetura/serverless-vercel-supabase-architecture]]"
---

# Plano Tecnico de Implementacao do Backend do MVP

## 1. Leitura do estado atual

O projeto ja tem o dominio central definido em `app/AGENTS.md`: o MVP e orientado a buckets de saldo, compromissos futuros e leituras derivadas de `planejado`, `recebido`, `comprometido` e `disponivel`.

No banco, o schema principal ja existe em migracoes versionadas com:

- enums canonicos de bucket, origem de renda, natureza de despesa e tipo de compromisso
- tabelas de `profiles`, `accounts`, `categories`, `transactions`, `commitments`, `goals`
- ajustes de integridade para fluxo financeiro real
- planejamento mensal em `monthly_plans` e `monthly_plan_items`
- RLS aplicado nas tabelas principais

A arquitetura alvo tambem ja foi definida: `domain`, `application`, `infrastructure`, `interface` e `app`, com o backend rodando dentro do ecossistema `Next.js App Router`, sem servico separado.

No codigo, ja existe um inicio de estrutura em `src/modules/finance`, mas ainda como base de modelagem. A integracao real com Supabase e os casos de uso centrais do backend ainda nao foram implementados.

## 2. Objetivo real do backend do MVP

O backend minimo viavel deste projeto nao e um CRUD financeiro generico.

Ele precisa ser capaz de:

- autenticar o usuario obrigatoriamente
- persistir contas, categorias, transacoes, compromissos e planejamento mensal
- registrar entradas e saidas respeitando `balance_bucket`
- registrar compras no credito como consumo diferido e compromisso futuro
- registrar pagamento de fatura como liquidacao de compromisso e reducao real do bucket `free`
- calcular leituras derivadas por bucket sem persistir `disponivel` como saldo materializado
- manter isolamento total por usuario com apoio de RLS e validacoes na aplicacao

Se isso funcionar de ponta a ponta, o backend do MVP ja atende a regra central do produto.

### Contrato de execucao em producao

O backend do MVP deve funcionar exclusivamente com `Next.js` na Vercel e Supabase, conforme `docs/arquitetura/serverless-vercel-supabase-architecture.md`.

Regras obrigatorias:

- nao criar backend separado, servidor dedicado, VPS, container permanente ou microservico
- executar Server Components, Server Actions, Proxy e Route Handlers no runtime gerenciado pela Vercel
- acessar dados com `supabase-js` pela Data API HTTPS
- nao abrir conexao Postgres direta pela aplicacao
- nao adicionar ORM ou driver que dependa de conexao Postgres direta
- nao manter pool de conexoes na aplicacao
- criar o Supabase server client dentro do contexto de cada requisicao
- nao armazenar sessao, client autenticado ou estado de usuario em variavel global
- usar a publishable key e o JWT do usuario nos fluxos normais
- manter `SUPABASE_SECRET_KEY` fora dos fluxos normais do MVP
- implementar operacoes compostas que exigem atomicidade como funcoes RPC transacionais no Supabase
- nao introduzir Supabase Edge Functions sem necessidade especifica aprovada

## 3. Modulos e responsabilidades

### `auth`

Responsabilidade:

- garantir autenticacao server-side
- expor o usuario autenticado para os casos de uso
- proteger acessos internos do backend

Conceitos centrais:

- sessao
- usuario autenticado
- guardas de autenticacao

Casos de uso principais:

- obter usuario atual
- exigir autenticacao

Dependencias:

- Supabase Auth
- composicao do Next.js

### `finance-core`

Responsabilidade:

- concentrar as regras estaveis do dominio financeiro
- validar compatibilidade de bucket
- calcular leituras derivadas

Conceitos centrais:

- `Transaction`
- `Commitment`
- `MonthlyPlan`
- `BalanceBucket`
- `ExpenseNature`
- `IncomeSource`

Casos de uso principais:

- calcular saldo por bucket
- calcular comprometido
- calcular disponivel
- calcular limite seguro no credito

Dependencias:

- nenhuma externa

### `accounts`

Responsabilidade:

- gerenciar contas financeiras do usuario

Conceitos centrais:

- `Account`
- `account_type`
- `balance_bucket`
- saldo inicial

Casos de uso principais:

- criar conta
- listar contas
- validar bucket compativel com tipo de conta

Dependencias:

- `auth`
- `finance-core`

### `categories`

Responsabilidade:

- gerenciar categorias usadas por gastos e classificacao

Conceitos centrais:

- `Category`
- `category_kind`
- `expense_nature`

Casos de uso principais:

- criar categoria
- listar categorias
- validar semantica da categoria

Dependencias:

- `auth`
- `finance-core`

### `transactions`

Responsabilidade:

- registrar movimentacoes confirmadas que afetam ou nao o saldo real

Conceitos centrais:

- direcao
- bucket
- `affects_balance`
- entrada e saida confirmada

Casos de uso principais:

- lancar entrada
- lancar saida imediata
- listar transacoes do mes

Dependencias:

- `accounts`
- `categories`
- `auth`
- `finance-core`

### `commitments`

Responsabilidade:

- modelar obrigacoes futuras e sua liquidacao

Conceitos centrais:

- `Commitment`
- `commitment_type`
- vencimento
- liquidacao

Casos de uso principais:

- criar compromisso originado por compra no credito
- listar compromissos em aberto
- liquidar compromisso por pagamento

Dependencias:

- `transactions`
- `accounts`
- `categories`
- `auth`
- `finance-core`

### `monthly-planning`

Responsabilidade:

- armazenar expectativas mensais sem mover saldo

Conceitos centrais:

- `MonthlyPlan`
- `MonthlyPlanItem`
- reserva minima do mes

Casos de uso principais:

- criar ou atualizar plano mensal
- listar plano mensal
- comparar planejado com realizado

Dependencias:

- `categories`
- `auth`
- `finance-core`

### `dashboard`

Responsabilidade:

- compor leituras consolidadas do mes atual

Conceitos centrais:

- resumo por bucket
- comprometido
- disponivel
- planejado versus realizado

Casos de uso principais:

- obter dashboard mensal
- obter gastos por categoria
- obter resumo por bucket

Dependencias:

- `transactions`
- `commitments`
- `monthly-planning`

## 4. Casos de uso priorizados

### Prioridade 1 - autenticacao e identidade

- `require-authenticated-user`
- `get-current-user`

Motivo:

Todo o backend depende de identidade segura. Sem isso, qualquer regra de multi-tenant fica fragil.

### Prioridade 2 - bases referenciais

- `create-account`
- `list-accounts`
- `create-category`
- `list-categories`

Motivo:

Contas e categorias sao prerequisitos para lancamentos consistentes.

### Prioridade 3 - fluxo basico de caixa real

- `create-income-entry`
- `create-immediate-expense`
- `list-transactions-by-month`

Motivo:

Esses casos de uso fazem o saldo real existir no sistema e validam bucket, conta e categoria.

### Prioridade 4 - leituras derivadas do saldo

- `get-bucket-balances`
- `get-committed-balances`
- `get-available-balances`
- `calculate-safe-credit-limit`

Motivo:

O produto e orientado a leitura derivada por bucket. Sem isso, o backend ainda nao entrega a principal regra de decisao.

### Prioridade 5 - fluxo de credito

- `create-credit-card-purchase`
- `list-open-commitments`
- `pay-commitment`

Motivo:

Esse e o fluxo mais sensivel do dominio e precisa ser implementado depois que o caixa real estiver estavel.

### Prioridade 6 - planejamento mensal

- `upsert-monthly-plan`
- `list-monthly-plan`
- `compare-planned-vs-actual`

Motivo:

Planejamento depende de saldo, compromisso e leituras reais ja corretos.

### Prioridade 7 - dashboard consolidado

- `get-monthly-dashboard`

Motivo:

O dashboard deve ser consequencia dos fluxos anteriores, nao a base do backend.

## 5. Estrutura tecnica sugerida

```txt
src/
|-- modules/
|   |-- auth/
|   |   |-- application/
|   |   |   `-- use-cases/
|   |   |       |-- get-current-user.ts
|   |   |       `-- require-authenticated-user.ts
|   |   `-- infrastructure/
|   |       `-- supabase/
|   |           `-- supabase-auth-gateway.ts
|   |
|   `-- finance/
|       |-- domain/
|       |   |-- entities/
|       |   |   |-- account.ts
|       |   |   |-- category.ts
|       |   |   |-- transaction.ts
|       |   |   |-- commitment.ts
|       |   |   `-- monthly-plan.ts
|       |   |-- enums/
|       |   `-- services/
|       |       |-- calculate-bucket-balance.ts
|       |       |-- calculate-committed-balance.ts
|       |       |-- calculate-available-balance.ts
|       |       |-- calculate-safe-credit-limit.ts
|       |       `-- validate-expense-bucket-compatibility.ts
|       |
|       |-- application/
|       |   |-- dtos/
|       |   |-- ports/
|       |   |   |-- account-repository.ts
|       |   |   |-- category-repository.ts
|       |   |   |-- transaction-repository.ts
|       |   |   |-- commitment-repository.ts
|       |   |   |-- monthly-plan-repository.ts
|       |   |   `-- finance-read-repository.ts
|       |   `-- use-cases/
|       |       |-- create-account.ts
|       |       |-- create-category.ts
|       |       |-- create-income-entry.ts
|       |       |-- create-immediate-expense.ts
|       |       |-- create-credit-card-purchase.ts
|       |       |-- pay-commitment.ts
|       |       |-- upsert-monthly-plan.ts
|       |       |-- get-bucket-balances.ts
|       |       `-- get-monthly-dashboard.ts
|       |
|       |-- infrastructure/
|       |   `-- supabase/
|       |       |-- client.ts
|       |       |-- mappers/
|       |       |   |-- account-mapper.ts
|       |       |   |-- category-mapper.ts
|       |       |   |-- transaction-mapper.ts
|       |       |   |-- commitment-mapper.ts
|       |       |   `-- monthly-plan-mapper.ts
|       |       `-- repositories/
|       |           |-- supabase-account-repository.ts
|       |           |-- supabase-category-repository.ts
|       |           |-- supabase-transaction-repository.ts
|       |           |-- supabase-commitment-repository.ts
|       |           |-- supabase-monthly-plan-repository.ts
|       |           `-- supabase-finance-read-repository.ts
|       |
|       `-- interface/
|           |-- schemas/
|           |   |-- create-account-schema.ts
|           |   |-- create-category-schema.ts
|           |   |-- create-income-entry-schema.ts
|           |   |-- create-immediate-expense-schema.ts
|           |   |-- create-credit-card-purchase-schema.ts
|           |   |-- pay-commitment-schema.ts
|           |   `-- upsert-monthly-plan-schema.ts
|           |-- presenters/
|           `-- view-models/
```

Observacoes:

- `app/` deve ficar responsavel por composicao do Next.js
- `server actions` devem chamar casos de uso
- repositorios concretos do Supabase ficam em `infrastructure`
- schemas de entrada para formularios e actions ficam em `interface`
- o server client do Supabase deve ser criado por requisicao, usando os cookies da requisicao atual
- o browser client pode usar o comportamento singleton de `createBrowserClient`
- repositories acessam o Supabase pela Data API HTTPS, nunca por conexao Postgres direta

## 6. Fluxo de autenticacao e seguranca

### Autenticacao

- usar Supabase SSR para recuperar sessao no servidor
- usar `Proxy` do Next.js para renovar tokens e propagar cookies atualizados
- validar identidade no servidor com uma chamada que verifique as claims do JWT
- nao usar `getSession()` como verificacao autoritativa em codigo de servidor
- toda leitura ou escrita sensivel deve obter o usuario autenticado no servidor
- nunca confiar em `userId` vindo do cliente

### Autorizacao

A autorizacao deve existir em tres niveis:

- camada `application` exigindo usuario autenticado
- `RLS` no banco
- validacoes de integridade no caso de uso para rejeitar referencias inconsistentes

### RLS

Diretrizes:

- manter RLS ativado em todas as tabelas do dominio
- versionar policies em migracoes
- nao depender de regra manual no painel do Supabase

### Validacao

Separacao recomendada:

- `Zod` na interface para shape, coercao e erros de entrada
- `domain` e `application` para regra de negocio
- banco como ultima defesa com constraints e foreign keys

### Isolamento por usuario

- usar client autenticado do usuario nas `server actions`
- manter relacionamentos sensiveis com integridade multi-tenant por `(id, user_id)` quando necessario
- evitar consultas que assumam isolamento apenas pelo filtro da tabela principal

### Uso correto de chaves Supabase

- publishable key no browser e no client SSR autenticado
- client SSR com cookies e JWT para operacoes do usuario
- `SUPABASE_SECRET_KEY` apenas para eventual caso administrativo explicito e isolado
- secret key fora do frontend, dos repositories normais e dos fluxos do usuario
- a existencia da secret key no ambiente nao autoriza seu uso automatico

## 7. Fluxos criticos do dominio

### Cadastro de conta

Entrada:

- nome
- tipo
- bucket
- saldo inicial

Regras:

- conta `benefit` so pode usar `meal_benefit` ou `transport_benefit`
- contas nao-beneficio usam `free`

Persistencia:

- `accounts`

### Cadastro de categoria

Entrada:

- nome
- `category_kind`
- `expense_nature` quando aplicavel

Regras:

- semantica da categoria deve ser coerente com o tipo

Persistencia:

- `categories`

### Lancamento de entrada

Entrada:

- valor
- data
- descricao
- conta
- bucket
- `income_source`

Regras:

- bucket precisa corresponder a origem da renda
- entrada afeta saldo

Persistencia:

- `transactions` com `direction = income`

### Lancamento de saida imediata

Entrada:

- valor
- data
- categoria
- conta
- bucket
- `expense_nature` diferente de `credit_card`

Regras:

- bucket precisa ser compativel com a natureza da despesa
- a saida afeta saldo imediatamente

Persistencia:

- `transactions` com `direction = expense`

### Compra no credito

Entrada:

- valor
- data da compra
- categoria
- descricao
- vencimento esperado

Regras:

- usa bucket `free`
- registra consumo
- nao reduz saldo no ato
- gera compromisso futuro

Persistencia:

- cria `transaction` com `direction = expense`
- `expense_nature = credit_card`
- `affects_balance = false`
- cria `commitment` ligado por `source_transaction_id`

### Pagamento de fatura

Entrada:

- compromisso ou conjunto de compromissos
- conta pagadora
- data de pagamento

Regras:

- reduz apenas bucket `free`
- liquida compromisso existente
- nao recria consumo

Persistencia:

- cria nova `transaction` de saida confirmada
- marca `commitment` com `settled_at`
- preenche `settlement_transaction_id`

### Leitura de saldo por bucket

Fonte:

- saldo inicial das contas do bucket
- entradas confirmadas
- saidas confirmadas que afetam saldo

Regras:

- nao incluir planejamento mensal
- nao descontar compromisso duas vezes

### Leitura de comprometido

Fonte:

- compromissos em aberto por bucket

Regras:

- no MVP, o foco principal esta no comprometido do bucket `free`

### Leitura de disponivel

Formula conceitual:

```txt
disponivel = saldo_atual_do_bucket - comprometido_aplicavel_do_bucket
```

Regras:

- nao persistir como saldo independente
- para `free`, considerar tambem a reserva minima quando a leitura representar capacidade segura

### Planejamento mensal

`monthly_plans`:

- contexto do mes
- reserva minima
- observacoes

`monthly_plan_items`:

- expectativas de entrada e saida
- nao movem saldo
- nao criam compromisso automaticamente

## 8. Plano incremental de implementacao

### Fase 1 - fundacao de autenticacao e persistencia base

Entregaveis:

- client Supabase de servidor criado por requisicao
- browser client para autenticacao e interacoes estritamente necessarias no cliente
- Proxy para renovacao segura da sessao e propagacao de cookies
- obtencao de usuario autenticado no servidor
- repositorios reais de `accounts` e `categories`
- casos de uso `create-account`, `list-accounts`, `create-category`, `list-categories`

Dependencias:

- variaveis de ambiente
- integracao Supabase SSR
- Data API acessivel para o role `authenticated`

Riscos:

- acoplamento do `app/` direto ao banco
- misturar autenticacao com regra de negocio

Criterios de pronto:

- usuario autenticado consegue criar e listar contas e categorias proprias
- repositories usam publishable key, cookies da sessao e Data API HTTPS
- nenhum fluxo da fase usa `SUPABASE_SECRET_KEY` ou conexao Postgres direta

Status de implementacao em 2026-08-06:

- server client e browser client implementados com publishable key
- server client criado por requisicao e integrado aos cookies do Next.js
- `proxy.ts` implementado para renovar a sessao com `getClaims()` e propagar cookies e headers privados
- identidade autenticada obtida no servidor sem aceitar `userId` vindo das actions
- repositories Supabase reais de `accounts` e `categories` implementados pela Data API HTTPS
- casos de uso `create-account`, `list-accounts`, `create-category` e `list-categories` implementados
- schemas Zod e Server Actions finas implementados na camada de entrega
- testes unitarios cobrem autenticacao obrigatoria, ownership e regras de conta e categoria
- validacao ponta a ponta com usuario real depende do fluxo de login da aplicacao

### Fase 2 - fluxo basico de caixa confirmado

Entregaveis:

- `create-income-entry`
- `create-immediate-expense`
- `list-transactions-by-month`
- `get-bucket-balances`

Dependencias:

- fase 1 concluida

Riscos:

- erro de validacao de bucket
- leitura incorreta do saldo atual

Criterios de pronto:

- entradas e saidas imediatas refletem corretamente no saldo por bucket

Status de implementacao em 2026-08-07:

- caso de uso `create-income-entry` implementado com validacao de bucket pela conta escolhida
- caso de uso `create-immediate-expense` implementado com categoria obrigatoria e bloqueio de fluxo de credito
- caso de uso `list-transactions-by-month` implementado com leitura por intervalo derivado de `YYYY-MM`
- caso de uso `get-bucket-balances` implementado a partir de saldo inicial das contas e transacoes que afetam saldo
- repositorio Supabase real de `transactions` implementado via Data API HTTPS
- Server Actions e schemas Zod da Fase 2 implementados na camada de entrega
- testes unitarios cobrem regras principais de bucket, categoria e leitura de saldo

### Fase 3 - compromissos e credito

Entregaveis:

- `create-credit-card-purchase`
- `list-open-commitments`
- `pay-commitment`
- `get-committed-balances`
- `get-available-balances`
- `calculate-safe-credit-limit`
- funcoes RPC transacionais para compra com compromisso e pagamento com liquidacao

Dependencias:

- fase 2 concluida

Riscos:

- dupla contagem entre compra, compromisso e pagamento
- falta de atomicidade em operacoes compostas

Criterios de pronto:

- compra no credito aumenta consumo e comprometido, mas nao reduz caixa
- pagamento reduz caixa e liquida compromisso
- cada fluxo composto conclui integralmente ou nao persiste nenhuma alteracao

### Fase 4 - planejamento mensal e consolidacao

Entregaveis:

- `upsert-monthly-plan`
- `list-monthly-plan`
- `compare-planned-vs-actual`
- `get-monthly-dashboard`

Dependencias:

- fases 2 e 3 concluidas

Riscos:

- contaminar saldo confirmado com dados planejados
- dashboard nascer acoplado a consultas pouco reutilizaveis

Criterios de pronto:

- backend entrega leitura separada de planejado, recebido, comprometido e disponivel

## 9. Decisoes tecnicas recomendadas

- usar `Server Action` como default para fluxos internos do app
- usar `Route Handler` apenas quando houver necessidade real de endpoint HTTP
- executar o backend apenas no runtime gerenciado do Next.js na Vercel
- usar `supabase-js` e Supabase Data API por HTTPS como mecanismo de acesso a dados
- nao criar conexao Postgres direta, pool da aplicacao, servidor dedicado ou worker persistente
- criar o Supabase server client por requisicao e nunca compartilhar contexto autenticado entre requisicoes
- validar shape na interface e regras na `application` ou `domain`
- modelar repositorios por agregado ou por tipo de persistencia, nao um mega repositorio generico
- criar mapeadores para evitar contaminar dominio com formatos do Supabase
- manter calculos centrais fora de React, `page.tsx` e action handlers extensos
- para operacoes que criam transacao e compromisso juntos, usar RPC transacional no Supabase
- preferir `SECURITY INVOKER` nas RPCs e revisar grants, RLS e autorizacao antes de expo-las
- evitar separar em submodulos excessivos antes do volume real justificar

## 10. Riscos e pontos de atencao

- inconsistencia de regra se compatibilidade de bucket existir apenas no frontend
- dupla contagem financeira no fluxo de credito
- vazamento de dados entre usuarios por uso incorreto de client privilegiado
- dependencia excessiva de constraints SQL sem modelagem suficiente na aplicacao
- abstrações prematuras que compliquem o MVP antes da entrega do fluxo real
- consultas de dashboard misturando `planejado` e `confirmado`
- falta de atomicidade em fluxos compostos
- vazamento de sessao por reutilizacao de client autenticado entre invocacoes da Vercel
- introducao acidental de conexao Postgres direta ou infraestrutura persistente fora do contrato do MVP
- uso da secret key como atalho para contornar grants ou RLS

## 11. Proximo passo concreto

O proximo passo recomendado de implementacao e:

1. criar o server client Supabase por requisicao e o Proxy de renovacao de sessao
2. implementar `AccountRepository` e `CategoryRepository`
3. implementar `create-account` e `create-category`
4. implementar `create-income-entry` e `create-immediate-expense`
5. implementar `get-bucket-balances`
6. testar os cenarios criticos de bucket e isolamento por usuario

## Lacunas a decidir

Estas decisoes devem ser confirmadas antes de fechar a fase de credito:

- pagamento parcial de compromisso entra no MVP ou nao
- parcelamento sera modelado como multiplos `commitments` desde a origem ou apenas compromisso unico
- `fixed_bill` entra no MVP inicial como compromisso explicito ou fica para fase posterior
