import { describe, expect, it } from "vitest";

import type { AuthGateway } from "@/modules/auth/application/ports/auth-gateway";
import { RequireAuthenticatedUser } from "@/modules/auth/application/use-cases/require-authenticated-user";

import type { AvailableBalancesDto } from "../dtos/available-balances-dto";
import type { CommittedBalancesDto } from "../dtos/committed-balances-dto";
import type { AccountRepository, CreateAccountRecord } from "../ports/account-repository";
import type { CategoryRepository, CreateCategoryRecord } from "../ports/category-repository";
import type {
  CommitmentMutationResult,
  CommitmentRepository,
  CreateCreditCardPurchaseRecord,
  PayCommitmentsRecord,
} from "../ports/commitment-repository";
import type {
  CreateTransactionRecord,
  TransactionRepository,
} from "../ports/transaction-repository";
import { CalculateSafeCreditLimit } from "./calculate-safe-credit-limit";
import { CreateCreditCardPurchase } from "./create-credit-card-purchase";
import { GetAvailableBalances } from "./get-available-balances";
import { GetCommittedBalances } from "./get-committed-balances";
import { ListOpenCommitments } from "./list-open-commitments";
import { PayCommitment } from "./pay-commitment";
import type { Account } from "../../domain/entities/account";
import type { Category } from "../../domain/entities/category";
import type { Commitment } from "../../domain/entities/commitment";
import type { Transaction } from "../../domain/entities/transaction";
import { FinanceDomainError } from "../../domain/errors/finance-domain-error";

const now = "2026-08-08T00:00:00.000Z";

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
    return this.records.find((category) => category.id === categoryId && category.userId === userId) ?? null;
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

class InMemoryCommitmentRepository implements CommitmentRepository {
  readonly records: Commitment[] = [];

  constructor(private readonly transactionRepository: InMemoryTransactionRepository) {}

  async createCreditCardPurchase(
    input: CreateCreditCardPurchaseRecord,
  ): Promise<CommitmentMutationResult> {
    const transaction: Transaction = {
      accountId: input.accountId,
      affectsBalance: false,
      amountInCents: input.amountInCents,
      bucket: "free",
      categoryId: input.categoryId,
      createdAt: now,
      description: input.description,
      direction: "expense",
      expenseNature: "credit_card",
      id: `transaction-${this.transactionRepository.records.length + 1}`,
      incomeSource: null,
      occurredOn: input.occurredOn,
      userId: "authenticated-user",
    };
    this.transactionRepository.records.push(transaction);

    const baseAmount = Math.floor(input.amountInCents / input.installmentCount);
    const remainder = input.amountInCents % input.installmentCount;
    const logicalGroupId = `group-${this.records.length + 1}`;
    const commitments = Array.from({ length: input.installmentCount }, (_, index) => {
      const installmentNumber = index + 1;
      const dueMonth = 8 + index;
      const dueOn = `2026-${String(dueMonth).padStart(2, "0")}-10`;

      const commitment: Commitment = {
        accountId: input.accountId,
        amountInCents: baseAmount + (installmentNumber <= remainder ? 1 : 0),
        bucket: "free",
        categoryId: input.categoryId,
        createdAt: now,
        description: input.description,
        dueOn,
        id: `commitment-${this.records.length + installmentNumber}`,
        installmentCount: input.installmentCount,
        installmentNumber,
        logicalGroupId,
        settlementTransactionId: null,
        settledAt: null,
        sourceTransactionId: transaction.id,
        type: input.installmentCount === 1 ? "credit_card_bill" : "installment",
        userId: "authenticated-user",
      };

      return commitment;
    });

    this.records.push(...commitments);

    return { commitments, transaction };
  }

  async listOpenByUser(userId: string): Promise<Commitment[]> {
    return this.records
      .filter((commitment) => commitment.userId === userId && commitment.settledAt === null)
      .sort((left, right) => left.dueOn.localeCompare(right.dueOn));
  }

  async payCommitments(input: PayCommitmentsRecord): Promise<CommitmentMutationResult> {
    const selectedCommitments = this.records.filter(
      (commitment) =>
        input.commitmentIds.includes(commitment.id) &&
        commitment.userId === "authenticated-user" &&
        commitment.settledAt === null,
    );

    const transaction: Transaction = {
      accountId: input.payingAccountId,
      affectsBalance: true,
      amountInCents: selectedCommitments.reduce(
        (sum, commitment) => sum + commitment.amountInCents,
        0,
      ),
      bucket: "free",
      categoryId: null,
      createdAt: now,
      description: input.description,
      direction: "expense",
      expenseNature: "fixed",
      id: `transaction-${this.transactionRepository.records.length + 1}`,
      incomeSource: null,
      occurredOn: input.occurredOn,
      userId: "authenticated-user",
    };
    this.transactionRepository.records.push(transaction);

    const settledCommitments = selectedCommitments.map((commitment) => {
      const updatedCommitment: Commitment = {
        ...commitment,
        settledAt: now,
        settlementTransactionId: transaction.id,
      };
      const index = this.records.findIndex((record) => record.id === commitment.id);
      this.records[index] = updatedCommitment;
      return updatedCommitment;
    });

    return {
      commitments: settledCommitments,
      transaction,
    };
  }
}

function createAuthGuard() {
  return new RequireAuthenticatedUser(new AuthenticatedGateway());
}

function seedPhaseThreeData() {
  const accountRepository = new InMemoryAccountRepository();
  const categoryRepository = new InMemoryCategoryRepository();
  const transactionRepository = new InMemoryTransactionRepository();
  const commitmentRepository = new InMemoryCommitmentRepository(transactionRepository);

  accountRepository.records.push(
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
      creditLimitInCents: 2_500_00,
      createdAt: now,
      id: "credit-account",
      initialBalanceInCents: 0,
      isActive: true,
      name: "Card",
      statementDueDay: 10,
      updatedAt: now,
      userId: "authenticated-user",
    },
    {
      accountType: "vr",
      bucket: "meal_benefit",
      creditLimitInCents: null,
      createdAt: now,
      id: "meal-account",
      initialBalanceInCents: 300_00,
      isActive: true,
      name: "Meal",
      statementDueDay: null,
      updatedAt: now,
      userId: "authenticated-user",
    },
  );

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

  transactionRepository.records.push({
    accountId: "debit-account",
    affectsBalance: true,
    amountInCents: 500_00,
    bucket: "free",
    categoryId: null,
    createdAt: now,
    description: "Salary",
    direction: "income",
    expenseNature: null,
    id: "income-1",
    incomeSource: "salary",
    occurredOn: "2026-08-01",
    userId: "authenticated-user",
  });

  return {
    accountRepository,
    categoryRepository,
    commitmentRepository,
    transactionRepository,
  };
}

describe("phase three credit purchases", () => {
  it("creates one deferred expense transaction and one commitment per installment", async () => {
    const {
      accountRepository,
      categoryRepository,
      commitmentRepository,
      transactionRepository,
    } = seedPhaseThreeData();

    const result = await new CreateCreditCardPurchase(
      accountRepository,
      categoryRepository,
      commitmentRepository,
      createAuthGuard(),
    ).execute({
      accountId: "credit-account",
      amountInCents: 600_00,
      categoryId: "groceries",
      description: "  Supermercado  ",
      installmentCount: 3,
      occurredOn: "2026-08-08",
    });

    expect(result.transaction).toMatchObject({
      accountId: "credit-account",
      affectsBalance: false,
      amountInCents: 600_00,
      expenseNature: "credit_card",
    });
    expect(result.commitments).toHaveLength(3);
    expect(result.commitments.map((commitment) => commitment.amountInCents)).toEqual([
      200_00,
      200_00,
      200_00,
    ]);
    expect(transactionRepository.records).toHaveLength(2);
  });

  it("rejects purchases using a non-credit account", async () => {
    const {
      accountRepository,
      categoryRepository,
      commitmentRepository,
    } = seedPhaseThreeData();

    await expect(
      new CreateCreditCardPurchase(
        accountRepository,
        categoryRepository,
        commitmentRepository,
        createAuthGuard(),
      ).execute({
        accountId: "debit-account",
        amountInCents: 100_00,
        categoryId: "groceries",
        description: null,
        installmentCount: 1,
        occurredOn: "2026-08-08",
      }),
    ).rejects.toBeInstanceOf(FinanceDomainError);
  });
});

describe("phase three commitments reads", () => {
  it("calculates committed and available balances without double counting the deferred purchase in cash", async () => {
    const {
      accountRepository,
      categoryRepository,
      commitmentRepository,
      transactionRepository,
    } = seedPhaseThreeData();

    await new CreateCreditCardPurchase(
      accountRepository,
      categoryRepository,
      commitmentRepository,
      createAuthGuard(),
    ).execute({
      accountId: "credit-account",
      amountInCents: 300_00,
      categoryId: "groceries",
      description: "Compra",
      installmentCount: 3,
      occurredOn: "2026-08-08",
    });

    const committedBalances: CommittedBalancesDto = await new GetCommittedBalances(
      commitmentRepository,
      createAuthGuard(),
    ).execute();
    const availableBalances: AvailableBalancesDto = await new GetAvailableBalances(
      accountRepository,
      transactionRepository,
      commitmentRepository,
      createAuthGuard(),
    ).execute();

    expect(committedBalances).toEqual({
      freeCommittedInCents: 300_00,
      mealBenefitCommittedInCents: 0,
      transportBenefitCommittedInCents: 0,
    });
    expect(availableBalances).toEqual({
      freeAvailableInCents: 1_200_00,
      mealBenefitAvailableInCents: 300_00,
      transportBenefitAvailableInCents: 0,
    });
  });

  it("lists only open commitments ordered by due date", async () => {
    const {
      accountRepository,
      categoryRepository,
      commitmentRepository,
    } = seedPhaseThreeData();

    await new CreateCreditCardPurchase(
      accountRepository,
      categoryRepository,
      commitmentRepository,
      createAuthGuard(),
    ).execute({
      accountId: "credit-account",
      amountInCents: 300_00,
      categoryId: "groceries",
      description: null,
      installmentCount: 2,
      occurredOn: "2026-08-08",
    });

    const commitments = await new ListOpenCommitments(
      commitmentRepository,
      createAuthGuard(),
    ).execute();

    expect(commitments).toHaveLength(2);
    expect(commitments[0]?.dueOn <= commitments[1]?.dueOn).toBe(true);
  });
});

describe("phase three payments and safe credit", () => {
  it("pays selected commitments with a free-bucket account and keeps the safe credit limit coherent", async () => {
    const {
      accountRepository,
      categoryRepository,
      commitmentRepository,
      transactionRepository,
    } = seedPhaseThreeData();

    const purchase = await new CreateCreditCardPurchase(
      accountRepository,
      categoryRepository,
      commitmentRepository,
      createAuthGuard(),
    ).execute({
      accountId: "credit-account",
      amountInCents: 400_00,
      categoryId: "groceries",
      description: "Mercado",
      installmentCount: 2,
      occurredOn: "2026-08-08",
    });

    const safeLimitBeforePayment = await new CalculateSafeCreditLimit(
      accountRepository,
      transactionRepository,
      commitmentRepository,
      createAuthGuard(),
    ).execute();

    const payment = await new PayCommitment(
      accountRepository,
      commitmentRepository,
      createAuthGuard(),
    ).execute({
      commitmentIds: [purchase.commitments[0]!.id],
      description: "Pagamento fatura",
      occurredOn: "2026-08-10",
      payingAccountId: "debit-account",
    });

    const safeLimitAfterPayment = await new CalculateSafeCreditLimit(
      accountRepository,
      transactionRepository,
      commitmentRepository,
      createAuthGuard(),
    ).execute();

    expect(payment.transaction).toMatchObject({
      accountId: "debit-account",
      affectsBalance: true,
      amountInCents: 200_00,
    });
    expect(safeLimitBeforePayment).toBe(1_100_00);
    expect(safeLimitAfterPayment).toBe(1_100_00);
  });

  it("rejects payment attempts using a benefit account", async () => {
    const {
      accountRepository,
      categoryRepository,
      commitmentRepository,
    } = seedPhaseThreeData();

    const purchase = await new CreateCreditCardPurchase(
      accountRepository,
      categoryRepository,
      commitmentRepository,
      createAuthGuard(),
    ).execute({
      accountId: "credit-account",
      amountInCents: 120_00,
      categoryId: "groceries",
      description: null,
      installmentCount: 1,
      occurredOn: "2026-08-08",
    });

    await expect(
      new PayCommitment(
        accountRepository,
        commitmentRepository,
        createAuthGuard(),
      ).execute({
        commitmentIds: [purchase.commitments[0]!.id],
        description: null,
        occurredOn: "2026-08-10",
        payingAccountId: "meal-account",
      }),
    ).rejects.toBeInstanceOf(FinanceDomainError);
  });
});
