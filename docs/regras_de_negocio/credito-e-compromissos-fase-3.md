---
doc_id: DOC-RN-003
title: Credito, Parcelas e Compromissos da Fase 3
type: guide
status: draft
version: 1.1.0
owner: TBD
created_at: 2026-08-07
updated_at: 2026-08-07
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

Este documento registra as decisões de negócio confirmadas para o fluxo de cartão de crédito do MVP.

## Cadastro de contas e cartões

Ao cadastrar uma conta, o usuário informa o tipo da conta:

- `vr`
- `vt`
- `debit`
- `credit`

Para uma conta do tipo `credit`, o usuário também informa:

- limite total do cartão
- dia de vencimento da fatura

O vencimento informado pertence ao cartão. Ele será usado como referência para os compromissos e parcelas gerados por compras nesse cartão.

No MVP, o cartão não fica automaticamente ligado a uma conta bancária pagadora. O usuário escolhe a conta de pagamento no momento de quitar a fatura.

## Compra no crédito

Toda compra no crédito:

- exige categoria
- registra o consumo da compra
- não reduz imediatamente o saldo confirmado de nenhum bucket
- gera um compromisso futuro

Compra no crédito e pagamento da fatura são eventos distintos. A compra representa o consumo; o pagamento representa a saída real de dinheiro.

## Regra de compromisso e parcelas

Cada compra no crédito gera um compromisso lógico.

Quando a compra é parcelada, esse compromisso é dividido em parcelas com vencimentos mensais futuros. Cada parcela deve informar, no mínimo:

- número da parcela
- quantidade total de parcelas
- valor da parcela
- mês de vencimento
- cartão de origem

Assim, uma compra de R$ 600 em 3 parcelas representa um compromisso lógico de R$ 600, mas compromete R$ 200 em cada um dos três meses correspondentes.

Essa separação evita que o mês atual seja comprometido pelo valor inteiro quando apenas uma parcela vence nele.

Regra de contabilização:

- o consumo da compra é registrado uma única vez
- o comprometido mensal considera apenas parcelas ainda abertas daquele mês
- o pagamento de uma parcela liquida somente aquela parcela
- o pagamento não cria um novo consumo

### Persistência aprovada para o MVP

Foi aprovada a persistência de uma linha de `commitment` para cada parcela, todas relacionadas ao mesmo grupo da compra original.

Cada registro de parcela deve manter, no mínimo:

- identificador da compra ou compromisso lógico de origem
- número da parcela
- quantidade total de parcelas
- valor da parcela
- vencimento
- status de liquidação

Essa decisão não altera a regra de negócio: uma compra continua gerando um único compromisso lógico. A multiplicação ocorre apenas na persistência para permitir que cada parcela seja consultada, comprometida e liquidada no mês correto.

O consumo da compra original continua sendo registrado uma única vez. As linhas de parcela representam somente o comprometimento futuro e não novas despesas de consumo.

## Pagamento da fatura

No MVP, o pagamento é sempre total para o compromisso ou conjunto de parcelas selecionado.

Ao pagar, o usuário precisa escolher de qual conta o dinheiro saiu. Essa conta é a origem real do pagamento.

O pagamento:

- cria uma saída confirmada na conta escolhida
- afeta o bucket da conta escolhida, conforme as regras de buckets da Fase 2
- liquida o compromisso ou as parcelas selecionadas
- não registra novamente a despesa de consumo

Não existe pagamento parcial no MVP.

## Explicação do item 5: bucket do compromisso e do pagamento

O item 5 significa que o compromisso originado por uma compra no crédito pertence ao bucket `free` para fins de comprometimento.

Isso representa a natureza do cartão de crédito no MVP: a fatura será paga com dinheiro livre, e não diretamente com saldo de VR ou VT.

Importante: isso não impede o usuário de escolher uma conta específica para pagar. A conta escolhida no pagamento é que determina o bucket efetivamente reduzido pela saída confirmada. Se o usuário escolher uma conta do bucket `free`, reduz `free`; se escolher uma conta de benefício, a saída seguirá essa conta, desde que a regra de compatibilidade permita.

Portanto:

- compromisso de crédito: referência de comprometimento em `free`
- pagamento: saída confirmada no bucket da conta escolhida

Essa distinção mantém separado o que foi comprometido do que realmente saiu de uma conta.

## Explicação e decisão do item 7: listagem de compromissos em aberto

Para o MVP, a listagem de compromissos em aberto deve mostrar somente o que ainda não foi liquidado e ordenar pelo vencimento mais próximo.

Critério aprovado:

- incluir compromissos ou parcelas sem pagamento confirmado
- excluir compromissos ou parcelas totalmente liquidados
- ordenar por data de vencimento crescente
- em empate, ordenar pela data da compra

Essa escolha ajuda o usuário a enxergar primeiro o que precisa ser pago antes. A tela pode exibir filtros por cartão, mês e status no futuro, mas eles não são necessários para o primeiro fluxo.

## Regras fechadas para a Fase 3

- uma compra no crédito gera um compromisso lógico
- compras parceladas distribuem o comprometimento entre os meses das parcelas
- cartão de crédito possui limite e dia de vencimento de fatura
- categoria é obrigatória para toda compra no crédito
- pagamento é sempre total no MVP
- o usuário escolhe a conta pagadora
- o compromisso de crédito é referenciado no bucket `free`
- a saída do pagamento afeta o bucket da conta escolhida
- consumo e pagamento não podem ser contabilizados duas vezes
- a listagem padrão mostra apenas compromissos em aberto, do vencimento mais próximo para o mais distante
- `investment` permanece fora do MVP e fica no roadmap

## Exemplos

### Compra à vista no crédito

Uma compra de R$ 100 gera um compromisso de R$ 100. O saldo confirmado não muda na compra. Quando a fatura é paga, uma saída de R$ 100 é registrada na conta escolhida e o compromisso é liquidado.

### Compra parcelada

Uma compra de R$ 600 em 3 vezes gera um compromisso lógico de R$ 600 e três parcelas de R$ 200. Cada mês considera somente a parcela que vence nele. O pagamento total de uma fatura liquida as parcelas selecionadas daquela fatura.
