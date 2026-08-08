import { describe, expect, it } from "vitest";

import type { AuthGateway } from "@/modules/auth/application/ports/auth-gateway";
import { RequireAuthenticatedUser } from "@/modules/auth/application/use-cases/require-authenticated-user";

import type { Account } from "../../domain/entities/account";
import type { Category } from "../../domain/entities/category";
import { FinanceDomainError } from "../../domain/errors/finance-domain-error";
import type { AccountRepository, CreateAccountRecord } from "../ports/account-repository";
import type { CategoryRepository, CreateCategoryRecord } from "../ports/category-repository";
import { CreateAccount } from "./create-account";
import { CreateCategory } from "./create-category";
import { ListAccounts } from "./list-accounts";
import { ListCategories } from "./list-categories";

const now = "2026-08-06T00:00:00.000Z";

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

function createAuthGuard() {
  return new RequireAuthenticatedUser(new AuthenticatedGateway());
}

describe("phase one account use cases", () => {
  it("creates an account owned by the authenticated user", async () => {
    const repository = new InMemoryAccountRepository();
    const useCase = new CreateAccount(repository, createAuthGuard());

    const account = await useCase.execute({
      accountType: "debit",
      bucket: "free",
      creditLimitInCents: null,
      initialBalanceInCents: 150_00,
      name: "  Main account  ",
      statementDueDay: null,
    });

    expect(account).toMatchObject({ name: "Main account", userId: "authenticated-user" });
  });

  it("rejects a non-benefit account using a restricted bucket", async () => {
    const useCase = new CreateAccount(new InMemoryAccountRepository(), createAuthGuard());

    await expect(
      useCase.execute({
        accountType: "debit",
        bucket: "meal_benefit",
        creditLimitInCents: null,
        initialBalanceInCents: 0,
        name: "Invalid",
        statementDueDay: null,
      }),
    ).rejects.toBeInstanceOf(FinanceDomainError);
  });

  it("lists only records owned by the authenticated user", async () => {
    const repository = new InMemoryAccountRepository();
    repository.records.push(
      {
        accountType: "debit",
        bucket: "free",
        creditLimitInCents: null,
        createdAt: now,
        id: "mine",
        initialBalanceInCents: 0,
        isActive: true,
        name: "Mine",
        statementDueDay: null,
        updatedAt: now,
        userId: "authenticated-user",
      },
      {
        accountType: "debit",
        bucket: "free",
        creditLimitInCents: null,
        createdAt: now,
        id: "other",
        initialBalanceInCents: 0,
        isActive: true,
        name: "Other",
        statementDueDay: null,
        updatedAt: now,
        userId: "another-user",
      },
    );

    const accounts = await new ListAccounts(repository, createAuthGuard()).execute();

    expect(accounts.map((account) => account.id)).toEqual(["mine"]);
  });
});

describe("phase one category use cases", () => {
  it("creates an expense category with its nature", async () => {
    const repository = new InMemoryCategoryRepository();
    const useCase = new CreateCategory(repository, createAuthGuard());

    const category = await useCase.execute({
      color: " #ffcc00 ",
      expenseNature: "variable",
      kind: "expense",
      name: "  Groceries ",
    });

    expect(category).toMatchObject({
      color: "#ffcc00",
      expenseNature: "variable",
      name: "Groceries",
      userId: "authenticated-user",
    });
  });

  it("rejects expense categories without an expense nature", async () => {
    const useCase = new CreateCategory(new InMemoryCategoryRepository(), createAuthGuard());

    await expect(useCase.execute({ kind: "expense", name: "Invalid" })).rejects.toBeInstanceOf(
      FinanceDomainError,
    );
  });

  it("lists only records owned by the authenticated user", async () => {
    const repository = new InMemoryCategoryRepository();
    repository.records.push(
      {
        color: null,
        createdAt: now,
        expenseNature: null,
        id: "mine",
        kind: "income",
        name: "Salary",
        updatedAt: now,
        userId: "authenticated-user",
      },
      {
        color: null,
        createdAt: now,
        expenseNature: null,
        id: "other",
        kind: "income",
        name: "Other",
        updatedAt: now,
        userId: "another-user",
      },
    );

    const categories = await new ListCategories(repository, createAuthGuard()).execute();

    expect(categories.map((category) => category.id)).toEqual(["mine"]);
  });
});
