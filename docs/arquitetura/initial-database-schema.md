# Initial Database Schema

Este documento resume a primeira migracao do projeto.

Arquivo fonte:

- `supabase/migrations/20260712_001_initial_schema.sql`

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
- `supabase/migrations/20260725_002_finance_schema_adjustments.sql`
- `supabase/migrations/20260725_003_monthly_planning.sql`
