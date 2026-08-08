import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthenticationRequiredError } from "@/modules/auth";
import { FinancePersistenceError } from "@/modules/finance/application/errors/finance-persistence-error";
import { FinanceDomainError } from "@/modules/finance/domain/errors/finance-domain-error";

const mocks = vi.hoisted(() => ({
  comparePlannedVsActual: vi.fn(),
  getMonthlyDashboard: vi.fn(),
  listAccounts: vi.fn(),
  listCategories: vi.fn(),
  listMonthlyPlan: vi.fn(),
  listOpenCommitments: vi.fn(),
  listTransactionsByMonth: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("../_composition/finance-phase-one", () => ({
  createFinancePhaseOneUseCases: vi.fn(async () => ({
    listAccounts: { execute: mocks.listAccounts },
    listCategories: { execute: mocks.listCategories },
  })),
}));

vi.mock("../_composition/finance-phase-two", () => ({
  createFinancePhaseTwoUseCases: vi.fn(async () => ({
    listTransactionsByMonth: { execute: mocks.listTransactionsByMonth },
  })),
}));

vi.mock("../_composition/finance-phase-three", () => ({
  createFinancePhaseThreeUseCases: vi.fn(async () => ({
    listOpenCommitments: { execute: mocks.listOpenCommitments },
  })),
}));

vi.mock("../_composition/finance-phase-four", () => ({
  createFinancePhaseFourUseCases: vi.fn(async () => ({
    comparePlannedVsActual: { execute: mocks.comparePlannedVsActual },
    getMonthlyDashboard: { execute: mocks.getMonthlyDashboard },
    listMonthlyPlan: { execute: mocks.listMonthlyPlan },
  })),
}));

import {
  loadAccounts,
  loadCategories,
  loadMonthlyDashboard,
  loadTransactionsByMonth,
} from "./finance";

describe("finance loaders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a successful serializable dashboard DTO", async () => {
    const dashboard = {
      committedInCents: 20_00,
      consumedExpenseInCents: 100_00,
      creditCards: [],
      freeAvailableInCents: 780_00,
      freeBalanceInCents: 800_00,
      freeCommittedInCents: 20_00,
      insights: {
        commitmentsDueNext30DaysInCents: 20_00,
        highestSingleExpenseAmountInCents: 100_00,
        highestSingleExpenseDescription: "Market",
        netCashFlowInCents: 800_00,
        overdueCommitmentsInCents: 0,
        primaryAccountType: "debit" as const,
        topExpenseCategoryAmountInCents: 100_00,
        topExpenseCategoryName: "Food",
        topExpenseCategorySharePercentage: 100,
      },
      mealBenefitAvailableInCents: 0,
      mealBenefitBalanceInCents: 0,
      mealBenefitCommittedInCents: 0,
      minimumFreeReserveInCents: 0,
      plannedExpenseInCents: 100_00,
      plannedIncomeInCents: 1_000_00,
      receivedIncomeInCents: 1_000_00,
      safeCreditLimitInCents: 780_00,
      transportBenefitAvailableInCents: 0,
      transportBenefitBalanceInCents: 0,
      transportBenefitCommittedInCents: 0,
      yearMonth: "2026-08",
    };
    mocks.getMonthlyDashboard.mockResolvedValue(dashboard);

    const result = await loadMonthlyDashboard("2026-08");

    expect(result).toEqual({ data: dashboard, ok: true });
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it("preserves unauthenticated errors without exposing the thrown error", async () => {
    mocks.listAccounts.mockRejectedValue(new AuthenticationRequiredError());

    await expect(loadAccounts()).resolves.toEqual({
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication is required.",
      },
      ok: false,
    });
  });

  it("preserves known domain validation errors", async () => {
    mocks.listCategories.mockRejectedValue(new FinanceDomainError("Invalid category."));

    await expect(loadCategories()).resolves.toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid category.",
      },
      ok: false,
    });
  });

  it("rejects an invalid month before composing a use case", async () => {
    const result = await loadMonthlyDashboard("2026-13");

    expect(result).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        issues: [{ path: "yearMonth" }],
      },
      ok: false,
    });
    expect(mocks.getMonthlyDashboard).not.toHaveBeenCalled();
  });

  it("does not expose persistence or database details", async () => {
    mocks.getMonthlyDashboard.mockRejectedValue(
      new FinancePersistenceError(
        "relation public.transactions does not exist in Supabase",
        "42P01",
      ),
    );

    const result = await loadMonthlyDashboard("2026-08");
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      error: {
        code: "INTERNAL_ERROR",
        message: "Unable to complete the operation.",
      },
      ok: false,
    });
    expect(serializedResult).not.toContain("transactions");
    expect(serializedResult).not.toContain("Supabase");
    expect(serializedResult).not.toContain("42P01");
  });

  it("passes only the validated month and never a client-provided userId", async () => {
    mocks.listTransactionsByMonth.mockResolvedValue([]);

    await loadTransactionsByMonth("2026-08");

    expect(mocks.listTransactionsByMonth).toHaveBeenCalledWith({
      yearMonth: "2026-08",
    });
    expect(mocks.listTransactionsByMonth.mock.calls[0]?.[0]).not.toHaveProperty("userId");
  });
});
