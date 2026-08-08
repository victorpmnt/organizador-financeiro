---
doc_id: DOC-RN-003
title: Credito, Parcelas e Compromissos da Fase 3
type: guide
status: draft
version: 1.2.0
owner: TBD
created_at: 2026-08-07
updated_at: 2026-08-08
review_due:
domain: regras_de_negocio
audited_by: TBD
summary: Consolida as regras do MVP para cadastro de cartoes, compras no credito, parcelas, vencimento e pagamento de compromissos.
rag_ready: false
tags:
  - regras-de-negocio
  - fase-3
  - credito
  - parcelas
  - commitments
related_docs:
  - "[[docs/regras_de_negocio/movimentacoes-imediatas-e-buckets-fase-2]]"
  - "[[docs/planos/backend-mvp-plan]]"
  - "[[docs/roadmap/vinculo-cartao-conta-pagamento-fatura]]"
---

# Credito, Parcelas e Compromissos da Fase 3

Este documento registra as decisoes de negocio confirmadas para o fluxo de cartao de credito do MVP.

## Cadastro de contas e cartoes

Ao cadastrar uma conta, o usuario informa o tipo da conta:

- `vr`
- `vt`
- `debit`
- `credit`

Para uma conta do tipo `credit`, o usuario tambem informa:

- limite total do cartao
- dia de vencimento da fatura

O vencimento informado pertence ao cartao. Ele sera usado como referencia para os compromissos e parcelas gerados por compras nesse cartao.

Regra adotada na implementacao do MVP:

- a primeira parcela vence na proxima ocorrencia do dia de vencimento do cartao
- se a compra acontecer antes ou no proprio dia de vencimento, a primeira parcela vence naquele mesmo mes
- se a compra acontecer depois do dia de vencimento, a primeira parcela vence no mes seguinte

No MVP, o cartao nao fica automaticamente ligado a uma conta bancaria pagadora. O usuario escolhe a conta de pagamento no momento de quitar a fatura.

## Compra no credito

Toda compra no credito:

- exige categoria
- registra o consumo da compra
- nao reduz imediatamente o saldo confirmado de nenhum bucket
- gera um compromisso futuro

Compra no credito e pagamento da fatura sao eventos distintos. A compra representa o consumo; o pagamento representa a saida real de dinheiro.

## Regra de compromisso e parcelas

Cada compra no credito gera um compromisso logico.

Quando a compra e parcelada, esse compromisso e dividido em parcelas com vencimentos mensais futuros. Cada parcela deve informar, no minimo:

- numero da parcela
- quantidade total de parcelas
- valor da parcela
- mes de vencimento
- cartao de origem

Assim, uma compra de R$ 600 em 3 parcelas representa um compromisso logico de R$ 600, mas compromete R$ 200 em cada um dos tres meses correspondentes.

Essa separacao evita que o mes atual seja comprometido pelo valor inteiro quando apenas uma parcela vence nele.

Regra de contabilizacao:

- o consumo da compra e registrado uma unica vez
- o comprometido mensal considera apenas parcelas ainda abertas daquele mes
- o pagamento de uma parcela liquida somente aquela parcela
- o pagamento nao cria um novo consumo

### Persistencia aprovada para o MVP

Foi aprovada a persistencia de uma linha de `commitment` para cada parcela, todas relacionadas ao mesmo grupo da compra original.

Cada registro de parcela deve manter, no minimo:

- identificador da compra ou compromisso logico de origem
- numero da parcela
- quantidade total de parcelas
- valor da parcela
- vencimento
- status de liquidacao

Essa decisao nao altera a regra de negocio: uma compra continua gerando um unico compromisso logico. A multiplicacao ocorre apenas na persistencia para permitir que cada parcela seja consultada, comprometida e liquidada no mes correto.

O consumo da compra original continua sendo registrado uma unica vez. As linhas de parcela representam somente o comprometimento futuro e nao novas despesas de consumo.

## Pagamento da fatura

No MVP, o pagamento e sempre total para o compromisso ou conjunto de parcelas selecionado.

Ao pagar, o usuario precisa escolher de qual conta o dinheiro saiu. Essa conta e a origem real do pagamento.

Na implementacao atual do MVP, a conta pagadora precisa ser:

- uma conta nao-credito
- pertencente ao bucket `free`

O pagamento:

- cria uma saida confirmada na conta escolhida
- afeta o bucket da conta escolhida, conforme as regras de buckets da Fase 2
- liquida o compromisso ou as parcelas selecionadas
- nao registra novamente a despesa de consumo

Nao existe pagamento parcial no MVP.

## Explicacao do item 5: bucket do compromisso e do pagamento

O item 5 significa que o compromisso originado por uma compra no credito pertence ao bucket `free` para fins de comprometimento.

Isso representa a natureza do cartao de credito no MVP: a fatura sera paga com dinheiro livre, e nao diretamente com saldo de VR ou VT.

Importante: isso nao impede o usuario de escolher uma conta especifica para pagar. A conta escolhida no pagamento e que determina o bucket efetivamente reduzido pela saida confirmada.

Para o MVP implementado, a regra de compatibilidade foi fechada de forma mais restritiva: pagamento de fatura so pode sair de conta do bucket `free`. Isso evita usar saldo de VR ou VT para liquidar fatura de cartao e mantem coerencia com a leitura de comprometido em `free`.

Portanto:

- compromisso de credito: referencia de comprometimento em `free`
- pagamento: saida confirmada no bucket da conta escolhida

Essa distincao mantem separado o que foi comprometido do que realmente saiu de uma conta.

## Explicacao e decisao do item 7: listagem de compromissos em aberto

Para o MVP, a listagem de compromissos em aberto deve mostrar somente o que ainda nao foi liquidado e ordenar pelo vencimento mais proximo.

Criterio aprovado:

- incluir compromissos ou parcelas sem pagamento confirmado
- excluir compromissos ou parcelas totalmente liquidados
- ordenar por data de vencimento crescente
- em empate, ordenar pela data da compra

Essa escolha ajuda o usuario a enxergar primeiro o que precisa ser pago antes. A tela pode exibir filtros por cartao, mes e status no futuro, mas eles nao sao necessarios para o primeiro fluxo.

## Regras fechadas para a Fase 3

- uma compra no credito gera um compromisso logico
- compras parceladas distribuem o comprometimento entre os meses das parcelas
- cartao de credito possui limite e dia de vencimento de fatura
- categoria e obrigatoria para toda compra no credito
- pagamento e sempre total no MVP
- o usuario escolhe a conta pagadora
- o compromisso de credito e referenciado no bucket `free`
- a saida do pagamento afeta o bucket da conta escolhida
- consumo e pagamento nao podem ser contabilizados duas vezes
- a listagem padrao mostra apenas compromissos em aberto, do vencimento mais proximo para o mais distante
- `investment` permanece fora do MVP e fica no roadmap
- a primeira parcela usa a proxima ocorrencia do vencimento do cartao
- pagamento de fatura exige conta pagadora nao-credito no bucket `free`

## Exemplos

### Compra a vista no credito

Uma compra de R$ 100 gera um compromisso de R$ 100. O saldo confirmado nao muda na compra. Quando a fatura e paga, uma saida de R$ 100 e registrada na conta escolhida e o compromisso e liquidado.

### Compra parcelada

Uma compra de R$ 600 em 3 vezes gera um compromisso logico de R$ 600 e tres parcelas de R$ 200. Cada mes considera somente a parcela que vence nele. O pagamento total de uma fatura liquida as parcelas selecionadas daquela fatura.
