# App Domain Guide

Este arquivo registra o contexto operacional do MVP para que futuros agentes de IA possam tomar decisoes consistentes ao implementar banco, frontend, validacoes e calculos.

## Contexto do Dominio

O MVP nao e apenas um controle mensal de gastos. Ele e um organizador financeiro orientado a `saldo por tipo de recurso`.

A base conceitual do projeto e:

- existem entradas com comportamentos diferentes
- nem todo valor recebido pode pagar qualquer despesa
- o sistema deve controlar saldos por bucket
- o sistema deve considerar compromissos futuros
- o historico mensal e apoio analitico, nao motor principal de decisao

## Fundacao do Modelo

O dominio deve ser construido sobre estas camadas:

1. `buckets de saldo`
2. `movimentacoes reais`
3. `restricoes de uso`
4. `compromissos futuros`
5. `visoes mensais derivadas`

As visoes `planejado`, `recebido`, `disponivel` e `comprometido` sao leituras derivadas do modelo, e nao a estrutura central do dominio.

## Buckets Canonicos do MVP

### `livre`

Dinheiro de uso geral.

Exemplos:

- salario
- renda extra
- saldo em conta corrente

### `vr`

Saldo restrito para alimentacao ou refeicao.

### `vt`

Saldo restrito para transporte.

## Definicoes Canonicas

### `planejado`

Expectativa de entradas, saidas e distribuicao do mes.

### `recebido`

Valor que realmente entrou em um bucket.

### `disponivel`

Valor que ainda pode ser usado, respeitando o bucket e os compromissos existentes.

### `comprometido`

Valor ja consumido ou reservado para pagamento futuro.

### `historico`

Base comparativa para tendencias, sugestoes e recorrencia. Nunca deve ser usado sozinho como regra principal de limite de gasto do mes atual.

## Decisoes de Produto

### `DP-001` - Separacao por tipo de recurso

O sistema deve separar `salario`, `VR` e `VT` em buckets distintos.

- `salario` alimenta `livre`
- `VR` alimenta `vr`
- `VT` alimenta `vt`

### `DP-002` - O saldo total nao e suficiente

O sistema nao deve exibir apenas um saldo agregado como fonte principal de decisao.

O usuario precisa ver:

- saldo livre
- saldo de VR
- saldo de VT
- total comprometido no cartao
- disponivel real por bucket

### `DP-003` - Mes atual decide capacidade de gasto

O sistema nao deve usar `gastei X no mes passado` como regra para o mes atual.

A capacidade de gasto do mes deve partir de:

- saldo atual
- entradas do mes
- restricoes de uso
- compromissos ja assumidos

### `DP-004` - Historico como apoio

O historico deve servir para:

- sugerir orcamento
- mostrar tendencia
- comparar comportamento
- prever categorias recorrentes

O historico nao deve ser a fonte primaria de autorizacao de gasto.

### `DP-005` - Cartao como compromisso futuro

Gastos no cartao de credito nao reduzem imediatamente o bucket no ato da compra, mas geram compromisso futuro do bucket `livre`.

## Regras de Negocio

### `RN-001` - Entrada deve indicar destino

Toda entrada deve registrar em qual bucket ela entra.

Exemplos:

- salario -> `livre`
- VR -> `vr`
- VT -> `vt`
- renda extra -> `livre`

### `RN-002` - Saida deve respeitar compatibilidade do bucket

Toda saida deve consumir um bucket compativel com sua natureza.

Regra inicial do MVP:

- gastos gerais podem consumir `livre`
- alimentacao pode consumir `livre` ou `vr`
- transporte pode consumir `livre` ou `vt`
- pagamento de fatura consome apenas `livre`

### `RN-003` - Beneficios restritos nao entram no caixa livre

`VR` e `VT` nao podem ser tratados como dinheiro livre.

Portanto:

- nao entram no saldo livre
- nao pagam fatura de cartao
- nao devem inflar limite seguro de gasto geral

### `RN-004` - Disponivel por bucket

O `disponivel` deve ser calculado por bucket.

Formula conceitual:

`disponivel_do_bucket = entradas_confirmadas - saidas_confirmadas - reservas_do_bucket`

### `RN-005` - Comprometido do livre

O bucket `livre` deve considerar compromissos futuros.

Exemplos:

- fatura aberta
- parcelas futuras do cartao
- contas fixas previstas

### `RN-006` - Limite seguro no credito

O limite seguro de gasto no credito deve ser calculado a partir do bucket `livre`.

Formula conceitual do MVP:

`limite_seguro_credito = livre_disponivel - compromissos_ate_vencimento - reserva_minima`

Observacoes:

- `VR` e `VT` nao entram nessa conta
- historico pode sugerir prudencia, mas nao define o limite sozinho

### `RN-007` - Planejado e derivado do contexto atual

O orcamento do mes deve ser construido com base no contexto atual do usuario.

O planejamento pode considerar:

- renda recorrente esperada
- gastos fixos
- categorias variaveis
- compromissos existentes

Mas o sistema deve sempre recalcular a leitura real a partir do que foi recebido e comprometido.

### `RN-008` - Mes anterior e apenas referencia

Dados de meses anteriores podem apoiar previsoes, mas nao devem virar regra automatica de gasto permitido no mes atual.

## Classificacoes Canonicas

### `IncomeSource`

- `salary`
- `vr`
- `vt`
- `extra_income`

### `ExpenseNature`

- `fixed`
- `variable`
- `credit_card`
- `investment`

### `BalanceBucket`

- `free`
- `meal_benefit`
- `transport_benefit`

### `CommitmentType`

- `credit_card_bill`
- `installment`
- `fixed_bill`
- `reserved_amount`

## Diretrizes de Implementacao

- Sempre preferir modelagem por bucket antes de criar calculos agregados.
- Nao assumir que toda receita entra no mesmo saldo.
- Nao assumir que todo gasto reduz o saldo livre.
- Nao usar historico mensal como unica heuristica para limite de gasto.
- Quando houver duvida de modelagem, preservar a separacao entre `livre`, `vr` e `vt`.

## Arquitetura do MVP

O projeto deve seguir uma adaptacao pragmatica de `Clean Architecture` para `Next.js App Router`.

Isso significa:

- o dominio nao depende de UI
- casos de uso nao dependem de framework
- infraestrutura implementa contratos definidos pelas camadas internas
- a camada `app/` deve orquestrar pagina, layout, server actions e composicao, mas nao concentrar regra de negocio

## Regra de Dependencia

As dependencias devem apontar para dentro.

Ordem canonica:

1. `domain`
2. `application`
3. `infrastructure`
4. `interface`
5. `app`

Regras:

- `domain` nao importa nada de `application`, `infrastructure`, `interface` ou `app`
- `application` pode importar `domain`, mas nao `infrastructure`, `interface` ou `app`
- `infrastructure` pode importar `application` e `domain`
- `interface` pode importar `application` e `domain`
- `app` pode importar todas as camadas de composicao necessarias, mas nao deve criar regra de negocio fora dos casos de uso

## Estrutura de Pastas Recomendada

Para o MVP, a estrutura recomendada e:

```txt
src/
|-- app/
|   |-- (auth)/
|   |   `-- login/
|   |-- (dashboard)/
|   |   |-- dashboard/
|   |   |-- entradas/
|   |   |-- gastos/
|   |   |-- categorias/
|   |   |-- cartoes/
|   |   `-- investimentos/
|   |-- api/
|   |-- layout.tsx
|   `-- page.tsx
|-- modules/
|   |-- finance/
|   |   |-- domain/
|   |   |   |-- entities/
|   |   |   |-- value-objects/
|   |   |   |-- enums/
|   |   |   `-- services/
|   |   |-- application/
|   |   |   |-- dtos/
|   |   |   |-- use-cases/
|   |   |   `-- ports/
|   |   |-- infrastructure/
|   |   |   |-- repositories/
|   |   |   |-- mappers/
|   |   |   `-- supabase/
|   |   `-- interface/
|   |       |-- forms/
|   |       |-- view-models/
|   |       `-- presenters/
|   |-- auth/
|   |   |-- domain/
|   |   |-- application/
|   |   |-- infrastructure/
|   |   `-- interface/
|   `-- shared/
|       |-- domain/
|       |-- application/
|       `-- infrastructure/
|-- components/
|   |-- ui/
|   |-- layout/
|   |-- charts/
|   `-- shared/
|-- lib/
|   |-- supabase/
|   |-- utils/
|   |-- formatters/
|   `-- validators/
|-- types/
`-- styles/
```

## Responsabilidade por Camada

### `domain`

Responsavel por representar as regras mais estaveis do negocio.

Exemplos para este projeto:

- `Transaction`
- `BalanceBucket`
- `Commitment`
- `Category`
- `CreditLimitPolicy`

Nesta camada devem ficar:

- entidades
- enums
- value objects
- servicos de dominio
- regras puras sem dependencia de framework

### `application`

Responsavel por orquestrar casos de uso do sistema.

Exemplos:

- `create-income-entry`
- `register-expense`
- `calculate-bucket-balance`
- `calculate-safe-credit-limit`
- `list-monthly-dashboard`

Nesta camada devem ficar:

- casos de uso
- DTOs
- contratos de repositorio
- contratos de gateway

### `infrastructure`

Responsavel por implementar acesso externo.

Exemplos:

- repositorios Supabase
- mapeadores entre banco e dominio
- clientes de autenticacao
- adaptadores de persistencia

### `interface`

Responsavel por adaptar entrada e saida da aplicacao para a experiencia do usuario.

Exemplos:

- schemas de formulario
- presenters
- view models
- adaptadores de tabela ou grafico

### `app`

Responsavel pela integracao com o Next.js.

Exemplos:

- paginas
- layouts
- loading
- error boundaries
- server actions
- route handlers

## Convencoes por Modulo

Cada modulo deve agrupar tudo o que pertence ao mesmo contexto de negocio.

Modulos iniciais sugeridos:

- `finance`
- `auth`
- `shared`

Dentro de `finance`, subdominios podem nascer sem quebrar a arquitetura:

- `income`
- `expenses`
- `categories`
- `credit-card`
- `investments`
- `dashboard`

Se o modulo ainda estiver pequeno, manter tudo em `modules/finance` e separar por camada e suficiente. So extrair subpastas adicionais quando o volume justificar.

## Regras de Implementacao Arquitetural

- Nunca colocar calculo central de negocio diretamente em componente React.
- Nunca colocar regra de dominio diretamente em `page.tsx`.
- `server actions` devem chamar casos de uso, nao conter regra de negocio extensa.
- Validacao de formulario pode existir na interface, mas a regra final deve ser protegida no dominio/application.
- Repositorios concretos do Supabase devem ficar em `infrastructure`.
- Tipos visuais de grafico e tabela nao devem contaminar `domain`.

## Primeira Estrutura Real do Prototipo

Ao iniciar o MVP, a primeira versao concreta pode ser reduzida para:

```txt
src/
|-- app/
|-- modules/
|   |-- finance/
|   |   |-- domain/
|   |   |-- application/
|   |   |-- infrastructure/
|   |   `-- interface/
|   `-- auth/
|-- components/
|-- lib/
`-- types/
```

Essa versao e suficiente para comecar sem superengenharia.

Observacao de bootstrap atual:

- o projeto ainda usa `app/` na raiz para o App Router do Next.js
- `src/` sera usado agora para modulos, componentes e camadas internas
- nao mover o `app/` para `src/app` enquanto o prototipo ainda estiver formando a base do dominio
- a migracao para `src/app` pode acontecer depois, se houver ganho real de organizacao

## Decisao Arquitetural Atual

Para este projeto:

- usar `Clean Architecture adaptada`, nao versao academica rigida
- organizar por `modulos de negocio`
- separar regras centrais em `domain` e `application`
- usar `app/` apenas como camada de entrega do Next.js
- evitar espalhar regra de negocio entre componentes, hooks e paginas

## Terminologia Canonica

Usar estes termos no codigo, documentacao e interface sempre que possivel:

- `saldo livre`
- `beneficio restrito`
- `bucket de saldo`
- `comprometido`
- `disponivel`
- `limite seguro no credito`
- `mes atual`
- `historico como apoio`

Evitar termos vagos quando eles ocultarem a regra real:

- evitar `saldo geral` como metrica principal
- evitar `receita mensal` quando a distincao entre buckets for relevante
- evitar `pode gastar` sem explicitar se isso significa `livre`, `vr` ou `vt`
