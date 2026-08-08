import { AuthenticationRequiredError } from "@/modules/auth";
import { FinancePersistenceError } from "@/modules/finance/application/errors/finance-persistence-error";
import { FinanceDomainError } from "@/modules/finance/domain/errors/finance-domain-error";

export interface ActionIssue {
  message: string;
  path: string;
}

export type ActionResult<T> =
  | { data: T; ok: true }
  | {
      error: {
        code: "CONFLICT" | "INTERNAL_ERROR" | "UNAUTHENTICATED" | "VALIDATION_ERROR";
        issues?: ActionIssue[];
        message: string;
      };
      ok: false;
    };

export function actionSuccess<T>(data: T): ActionResult<T> {
  return { data, ok: true };
}

export function actionValidationFailure(issues: ActionIssue[]): ActionResult<never> {
  return {
    error: {
      code: "VALIDATION_ERROR",
      issues,
      message: "Invalid input.",
    },
    ok: false,
  };
}

export function actionFailure(error: unknown): ActionResult<never> {
  if (error instanceof AuthenticationRequiredError) {
    return {
      error: { code: "UNAUTHENTICATED", message: "Authentication is required." },
      ok: false,
    };
  }

  if (error instanceof FinanceDomainError) {
    return {
      error: { code: "VALIDATION_ERROR", message: error.message },
      ok: false,
    };
  }

  if (error instanceof FinancePersistenceError && error.databaseCode === "23505") {
    return {
      error: { code: "CONFLICT", message: "A record with the same name already exists." },
      ok: false,
    };
  }

  return {
    error: { code: "INTERNAL_ERROR", message: "Unable to complete the operation." },
    ok: false,
  };
}

