# Organizador Financeiro Pessoal

Aplicacao web para organizacao financeira pessoal, com foco em controle manual de entradas, saidas, investimentos, metas e acompanhamento mensal.

O projeto esta sendo construido para uso individual no primeiro momento, mas com base tecnica pensada para evoluir com seguranca para cenarios com multiplos usuarios.

## Objetivo

Criar um painel financeiro simples, claro e pratico para registrar e visualizar:

- receitas e despesas
- investimentos manuais
- categorias financeiras
- saldo mensal
- total economizado
- total investido
- metas financeiras

## Status Atual

O projeto esta em fase inicial de configuracao.

Hoje o repositorio ja possui:

- base em `Next.js` com `TypeScript`
- configuracao de `Tailwind CSS`
- dependencias principais instaladas para formularios, validacao, graficos e Supabase

Ainda nao estao implementados no codigo:

- autenticacao completa
- dashboard financeiro
- CRUD de transacoes, categorias, contas e investimentos
- integracao funcional com Supabase

## Escopo do MVP

As primeiras funcionalidades previstas para o MVP sao:

- login obrigatorio
- dashboard financeiro mensal
- cadastro manual de transacoes
- registro de entradas e saidas
- registro manual de investimentos
- cadastro de categorias
- visualizacao de saldo mensal
- visualizacao de total economizado
- visualizacao de total investido
- filtros por mes
- graficos simples de gastos por categoria

## Roadmap

Evolucoes previstas apos o MVP:

- metas financeiras
- multiplas contas
- controle de beneficios como VR e VT
- transacoes recorrentes
- relatorios mensais
- exportacao de dados
- versao mobile
- importacao de extratos e CSV
- analise de gastos com IA

## Stack

### Frontend

- Next.js
- TypeScript
- App Router
- Tailwind CSS

### Banco de dados e autenticacao

- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security

### Formularios e validacao

- React Hook Form
- Zod

### Visualizacao de dados

- Recharts
- date-fns

### Deploy

- Vercel

## Arquitetura planejada

```txt
Usuario
  |
  v
Aplicacao Next.js na Vercel
  |
  v
Supabase Auth
  |
  v
Supabase Postgres com Row Level Security
```

## Estrategia tecnica

O projeto sera uma aplicacao full-stack leve com `Next.js`, sem backend separado no inicio.

Divisao planejada da aplicacao:

- `Server Components` para leitura de dados
- `Client Components` para formularios, graficos e interacoes
- `Server Actions` para criacao, edicao e exclusao de registros
- `Middleware` para proteger rotas privadas
- `RLS` no Supabase para garantir isolamento por usuario

## Estrutura planejada

```txt
src/
|-- app/
|   |-- (auth)/
|   |   `-- login/
|   |-- (dashboard)/
|   |   |-- dashboard/
|   |   |-- transacoes/
|   |   |-- categorias/
|   |   |-- contas/
|   |   |-- rendas/
|   |   |-- investimentos/
|   |   `-- metas/
|   |-- layout.tsx
|   `-- page.tsx
|-- components/
|   |-- ui/
|   |-- charts/
|   |-- forms/
|   |-- tables/
|   `-- layout/
|-- features/
|   |-- auth/
|   |-- transactions/
|   |-- categories/
|   |-- accounts/
|   |-- income/
|   |-- investments/
|   `-- goals/
|-- lib/
|   |-- supabase/
|   |   |-- client.ts
|   |   |-- server.ts
|   |   `-- middleware.ts
|   |-- validations/
|   |-- formatters.ts
|   `-- utils.ts
`-- types/
```

Observacao: essa estrutura ainda e a direcao planejada. O repositorio atual ainda esta na base inicial do projeto.

## Modelo inicial de dados

### `profiles`

Dados basicos do usuario:

```txt
id
email
name
created_at
```

### `accounts`

Contas financeiras:

```txt
id
user_id
name
type
initial_balance
created_at
```

### `categories`

Categorias de entrada, saida ou investimento:

```txt
id
user_id
name
type
color
created_at
```

### `transactions`

Lancamentos financeiros:

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

### `goals`

Metas financeiras:

```txt
id
user_id
name
target_amount
current_amount
deadline
created_at
```

## Seguranca

Mesmo sendo um projeto de uso pessoal, a base tecnica prevista considera:

- login obrigatorio
- Row Level Security em todas as tabelas
- politicas baseadas em `auth.uid()`
- uso de variaveis de ambiente para chaves do Supabase
- nao exposicao de `service_role` no frontend
- validacao com Zod
- deploy com HTTPS

## Como rodar localmente

### Requisitos

- Node.js 20 ou superior
- npm

### Instalacao

```bash
npm install
```

### Ambiente

Crie as variaveis de ambiente do Supabase em um arquivo `.env` conforme a integracao for sendo implementada.

Sugestao inicial:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Desenvolvimento

```bash
npm run dev
```

Depois, abra `http://localhost:3000`.

## Scripts disponiveis

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Proxima meta

Estruturar a base real do produto com:

- autenticacao via Supabase
- protecao de rotas
- modelagem inicial das tabelas
- primeiras telas do dashboard
