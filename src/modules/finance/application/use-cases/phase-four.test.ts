import { describe, expect, it } from "vitest";

import type { AuthGateway } from "@/modules/auth/application/ports/auth-gateway";
import { RequireAuthenticatedUser } from "@/modules/auth/application/use-cases/require-authenticated-user";

import type { CategoryRepository } from "../ports/category-repository";
import { ComparePlannedVsActual } from "./compare-planned-vs-actual";
import { GetMonthlyDashboard } from "./get-monthly-dashboard";
import { ListMonthlyPlan } from "./list-monthly-plan";
import { UpsertMonthlyPlan } from "./upsert-monthly-plan";
import { InMemoryFinanceRepository } from "../../infrastructure/repositories/in-memory-finance-repository";
import type { Category } from "../../domain/entities/category";
import type { Commitment } from "../../domain/entities/commitment";
import { FinanceDomainError } from "../../domain/errors/finance-domain-error";

const now = "2026-08-08T00:00:00.000Z";

class AuthenticatedGateway implements AuthGateway {
  async getCurrentUser() {
    return { email: "owner@example.com", id: "authenticated-user" };
  }
}

class InMemoryCategoryRepository implements CategoryRepository {
  constructor(private readonly categories: Category[]) {}

  async create(): Promise<Category> {
    throw new Error("Not implemented in this test.");
  }

  async findByIdForUser(categoryId: string, userId: string): Promise<Category | null> {
    return this.categories.find((category) => category.id === categoryId && category.userId === userId) ?? null;
  }

  async listByUser(userId: string): Promise<Category[]> {
    return this.categories.filter((category) => category.userId === userId);
  }
}

function createAuthGuard() {
  return new RequireAuthenticatedUser(new AuthenticatedGateway());
}

function seedFinanceRepository() {
  const financeRepository = new InMemoryFinanceRepository();

  financeRepository.accounts.push(
    {
      accountType: "debit",
      bucket: "free",
      creditLimitInCents: null,
      createdAt: now,
      id: "debit-account",
      initialBalanceInCents: 1_000_00,
      isActive: true,
      name: "Main",
      statementDueDay: null,
      updatedAt: now,
      userId: "authenticated-user",
    },
    {
      accountType: "credit",
      bucket: "free",
      creditLimitInCents: 2_000_00,
      createdAt: now,
      id: "credit-account",
      initialBalanceInCents: 0,
      isActive: true,
      name: "Card",
      statementDueDay: 10,
      updatedAt: now,
      userId: "authenticated-user",
    },
  );

  financeRepository.categories.push(
    {
      color: null,
      createdAt: now,
      expenseNature: "variable",
      id: "groceries",
      kind: "expense",
      name: "Groceries",
      updatedAt: now,
      userId: "authenticated-user",
    },
    {
      color: null,
      createdAt: now,
      expenseNature: "credit_card",
      id: "subscriptions",
      kind: "expense",
      name: "Subscriptions",
      updatedAt: now,
      userId: "authenticated-user",
    },
  );

  financeRepository.transactions.push(
    {
      accountId: "debit-account",
      affectsBalance: true,
      amountInCents: 3_260_00,
      bucket: "free",
      categoryId: null,
      createdAt: now,
      description: "Salary",
      direction: "income",
      expenseNature: null,
      id: "salary-august",
      incomeSource: "salary",
      occurredOn: "2026-08-05",
      userId: "authenticated-user",
    },
    {
      accountId: "debit-account",
      affectsBalance: true,
      amountInCents: 180_00,
      bucket: "free",
      categoryId: "groceries",
      createdAt: now,
      description: "Market",
      direction: "expense",
      expenseNature: "variable",
      id: "expense-1",
      incomeSource: null,
      occurredOn: "2026-08-06",
      userId: "authenticated-user",
    },
    {
      accountId: "credit-account",
      affectsBalance: false,
      amountInCents: 120_00,
      bucket: "free",
      categoryId: "subscriptions",
      createdAt: now,
      description: "Streaming",
      direction: "expense",
      expenseNature: "credit_card",
      id: "credit-purchase",
      incomeSource: null,
      occurredOn: "2026-08-07",
      userId: "authenticated-user",
    },
    {
      accountId: "debit-account",
      affectsBalance: true,
      amountInCents: 120_00,
      bucket: "free",
      categoryId: null,
      createdAt: now,
      description: "Invoice payment",
      direction: "expense",
      expenseNature: "fixed",
      id: "invoice-payment",
      incomeSource: null,
      occurredOn: "2026-08-08",
      userId: "authenticated-user",
    },
  );

  financeRepository.commitments.push({
    accountId: "credit-account",
    amountInCents: 120_00,
    bucket: "free",
    categoryId: "subscriptions",
    createdAt: now,
    description: "Streaming",
    dueOn: "2026-08-10",
    id: "commitment-open",
    installmentCount: 1,
    installmentNumber: 1,
    logicalGroupId: "group-1",
    settlementTransactionId: null,
    settledAt: null,
    sourceTransactionId: "credit-purchase",
    type: "credit_card_bill",
    userId: "authenticated-user",
  });

  const settledCommitment: Commitment = {
    accountId: "credit-account",
    amountInCents: 120_00,
    bucket: "free",
    categoryId: "subscriptions",
    createdAt: now,
    description: "Streaming paid",
    dueOn: "2026-07-10",
    id: "commitment-paid",
    installmentCount: 1,
    installmentNumber: 1,
    logicalGroupId: "group-2",
    settlementTransactionId: "invoice-payment",
    settledAt: now,
    sourceTransactionId: "credit-purchase-july",
    type: "credit_card_bill",
    userId: "authenticated-user",
  };
  financeRepository.commitments.push(settledCommitment);

  return financeRepository;
}

describe("phase four monthly planning", () => {
  it("upserts the monthly snapshot and reloads it for the selected month", async () => {
    const financeRepository = seedFinanceRepository();
    const categoryRepository = new InMemoryCategoryRepository(financeRepository.categories);

    await new UpsertMonthlyPlan(
      categoryRepository,
      financeRepository,
      createAuthGuard(),
    ).execute({
      items: [
        {
          amountInCents: 3_300_00,
          bucket: "free",
          categoryId: null,
          description: "Salary forecast",
          expectedOn: "2026-08-05",
          incomeSource: "salary",
          kind: "income",
        },
        {
          amountInCents: 200_00,
          bucket: "free",
          categoryId: "groceries",
          description: "Food",
          expectedOn: "2026-08-06",
          incomeSource: null,
          kind: "expense",
        },
      ],
      minimumFreeReserveInCents: 500_00,
      notes: "  August plan  ",
      yearMonth: "2026-08",
    });

    const loadedPlan = await new ListMonthlyPlan(financeRepository, createAuthGuard()).execute({
      yearMonth: "2026-08",
    });

    expect(loadedPlan.plan?.minimumFreeReserveInCents).toBe(500_00);
    expect(loadedPlan.plan?.notes).toBe("August plan");
    expect(loadedPlan.items).toHaveLength(2);
  });

  it("rejects expense planning without a valid expense category", async () => {
    const financeRepository = seedFinanceRepository();
    const categoryRepository = new InMemoryCategoryRepository(financeRepository.categories);

    await expect(
      new UpsertMonthlyPlan(
        categoryRepository,
        financeRepository,
        createAuthGuard(),
      ).execute({
        items: [
          {
            amountInCents: 100_00,
            bucket: "free",
            categoryId: null,
            description: null,
            expectedOn: "2026-08-06",
            incomeSource: null,
            kind: "expense",
          },
        ],
        minimumFreeReserveInCents: 0,
        notes: null,
        yearMonth: "2026-08",
      }),
    ).rejects.toBeInstanceOf(FinanceDomainError);
  });
});

describe("phase four comparison and dashboard", () => {
  it("compares planned and actual values without double counting invoice payments as consumption", async () => {
    const financeRepository = seedFinanceRepository();
    const categoryRepository = new InMemoryCategoryRepository(financeRepository.categories);

    await new UpsertMonthlyPlan(
      categoryRepository,
      financeRepository,
      createAuthGuard(),
    ).execute({
      items: [
        {
          amountInCents: 3_300_00,
          bucket: "free",
          categoryId: null,
          description: "Salary forecast",
          expectedOn: "2026-08-05",
          incomeSource: "salary",
          kind: "income",
        },
        {
          amountInCents: 150_00,
          bucket: "free",
          categoryId: "groceries",
          description: "Food",
          expectedOn: "2026-08-06",
          incomeSource: null,
          kind: "expense",
        },
        {
          amountInCents: 100_00,
          bucket: "free",
          categoryId: "subscriptions",
          description: "Streaming",
          expectedOn: "2026-08-07",
          incomeSource: null,
          kind: "expense",
        },
      ],
      minimumFreeReserveInCents: 500_00,
      notes: null,
      yearMonth: "2026-08",
    });

    const comparison = await new ComparePlannedVsActual(
      financeRepository,
      createAuthGuard(),
    ).execute({
      yearMonth: "2026-08",
    });

    expect(comparison).toMatchObject({
      consumedExpenseInCents: 300_00,
      plannedExpenseInCents: 250_00,
      plannedIncomeInCents: 3_300_00,
      receivedIncomeInCents: 3_260_00,
    });
    expect(comparison.expenseItems.find((item) => item.categoryId === "subscriptions")?.actualInCents).toBe(120_00);
  });

  it("builds the monthly dashboard with balances, commitments, safe limit and insights", async () => {
    const financeRepository = seedFinanceRepository();
    const categoryRepository = new InMemoryCategoryRepository(financeRepository.categories);

    await new UpsertMonthlyPlan(
      categoryRepository,
      financeRepository,
      createAuthGuard(),
    ).execute({
      items: [
        {
          amountInCents: 3_300_00,
          bucket: "free",
          categoryId: null,
          description: null,
          expectedOn: "2026-08-05",
          incomeSource: "salary",
          kind: "income",
        },
      ],
      minimumFreeReserveInCents: 500_00,
      notes: null,
      yearMonth: "2026-08",
    });

    const dashboard = await new GetMonthlyDashboard(
      financeRepository,
      createAuthGuard(),
    ).execute({
      yearMonth: "2026-08",
    });

    expect(dashboard).toMatchObject({
      committedInCents: 120_00,
      freeAvailableInCents: 3_840_00,
      freeBalanceInCents: 3_960_00,
      minimumFreeReserveInCents: 500_00,
      safeCreditLimitInCents: 3_340_00,
    });
    expect(dashboard.creditCards[0]).toMatchObject({
      availableLimitInCents: 1_880_00,
      committedInCents: 120_00,
      creditLimitInCents: 2_000_00,
    });
    expect(dashboard.insights).toMatchObject({
      netCashFlowInCents: 2_960_00,
      primaryAccountType: "debit",
      topExpenseCategoryAmountInCents: 180_00,
      topExpenseCategoryName: "Groceries",
    });
  });
});
