"use server";

import type { Account } from "@/modules/finance/domain/entities/account";
import { createAccountSchema } from "@/modules/finance/interface/schemas/create-account-schema";

import { createFinancePhaseOneUseCases } from "../_composition/finance-phase-one";
import {
  actionFailure,
  actionSuccess,
  actionValidationFailure,
  type ActionResult,
} from "./action-result";

export async function createAccountAction(input: unknown): Promise<ActionResult<Account>> {
  const parsedInput = createAccountSchema.safeParse(input);

  if (!parsedInput.success) {
    return actionValidationFailure(
      parsedInput.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join("."),
      })),
    );
  }

  try {
    const { createAccount } = await createFinancePhaseOneUseCases();
    return actionSuccess(await createAccount.execute(parsedInput.data));
  } catch (error) {
    return actionFailure(error);
  }
}

export async function listAccountsAction(): Promise<ActionResult<Account[]>> {
  try {
    const { listAccounts } = await createFinancePhaseOneUseCases();
    return actionSuccess(await listAccounts.execute());
  } catch (error) {
    return actionFailure(error);
  }
}

