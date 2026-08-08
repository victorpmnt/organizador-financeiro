import {
  ArrowDownLeft,
  ArrowUpRight,
  BusFront,
  CreditCard,
  Landmark,
  PiggyBank,
  ShieldCheck,
  TriangleAlert,
  Utensils,
  Wallet,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { formatCurrency } from "@/lib/formatters/currency";
import type { MonthlyDashboardDto } from "@/modules/finance/application/dtos/monthly-dashboard-dto";

type DashboardErrorCode =
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "UNAUTHENTICATED"
  | "VALIDATION_ERROR";

interface MonthlyDashboardOverviewProps {
  data: MonthlyDashboardDto;
}

interface DashboardStateProps {
  code?: DashboardErrorCode;
  details?: string;
  title: string;
}

const bucketCards = [
  {
    availableKey: "freeAvailableInCents",
    balanceKey: "freeBalanceInCents",
    committedKey: "freeCommittedInCents",
    description: "Uso geral",
    icon: Wallet,
    label: "Livre",
  },
  {
    availableKey: "mealBenefitAvailableInCents",
    balanceKey: "mealBenefitBalanceInCents",
    committedKey: "mealBenefitCommittedInCents",
    description: "Alimentação",
    icon: Utensils,
    label: "VR",
  },
  {
    availableKey: "transportBenefitAvailableInCents",
    balanceKey: "transportBenefitBalanceInCents",
    committedKey: "transportBenefitCommittedInCents",
    description: "Transporte",
    icon: BusFront,
    label: "VT",
  },
] as const satisfies ReadonlyArray<{
  availableKey: keyof MonthlyDashboardDto;
  balanceKey: keyof MonthlyDashboardDto;
  committedKey: keyof MonthlyDashboardDto;
  description: string;
  icon: ComponentType<{ "aria-hidden"?: boolean; className?: string }>;
  label: string;
}>;

const metricCards = [
  {
    description: "Confirmadas na competência",
    icon: ArrowDownLeft,
    key: "receivedIncomeInCents",
    label: "Entradas recebidas",
    tone: "positive",
  },
  {
    description: "Consumidas durante o mês",
    icon: ArrowUpRight,
    key: "consumedExpenseInCents",
    label: "Saídas consumidas",
    tone: "negative",
  },
  {
    description: "Proteção mínima do saldo livre",
    icon: PiggyBank,
    key: "minimumFreeReserveInCents",
    label: "Reserva mínima",
    tone: "default",
  },
  {
    description: "Crédito ainda seguro para uso",
    icon: ShieldCheck,
    key: "safeCreditLimitInCents",
    label: "Limite seguro",
    tone: "warning",
  },
] as const satisfies ReadonlyArray<{
  description: string;
  icon: ComponentType<{ "aria-hidden"?: boolean; className?: string }>;
  key: keyof MonthlyDashboardDto;
  label: string;
  tone: "default" | "negative" | "positive" | "warning";
}>;

function getStateTone(code?: DashboardErrorCode) {
  switch (code) {
    case "VALIDATION_ERROR":
      return "border-[rgb(243_200_120_/_0.24)] text-[var(--warning)]";
    case "UNAUTHENTICATED":
      return "border-white/12 text-[var(--silver-100)]";
    default:
      return "border-[rgb(255_140_146_/_0.24)] text-[var(--negative)]";
  }
}

function formatMonthLabel(yearMonth: string) {
  const [year, month] = yearMonth.split("-");
  const parsedMonth = Number(month);

  if (!year || Number.isNaN(parsedMonth)) {
    return yearMonth;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(new Date(Number(year), parsedMonth - 1, 1));
}

function formatRatio(value: number | null) {
  if (value === null) {
    return "Sem percentual";
  }

  return `${value.toFixed(1)}%`;
}

function formatAccountTypeLabel(value: MonthlyDashboardDto["insights"]["primaryAccountType"]) {
  if (!value) {
    return "Sem conta principal";
  }

  return value.toLowerCase().replaceAll("_", " ");
}

function toneClass(tone: "default" | "negative" | "positive" | "warning") {
  if (tone === "positive") return "text-[var(--positive)]";
  if (tone === "negative") return "text-[var(--negative)]";
  if (tone === "warning") return "text-[var(--warning)]";
  return "text-[var(--silver-100)]";
}

function MetricValue({
  amountInCents,
  emphasize = false,
  tone = "default",
}: {
  amountInCents: number;
  emphasize?: boolean;
  tone?: "default" | "negative" | "positive" | "warning";
}) {
  if (emphasize) {
    return (
      <p className="money-tabular text-[2.25rem] font-semibold leading-none tracking-[-0.055em] text-[#0a1119] sm:text-5xl lg:text-[3.25rem]">
        {formatCurrency(amountInCents)}
      </p>
    );
  }

  return (
    <p className={`money-tabular text-2xl font-semibold tracking-[-0.045em] ${toneClass(tone)}`}>
      {formatCurrency(amountInCents)}
    </p>
  );
}

function InfoTile({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--radius-sm)] border border-white/[0.065] bg-black/10 px-4 py-3 ${className}`}>
      {children}
    </div>
  );
}

export function DashboardState({ code, details, title }: DashboardStateProps) {
  return (
    <section className={`surface-content rounded-[var(--radius-lg)] p-6 ${getStateTone(code)}`}>
      <div className="flex max-w-2xl gap-4">
        <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-current/20 bg-current/5">
          <TriangleAlert aria-hidden="true" className="h-5 w-5" />
        </span>
        <div>
          <p className="eyebrow text-current">{code ? `Estado ${code}` : "Dashboard"}</p>
          <h2 className="mt-2 text-xl font-semibold text-current">{title}</h2>
          {details ? <p className="mt-2 text-sm/6 text-[rgb(244_247_250_/_0.7)]">{details}</p> : null}
        </div>
      </div>
    </section>
  );
}

export function MonthlyDashboardOverview({ data }: MonthlyDashboardOverviewProps) {
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section aria-label="Resumo principal" className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)]">
        <article className="surface-metal interactive-surface min-h-[248px] rounded-[var(--radius-lg)] p-6 sm:p-8">
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(10_17_25_/_0.6)]">Saldo livre</p>
                <p className="mt-2 text-sm text-[rgb(10_17_25_/_0.66)]">Disponível para uso geral</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white/25 text-[#17202a] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.5)]">
                <Landmark aria-hidden="true" className="h-5 w-5" />
              </span>
            </div>

            <div>
              <MetricValue amountInCents={data.freeAvailableInCents} emphasize />
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-black/10 pt-4 text-xs text-[rgb(10_17_25_/_0.66)]">
                <span>Saldo total <strong className="money-tabular ml-1 font-semibold text-[#0a1119]">{formatCurrency(data.freeBalanceInCents)}</strong></span>
                <span>Comprometido <strong className="money-tabular ml-1 font-semibold text-[#0a1119]">{formatCurrency(data.freeCommittedInCents)}</strong></span>
                <span className="capitalize">{formatMonthLabel(data.yearMonth)}</span>
              </div>
            </div>
          </div>
        </article>

        <article className="surface-content rounded-[var(--radius-lg)] p-5 sm:p-6">
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Compromissos</p>
                <div className="mt-3"><MetricValue amountInCents={data.committedInCents} tone="warning" /></div>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] border border-[rgb(243_200_120_/_0.16)] bg-[rgb(243_200_120_/_0.07)] text-[var(--warning)]">
                <CreditCard aria-hidden="true" className="h-5 w-5" />
              </span>
            </div>

            <dl className="mt-auto grid gap-2 pt-6 text-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <InfoTile>
                <dt className="text-xs text-[var(--silver-500)]">Próximos 30 dias</dt>
                <dd className="money-tabular mt-1.5 font-semibold text-[var(--warning)]">{formatCurrency(data.insights.commitmentsDueNext30DaysInCents)}</dd>
              </InfoTile>
              <InfoTile>
                <dt className="text-xs text-[var(--silver-500)]">Em atraso</dt>
                <dd className="money-tabular mt-1.5 font-semibold text-[var(--negative)]">{formatCurrency(data.insights.overdueCommitmentsInCents)}</dd>
              </InfoTile>
            </dl>
          </div>
        </article>
      </section>

      <section aria-labelledby="buckets-title">
        <div className="mb-3 flex items-end justify-between px-1">
          <div>
            <p className="eyebrow">Recursos</p>
            <h2 id="buckets-title" className="mt-1 text-lg font-semibold tracking-tight">Saldos por bucket</h2>
          </div>
          <p className="hidden text-xs text-[var(--silver-500)] sm:block">Cada saldo preserva sua regra de uso</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {bucketCards.map((bucket) => {
            const Icon = bucket.icon;
            return (
              <article key={bucket.label} className="surface-content interactive-surface rounded-[var(--radius-md)] p-5 hover:border-white/[0.14]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--silver-300)]">{bucket.label}</p>
                    <p className="mt-1 text-xs text-[var(--silver-500)]">{bucket.description}</p>
                  </div>
                  <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] border border-white/8 bg-white/5 text-[var(--silver-300)]">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                </div>
                <p className="money-tabular mt-6 text-[1.7rem] font-semibold tracking-[-0.045em] text-[var(--silver-100)]">{formatCurrency(data[bucket.balanceKey] as number)}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.065] pt-4 text-xs">
                  <div>
                    <dt className="text-[var(--silver-500)]">Disponível</dt>
                    <dd className="money-tabular mt-1 font-semibold text-[var(--positive)]">{formatCurrency(data[bucket.availableKey] as number)}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--silver-500)]">Comprometido</dt>
                    <dd className="money-tabular mt-1 font-semibold text-[var(--warning)]">{formatCurrency(data[bucket.committedKey] as number)}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-label="Métricas mensais" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="surface-content rounded-[var(--radius-md)] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium text-[var(--silver-500)]">{metric.label}</p>
                <Icon aria-hidden="true" className={`h-4 w-4 ${toneClass(metric.tone)}`} />
              </div>
              <div className="mt-4"><MetricValue amountInCents={data[metric.key] as number} tone={metric.tone} /></div>
              <p className="mt-2 text-xs/5 text-[var(--silver-500)]">{metric.description}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <article className="surface-content-strong rounded-[var(--radius-lg)] p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4 border-b border-white/[0.065] pb-4">
            <div>
              <p className="eyebrow">Leitura do mês</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">Planejado e realizado</h2>
            </div>
            <span className="text-xs text-[var(--silver-500)]">Consolidado</span>
          </div>

          <dl className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {[
              ["Entradas planejadas", formatCurrency(data.plannedIncomeInCents)],
              ["Despesas planejadas", formatCurrency(data.plannedExpenseInCents)],
              ["Fluxo líquido", formatCurrency(data.insights.netCashFlowInCents)],
              ["Conta principal", formatAccountTypeLabel(data.insights.primaryAccountType)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-white/[0.055] py-3 text-sm">
                <dt className="text-[var(--silver-500)]">{label}</dt>
                <dd className="money-tabular text-right font-semibold capitalize text-[var(--silver-100)]">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoTile>
              <p className="text-xs text-[var(--silver-500)]">Maior gasto isolado</p>
              <p className="mt-2 truncate text-sm font-semibold">{data.insights.highestSingleExpenseDescription ?? "Sem descrição"}</p>
              <p className="money-tabular mt-1 text-xs text-[var(--negative)]">{formatCurrency(data.insights.highestSingleExpenseAmountInCents)}</p>
            </InfoTile>
            <InfoTile>
              <p className="text-xs text-[var(--silver-500)]">Categoria de maior peso</p>
              <p className="mt-2 truncate text-sm font-semibold">{data.insights.topExpenseCategoryName ?? "Sem categoria dominante"}</p>
              <p className="money-tabular mt-1 text-xs text-[var(--silver-300)]">{formatCurrency(data.insights.topExpenseCategoryAmountInCents)} · {formatRatio(data.insights.topExpenseCategorySharePercentage)}</p>
            </InfoTile>
          </div>
        </article>

        <article className="surface-content-strong rounded-[var(--radius-lg)] p-5 sm:p-6">
          <div className="border-b border-white/[0.065] pb-4">
            <p className="eyebrow">Carteira</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">Limite por cartão</h2>
          </div>

          {data.creditCards.length === 0 ? (
            <div className="mt-4 rounded-[var(--radius-md)] border border-dashed border-white/10 px-4 py-8 text-center text-sm/6 text-[var(--silver-500)]">Nenhum cartão com limite disponível nesta competência.</div>
          ) : (
            <ul className="mt-4 grid gap-3">
              {data.creditCards.map((card) => {
                const utilization = Math.min(Math.max(card.utilizationPercentage, 0), 100);
                return (
                  <li key={card.accountId} className="rounded-[var(--radius-md)] border border-white/[0.065] bg-black/10 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--silver-100)]">{card.name}</p>
                        <p className="mt-1 text-xs text-[var(--silver-500)]">{utilization.toFixed(1)}% utilizado</p>
                      </div>
                      <div className="text-right">
                        <p className="money-tabular text-sm font-semibold text-[var(--ice)]">{formatCurrency(card.availableLimitInCents)}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[var(--silver-500)]">disponível</p>
                      </div>
                    </div>
                    <div aria-label={`${utilization.toFixed(1)}% do limite utilizado`} className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.065]" role="img">
                      <div className="h-full rounded-full bg-[var(--warning)]" style={{ width: `${utilization}%` }} />
                    </div>
                    <div className="mt-3 flex justify-between gap-4 text-xs text-[var(--silver-500)]">
                      <span>Comprometido <strong className="money-tabular ml-1 font-medium text-[var(--warning)]">{formatCurrency(card.committedInCents)}</strong></span>
                      <span>Limite <strong className="money-tabular ml-1 font-medium text-[var(--silver-300)]">{formatCurrency(card.creditLimitInCents)}</strong></span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}
