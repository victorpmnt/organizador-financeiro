---
doc_id: DOC-ARCH-001
title: Database Migrations com Supabase
type: architecture
status: draft
version: 1.0.0
owner: TBD
created_at: 2026-08-05
updated_at: 2026-08-05
review_due:
domain: arquitetura
audited_by: TBD
summary: Guia operacional para versionamento, validacao e publicacao de migracoes de banco com Supabase CLI.
rag_ready: true
tags:
  - supabase
  - migrations
  - database
  - architecture
related_docs:
  - "[[docs/arquitetura/initial-database-schema]]"
  - "[[docs/arquitetura/supabase-cli]]"
---

# Database Migrations com Supabase

Este documento define como o projeto deve versionar, aplicar e revisar mudancas de banco de dados usando `Supabase CLI`.

Ele serve como guia operacional para desenvolvedores e futuros agentes de IA.

## Objetivo

Neste projeto, mudancas de banco nao devem ficar apenas em texto solto, SQL executado manualmente no dashboard ou conhecimento implícito.

A regra oficial e:

- schema deve ser versionado em arquivos SQL
- migracoes sao a fonte de verdade do banco
- documentacao em Markdown explica a intencao e as decisoes

## Fonte de Verdade

Para este projeto:

- `supabase/migrations/` = fonte oficial e executavel do schema
- `docs/` = explicacao humana e contexto arquitetural

Se houver divergencia entre um `.md` e uma migracao SQL, a migracao SQL prevalece.

## Estrutura Recomendada

```txt
supabase/
|-- migrations/
|   |-- 20260712000001_initial_schema.sql
|   |-- 20260725000002_finance_schema_adjustments.sql
|   `-- 20260725000003_monthly_planning.sql
|-- seed.sql
`-- config.toml
```

Observacoes:

- o nome real do arquivo gerado pela CLI segue o padrao `<timestamp>_<nome>.sql`
- `seed.sql` e opcional
- `config.toml` pode existir quando o projeto for inicializado com a CLI do Supabase

## Ferramenta Oficial

O equivalente pratico ao Alembic neste projeto sera o `Supabase CLI`.

Principais comandos:

```bash
supabase migration new nome_da_migracao
supabase db reset
supabase db push
supabase db diff -f nome_da_migracao
supabase migration list
```

## O Que Cada Comando Faz

### `supabase migration new nome_da_migracao`

Cria um novo arquivo SQL em `supabase/migrations/`.

Uso recomendado:

- sempre que houver mudanca de schema
- sempre que houver criacao de tabela, enum, indice, view, function, policy ou trigger

### `supabase db reset`

Recria o banco local e reaplica todas as migracoes da pasta `supabase/migrations`.

Uso recomendado:

- testar se o projeto sobe do zero
- validar se a ordem das migracoes esta correta
- garantir que nao existe dependencia oculta do estado local

### `supabase db push`

Aplica as migracoes locais no projeto remoto linkado.

Uso recomendado:

- somente depois de validar localmente
- preferencialmente por uma pessoa por vez
- nunca como substituto de migracao manual no dashboard

### `supabase db diff -f nome_da_migracao`

Gera uma migracao a partir da diferenca entre estados de banco.

Uso recomendado:

- quando foi mais facil experimentar o schema localmente
- quando for necessario capturar uma diferenca existente

### `supabase migration list`

Lista o estado das migracoes local e remoto.

Uso recomendado:

- diagnosticar drift
- conferir se o remoto esta sincronizado

## Workflow Oficial do Projeto

O fluxo padrao deve ser este:

1. criar uma nova migracao
2. escrever o SQL manualmente
3. rodar reset local
4. revisar schema e regras
5. commitar a migracao
6. aplicar no remoto com `db push` quando apropriado

Exemplo:

```bash
supabase migration new initial_schema
supabase db reset
supabase migration list
supabase db push
```

Para detalhes operacionais do ambiente atual, consultar tambem:

- `docs/arquitetura/supabase-cli.md`

## Regras do Projeto

### Regra 1 - Nunca alterar o schema remoto diretamente

Depois que o projeto adotar migracoes, o schema remoto nao deve ser alterado manualmente no `SQL Editor` ou `Table Editor` como fluxo principal.

Motivo:

- isso ignora o historico versionado
- pode causar falha no `supabase db push`
- aumenta risco de drift entre local e remoto

### Regra 2 - Toda mudanca estrutural vira migracao

Isto inclui:

- tabelas
- colunas
- tipos
- constraints
- indices
- funcoes
- triggers
- views
- RLS
- policies

### Regra 3 - Toda migracao deve ser reexecutavel via reset local

Antes de considerar uma migracao valida, ela deve funcionar num `supabase db reset`.

Se o reset falhar, a migracao nao esta pronta.

### Regra 4 - RLS faz parte do schema

Neste projeto, `Row Level Security` nao e detalhe operacional. Faz parte do contrato de seguranca.

Portanto:

- ativacao de RLS deve ficar em migracao
- policies devem ficar em migracao
- nao deixar politica importante apenas configurada manualmente no painel

### Regra 5 - Seeds nao substituem migracoes

`seed.sql` pode popular dados de apoio, mas nao deve conter definicao estrutural de schema.

Schema vai em migracao.
Dados de apoio podem ir em seed.

## Convencoes para Este Projeto

Como o dominio ja foi definido em `app/AGENTS.md`, as migracoes devem respeitar:

- separacao entre `free`, `meal_benefit` e `transport_benefit`
- entradas e saidas com semantica clara
- compromissos futuros do saldo livre
- historico como apoio, nao como regra central

Ao modelar tabelas, evitar nomes vagos que escondam a regra real.

Preferir nomes explicitos, por exemplo:

- `balance_bucket`
- `income_source`
- `expense_nature`
- `commitment_type`

## Estrategia de Evolucao

Para o MVP, a melhor ordem de migracoes tende a ser:

1. `initial_schema`
2. `finance_reference_enums`
3. `finance_core_tables`
4. `finance_indexes`
5. `finance_rls_policies`
6. `seed_reference_data`

Essa ordem pode ser ajustada, mas a ideia e manter mudancas pequenas e revisaveis.

## Quando Usar SQL Manual e Quando Usar Diff

Preferir `SQL manual` quando:

- a modelagem esta clara
- a mudanca e pequena
- voce quer controle fino do historico

Usar `db diff` quando:

- voce prototipou algo localmente
- quer capturar diferencas do estado atual
- precisa acelerar a geracao inicial do SQL

Mesmo quando usar `db diff`, revisar o arquivo gerado antes de commit.

## Processo Recomendado para Futuros Agentes

Ao mexer no banco deste projeto, siga esta ordem:

1. ler `app/AGENTS.md`
2. ler este documento
3. verificar migracoes existentes em `supabase/migrations`
4. criar nova migracao em vez de editar historico antigo, salvo se a migracao ainda nao foi compartilhada
5. validar localmente com reset
6. so depois considerar push remoto

## Anti-padroes

Evitar:

- criar schema apenas pelo dashboard remoto
- alterar tabela remota e esquecer de registrar migracao
- misturar estrutura e seed no mesmo arquivo sem necessidade
- colocar regras de seguranca fora do versionamento
- editar migracao antiga que ja foi compartilhada ou aplicada remotamente

## Resumo Operacional

Em termos praticos:

- usar `Supabase CLI` como sistema de migracoes
- versionar tudo em `supabase/migrations`
- documentar decisoes em `docs/`
- testar com `supabase db reset`
- publicar com `supabase db push`

## Referencias Oficiais

- Supabase Docs, Database Migrations: https://supabase.com/docs/guides/deployment/database-migrations
- Supabase CLI, `migration new`: https://supabase.com/docs/reference/cli/supabase-migration-new
- Supabase CLI, `db push`: https://supabase.com/docs/reference/cli/supabase-db-push
