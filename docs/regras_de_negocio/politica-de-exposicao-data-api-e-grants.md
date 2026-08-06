---
doc_id: DOC-RN-001
title: Politica de Exposicao da Data API e Grants
type: policy
status: draft
version: 1.2.0
owner: TBD
created_at: 2026-08-06
updated_at: 2026-08-06
review_due:
domain: regras_de_negocio
audited_by: TBD
summary: Define como objetos do schema public devem ser expostos via Data API no projeto, com foco em grants explicitos, RLS obrigatorio e menor superficie de acesso.
rag_ready: false
tags:
  - supabase
  - security
  - grants
  - rls
  - data-api
related_docs:
  - "[[docs/arquitetura/initial-database-schema]]"
  - "[[docs/arquitetura/database-migrations]]"
  - "[[docs/arquitetura/monthly-planning-schema]]"
---

# Politica de Exposicao da Data API e Grants

Este documento registra a politica oficial do projeto para exposicao de objetos do banco via `Supabase Data API`.

Ele existe para auditoria, manutencao interna e orientacao de desenvolvedores e agentes.

## Objetivo

Neste projeto, acesso a tabelas, views e funcoes do schema `public` nao deve acontecer por efeito colateral de configuracao padrao.

A regra e:

- objeto exposto via API precisa de decisao explicita
- `GRANT` define quem pode alcancar o objeto
- `RLS` define quais linhas esse role pode acessar
- as duas camadas sao obrigatorias quando o objeto faz parte da superficie de produto

## Contexto do Produto

No estado atual, o projeto e de uso pessoal, com:

- login obrigatorio
- dados financeiros pessoais
- registros de contas, categorias, transacoes, compromissos, metas e planejamento mensal

Mesmo assim, o banco deve ser preparado como se o produto pudesse evoluir para multiusuario.

O motivo e simples:

- dado financeiro e sensivel desde o primeiro usuario
- defaults permissivos em `public` facilitam exposicoes acidentais
- corrigir o modelo cedo e muito mais barato do que endurecer depois

## Principio Central

Nao confiar apenas em `RLS`.

`RLS` protege linhas.

`GRANT/REVOKE` protege a existencia do objeto como superficie acessivel pela Data API.

Portanto, neste projeto:

- nao basta uma tabela ter policy correta
- ela tambem precisa estar exposta apenas para os roles certos

## Politica Oficial

### 1. `anon` nao acessa dados de negocio

Como o produto exige autenticacao, o role `anon` nao possui caso de uso legitimo para ler ou escrever:

- `profiles`
- `accounts`
- `categories`
- `transactions`
- `commitments`
- `goals`
- `monthly_plans`
- `monthly_plan_items`

Regra:

- `anon` deve ter zero privilegios de negocio nessas tabelas

### 2. `authenticated` usa allowlist explicita

O role `authenticated` nao recebe acesso generico ao schema `public`.

Ele recebe apenas os privilegios necessarios nas tabelas realmente usadas pelo app.

No MVP atual, isso significa:

- `profiles`: `select`, `insert`, `update`
- `accounts`: `select`, `insert`, `update`
- `categories`: `select`, `insert`, `update`
- `transactions`: `select`, `insert`, `update`
- `commitments`: `select`, `insert`, `update`
- `goals`: `select`, `insert`, `update`
- `monthly_plans`: `select`, `insert`, `update`
- `monthly_plan_items`: `select`, `insert`, `update`

Observacao:

- o grant nao substitui `RLS`
- o grant apenas autoriza o role a tentar acessar o objeto
- a visibilidade final continua condicionada pelas policies

### 3. `service_role` e role de backend, nao de frontend

`service_role` existe para operacoes privilegiadas de backend, scripts, automacoes e manutencao.

Regras:

- nunca expor chave `service_role` ao cliente
- nao usar `service_role` como atalho para corrigir problema de modelagem
- qualquer uso de `service_role` deve ser tratado como operacao privilegiada

### 3.1 `DELETE` nao e fluxo padrao do usuario autenticado

Neste dominio, exclusao fisica nao deve ser a pratica padrao para `authenticated`.

Motivos:

- dificulta auditoria e rastreabilidade
- enfraquece historico financeiro e reconciliacao
- complica analise de erros e suporte futuro

Regra:

- `authenticated` nao recebe `DELETE` nas tabelas de negocio do MVP
- exclusao logica ou desativacao devem ser preferidas
- exclusao fisica deve ser excecao administrativa ou operacional

### 3.2 Policies RLS devem ser separadas por acao

Policies genericas `for all` nao sao o padrao desejado para as tabelas de negocio do projeto.

Regra:

- preferir policies explicitas de `select`, `insert` e `update`
- nao criar policy de `delete` sem caso de uso real aprovado
- manter `using` e `with check` nas policies de `update`

Motivos:

- deixa a intencao de seguranca visivel no schema
- evita ambiguidade entre o que o produto permite e o que o banco aceita
- alinha `RLS` com a decisao de nao conceder `DELETE` ao usuario autenticado

### 4. Objetos novos em `public` devem nascer fechados

Todo objeto novo criado no schema `public` deve permanecer inacessivel pela Data API ate que um `GRANT` explicito seja adicionado em migracao.

Isso vale para:

- tabelas
- views
- funcoes
- sequencias

Motivo:

- impedir exposicao acidental
- tornar a seguranca revisavel em diff
- manter compatibilidade com a direcao atual da plataforma Supabase

### 5. Views exigem revisao propria

Views nao devem ser tratadas como extensao automatica do `RLS` das tabelas base.

Regras:

- so criar view exposta quando houver necessidade real do produto
- em Postgres 15+, preferir `security_invoker = true` quando a view precisar obedecer o `RLS` das tabelas base
- se a view nao for para o cliente, ela nao deve ficar exposta

### 6. Funcoes em `public` sao excecao

Funcoes no schema `public` aumentam a superficie da API.

Regras:

- nao criar funcao em `public` por padrao
- se a funcao nao precisa ser chamada pelo cliente, nao conceder `EXECUTE`
- evitar `SECURITY DEFINER` em objetos expostos

## Cruzamento com as Regras de Negocio do Projeto

### Login obrigatorio

Como o sistema exige login, nao existe caso de uso funcional que justifique acesso de `anon` aos dados financeiros.

### Uso pessoal hoje

Como nao existe compartilhamento, area publica ou consulta de terceiros:

- nao ha necessidade de leitura publica
- nao ha necessidade de escrita publica
- nao ha necessidade de relatorio publico

### Possivel produto no futuro

Se o projeto evoluir para produto:

- a politica atual ja suporta multiusuario
- o modelo ownership + allowlist explicita continua valido
- novos objetos podem ser expostos de forma controlada, sem reabrir todo o schema

### Natureza dos dados

Mesmo agregados e resumos sao sensiveis neste dominio.

Exemplos:

- soma de gastos por categoria
- total economizado no mes
- valor comprometido no cartao
- limite seguro calculado

Esses dados continuam sendo financeiros e nao devem ser expostos por default apenas por parecerem derivados.

## Regra Operacional para Devs e Agents

Ao criar novo objeto que o frontend precise consumir via `supabase-js` ou Data API:

1. decidir se o objeto realmente precisa estar em `public`
2. definir quais roles precisam alcancar o objeto
3. adicionar `GRANT` explicito na mesma migracao
4. habilitar `RLS` se for tabela ou view exposta
5. adicionar policies coerentes com ownership ou outro modelo legitimo de autorizacao

Ao criar objeto interno:

1. preferir schema nao exposto quando fizer sentido
2. se ficar em `public`, manter sem grant ate existir necessidade real
3. nao assumir que `RLS` sozinho basta

## Decisao Atual do Projeto

Para o estado atual do produto, a decisao oficial e:

- `anon` nao acessa nenhuma tabela de negocio
- `authenticated` recebe acesso apenas as tabelas do app
- `authenticated` nao recebe `DELETE` nas tabelas de negocio do MVP
- tabelas de negocio devem preferir policies RLS separadas por acao, e nao `for all`
- objetos futuros em `public` nao devem nascer expostos
- `RLS` continua obrigatorio em toda tabela exposta

## Impacto Esperado

Beneficios:

- menor superficie de ataque
- menos risco de exposicao acidental
- migracoes mais auditaveis
- base pronta para evolucao segura do produto

Tradeoff:

- cada novo objeto exposto exige grant explicito
- isso aumenta disciplina operacional, mas evita surpresas

## Implementacao Inicial Esperada

A implementacao correspondente a esta politica deve:

- revogar privilegios padrao automaticos para novos objetos em `public`
- revogar acessos amplos atuais dos roles de Data API
- reaplicar grants explicitos apenas nas tabelas do MVP
- evitar `DELETE` para `authenticated` nas tabelas de negocio
- substituir policies `for all` por policies explicitas de `select`, `insert` e `update`

Esse hardening deve ficar versionado em migracao SQL e nunca apenas configurado manualmente no dashboard.
