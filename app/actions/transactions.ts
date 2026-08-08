"use server";

import type { BucketBalancesDto } from "@/modules/finance/application/dtos/bucket-balances-dto";
import type { Transaction } from "@/modules/finance/domain/entities/transaction";
import { createImmediateExpenseSchema } from "@/modules/finance/interface/schemas/create-immediate-expense-schema";
import { createIncomeEntrySchema } from "@/modules/finance/interface/schemas/create-income-entry-schema";
import { listTransactionsByMonthSchema } from "@/modules/finance/interface/schemas/list-transactions-by-month-schema";

import { createFinancePhaseTwoUseCases } from "../_composition/finance-phase-two";
import {
  actionFailure,
  actionSuccess,
  actionValidationFailure,
  type ActionResult,
} from "./action-result";
import { revalidateTransactionViews } from "./revalidation";

export async function createIncomeEntryAction(
  input: unknown,
): Promise<ActionResult<Transaction>> {
  const parsedInput = createIncomeEntrySchema.safeParse(input);

  if (!parsedInput.success) {
    return actionValidationFailure(
      parsedInput.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join("."),
      })),
    );
  }

  try {
    const { createIncomeEntry } = await createFinancePhaseTwoUseCases();
    const transaction = await createIncomeEntry.execute(parsedInput.data);
    revalidateTransactionViews();
    return actionSuccess(transaction);
  } catch (error) {
    return actionFailure(error);
  }
}

export async function createImmediateExpenseAction(
  input: unknown,
): Promise<ActionResult<Transaction>> {
  const parsedInput = createImmediateExpenseSchema.safeParse(input);

  if (!parsedInput.success) {
    return actionValidationFailure(
      parsedInput.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join("."),
      })),
    );
  }

  try {
    const { createImmediateExpense } = await createFinancePhaseTwoUseCases();
    const transaction = await createImmediateExpense.execute(parsedInput.data);
    revalidateTransactionViews();
    return actionSuccess(transaction);
  } catch (error) {
    return actionFailure(error);
  }
}

export async function listTransactionsByMonthAction(
  input: unknown,
): Promise<ActionResult<Transaction[]>> {
  const parsedInput = listTransactionsByMonthSchema.safeParse(input);

  if (!parsedInput.success) {
    return actionValidationFailure(
      parsedInput.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join("."),
      })),
    );
  }

  try {
    const { listTransactionsByMonth } = await createFinancePhaseTwoUseCases();
    return actionSuccess(await listTransactionsByMonth.execute(parsedInput.data));
  } catch (error) {
    return actionFailure(error);
  }
}

export async function getBucketBalancesAction(): Promise<ActionResult<BucketBalancesDto>> {
  try {
    const { getBucketBalances } = await createFinancePhaseTwoUseCases();
    return actionSuccess(await getBucketBalances.execute());
  } catch (error) {
    return actionFailure(error);
  }
}
