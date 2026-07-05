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
