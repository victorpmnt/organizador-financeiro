"use server";

import type { MonthlyDashboardDto } from "@/modules/finance/application/dtos/monthly-dashboard-dto";
import type { MonthlyPlanDetailsDto } from "@/modules/finance/application/dtos/monthly-plan-details-dto";
import type { PlannedVsActualOverviewDto } from "@/modules/finance/application/dtos/planned-vs-actual-dto";
import { comparePlannedVsActualSchema } from "@/modules/finance/interface/schemas/compare-planned-vs-actual-schema";
import { getMonthlyDashboardSchema } from "@/modules/finance/interface/schemas/get-monthly-dashboard-schema";
import { listMonthlyPlanSchema } from "@/modules/finance/interface/schemas/list-monthly-plan-schema";
import { upsertMonthlyPlanSchema } from "@/modules/finance/interface/schemas/upsert-monthly-plan-schema";

import { createFinancePhaseFourUseCases } from "../_composition/finance-phase-four";
import {
  actionFailure,
  actionSuccess,
  actionValidationFailure,
  type ActionResult,
} from "./action-result";
import { revalidatePlanningViews } from "./revalidation";

export async function upsertMonthlyPlanAction(
  input: unknown,
): Promise<ActionResult<MonthlyPlanDetailsDto>> {
  const parsedInput = upsertMonthlyPlanSchema.safeParse(input);

  if (!parsedInput.success) {
    return actionValidationFailure(
      parsedInput.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join("."),
      })),
    );
  }

  try {
    const { upsertMonthlyPlan } = await createFinancePhaseFourUseCases();
    const plan = await upsertMonthlyPlan.execute(parsedInput.data);
    revalidatePlanningViews();
    return actionSuccess(plan);
  } catch (error) {
    return actionFailure(error);
  }
}

export async function listMonthlyPlanAction(
  input: unknown,
): Promise<ActionResult<MonthlyPlanDetailsDto>> {
  const parsedInput = listMonthlyPlanSchema.safeParse(input);

  if (!parsedInput.success) {
    return actionValidationFailure(
      parsedInput.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join("."),
      })),
    );
  }

  try {
    const { listMonthlyPlan } = await createFinancePhaseFourUseCases();
    return actionSuccess(await listMonthlyPlan.execute(parsedInput.data));
  } catch (error) {
    return actionFailure(error);
  }
}

export async function comparePlannedVsActualAction(
  input: unknown,
): Promise<ActionResult<PlannedVsActualOverviewDto>> {
  const parsedInput = comparePlannedVsActualSchema.safeParse(input);

  if (!parsedInput.success) {
    return actionValidationFailure(
      parsedInput.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join("."),
      })),
    );
  }

  try {
    const { comparePlannedVsActual } = await createFinancePhaseFourUseCases();
    return actionSuccess(await comparePlannedVsActual.execute(parsedInput.data));
  } catch (error) {
    return actionFailure(error);
  }
}

export async function getMonthlyDashboardAction(
  input: unknown,
): Promise<ActionResult<MonthlyDashboardDto>> {
  const parsedInput = getMonthlyDashboardSchema.safeParse(input);

  if (!parsedInput.success) {
    return actionValidationFailure(
      parsedInput.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join("."),
      })),
    );
  }

  try {
    const { getMonthlyDashboard } = await createFinancePhaseFourUseCases();
    return actionSuccess(await getMonthlyDashboard.execute(parsedInput.data));
  } catch (error) {
    return actionFailure(error);
  }
}
