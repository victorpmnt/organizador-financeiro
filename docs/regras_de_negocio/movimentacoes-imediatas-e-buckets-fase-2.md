---
doc_id: DOC-RN-002
title: Movimentacoes Imediatas e Buckets da Fase 2
type: guide
status: draft
version: 1.0.0
owner: TBD
created_at: 2026-08-07
updated_at: 2026-08-07
review_due:
domain: regras_de_negocio
audited_by: TBD
summary: Registra as decisoes de negocio da Fase 2 sobre entradas imediatas, saidas imediatas, escolha de conta, bucket afetado e obrigatoriedade de categoria nas despesas.
rag_ready: false
tags:
  - regras-de-negocio
  - fase-2
  - transactions
  - buckets
  - categorias
related_docs:
  - "[[docs/planos/backend-mvp-plan]]"
  - "[[docs/arquitetura/initial-database-schema]]"
  - "[[docs/arquitetura/monthly-planning-schema]]"
  - "[[docs/regras_de_negocio/politica-de-exposicao-data-api-e-grants]]"
---

# Movimentacoes Imediatas e Buckets da Fase 2

Este documento consolida as decisoes de negocio confirmadas antes da implementacao da Fase 2 do backend do MVP.

O objetivo e evitar ambiguidade na forma como o sistema registra dinheiro que entrou, dinheiro que saiu e bucket afetado em cada lancamento.

## Objetivo

Na Fase 2, o sistema passa a registrar movimentacoes confirmadas em `transactions`.

Para isso, o projeto precisa de regras claras sobre:

- o que e entrada imediata
- o que e saida imediata
- como o bucket e definido
- quando uma despesa exige categoria
- o que altera saldo confirmado

## Conceitos Base

### Entrada imediata

Entrada imediata e um dinheiro que realmente entrou e ja pode ser considerado confirmado no momento do lancamento.

Exemplos:

- salario recebido
- pix recebido
- deposito confirmado
- transferencia recebida

Efeito de negocio:

- cria uma transacao confirmada de entrada
- aumenta o saldo confirmado do bucket da conta escolhida

### Saida imediata

Saida imediata e um dinheiro que realmente saiu naquele momento, sem gerar obrigacao futura.

Exemplos:

- pagamento no debito
- pix enviado
- saque
- compra paga com saldo ja existente

Efeito de negocio:

- cria uma transacao confirmada de saida
- reduz o saldo confirmado do bucket da conta escolhida

### Evento que nao e saida imediata

Compra no cartao de credito nao e saida imediata.

Na regra do projeto:

- a compra no credito registra consumo
- a compra no credito gera compromisso futuro
- a saida de dinheiro acontece apenas quando a fatura e paga

Isso evita dupla contagem de consumo e dupla contagem de comprometimento.

## Regra de Escolha da Origem do Dinheiro

O sistema nao decide sozinho de qual bucket o gasto deve sair.

A decisao oficial do MVP e:

- o usuario escolhe a conta no momento do lancamento
- a conta escolhida representa a origem do dinheiro
- o bucket afetado vem da conta escolhida

Consequencia pratica:

- o sistema nao deve mover automaticamente uma despesa para outro bucket
- o sistema nao deve presumir que todo gasto sai de `free`
- o usuario controla explicitamente de onde o dinheiro saiu

## Relacao Entre Conta e Bucket

Cada movimentacao da Fase 2 precisa apontar para uma conta.

A conta escolhida pelo usuario define qual bucket sera afetado na transacao.

Exemplos:

- conta de uso geral afeta `free`
- conta de beneficio refeicao afeta `meal_benefit`
- conta de beneficio transporte afeta `transport_benefit`

Regra operacional:

- entrada imediata soma no bucket da conta
- saida imediata subtrai do bucket da conta

## Regra de Categoria nas Despesas

Toda despesa do MVP deve possuir categoria obrigatoria.

Isso vale para:

- despesa imediata
- compra no credito

Motivos:

- manter consistencia dos dados
- permitir relatorios confiaveis
- evitar lancamentos financeiros sem classificacao

Observacao:

- a possibilidade de evoluir categorias no futuro continua aberta
- a obrigatoriedade de categoria ja esta confirmada para o MVP

## Regra de Saldo no Dominio

O projeto nao trabalha com um saldo unico principal.

O dominio e orientado a buckets.

Portanto:

- cada bucket possui sua propria leitura de saldo
- entradas imediatas e saidas imediatas alteram o saldo confirmado do bucket correspondente
- `disponivel` continua sendo leitura derivada, nao saldo principal persistido

Linguagem preferida no projeto:

- evitar falar apenas em "saldo do usuario"
- preferir "saldo confirmado por bucket"
- preferir "disponivel por bucket" quando a leitura considerar compromissos

## Regras Fechadas Para Implementacao da Fase 2

As seguintes decisoes ficam aprovadas como contrato de implementacao:

- `create-income-entry` deve registrar entrada confirmada
- `create-income-entry` deve aumentar o bucket da conta escolhida
- `create-immediate-expense` deve registrar saida confirmada
- `create-immediate-expense` deve reduzir o bucket da conta escolhida
- toda despesa deve possuir categoria obrigatoria
- compra no credito nao faz parte de saida imediata

## Exemplos Praticos

### Exemplo 1. Salario

Se o usuario registrar salario em uma conta do bucket `free`:

- a transacao e confirmada
- o bucket `free` aumenta

### Exemplo 2. Compra com saldo de refeicao

Se o usuario registrar uma refeicao paga por uma conta de beneficio refeicao:

- a despesa precisa de categoria
- a transacao e confirmada
- o bucket `meal_benefit` diminui

### Exemplo 3. Passagem com saldo de transporte

Se o usuario registrar um gasto de transporte em uma conta de beneficio transporte:

- a despesa precisa de categoria
- a transacao e confirmada
- o bucket `transport_benefit` diminui

### Exemplo 4. Compra no credito

Se o usuario fizer uma compra no cartao de credito:

- o sistema registra o consumo
- o sistema gera compromisso futuro
- nenhum bucket de saldo confirmado e reduzido naquele momento

## Impacto Tecnico Esperado

Estas decisoes impactam a implementacao da Fase 2 da seguinte forma:

- os casos de uso devem receber `accountId` informado pelo usuario
- o bucket deve ser resolvido a partir da conta
- validacoes de negocio nao devem confiar em bucket enviado diretamente pelo cliente
- validacoes de despesa devem exigir `categoryId`
- leituras de saldo por bucket devem partir de transacoes confirmadas

