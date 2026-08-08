---
doc_id: DOC-ARCH-007
title: Acesso a Dados e Tratamento de Erros no Frontend
type: guide
status: draft
version: 1.0.0
owner: TBD
created_at: 2026-08-08
updated_at: 2026-08-08
review_due:
domain: frontend
audited_by: TBD
summary: Define como o frontend consumira leituras e mutacoes do backend Next.js, incluindo loaders, Server Actions, view models e estados de erro.
rag_ready: false
tags:
  - frontend
  - data-access
  - loaders
  - server-actions
  - error-handling
  - nextjs
related_docs:
  - "[[docs/planos/frontend-implementation-plan]]"
  - "[[docs/arquitetura/serverless-vercel-supabase-architecture]]"
  - "[[docs/planos/backend-mvp-plan]]"
  - "[[docs/regras_de_negocio/planejamento-e-dashboard-fase-4]]"
---

# Acesso a Dados e Tratamento de Erros no Frontend

## Objetivo

Definir um contrato simples para que paginas, Server Components e Client Components consumam o backend sem duplicar autenticacao, validacao, tratamento de erro ou montagem de dados financeiros.

Este documento prepara a implementacao do frontend. Ele nao cria loaders ou componentes neste momento.

## Principios

- `app/` continua sendo camada de entrega e composicao.
- Componentes visuais nao importam repositorios, casos de uso ou cliente Supabase.
- Regras financeiras continuam em `domain` e `application`.
- O frontend recebe view models prontos para exibicao.
- Erros tecnicos nao sao exibidos diretamente ao usuario.
- O isolamento por usuario continua sendo garantido pelo backend, autenticacao e RLS; o frontend nunca envia `userId` como autoridade.

## Separacao entre leitura e mutacao

### Leituras: loaders

Loaders sao funcoes pequenas, server-only, usadas por Server Components e paginas para obter dados de leitura.

Responsabilidades:

1. receber parametros de tela, como `yearMonth`;
2. chamar a composicao do caso de uso de leitura;
3. devolver um view model serializavel;
4. preservar o contrato de erro conhecido.

Exemplos futuros:

```ts
loadMonthlyDashboard(yearMonth)
loadMonthlyPlan(yearMonth)
loadPlannedVsActual(yearMonth)
```

O loader nao deve calcular saldo, comprometido ou disponivel. Ele apenas coordena a leitura e entrega o resultado ao componente.

Para leituras, a preferencia arquitetural e chamar o caso de uso diretamente pela composicao server-side. Server Actions de leitura existentes podem ser mantidas por compatibilidade, mas nao devem virar uma API HTTP interna nem ser duplicadas em cada pagina.

### Mutacoes: Server Actions

Server Actions sao a fronteira para operacoes iniciadas por formulario ou interacao do usuario:

- criar entrada ou despesa;
- criar compra no credito;
- pagar compromisso;
- salvar planejamento mensal;
- criar conta ou categoria.

Uma Action deve apenas validar a entrada, autenticar, chamar o caso de uso, adaptar o retorno e solicitar revalidacao quando necessario. Ela nao deve conter calculo financeiro ou acesso direto ao Supabase.

## Contrato de retorno

As leituras e mutacoes devem usar um resultado discriminado equivalente a:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      error: {
        code: string
        message: string
        issues?: Record<string, string[]>
      }
    }
```

O frontend deve testar `ok` antes de usar `data`. Nao deve depender de excecoes para erros esperados de validacao, sessao ou conflito.

## Mapeamento de erros para a interface

| Codigo | Significado | Tratamento visual |
| --- | --- | --- |
| `UNAUTHENTICATED` | sessao ausente ou expirada | redirecionar para login ou mostrar acao de entrar novamente |
| `VALIDATION_ERROR` | entrada rejeitada pela regra | mostrar mensagem proxima ao campo ou ao formulario |
| `CONFLICT` | registro duplicado ou estado concorrente | explicar o conflito e pedir nova tentativa |
| `INTERNAL_ERROR` | falha inesperada | mensagem generica, opcao de tentar novamente e registro para observabilidade |

Mensagens de banco, stack trace, nomes de tabela e detalhes de infraestrutura nunca devem chegar ao usuario.

## Estados obrigatorios por bloco de dados

Todo bloco que dependa de leitura deve prever:

- `loading`: skeleton ou placeholder com a mesma estrutura aproximada do conteudo;
- `empty`: nenhuma informacao cadastrada ou nenhum resultado para o filtro;
- `success`: view model completo;
- `error`: erro recuperavel com acao de tentar novamente;
- `unauthenticated`: sessao ausente ou expirada;
- `unavailable`: dado temporariamente indisponivel, sem inventar valor zero.

Valor indisponivel nao deve ser apresentado como `R$ 0,00`, pois isso altera a interpretacao financeira.

## Fluxo recomendado

```text
Pagina/Server Component
        |
        v
Loader server-only (leitura)
        |
        v
Composicao -> Caso de uso -> Repositorio Supabase/RLS
        |
        v
View model / erro conhecido
        |
        v
Componente visual
```

Para mutacoes:

```text
Formulario Client Component
        |
        v
Server Action
        |
        v
Zod -> autenticacao -> Caso de uso -> persistencia
        |
        v
ActionResult + revalidacao da pagina
```

## Revalidacao e consistencia

Depois de uma mutacao confirmada, a tela deve atualizar as leituras afetadas. No MVP, a estrategia preferida e revalidar a rota ou o segmento que exibe o dado, sem manter uma copia financeira em estado global do navegador.

Exemplos:

- criar entrada ou despesa: atualizar saldo, buckets, transacoes e dashboard;
- compra no credito: atualizar transacoes, compromissos e limite seguro;
- pagamento de compromisso: atualizar compromisso, saldo da conta pagadora e disponivel;
- salvar plano: atualizar planejamento e comparativo planejado versus realizado.

## View models e presenters

Casos de uso retornam DTOs de aplicacao. A camada `interface` pode convertê-los em view models próprios da tela, por exemplo para:

- formatar valores monetarios;
- traduzir labels de bucket e status;
- preparar series de grafico;
- ordenar ou agrupar itens para leitura.

Essa adaptação nao deve alterar valores nem regras do dominio. Formatação deve acontecer na borda, mantendo números e identificadores disponíveis quando a tela precisar deles.

## Decisoes adiadas

- Implementar os loaders quando o primeiro dashboard real for conectado.
- Definir se cada tela usara um loader por bloco ou um loader agregado por página após medir a necessidade de atualização independente.
- Avaliar cache e revalidacao mais granular quando houver telas interativas suficientes para justificar a complexidade.
- Adicionar observabilidade estruturada para `INTERNAL_ERROR` antes do deploy publico.

## Checklist para a implementação do frontend

- [ ] Server Component usa loader ou composicao server-side para leituras.
- [ ] Client Component nao acessa Supabase nem repositorio.
- [ ] Mutacao usa Server Action e `ActionResult`.
- [ ] Campos invalidos exibem `issues` sem perder os valores digitados.
- [ ] Erros de sessao, validacao, conflito e falha inesperada possuem tratamento distinto.
- [ ] Loading, vazio, sucesso e erro existem para cada bloco financeiro.
- [ ] Nenhuma falha de leitura e convertida silenciosamente em saldo zero.
- [ ] Apos mutacao, todas as leituras derivadas afetadas sao revalidadas.
