import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLoading() {
  return (
    <AppShell>
      <div aria-busy="true" aria-label="Carregando dashboard financeiro" className="flex flex-col gap-5 sm:gap-6">
        <div className="skeleton-shine surface-content h-28 rounded-[var(--radius-lg)]" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="skeleton-shine surface-metal h-64 rounded-[var(--radius-lg)]" />
          <div className="skeleton-shine surface-content h-64 rounded-[var(--radius-lg)]" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="skeleton-shine surface-content h-48 rounded-[var(--radius-md)]" />
          <div className="skeleton-shine surface-content h-48 rounded-[var(--radius-md)]" />
          <div className="skeleton-shine surface-content h-48 rounded-[var(--radius-md)]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="skeleton-shine surface-content h-36 rounded-[var(--radius-md)]" />
          <div className="skeleton-shine surface-content h-36 rounded-[var(--radius-md)]" />
          <div className="skeleton-shine surface-content h-36 rounded-[var(--radius-md)]" />
          <div className="skeleton-shine surface-content h-36 rounded-[var(--radius-md)]" />
        </div>
      </div>
    </AppShell>
  );
}
