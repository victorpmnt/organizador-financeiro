import { loadMonthlyDashboard } from "@/app/_loaders/finance";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/shared/section-heading";
import { getCurrentYearMonth } from "@/lib/dates/current-year-month";
import {
  DashboardState,
  MonthlyDashboardOverview,
} from "@/components/finance/monthly-dashboard-overview";

type DashboardPageProps = {
  searchParams?: Promise<{ month?: string | string[] }>;
};

function getRequestedMonth(month: string | string[] | undefined) {
  if (typeof month === "string") {
    return month;
  }

  if (Array.isArray(month)) {
    return month[0];
  }

  return getCurrentYearMonth();
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedMonth = getRequestedMonth(params?.month);
  const dashboardResult = await loadMonthlyDashboard(selectedMonth);

  return (
    <AppShell>
      <div className="flex flex-col gap-5 sm:gap-6">
        <section className="flex flex-col gap-6 px-1 py-2 sm:px-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="eyebrow text-[var(--ice)]">Competência mensal</p>
              <SectionHeading
                title="Dashboard financeiro"
                description="Acompanhe o que está disponível agora, o que já está comprometido e como cada recurso pode ser utilizado."
              />
            </div>

            <form className="surface-glass flex flex-col gap-2 rounded-[var(--radius-md)] p-2 sm:flex-row sm:items-end" method="get">
              <label className="flex min-w-52 flex-col gap-1.5 px-2 py-1 text-xs font-medium text-[var(--silver-500)]">
                Competência
                <input
                  aria-label="Competência do dashboard"
                  className="focus-outline min-h-11 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-3 text-sm font-medium text-[var(--silver-100)] outline-none transition-[border-color,background-color] duration-150 hover:border-white/20 hover:bg-white/7"
                  defaultValue={selectedMonth}
                  max={getCurrentYearMonth()}
                  name="month"
                  type="month"
                />
              </label>
              <button
                className="focus-outline interactive-surface min-h-11 rounded-[var(--radius-sm)] border border-[rgb(185_231_255_/_0.22)] bg-[rgb(185_231_255_/_0.1)] px-5 text-sm font-semibold text-[var(--ice)] hover:border-[rgb(185_231_255_/_0.38)] hover:bg-[rgb(185_231_255_/_0.15)]"
                type="submit"
              >
                Atualizar
              </button>
            </form>
        </section>

        {dashboardResult.ok ? (
          <MonthlyDashboardOverview data={dashboardResult.data} />
        ) : (
          <DashboardState
            code={dashboardResult.error.code}
            details={
              dashboardResult.error.code === "VALIDATION_ERROR"
                ? "Use uma competencia valida no formato AAAA-MM para consultar o consolidado mensal."
                : dashboardResult.error.code === "UNAUTHENTICATED"
                  ? "A rota exige autenticacao. Quando o fluxo de login estiver ativo, esta tela deve receber a sessao protegida."
                  : "Nao foi possivel carregar o dashboard mensal nesta tentativa."
            }
            title={
              dashboardResult.error.code === "VALIDATION_ERROR"
                ? "Competencia invalida"
                : dashboardResult.error.code === "UNAUTHENTICATED"
                  ? "Sessao necessaria"
                  : "Falha ao carregar o dashboard"
            }
          />
        )}
      </div>
    </AppShell>
  );
}
