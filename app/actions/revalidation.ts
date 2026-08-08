import "server-only";

import { revalidatePath } from "next/cache";

const financePaths = {
  accounts: "/contas",
  categories: "/categorias",
  commitments: "/compromissos",
  dashboard: "/dashboard",
  planning: "/planejamento",
  transactions: "/transacoes",
} as const;

function revalidateFinancePaths(paths: readonly string[]): void {
  for (const path of new Set(paths)) {
    revalidatePath(path);
  }
}

export function revalidateAccountViews(): void {
  revalidateFinancePaths([financePaths.accounts, financePaths.dashboard]);
}

export function revalidateCategoryViews(): void {
  revalidateFinancePaths([
    financePaths.categories,
    financePaths.planning,
    financePaths.transactions,
  ]);
}

export function revalidateTransactionViews(): void {
  revalidateFinancePaths([financePaths.dashboard, financePaths.transactions]);
}

export function revalidateCreditPurchaseViews(): void {
  revalidateFinancePaths([
    financePaths.commitments,
    financePaths.dashboard,
    financePaths.transactions,
  ]);
}

export function revalidateCommitmentPaymentViews(): void {
  revalidateFinancePaths([
    financePaths.accounts,
    financePaths.commitments,
    financePaths.dashboard,
  ]);
}

export function revalidatePlanningViews(): void {
  revalidateFinancePaths([financePaths.dashboard, financePaths.planning]);
}
