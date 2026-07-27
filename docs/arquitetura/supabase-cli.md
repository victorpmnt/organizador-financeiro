# Supabase CLI no Projeto

Este documento registra como a `Supabase CLI` esta sendo usada neste projeto, com foco no ambiente atual em Windows e no fluxo remoto via `SQL Editor` + migracoes versionadas.

## Objetivo

Servir como guia pratico para:

- criar novas migracoes
- sincronizar historico local e remoto
- aplicar mudancas no projeto Supabase linkado
- evitar problemas de execucao no Windows

## Contexto Atual

Neste projeto:

- as migracoes vivem em `supabase/migrations/`
- o projeto remoto ja foi linkado com `supabase link`
- as migracoes iniciais foram aplicadas primeiro pelo `SQL Editor`
- depois o historico remoto foi reparado com `migration repair`

Migracoes atuais:

- `supabase/migrations/20260712000001_initial_schema.sql`
- `supabase/migrations/20260725000002_finance_schema_adjustments.sql`
- `supabase/migrations/20260725000003_monthly_planning.sql`

## Comandos Oficiais para Este Ambiente

No Windows deste projeto, o padrao mais confiavel foi executar a CLI com `cmd /c npx supabase ...`.

Exemplos:

```powershell
cmd /c npx supabase login
cmd /c npx supabase link
cmd /c npx supabase migration list
cmd /c npx supabase migration new nome_da_migracao
cmd /c npx supabase db push
cmd /c npx supabase db push --dry-run
```

## Por Que Usar `cmd /c npx supabase`

O ambiente PowerShell pode falhar ao resolver o binario da CLI ou ao lidar com o wrapper do `npm`.

Quando isso acontecer:

- prefira `cmd /c npx supabase ...`
- alternativamente, tente `npx.cmd supabase ...`

Se `cmd /c npx supabase ...` funcionar, esse passa a ser o padrao operacional do projeto.

## Fluxo Ja Validado no Projeto

Os comandos abaixo ja foram executados com sucesso neste repositorio:

```powershell
cmd /c npx supabase link
cmd /c npx supabase migration repair 20260712000001 20260725000002 20260725000003 --status applied
cmd /c npx supabase migration list
cmd /c npx supabase db push --dry-run
```

Resultado esperado:

- `link` associa o repositorio ao projeto remoto correto
- `migration repair` registra no historico remoto migracoes que ja foram aplicadas manualmente
- `migration list` mostra local e remoto com os mesmos IDs
- `db push --dry-run` informa que o banco remoto esta atualizado

## Quando Usar Cada Comando

### Criar nova migracao

```powershell
cmd /c npx supabase migration new add_nome_da_mudanca
```

Use quando houver:

- nova tabela
- nova coluna
- novo enum
- constraint
- indice
- trigger
- policy RLS

### Verificar historico local e remoto

```powershell
cmd /c npx supabase migration list
```

Use antes de publicar mudancas ou ao suspeitar de drift.

### Simular aplicacao no remoto

```powershell
cmd /c npx supabase db push --dry-run
```

Use para confirmar se existe algo pendente sem alterar o banco remoto.

### Aplicar migracoes pendentes no remoto

```powershell
cmd /c npx supabase db push
```

Use somente depois de revisar o SQL e confirmar que a ordem das migracoes esta correta.

### Reparar historico remoto

```powershell
cmd /c npx supabase migration repair <ids...> --status applied
```

Use apenas quando:

- a migracao ja foi executada manualmente no banco remoto
- o historico em `supabase_migrations.schema_migrations` ainda nao foi registrado

Esse comando nao executa o SQL da migracao. Ele apenas alinha o historico remoto.

## Fluxo Recomendado daqui para Frente

Depois que o historico foi alinhado, o fluxo normal deve ser:

1. criar uma nova migracao com `migration new`
2. escrever o SQL no arquivo gerado
3. revisar a migracao com base em `app/AGENTS.md` e docs de arquitetura
4. executar `migration list`
5. executar `db push --dry-run`
6. executar `db push`

## Regras Importantes

- nao editar o banco remoto manualmente como fluxo padrao
- nao criar mudanca estrutural sem arquivo em `supabase/migrations/`
- nao alterar migracao antiga que ja foi aplicada remotamente
- usar `migration repair` apenas para corrigir historico, nao para substituir migracao

## Observacao Sobre Ambiente Local

Com `supabase start`, a CLI tenta subir containers locais com Docker.

Se o projeto estiver operando sem Docker local:

- nao usar `supabase start`
- nao depender de `db reset` local neste momento
- usar o banco remoto com cuidado e manter migracoes pequenas

Quando Docker estiver disponivel, vale adicionar reset local ao fluxo de validacao.
