import { describe, expect, it } from "vitest";

import type { AuthGateway } from "@/modules/auth/application/ports/auth-gateway";
import { RequireAuthenticatedUser } from "@/modules/auth/application/use-cases/require-authenticated-user";

import type { BucketBalancesDto } from "../dtos/bucket-balances-dto";
import type { AccountRepository, CreateAccountRecord } from "../ports/account-repository";
import type { CategoryRepository, CreateCategoryRecord } from "../ports/category-repository";
import type {
  CreateTransactionRecord,
  TransactionRepository,
} from "../ports/transaction-repository";
import { CreateImmediateExpense } from "./create-immediate-expense";
import { CreateIncomeEntry } from "./create-income-entry";
import { GetBucketBalances } from "./get-bucket-balances";
import { ListTransactionsByMonth } from "./list-transactions-by-month";
import type { Account } from "../../domain/entities/account";
import type { Category } from "../../domain/entities/category";
import type { Transaction } from "../../domain/entities/transaction";
import { FinanceDomainError } from "../../domain/errors/finance-domain-error";

const now = "2026-08-07T00:00:00.000Z";

class AuthenticatedGateway implements AuthGateway {
  async getCurrentUser() {
    return { email: "owner@example.com", id: "authenticated-user" };
  }
}

class InMemoryAccountRepository implements AccountRepository {
  readonly records: Account[] = [];

  async create(input: CreateAccountRecord): Promise<Account> {
    const account: Account = {
      ...input,
      createdAt: now,
      id: `account-${this.records.length + 1}`,
      isActive: true,
      updatedAt: now,
    };
    this.records.push(account);
    return account;
  }

  async findByIdForUser(accountId: string, userId: string): Promise<Account | null> {
    return this.records.find((account) => account.id === accountId && account.userId === userId) ?? null;
  }

  async listByUser(userId: string): Promise<Account[]> {
    return this.records.filter((account) => account.userId === userId);
  }
}

class InMemoryCategoryRepository implements CategoryRepository {
  readonly records: Category[] = [];

  async create(input: CreateCategoryRecord): Promise<Category> {
    const category: Category = {
      ...input,
      createdAt: now,
      id: `category-${this.records.length + 1}`,
      updatedAt: now,
    };
    this.records.push(category);
    return category;
  }

  async findByIdForUser(categoryId: string, userId: string): Promise<Category | null> {
    return (
      this.records.find((category) => category.id === categoryId && category.userId === userId) ??
      null
    );
  }

  async listByUser(userId: string): Promise<Category[]> {
    return this.records.filter((category) => category.userId === userId);
  }
}

class InMemoryTransactionRepository implements TransactionRepository {
  readonly records: Transaction[] = [];

  async create(input: CreateTransactionRecord): Promise<Transaction> {
    const transaction: Transaction = {
      ...input,
      accountId: input.accountId,
      affectsBalance:
        input.direction === "income" || input.expenseNature !== "credit_card",
      createdAt: now,
      id: `transaction-${this.records.length + 1}`,
    };
    this.records.push(transaction);
    return transaction;
  }

  async listBalanceAffectingByUser(userId: string): Promise<Transaction[]> {
    return this.records.filter((transaction) => transaction.userId === userId && transaction.affectsBalance);
  }

  async listByUserAndDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<Transaction[]> {
    return this.records.filter(
      (transaction) =>
        transaction.userId === userId &&
        transaction.occurredOn >= startDate &&
        transaction.occurredOn <= endDate,
    );
  }
}

function createAuthGuard() {
  return new RequireAuthenticatedUser(new AuthenticatedGateway());
}

function seedBalances(
  accountRepository: InMemoryAccountRepository,
  transactionRepository: InMemoryTransactionRepository,
) {
  accountRepository.records.push(
    {
      accountType: "checking",
      bucket: "free",
      createdAt: now,
      id: "free-account",
      initialBalanceInCents: 1_000_00,
      isActive: true,
      name: "Main",
      updatedAt: now,
      userId: "authenticated-user",
    },
    {
      accountType: "benefit",
      bucket: "meal_benefit",
      createdAt: now,
      id: "meal-account",
      initialBalanceInCents: 300_00,
      isActive: true,
      name: "Meal",
      updatedAt: now,
      userId: "authenticated-user",
    },
  );

  transactionRepository.records.push(
    {
      accountId: "free-account",
      affectsBalance: true,
      amountInCents: 200_00,
      bucket: "free",
      categoryId: null,
      createdAt: now,
      description: "Salary",
      direction: "income",
      expenseNature: null,
      id: "income-1",
      incomeSource: "salary",
      occurredOn: "2026-08-03",
      userId: "authenticated-user",
    },
    {
      accountId: "meal-account",
      affectsBalance: true,
      amountInCents: 50_00,
      bucket: "meal_benefit",
      categoryId: "category-1",
      createdAt: now,
      description: "Lunch",
      direction: "expense",
      expenseNature: "variable",
      id: "expense-1",
      incomeSource: null,
      occurredOn: "2026-08-04",
      userId: "authenticated-user",
    },
    {
      accountId: "free-account",
      affectsBalance: false,
      amountInCents: 90_00,
      bucket: "free",
      categoryId: "category-2",
      createdAt: now,
      description: "Credit purchase",
      direction: "expense",
      expenseNature: "credit_card",
      id: "expense-2",
      incomeSource: null,
      occurredOn: "2026-08-05",
      userId: "authenticated-user",
    },
  );
}

describe("phase two create-income-entry", () => {
  it("creates an immediate income using the selected account bucket", async () => {
    const accountRepository = new InMemoryAccountRepository();
    const transactionRepository = new InMemoryTransactionRepository();

    accountRepository.records.push({
      accountType: "benefit",
      bucket: "meal_benefit",
      createdAt: now,
      id: "meal-account",
      initialBalanceInCents: 0,
      isActive: true,
      name: "Meal",
      updatedAt: now,
      userId: "authenticated-user",
    });

    const transaction = await new CreateIncomeEntry(
      accountRepository,
      transactionRepository,
      createAuthGuard(),
    ).execute({
      accountId: "meal-account",
      amountInCents: 800_00,
      description: "  VR de agosto  ",
      incomeSource: "vr",
      occurredOn: "2026-08-07",
    });

    expect(transaction).toMatchObject({
      bucket: "meal_benefit",
      description: "VR de agosto",
      direction: "income",
      incomeSource: "vr",
    });
  });

  it("rejects an income source that does not match the selected account bucket", async () => {
    const accountRepository = new InMemoryAccountRepository();

    accountRepository.records.push({
      accountType: "checking",
      bucket: "free",
      createdAt: now,
      id: "free-account",
      initialBalanceInCents: 0,
      isActive: true,
      name: "Main",
      updatedAt: now,
      userId: "authenticated-user",
    });

    await expect(
      new CreateIncomeEntry(
        accountRepository,
        new InMemoryTransactionRepository(),
        createAuthGuard(),
      ).execute({
        accountId: "free-account",
        amountInCents: 800_00,
        description: null,
        incomeSource: "vr",
        occurredOn: "2026-08-07",
      }),
    ).rejects.toBeInstanceOf(FinanceDomainError);
  });
});

describe("phase two create-immediate-expense", () => {
  it("creates an immediate expense using the selected account bucket and category nature", async () => {
    const accountRepository = new InMemoryAccountRepository();
    const categoryRepository = new InMemoryCategoryRepository();
    const transactionRepository = new InMemoryTransactionRepository();

    accountRepository.records.push({
      accountType: "benefit",
      bucket: "meal_benefit",
      createdAt: now,
      id: "meal-account",
      initialBalanceInCents: 0,
      isActive: true,
      name: "Meal",
      updatedAt: now,
      userId: "authenticated-user",
    });

    categoryRepository.records.push({
      color: null,
      createdAt: now,
      expenseNature: "variable",
      id: "groceries",
      kind: "expense",
      name: "Groceries",
      updatedAt: now,
      userId: "authenticated-user",
    });

    const transaction = await new CreateImmediateExpense(
      accountRepository,
      categoryRepository,
      transactionRepository,
      createAuthGuard(),
    ).execute({
      accountId: "meal-account",
      amountInCents: 25_00,
      categoryId: "groceries",
      description: "  Almoço  ",
      occurredOn: "2026-08-07",
    });

    expect(transaction).toMatchObject({
      bucket: "meal_benefit",
      categoryId: "groceries",
      description: "Almoço",
      direction: "expense",
      expenseNature: "variable",
      incomeSource: null,
    });
  });

  it("rejects credit-card expense categories in the immediate flow", async () => {
    const accountRepository = new InMemoryAccountRepository();
    const categoryRepository = new InMemoryCategoryRepository();

    accountRepository.records.push({
      accountType: "checking",
      bucket: "free",
      createdAt: now,
      id: "free-account",
      initialBalanceInCents: 0,
      isActive: true,
      name: "Main",
      updatedAt: now,
      userId: "authenticated-user",
    });

    categoryRepository.records.push({
      color: null,
      createdAt: now,
      expenseNature: "credit_card",
      id: "credit-card",
      kind: "expense",
      name: "Card",
      updatedAt: now,
      userId: "authenticated-user",
    });

    await expect(
      new CreateImmediateExpense(
        accountRepository,
        categoryRepository,
        new InMemoryTransactionRepository(),
        createAuthGuard(),
      ).execute({
        accountId: "free-account",
        amountInCents: 25_00,
        categoryId: "credit-card",
        description: null,
        occurredOn: "2026-08-07",
      }),
    ).rejects.toBeInstanceOf(FinanceDomainError);
  });
});

describe("phase two reads", () => {
  it("lists only transactions from the requested month", async () => {
    const transactionRepository = new InMemoryTransactionRepository();
    transactionRepository.records.push(
      {
        accountId: "free-account",
        affectsBalance: true,
        amountInCents: 10_00,
        bucket: "free",
        categoryId: null,
        createdAt: now,
        description: null,
        direction: "income",
        expenseNature: null,
        id: "august",
        incomeSource: "salary",
        occurredOn: "2026-08-02",
        userId: "authenticated-user",
      },
      {
        accountId: "free-account",
        affectsBalance: true,
        amountInCents: 10_00,
        bucket: "free",
        categoryId: null,
        createdAt: now,
        description: null,
        direction: "income",
        expenseNature: null,
        id: "july",
        incomeSource: "salary",
        occurredOn: "2026-07-30",
        userId: "authenticated-user",
      },
    );

    const transactions = await new ListTransactionsByMonth(
      transactionRepository,
      createAuthGuard(),
    ).execute({
      yearMonth: "2026-08",
    });

    expect(transactions.map((transaction) => transaction.id)).toEqual(["august"]);
  });

  it("calculates bucket balances from initial account balances and balance-affecting transactions", async () => {
    const accountRepository = new InMemoryAccountRepository();
    const transactionRepository = new InMemoryTransactionRepository();
    seedBalances(accountRepository, transactionRepository);

    const balances: BucketBalancesDto = await new GetBucketBalances(
      accountRepository,
      transactionRepository,
      createAuthGuard(),
    ).execute();

    expect(balances).toEqual({
      freeBalanceInCents: 1_200_00,
      mealBenefitBalanceInCents: 250_00,
      transportBenefitBalanceInCents: 0,
    });
  });
});
