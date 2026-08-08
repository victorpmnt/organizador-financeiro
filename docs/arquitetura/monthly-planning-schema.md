---
doc_id: DOC-ARCH-003
title: Planejamento Mensal e Ajustes do Schema Financeiro
type: architecture
status: draft
version: 1.0.0
owner: TBD
created_at: 2026-08-05
updated_at: 2026-08-05
review_due:
domain: arquitetura
audited_by: TBD
summary: Documenta os ajustes do schema financeiro e a modelagem de planejamento mensal introduzidos apos a migracao inicial.
rag_ready: true
tags:
  - monthly-planning
  - database
  - schema
  - finance
related_docs:
  - "[[docs/arquitetura/initial-database-schema]]"
  - "[[docs/planos/backend-mvp-plan]]"
---

# Planejamento Mensal e Ajustes do Schema Financeiro

Este documento registra a comparacao entre as regras de negocio do MVP e as migracoes que sucedem o schema inicial.

Arquivos executaveis:

- `supabase/migrations/20260725000002_finance_schema_adjustments.sql`
- `supabase/migrations/20260725000003_monthly_planning.sql`

## Separacao dos conceitos

O banco nao armazena `planejado`, `recebido`, `comprometido` e `disponivel` como quatro saldos independentes.

Cada leitura tem uma fonte diferente:

| Leitura | Fonte |
| --- | --- |
| planejado | `monthly_plans` e `monthly_plan_items` |
| recebido | entradas confirmadas em `transactions` |
| saldo atual | saldo inicial mais transacoes com `affects_balance = true` |
| comprometido | registros de `commitments` ainda nao liquidados |
| disponivel | calculo por bucket feito a partir das fontes anteriores |

Essa separacao impede que uma expectativa de renda seja tratada como dinheiro ja recebido.

## Migracao 002 - Ajustes do fluxo real

A migracao `002` complementa a primeira versao sem altera-la.

Principais ajustes:

- garante que conta e categoria referenciadas pertencam ao mesmo usuario do registro
- valida a correspondencia entre fonte de renda e bucket
- restringe contas de beneficio aos buckets de VR e VT
- adiciona o bucket consumido por cada compromisso
- liga um compromisso a transacao que o originou, quando aplicavel
- exige uma transacao real para liquidar um compromisso
- diferencia despesas imediatas de compras no credito com `affects_balance`

### Fluxo do cartao

No MVP, compra e pagamento sao eventos diferentes.

1. A compra e registrada como despesa com `expense_nature = credit_card`.
2. Essa transacao tem `affects_balance = false`.
3. A compra origina um `commitment` do bucket `free`.
4. O pagamento da fatura e uma nova transacao de saida que afeta saldo.
5. A transacao de pagamento liquida o compromisso.

Consultas de consumo por categoria consideram a compra. Consultas de saldo consideram apenas transacoes com `affects_balance = true`. Assim, compra e pagamento nao devem ser somados como duas despesas de consumo.

O comprometido tambem nao pode ser duplicado. Se as compras estiverem detalhadas, os compromissos devem representar esses valores individuais ou suas parcelas, sem criar outra linha agregada para a fatura inteira. O compromisso agregado de fatura e uma alternativa para quando o usuario informar apenas o total da fatura.

## Migracao 003 - Planejamento mensal

`monthly_plans` representa o contexto de um mes:

- um plano por usuario e mes
- mes normalizado para o primeiro dia
- reserva minima do saldo livre
- observacoes opcionais

`monthly_plan_items` representa as expectativas:

- entrada ou saida
- bucket
- valor
- fonte de renda ou natureza da despesa
- categoria, descricao e data esperada opcionais

Criar ou editar esses registros nao movimenta saldo e nao cria compromisso automaticamente.

## Calculos derivados

Formula conceitual do saldo atual por bucket:

```txt
saldo_atual =
  soma_dos_saldos_iniciais
  + entradas_confirmadas
  - saidas_confirmadas_que_afetam_saldo
```

Formula conceitual do comprometido:

```txt
comprometido =
  soma_dos_compromissos_nao_liquidados
```

Formula conceitual do disponivel:

```txt
disponivel =
  saldo_atual
  - comprometido_aplicavel
```

Formula conceitual do limite seguro no credito:

```txt
limite_seguro_credito =
  saldo_livre_atual
  - compromissos_ate_o_vencimento
  - reserva_minima_do_mes
```

Resultados negativos devem ser apresentados como indisponibilidade ou alerta, nao como autorizacao para novo gasto.

## Ordem de aplicacao manual

Como a migracao inicial ja foi executada no SQL Editor:

1. executar todo o arquivo `20260725000002_finance_schema_adjustments.sql`
2. confirmar que a execucao terminou sem erro
3. executar todo o arquivo `20260725000003_monthly_planning.sql`
4. confirmar no Table Editor a existencia de `monthly_plans` e `monthly_plan_items`

Nao executar a `001` novamente no mesmo banco.
