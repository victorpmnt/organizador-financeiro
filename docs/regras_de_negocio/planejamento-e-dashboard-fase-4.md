---
doc_id: DOC-RULE-004
title: Planejamento Mensal, Comparacao e Dashboard - Fase 4
type: business-rules
status: approved
version: 1.0.0
owner: TBD
created_at: 2026-08-08
updated_at: 2026-08-08
review_due:
domain: finance
audited_by: TBD
summary: Define como o planejamento mensal sera comparado com valores realizados e quais leituras e insights o dashboard da Fase 4 deve entregar.
rag_ready: true
tags:
  - monthly-planning
  - dashboard
  - planned-vs-actual
  - finance
related_docs:
  - "[[docs/arquitetura/monthly-planning-schema]]"
  - "[[docs/regras_de_negocio/movimentacoes-imediatas-e-buckets-fase-2]]"
  - "[[docs/regras_de_negocio/credito-e-compromissos-fase-3]]"
  - "[[docs/planos/backend-mvp-plan]]"
---

# Planejamento Mensal, Comparacao e Dashboard - Fase 4

## 1. Principio do planejamento

O planejamento mensal representa expectativas. Ele nao confirma recebimento, nao movimenta saldo e nao cria compromisso automaticamente.

O MVP usa regime de caixa para definir o mes: o valor pertence ao mes em que se espera receber ou gastar o dinheiro.

Exemplo:

- salario planejado para 05/08: R$ 3.300;
- salario recebido em 05/08: R$ 3.260;
- variacao: R$ 40 abaixo do planejado, aproximadamente -1,21%.

O fato que causou a diferenca pode ter acontecido em julho, mas a comparacao financeira pertence a agosto, quando o dinheiro entrou. O planejamento deve preferir o valor liquido esperado na conta; controle detalhado de salario bruto, descontos, faltas e folha de pagamento fica para o roadmap.

## 2. Comparacao entre planejado e realizado

As entradas serao comparadas por:

```txt
mes + income_source + balance_bucket
```

As despesas serao comparadas por:

```txt
mes + category_id + balance_bucket
```

Quando houver mais de um item planejado no mesmo agrupamento, os valores serao somados. Descricao e observacoes sao informativas e nao serao usadas como chave de conciliacao no MVP.

Uma despesa planejada deve obrigatoriamente possuir categoria. Itens planejados de entrada nao precisam de categoria.

O realizado considera a data da transacao confirmada (`occurred_on`). `expected_on` e usado apenas como expectativa do planejamento e, quando informado, deve pertencer ao mes do plano.

## 3. Regra para compras no credito

Uma compra no credito e consumo no mes da compra, mesmo quando parcelada. Ela deve aparecer em planejado versus realizado como consumo da categoria e do bucket `free`.

As parcelas aparecem separadamente como compromissos nos meses de vencimento.

O pagamento da fatura:

- reduz o saldo da conta pagadora;
- liquida os compromissos correspondentes;
- nao e contado novamente como consumo ou despesa realizada.

Essa separacao evita dupla contagem entre compra, compromisso e pagamento.

## 4. Salvamento do plano mensal

O envio do formulario representa a versao completa do plano daquele mes.

O caso de uso deve usar uma RPC transacional do Supabase para:

1. criar ou atualizar o contexto em `monthly_plans`;
2. criar ou atualizar os itens enviados;
3. remover itens que nao fazem mais parte do plano;
4. confirmar tudo atomicamente.

Se qualquer etapa falhar, o plano anterior deve permanecer intacto. A RPC deve usar a identidade autenticada e respeitar RLS e isolamento por `user_id`.

## 5. Leituras oficiais do dashboard

O dashboard deve manter as leituras separadas:

| Leitura | Regra |
| --- | --- |
| Planejado | expectativas em `monthly_plans` e `monthly_plan_items` |
| Recebido | entradas confirmadas ocorridas no mes |
| Consumido | despesas reais e compras no credito ocorridas no mes |
| Saldo atual | saldo inicial mais movimentacoes confirmadas que afetam saldo |
| Comprometido | compromissos ainda nao liquidados |
| Disponivel | saldo atual menos comprometido aplicavel ao bucket |
| Limite seguro | disponivel do bucket `free` menos a reserva minima do plano |

Pagamentos de fatura ficam fora do consumo, mas entram no saldo atual porque reduzem dinheiro confirmado.

## 6. Insights do MVP

O dashboard pode exibir os seguintes insights derivados, sem persistir novos saldos:

- variacao da renda: recebido menos planejado;
- aderencia das despesas: consumido versus planejado no total e por categoria;
- categoria com maior consumo, incluindo valor e percentual;
- maior despesa individual do mes;
- distribuicao do consumo por bucket;
- compromissos com vencimento nos proximos 30 dias e compromissos atrasados;
- fluxo de caixa confirmado do mes: entradas menos saidas que efetivamente reduziram saldo;
- utilizacao de cada cartao: limite, comprometido, disponivel e percentual utilizado.

## 7. Tipo de pagamento

O modelo atual registra a conta escolhida, mas nao registra o meio operacional especifico. Portanto, no MVP o dashboard deve chamar essa leitura de **tipo de conta utilizado**, distinguindo `credit`, `debit`, `vr` e `vt`.

Nao e permitido afirmar que o sistema sabe se uma conta `debit` foi usada por PIX, dinheiro, transferencia ou cartao de debito.

Persistir uma forma de pagamento detalhada fica para o roadmap e exigira novo campo, enum e regras de validacao.

## 8. Fora do escopo da Fase 4

- conciliacao automatica com folha de pagamento;
- explicacao automatica da diferenca entre salario planejado e recebido;
- formas operacionais detalhadas de pagamento;
- previsao de gastos por inteligencia artificial;
- alteracao do saldo confirmado com base apenas no planejamento.
