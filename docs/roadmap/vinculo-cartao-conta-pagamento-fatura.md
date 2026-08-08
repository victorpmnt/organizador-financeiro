---
doc_id: DOC-RM-001
title: Vinculo Futuro entre Cartao e Conta para Pagamento de Fatura
type: roadmap
status: planned
version: 1.0.0
owner: TBD
created_at: 2026-08-07
updated_at: 2026-08-07
review_due:
domain: roadmap
audited_by: TBD
summary: Registra a funcionalidade futura de vincular um cartao de credito a uma conta bancaria pagadora.
rag_ready: false
tags:
  - roadmap
  - cartao
  - contas
  - pagamento-de-fatura
related_docs:
  - "[[docs/regras_de_negocio/credito-e-compromissos-fase-3]]"
  - "[[docs/arquitetura/serverless-vercel-supabase-architecture]]"
---

# Vinculo Futuro entre Cartao e Conta para Pagamento de Fatura

## Objetivo

Permitir que um cartão de crédito seja associado a uma conta bancária pagadora, tornando opcional a escolha manual da conta ao quitar a fatura.

## Comportamento desejado

Quando uma fatura for marcada como paga:

- o sistema identifica a conta bancária vinculada ao cartão
- registra a saída confirmada nessa conta
- liquida a fatura ou as parcelas correspondentes
- mantém o consumo original separado do pagamento

## O que fica fora do MVP atual

- vínculo automático entre cartão e conta
- débito automático simulado ou agendado
- escolha padrão persistida para pagamentos

No MVP atual, o usuário sempre escolhe manualmente a conta pagadora.

## Pontos a definir quando o roadmap for priorizado

- permitir um cartão vinculado a uma ou várias contas
- permitir alterar o vínculo depois de existirem faturas abertas
- comportamento quando a conta vinculada estiver inativa ou sem saldo suficiente
- confirmação manual antes de registrar a saída
- auditoria e desfazimento de um pagamento automático

