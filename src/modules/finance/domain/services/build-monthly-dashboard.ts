import type { MonthlyDashboardDto } from "../../application/dtos/monthly-dashboard-dto";
import type { PlannedVsActualOverviewDto } from "../../application/dtos/planned-vs-actual-dto";
import type { Account } from "../entities/account";
import type { Category } from "../entities/category";
import type { Commitment } from "../entities/commitment";
import type { Transaction } from "../entities/transaction";
import type { AccountType } from "../enums/account-type";
import type { CalculatedBucketBalances } from "./calculate-bucket-balances";

interface BuildMonthlyDashboardInput {
  accounts: Account[];
  balances: CalculatedBucketBalances;
  categories: Category[];
  commitments: Commitment[];
  comparison: PlannedVsActualOverviewDto;
  minimumFreeReserveInCents: number;
  today: string;
  transactionsInMonth: Transaction[];
}

function asDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function buildMonthlyDashboard({
  accounts,
  balances,
  categories,
  commitments,
  comparison,
  minimumFreeReserveInCents,
  today,
  transactionsInMonth,
}: BuildMonthlyDashboardInput): MonthlyDashboardDto {
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const freeCommittedInCents = commitments
    .filter((commitment) => commitment.bucket === "free")
    .reduce((sum, commitment) => sum + commitment.amountInCents, 0);
  const mealBenefitCommittedInCents = commitments
    .filter((commitment) => commitment.bucket === "meal_benefit")
    .reduce((sum, commitment) => sum + commitment.amountInCents, 0);
  const transportBenefitCommittedInCents = commitments
    .filter((commitment) => commitment.bucket === "transport_benefit")
    .reduce((sum, commitment) => sum + commitment.amountInCents, 0);
  const freeAvailableInCents = balances.freeBalanceInCents - freeCommittedInCents;
  const mealBenefitAvailableInCents =
    balances.mealBenefitBalanceInCents - mealBenefitCommittedInCents;
  const transportBenefitAvailableInCents =
    balances.transportBenefitBalanceInCents - transportBenefitCommittedInCents;
  const settledTransactionIds = new Set(
    commitments
      .filter((commitment) => commitment.settlementTransactionId !== null)
      .map((commitment) => commitment.settlementTransactionId as string),
  );
  const consumedTransactions = transactionsInMonth.filter(
    (transaction) =>
      transaction.direction === "expense" &&
      transaction.categoryId !== null &&
      !settledTransactionIds.has(transaction.id),
  );

  const expenseByCategory = new Map<string, number>();
  const expenseByAccountType = new Map<string, number>();
  let highestSingleExpenseAmountInCents = 0;
  let highestSingleExpenseDescription: string | null = null;

  for (const transaction of consumedTransactions) {
    if (transaction.categoryId !== null) {
      expenseByCategory.set(
        transaction.categoryId,
        (expenseByCategory.get(transaction.categoryId) ?? 0) + transaction.amountInCents,
      );
    }

    const accountType = accounts.find((account) => account.id === transaction.accountId)?.accountType;
    if (accountType) {
      expenseByAccountType.set(
        accountType,
        (expenseByAccountType.get(accountType) ?? 0) + transaction.amountInCents,
      );
    }

    if (transaction.amountInCents > highestSingleExpenseAmountInCents) {
      highestSingleExpenseAmountInCents = transaction.amountInCents;
      highestSingleExpenseDescription = transaction.description;
    }
  }

  const topExpenseCategory = Array.from(expenseByCategory.entries()).sort((left, right) => right[1] - left[1])[0];
  const primaryAccountType =
    (Array.from(expenseByAccountType.entries()).sort((left, right) => right[1] - left[1])[0]?.[0] as
      | AccountType
      | undefined) ?? null;
  const currentDate = asDate(today);
  const nextThirtyDays = new Date(currentDate);
  nextThirtyDays.setUTCDate(nextThirtyDays.getUTCDate() + 30);

  const commitmentsDueNext30DaysInCents = commitments
    .filter((commitment) => {
      const dueDate = asDate(commitment.dueOn);
      return dueDate >= currentDate && dueDate <= nextThirtyDays;
    })
    .reduce((sum, commitment) => sum + commitment.amountInCents, 0);

  const overdueCommitmentsInCents = commitments
    .filter((commitment) => asDate(commitment.dueOn) < currentDate)
    .reduce((sum, commitment) => sum + commitment.amountInCents, 0);

  const netCashFlowInCents =
    transactionsInMonth
      .filter((transaction) => transaction.direction === "income")
      .reduce((sum, transaction) => sum + transaction.amountInCents, 0) -
    transactionsInMonth
      .filter((transaction) => transaction.direction === "expense" && transaction.affectsBalance)
      .reduce((sum, transaction) => sum + transaction.amountInCents, 0);

  return {
    committedInCents:
      freeCommittedInCents + mealBenefitCommittedInCents + transportBenefitCommittedInCents,
    consumedExpenseInCents: comparison.consumedExpenseInCents,
    creditCards: accounts
      .filter((account) => account.accountType === "credit")
      .map((account) => {
        const committedInCents = commitments
          .filter((commitment) => commitment.accountId === account.id)
          .reduce((sum, commitment) => sum + commitment.amountInCents, 0);
        const creditLimitInCents = account.creditLimitInCents ?? 0;
        const availableLimitInCents = Math.max(0, creditLimitInCents - committedInCents);

        return {
          accountId: account.id,
          availableLimitInCents,
          committedInCents,
          creditLimitInCents,
          name: account.name,
          utilizationPercentage:
            creditLimitInCents > 0
              ? Number(((committedInCents / creditLimitInCents) * 100).toFixed(2))
              : 0,
        };
      })
      .sort((left, right) => right.committedInCents - left.committedInCents),
    freeAvailableInCents,
    freeBalanceInCents: balances.freeBalanceInCents,
    freeCommittedInCents,
    insights: {
      commitmentsDueNext30DaysInCents,
      highestSingleExpenseAmountInCents,
      highestSingleExpenseDescription,
      netCashFlowInCents,
      overdueCommitmentsInCents,
      primaryAccountType,
      topExpenseCategoryAmountInCents: topExpenseCategory?.[1] ?? 0,
      topExpenseCategoryName:
        topExpenseCategory === undefined
          ? null
          : (categoriesById.get(topExpenseCategory[0])?.name ?? null),
      topExpenseCategorySharePercentage:
        comparison.consumedExpenseInCents > 0 && topExpenseCategory !== undefined
          ? Number(((topExpenseCategory[1] / comparison.consumedExpenseInCents) * 100).toFixed(2))
          : null,
    },
    mealBenefitAvailableInCents,
    mealBenefitBalanceInCents: balances.mealBenefitBalanceInCents,
    mealBenefitCommittedInCents,
    minimumFreeReserveInCents,
    plannedExpenseInCents: comparison.plannedExpenseInCents,
    plannedIncomeInCents: comparison.plannedIncomeInCents,
    receivedIncomeInCents: comparison.receivedIncomeInCents,
    safeCreditLimitInCents: Math.max(0, freeAvailableInCents - minimumFreeReserveInCents),
    transportBenefitAvailableInCents,
    transportBenefitBalanceInCents: balances.transportBenefitBalanceInCents,
    transportBenefitCommittedInCents,
    yearMonth: comparison.yearMonth,
  };
}
