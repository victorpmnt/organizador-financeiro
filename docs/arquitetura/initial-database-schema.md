---
doc_id: DOC-ARCH-002
title: Initial Database Schema
type: architecture
status: draft
version: 1.1.0
owner: TBD
created_at: 2026-08-05
updated_at: 2026-08-06
review_due:
domain: arquitetura
audited_by: TBD
summary: Resumo da migracao inicial do banco, cobrindo tipos, tabelas, RLS e diretrizes de evolucao do schema.
rag_ready: false
tags:
  - database
  - schema
  - supabase
  - rls
related_docs:
  - "[[docs/arquitetura/database-migrations]]"
  - "[[docs/arquitetura/monthly-planning-schema]]"
---

# Initial Database Schema

Este documento resume a primeira migracao do projeto.

Arquivo fonte:

- `supabase/migrations/20260712000001_initial_schema.sql`

## O que a migracao cria

### Tipos

- `balance_bucket`
- `income_source`
- `expense_nature`
- `commitment_type`
- `account_type`
- `category_kind`
- `transaction_direction`

### Tabelas

- `profiles`
- `accounts`
- `categories`
- `transactions`
- `commitments`
- `goals`

### Itens adicionais

- indices principais
- trigger de `updated_at`
- `Row Level Security`
- policies baseadas em `auth.uid()`

## Regra atual para `profiles.email`

Embora o schema inicial tenha criado `profiles.email` como coluna propria, a regra atual do projeto e que esse campo nao e fonte primaria de identidade.

Decisao vigente:

- `auth.users.email` e o email canonico da conta
- `public.profiles.email` existe apenas como espelho controlado do Auth
- o usuario nao deve conseguir divergir esse valor manualmente no perfil

Essa garantia passou a ser reforcada por migracao posterior com trigger de sincronizacao e protecao de escrita.

## Intencao de modelagem

O schema inicial segue o dominio definido em `app/AGENTS.md`.

Decisoes importantes:

- `balance_bucket` separa `free`, `meal_benefit` e `transport_benefit`
- `transactions` separam entradas e saidas via `transaction_direction`
- `income_source` e `expense_nature` garantem semantica minima das movimentacoes
- `commitments` modelam compromissos futuros, como fatura e parcelas
- `goals` ficam isoladas do fluxo transacional principal

## Limites desta primeira versao

Esta migracao ainda nao tenta resolver tudo.

Ainda podem surgir migracoes futuras para:

- planejamento mensal
- orcamento por categoria
- cartoes de credito como entidade dedicada
- reconciliacao de fatura
- visoes materializadas ou views para dashboard
- seeds de categorias padrao

## Como evoluir

Toda mudanca estrutural a partir daqui deve gerar uma nova migracao em vez de editar esta, exceto se a migracao ainda nao tiver sido compartilhada nem aplicada fora do ambiente local.

Como esta migracao ja foi aplicada no projeto remoto, ela deve ser tratada como historico imutavel.

As correcoes de integridade e o planejamento mensal foram adicionados posteriormente. Consulte:

- `docs/arquitetura/monthly-planning-schema.md`
- `supabase/migrations/20260725000002_finance_schema_adjustments.sql`
- `supabase/migrations/20260725000003_monthly_planning.sql`
- `supabase/migrations/20260806012235_enforce_profiles_email_from_auth.sql`
