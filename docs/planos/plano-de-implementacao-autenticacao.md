---
doc_id: DOC-PLAN-005
title: Plano de Implementação do Serviço de Autenticação
type: plan
status: draft
version: 1.0.0
owner: TBD
created_at: 2026-08-08
updated_at: 2026-08-08
review_due:
domain: autenticacao
audited_by: TBD
summary: Organiza a implementação incremental do login, da sessão HttpOnly, do logout e da recuperação de senha com Supabase Auth.
rag_ready: false
tags:
  - autenticacao
  - supabase-auth
  - plano
  - seguranca
  - server-actions
related_docs:
  - "[[docs/arquitetura/autenticacao-e-sessao]]"
  - "[[docs/arquitetura/serverless-vercel-supabase-architecture]]"
  - "[[docs/regras_de_negocio/politica-de-exposicao-data-api-e-grants]]"
  - "[[docs/planos/backend-mvp-plan]]"
---

# Plano de Implementação do Serviço de Autenticação

## Objetivo

Implementar o serviço de login do Organizador Financeiro usando Supabase Auth, Next.js App Router e sessões em cookies `HttpOnly`, sem expor tokens ao JavaScript do navegador.

A arquitetura e as decisões de segurança estão em [[docs/arquitetura/autenticacao-e-sessao]]. Este documento descreve a ordem de execução e os critérios de aceite.

## Escopo do MVP

Incluído:

- login por e-mail e senha;
- logout da sessão atual;
- recuperação e redefinição de senha;
- proteção de rotas privadas;
- renovação de sessão no `proxy`;
- validação server-side com Zod;
- mensagens de erro sem enumeração de contas;
- testes de sessão, cookies, autorização e RLS.

Fora do primeiro ciclo:

- cadastro público;
- OAuth;
- login social;
- gerenciamento de múltiplos dispositivos na interface;
- MFA obrigatório;
- painel administrativo de usuários.

## Fase 0 — Preparação e configuração

### Tarefas

- confirmar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
- garantir que nenhuma chave secreta seja importada por código de navegador;
- revisar dependências `@supabase/ssr` e `@supabase/supabase-js` e manter lockfile versionado;
- desabilitar cadastro público e login anônimo no Supabase;
- criar o usuário inicial pelo painel do Supabase;
- configurar `Site URL` e redirects de localhost/produção;
- planejar SMTP próprio para o ambiente de produção.

### Aceite

- o login anônimo não é permitido;
- o usuário inicial existe em `auth.users`;
- redirects de produção são exatos;
- não há segredo em variáveis `NEXT_PUBLIC_*`.

## Fase 1 — Adaptador de sessão server-side

### Tarefas

- ajustar o cliente de servidor para aplicar cookies `HttpOnly`, `Secure`, `SameSite=Lax` e `Path=/`;
- preservar `getAll`/`setAll` e o repasse de headers de cache no `proxy`;
- manter criação do cliente dentro do contexto da requisição;
- impedir que o `createSupabaseBrowserClient()` seja usado em autenticação ou acesso a dados protegidos;
- adicionar uma função server-only para obter claims autenticados;
- revisar imports com `server-only` para evitar vazamento acidental para o bundle do navegador.

### Aceite

- cookies de autenticação aparecem como `HttpOnly`;
- em produção aparecem como `Secure`;
- não existe token em local/session storage;
- o `proxy` renova uma sessão expirada sem duplicar cookies incorretamente;
- respostas com renovação não são cacheadas por outro usuário.

## Fase 2 — Contratos e validação

### Tarefas

- criar schemas Zod para e-mail, senha e confirmação de senha;
- definir resultado estável das ações (`success`, `fieldErrors`, `formError`);
- criar erros de autenticação que não exponham detalhes do Supabase;
- normalizar e-mail antes do envio;
- impor senha mínima de 12 caracteres no fluxo de criação/alteração;
- não aceitar `userId` vindo do formulário.

### Aceite

- entradas inválidas não chegam ao Supabase;
- mensagens de login são genéricas;
- erros internos não são serializados para o cliente;
- os contratos podem ser testados sem Next.js ou Supabase real.

## Fase 3 — Login e proteção de rotas

### Tarefas

- criar `loginAction` em arquivo server-only;
- chamar `signInWithPassword` no servidor;
- redirecionar para um destino interno permitido ou `/dashboard`;
- criar a página `/login` e o formulário client-side que apenas chama a action;
- atualizar o `proxy` para reconhecer rotas públicas e privadas;
- redirecionar usuários anônimos para `/login`;
- redirecionar usuários autenticados que visitarem `/login` para `/dashboard`;
- proteger o layout do dashboard com validação real de sessão.

### Aceite

- login válido cria cookie HttpOnly e abre o dashboard;
- login inválido não revela se o e-mail existe;
- acesso direto sem sessão retorna para `/login`;
- esconder ou mostrar elementos da UI não é usado como autorização;
- o dashboard nunca é renderizado com dados de outro usuário.

## Fase 4 — Logout

### Tarefas

- criar `logoutAction` server-side;
- usar `signOut({ scope: "local" })` como comportamento padrão;
- limpar cookies mesmo quando a sessão local já estiver inválida;
- redirecionar para `/login`;
- preparar uma ação futura de logout global com `scope: "global"`.

### Aceite

- o cookie não permanece utilizável no navegador após logout;
- a sessão local deixa de ser renovável;
- o usuário não retorna ao dashboard usando navegação comum;
- erros de logout não expõem tokens ou dados de sessão.

## Fase 5 — Recuperação e redefinição de senha

### Tarefas

- criar `/esqueci-senha` e action para `resetPasswordForEmail`;
- retornar resposta genérica independentemente de o e-mail existir;
- criar `/auth/confirm` para validar `token_hash`;
- permitir somente `type=recovery` nesse fluxo;
- validar `next` contra uma allowlist interna;
- criar `/redefinir-senha` com nova senha e confirmação;
- exigir sessão válida de recuperação antes de atualizar a senha;
- configurar templates e SMTP próprio.

### Aceite

- link válido abre somente a redefinição esperada;
- link expirado ou reutilizado é rejeitado;
- nenhum token é exibido na interface;
- links não permitem open redirect;
- a nova senha é validada no servidor;
- a troca de senha invalida ou exige renovação das sessões conforme a configuração do Supabase.

## Fase 6 — Hardening do Supabase

### Tarefas

- habilitar confirmação de e-mail caso o cadastro seja aberto no futuro;
- configurar limites de sessão e JWT com valores revisados;
- ativar CAPTCHA/Turnstile quando o endpoint ficar exposto publicamente;
- habilitar proteção contra senhas vazadas quando disponível no plano;
- considerar MFA para a conta financeira;
- revisar Rate Limits e SMTP;
- revisar redirects de preview versus produção;
- executar Security Advisor e revisar grants/RLS.

### Aceite

- configurações de produção estão registradas e reproduzíveis;
- `anon` continua sem acesso às tabelas de negócio;
- todas as tabelas expostas mantêm RLS ativo;
- não existe dependência de `service_role` no fluxo comum.

## Fase 7 — Testes

### Testes unitários

- schemas aceitam e rejeitam entradas esperadas;
- ações mapeiam erros do provedor para mensagens seguras;
- destinos externos são rejeitados;
- usuário anônimo é recusado pelo guard;
- `userId` sempre vem do gateway autenticado.

### Testes de integração

- login válido e inválido;
- renovação de sessão no `proxy`;
- logout local;
- recuperação e redefinição;
- cookies com atributos de segurança;
- ausência de `localStorage`/`sessionStorage`;
- duas identidades isoladas pelo RLS.

### Testes de navegador

- `document.cookie` não expõe os cookies de sessão;
- tokens não aparecem em HTML, props, respostas JSON ou logs;
- navegação sem sessão é redirecionada;
- refresh da página mantém sessão;
- chamadas de mutação sem autenticação são rejeitadas;
- tentativa de CSRF de origem não permitida falha.

## Ordem de entrega recomendada

1. Fase 0: configurar o projeto Auth.
2. Fase 1: fechar o armazenamento da sessão.
3. Fase 2: criar contratos e erros.
4. Fase 3: entregar login e proteção de rotas.
5. Fase 4: entregar logout.
6. Fase 5: entregar recuperação de senha.
7. Fase 6: executar hardening de produção.
8. Fase 7: executar testes e revisão final.

## Arquivos esperados

```txt
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── esqueci-senha/page.tsx
│   └── redefinir-senha/page.tsx
├── auth/confirm/route.ts
└── actions/auth.ts

src/
├── lib/supabase/server.ts
├── lib/supabase/proxy.ts
└── modules/auth/
    ├── application/
    ├── infrastructure/supabase/
    └── interface/
```

## Riscos e respostas

| Risco | Resposta |
| --- | --- |
| Token acessível por JavaScript | Cookies HttpOnly e nenhum browser client para sessão |
| Ação protegida apenas pela UI | Guard server-side em toda action e caso de uso |
| Enumeração de contas | Mensagens genéricas e respostas equivalentes |
| Open redirect no recovery | Allowlist de caminhos internos |
| Cookie renovado por cache compartilhado | Headers privados/no-store e ausência de ISR autenticado |
| Uso acidental da secret key | Variável server-only e revisão de imports |
| RLS bypassado por grants amplos | Allowlist de grants e policies por ação |
| Brute force e abuso de e-mail | Rate Limits, CAPTCHA e SMTP próprio |

## Definição de pronto

O serviço será considerado pronto quando as sete fases estiverem concluídas, os testes críticos passarem e uma revisão confirmar simultaneamente:

- sessão server-first;
- cookies inacessíveis ao JavaScript;
- rotas e ações protegidas;
- RLS preservado;
- recovery funcional;
- configuração de produção documentada;
- nenhum token, senha ou segredo presente em logs, HTML, URLs ou payloads do cliente.
