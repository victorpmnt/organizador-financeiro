import "server-only";

import type { MonthlyDashboardDto } from "@/modules/finance/application/dtos/monthly-dashboard-dto";
import type { MonthlyPlanDetailsDto } from "@/modules/finance/application/dtos/monthly-plan-details-dto";
import type { PlannedVsActualOverviewDto } from "@/modules/finance/application/dtos/planned-vs-actual-dto";
import type { Account } from "@/modules/finance/domain/entities/account";
import type { Category } from "@/modules/finance/domain/entities/category";
import type { Commitment } from "@/modules/finance/domain/entities/commitment";
import type { Transaction } from "@/modules/finance/domain/entities/transaction";
import { comparePlannedVsActualSchema } from "@/modules/finance/interface/schemas/compare-planned-vs-actual-schema";
import { getMonthlyDashboardSchema } from "@/modules/finance/interface/schemas/get-monthly-dashboard-schema";
import { listMonthlyPlanSchema } from "@/modules/finance/interface/schemas/list-monthly-plan-schema";
import { listTransactionsByMonthSchema } from "@/modules/finance/interface/schemas/list-transactions-by-month-schema";

import { createFinancePhaseFourUseCases } from "../_composition/finance-phase-four";
import { createFinancePhaseOneUseCases } from "../_composition/finance-phase-one";
import { createFinancePhaseThreeUseCases } from "../_composition/finance-phase-three";
import { createFinancePhaseTwoUseCases } from "../_composition/finance-phase-two";
import {
  actionFailure,
  actionSuccess,
  actionValidationFailure,
  type ActionResult,
} from "../actions/action-result";

type YearMonthSchema = {
  safeParse(input: unknown):
    | { data: { yearMonth: string }; success: true }
    | {
        error: { issues: { message: string; path: PropertyKey[] }[] };
        success: false;
      };
};

async function loadByYearMonth<T>(
  yearMonth: unknown,
  schema: YearMonthSchema,
  execute: (input: { yearMonth: string }) => Promise<T>,
): Promise<ActionResult<T>> {
  const parsedInput = schema.safeParse({ yearMonth });

  if (!parsedInput.success) {
    return actionValidationFailure(
      parsedInput.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join("."),
      })),
    );
  }

  try {
    return actionSuccess(await execute(parsedInput.data));
  } catch (error) {
    return actionFailure(error);
  }
}

export async function loadMonthlyDashboard(
  yearMonth: unknown,
): Promise<ActionResult<MonthlyDashboardDto>> {
  return loadByYearMonth(yearMonth, getMonthlyDashboardSchema, async (input) => {
    const { getMonthlyDashboard } = await createFinancePhaseFourUseCases();
    return getMonthlyDashboard.execute(input);
  });
}

export async function loadMonthlyPlan(
  yearMonth: unknown,
): Promise<ActionResult<MonthlyPlanDetailsDto>> {
  return loadByYearMonth(yearMonth, listMonthlyPlanSchema, async (input) => {
    const { listMonthlyPlan } = await createFinancePhaseFourUseCases();
    return listMonthlyPlan.execute(input);
  });
}

export async function loadPlannedVsActual(
  yearMonth: unknown,
): Promise<ActionResult<PlannedVsActualOverviewDto>> {
  return loadByYearMonth(yearMonth, comparePlannedVsActualSchema, async (input) => {
    const { comparePlannedVsActual } = await createFinancePhaseFourUseCases();
    return comparePlannedVsActual.execute(input);
  });
}

export async function loadTransactionsByMonth(
  yearMonth: unknown,
): Promise<ActionResult<Transaction[]>> {
  return loadByYearMonth(yearMonth, listTransactionsByMonthSchema, async (input) => {
    const { listTransactionsByMonth } = await createFinancePhaseTwoUseCases();
    return listTransactionsByMonth.execute(input);
  });
}

export async function loadOpenCommitments(): Promise<ActionResult<Commitment[]>> {
  try {
    const { listOpenCommitments } = await createFinancePhaseThreeUseCases();
    return actionSuccess(await listOpenCommitments.execute());
  } catch (error) {
    return actionFailure(error);
  }
}

export async function loadAccounts(): Promise<ActionResult<Account[]>> {
  try {
    const { listAccounts } = await createFinancePhaseOneUseCases();
    return actionSuccess(await listAccounts.execute());
  } catch (error) {
    return actionFailure(error);
  }
}

export async function loadCategories(): Promise<ActionResult<Category[]>> {
  try {
    const { listCategories } = await createFinancePhaseOneUseCases();
    return actionSuccess(await listCategories.execute());
  } catch (error) {
    return actionFailure(error);
  }
}
