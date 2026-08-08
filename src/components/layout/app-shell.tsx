import Link from "next/link";
import { ArrowLeftRight, CalendarRange, LayoutDashboard, WalletCards } from "lucide-react";
import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

const navigationItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Visão geral" },
  { href: "/transacoes", icon: ArrowLeftRight, label: "Movimentações" },
  { href: "/planejamento", icon: CalendarRange, label: "Planejamento" },
  { href: "/carteira", icon: WalletCards, label: "Carteira" },
] as const;

function Navigation({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav
      aria-label={mobile ? "Navegação principal móvel" : "Navegação principal"}
      className={mobile ? "grid grid-cols-4 gap-1" : "grid gap-1.5"}
    >
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/dashboard";

        return (
          <Link
            key={item.href}
            aria-current={active ? "page" : undefined}
            className={`focus-outline interactive-surface group flex min-h-11 items-center border ${
              mobile
                ? "flex-col justify-center gap-1 rounded-[var(--radius-sm)] px-1 py-2 text-[10px]"
                : "gap-3 rounded-[var(--radius-md)] px-3.5 py-3 text-sm"
            } ${
              active
                ? "border-white/12 bg-white/9 text-[var(--silver-100)] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.06)]"
                : "border-transparent text-[var(--silver-500)] hover:border-white/8 hover:bg-white/5 hover:text-[var(--silver-100)]"
            }`}
            href={item.href}
          >
            <span
              className={`grid place-items-center rounded-lg transition-colors ${
                active ? "text-[var(--ice)]" : "text-[var(--silver-500)] group-hover:text-[var(--silver-300)]"
              }`}
            >
              <Icon aria-hidden="true" className={mobile ? "h-[18px] w-[18px]" : "h-[17px] w-[17px]"} />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="ambient-shell bg-[var(--canvas)] text-[var(--silver-100)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] gap-5 px-3 py-3 sm:px-5 sm:py-5 lg:gap-7 lg:px-7 lg:py-7">
        <aside className="surface-glass hidden w-[244px] shrink-0 rounded-[var(--radius-lg)] p-4 lg:sticky lg:top-7 lg:block lg:h-[calc(100vh-3.5rem)]">
          <div className="flex h-full flex-col">
            <div className="border-b border-white/8 px-2 pb-5 pt-1">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] border border-white/15 bg-white/8 font-semibold text-[var(--ice)] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.08)]">
                  A
                </span>
                <div>
                  <p className="text-sm font-semibold tracking-[0.08em] text-[var(--silver-100)]">ARGENT</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--silver-500)]">Platinum Night</p>
                </div>
              </div>
              <p className="eyebrow">Organizador financeiro</p>
              <p className="mt-2 text-sm/6 text-[rgb(244_247_250_/_0.68)]">Seu dinheiro, organizado por natureza e propósito.</p>
            </div>

            <div className="py-5">
              <p className="eyebrow mb-2 px-3">Menu</p>
              <Navigation />
            </div>

            <div className="mt-auto border-t border-white/8 px-2 pt-4">
              <div className="flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2">
                <span className="h-2 w-2 rounded-full bg-[var(--positive)] shadow-[0_0_0_4px_rgb(121_214_163_/_0.08)]" />
                <div>
                  <p className="text-xs font-medium text-[var(--silver-300)]">Ambiente protegido</p>
                  <p className="mt-0.5 text-[11px] text-[var(--silver-500)]">Dados privados</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-24 lg:pb-0">
          <header className="mb-5 flex min-h-14 items-center justify-between px-1 sm:px-2 lg:mb-7">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] border border-white/12 bg-white/7 font-semibold text-[var(--ice)]">A</span>
              <div>
                <p className="text-sm font-semibold tracking-[0.08em]">ARGENT</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--silver-500)]">Platinum Night</p>
              </div>
            </div>
            <div className="hidden lg:block">
              <p className="eyebrow">Visão geral</p>
              <p className="mt-1 text-sm text-[rgb(244_247_250_/_0.68)]">Clareza para decidir o próximo movimento.</p>
            </div>
            <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/8 bg-white/[0.035] px-3 text-xs text-[var(--silver-300)]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--positive)]" />
              Atualizado
            </div>
          </header>

          <main className="flex min-w-0 flex-1 flex-col">{children}</main>
        </div>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-50 lg:hidden">
        <div className="surface-glass mx-auto max-w-md rounded-[var(--radius-md)] p-1.5">
          <Navigation mobile />
        </div>
      </div>
    </div>
  );
}
