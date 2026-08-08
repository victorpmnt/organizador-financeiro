"use server";

import type { AvailableBalancesDto } from "@/modules/finance/application/dtos/available-balances-dto";
import type { CommittedBalancesDto } from "@/modules/finance/application/dtos/committed-balances-dto";
import type { CommitmentMutationResult } from "@/modules/finance/application/ports/commitment-repository";
import type { Commitment } from "@/modules/finance/domain/entities/commitment";
import { createCreditCardPurchaseSchema } from "@/modules/finance/interface/schemas/create-credit-card-purchase-schema";
import { payCommitmentSchema } from "@/modules/finance/interface/schemas/pay-commitment-schema";

import { createFinancePhaseThreeUseCases } from "../_composition/finance-phase-three";
import {
  actionFailure,
  actionSuccess,
  actionValidationFailure,
  type ActionResult,
} from "./action-result";

export async function createCreditCardPurchaseAction(
  input: unknown,
): Promise<ActionResult<CommitmentMutationResult>> {
  const parsedInput = createCreditCardPurchaseSchema.safeParse(input);

  if (!parsedInput.success) {
    return actionValidationFailure(
      parsedInput.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join("."),
      })),
    );
  }

  try {
    const { createCreditCardPurchase } = await createFinancePhaseThreeUseCases();
    return actionSuccess(await createCreditCardPurchase.execute(parsedInput.data));
  } catch (error) {
    return actionFailure(error);
  }
}

export async function listOpenCommitmentsAction(): Promise<ActionResult<Commitment[]>> {
  try {
    const { listOpenCommitments } = await createFinancePhaseThreeUseCases();
    return actionSuccess(await listOpenCommitments.execute());
  } catch (error) {
    return actionFailure(error);
  }
}

export async function payCommitmentAction(
  input: unknown,
): Promise<ActionResult<CommitmentMutationResult>> {
  const parsedInput = payCommitmentSchema.safeParse(input);

  if (!parsedInput.success) {
    return actionValidationFailure(
      parsedInput.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join("."),
      })),
    );
  }

  try {
    const { payCommitment } = await createFinancePhaseThreeUseCases();
    return actionSuccess(await payCommitment.execute(parsedInput.data));
  } catch (error) {
    return actionFailure(error);
  }
}

export async function getCommittedBalancesAction(): Promise<ActionResult<CommittedBalancesDto>> {
  try {
    const { getCommittedBalances } = await createFinancePhaseThreeUseCases();
    return actionSuccess(await getCommittedBalances.execute());
  } catch (error) {
    return actionFailure(error);
  }
}

export async function getAvailableBalancesAction(): Promise<ActionResult<AvailableBalancesDto>> {
  try {
    const { getAvailableBalances } = await createFinancePhaseThreeUseCases();
    return actionSuccess(await getAvailableBalances.execute());
  } catch (error) {
    return actionFailure(error);
  }
}

export async function calculateSafeCreditLimitAction(): Promise<ActionResult<number>> {
  try {
    const { calculateSafeCreditLimit } = await createFinancePhaseThreeUseCases();
    return actionSuccess(await calculateSafeCreditLimit.execute());
  } catch (error) {
    return actionFailure(error);
  }
}
