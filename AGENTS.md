# Organizador Financeiro Pessoal

## Objetivo do Projeto

O objetivo deste projeto é desenvolver um painel web para organização financeira pessoal, com foco em controle manual de entradas, saídas, investimentos, metas e economia mensal.

A aplicação será usada inicialmente por apenas um usuário, mas será construída com autenticação obrigatória e estrutura segura de banco de dados, permitindo evolução futura para múltiplos usuários ou aplicativo mobile.

O sistema deve permitir o registro de informações como salário, VR, VT, gastos mensais, valores economizados, investimentos realizados e metas financeiras. A primeira versão será focada em simplicidade, organização e visualização clara dos dados.

## Escopo Inicial do MVP

A primeira versão do projeto terá as seguintes funcionalidades:

* Login obrigatório
* Dashboard financeiro mensal
* Cadastro de transações manuais
* Registro de entradas e saídas
* Registro de investimentos manuais
* Cadastro de categorias
* Visualização de saldo mensal
* Visualização de total economizado
* Visualização de total investido
* Filtros por mês
* Gráficos simples de gastos por categoria

## Funcionalidades Futuras

Após o MVP, o projeto poderá evoluir com:

* Cadastro de metas financeiras
* Controle de contas diferentes
* Controle de benefícios como VR e VT
* Transações recorrentes
* Relatórios mensais
* Exportação de dados
* Versão mobile
* Integração com IA para análise de gastos
* Importação de extratos ou arquivos CSV

## Stack Principal

### Frontend / Full Stack

* Next.js
* TypeScript
* App Router
* Tailwind CSS
* shadcn/ui

### Banco de Dados e Autenticação

* Supabase Auth
* Supabase Postgres
* Supabase Row Level Security

### Formulários e Validação

* React Hook Form
* Zod

### Gráficos e Visualização de Dados

* Recharts

### Datas e Formatação

* date-fns

### Deploy

* Vercel

## Arquitetura Inicial

```txt
Usuário
  ↓
Aplicação Next.js na Vercel
  ↓
Supabase Auth
  ↓
Supabase Postgres com Row Level Security
```

## Estratégia Técnica

O projeto não terá backend separado no início. O Next.js será usado como aplicação full-stack leve, enquanto o Supabase ficará responsável por autenticação, banco de dados e regras de segurança.

A lógica principal será dividida entre:

* Server Components para buscar dados
* Client Components para formulários, gráficos e interações
* Server Actions para ações como criar, editar e excluir registros
* Middleware para proteger rotas privadas
* Row Level Security no Supabase para garantir que cada usuário acesse apenas os próprios dados

## Estrutura Inicial de Pastas

```txt
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── transacoes/
│   │   ├── categorias/
│   │   ├── contas/
│   │   ├── rendas/
│   │   ├── investimentos/
│   │   └── metas/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── charts/
│   ├── forms/
│   ├── tables/
│   └── layout/
│
├── features/
│   ├── auth/
│   ├── transactions/
│   ├── categories/
│   ├── accounts/
│   ├── income/
│   ├── investments/
│   └── goals/
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── validations/
│   ├── formatters.ts
│   └── utils.ts
│
└── types/
```

## Modelo Inicial de Banco de Dados

### profiles

Armazena dados básicos do usuário.

```txt
id
email
name
created_at
```

### accounts

Armazena contas financeiras, como banco, carteira, conta de investimento ou benefício.

```txt
id
user_id
name
type
initial_balance
created_at
```

### categories

Armazena categorias de entrada, saída ou investimento.

```txt
id
user_id
name
type
color
created_at
```

### transactions

Armazena os lançamentos financeiros.

```txt
id
user_id
account_id
category_id
type
amount
description
transaction_date
created_at
```

### goals

Armazena metas financeiras.

```txt
id
user_id
name
target_amount
current_amount
deadline
created_at
```

## Segurança

Como o projeto lida com informações financeiras pessoais, mesmo sendo de uso individual, a aplicação deve seguir boas práticas mínimas de segurança:

* Login obrigatório
* Row Level Security ativado em todas as tabelas
* Políticas de acesso baseadas em `auth.uid()`
* Variáveis de ambiente para chaves do Supabase
* Nunca expor `service_role` no frontend
* Validação dos dados com Zod
* Deploy com HTTPS pela Vercel

## Stack Final

```txt
Next.js + TypeScript
Tailwind CSS + shadcn/ui
Supabase Auth + Supabase Postgres + RLS
React Hook Form + Zod
Recharts
date-fns
Vercel
```

## Status do Projeto

Projeto em fase inicial de planejamento e configuração.

Primeira meta: criar a base do projeto com Next.js, configurar Tailwind, instalar dependências principais e preparar integração com Supabase.

## Protocolo de Documentacao

Toda implementacao nova relevante deve deixar a documentacao do projeto em dia.

Regras obrigatorias para agentes:

* Antes de implementar, verificar se ja existe documento relacionado em `docs/`
* Se a implementacao alterar arquitetura, dominio, fluxo operacional, banco, integracao, seguranca ou convencao importante, atualizar o documento existente correspondente
* Se nao existir documento adequado para a mudanca, criar um novo arquivo em `docs/` no dominio mais apropriado
* Nao concluir uma implementacao relevante deixando a documentacao desatualizada
* Para mudancas pequenas e locais, evitar criar documentacao desnecessaria; nesses casos, atualizar apenas quando a mudanca alterar comportamento, contrato ou decisao tecnica importante

Todo documento Markdown em `docs/` deve usar front matter YAML compativel com Obsidian no topo do arquivo.

Campos padrao obrigatorios:

```yaml
---
doc_id: DOC-XXX-000
title: Titulo do documento
type: guide
status: draft
version: 1.0.0
owner: TBD
created_at: 2026-08-05
updated_at: 2026-08-05
review_due:
domain: arquitetura
audited_by: TBD
summary: Resumo curto do objetivo do documento.
rag_ready: false
tags:
  - exemplo
related_docs:
  - "[[docs/caminho/do-documento]]"
---
```

Convencoes para documentacao:

* Usar datas em formato ISO `YYYY-MM-DD`
* Manter `rag_ready` como booleano real `true` ou `false`
* Usar `related_docs` com wikilinks do Obsidian
* Atualizar `updated_at` sempre que o documento for alterado
* Atualizar `version` quando houver mudanca relevante de conteudo ou decisao
* Escrever documentos de forma objetiva, com contexto, decisao e impacto pratico

## Guardrails de Implementacao

Agentes devem priorizar simplicidade, clareza e escopo minimo suficiente.

Regras obrigatorias:

* Resolver o problema com a menor mudanca coerente possivel
* Evitar overengineering, abstrações prematuras e camadas extras sem ganho claro
* Nao transformar tarefa simples em refactor grande ou algoritmo desnecessariamente complexo
* Nao espalhar a mesma mudanca por dezenas ou centenas de arquivos sem necessidade real
* Preferir diffs pequenos, localizados e reversiveis
* Reutilizar padroes, utilitarios e estruturas ja existentes antes de criar novos
* So extrair novas abstrações quando houver repeticao real, pressao de manutencao ou ganho claro de legibilidade
* Manter casos de uso, validacoes e regras de negocio coesos e faceis de ler
* Quando houver tradeoff entre sofisticacao e manutencao, preferir a abordagem mais simples que atenda corretamente ao dominio

Boas praticas esperadas:

* nomes claros e coerentes com o dominio
* funcoes pequenas e com responsabilidade definida
* validacao explicita de entradas
* tratamento consistente de erros
* tipagem forte e contratos claros
* testes focados nos fluxos criticos quando a base de testes existir
* seguranca por padrao, especialmente em autenticacao, autorizacao e dados financeiros
