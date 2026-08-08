import type { AccountType } from "../../domain/enums/account-type";
import type { BalanceBucket } from "../../domain/enums/balance-bucket";
import type { ExpenseNature } from "../../domain/enums/expense-nature";
import type { IncomeSource } from "../../domain/enums/income-source";

export interface PlannedVsActualIncomeItemDto {
  actualInCents: number;
  bucket: BalanceBucket;
  incomeSource: IncomeSource;
  key: string;
  plannedInCents: number;
  varianceInCents: number;
}

export interface PlannedVsActualExpenseItemDto {
  actualInCents: number;
  bucket: BalanceBucket;
  categoryId: string;
  categoryName: string | null;
  expenseNature: ExpenseNature | null;
  key: string;
  plannedInCents: number;
  varianceInCents: number;
}

export interface PlannedVsActualOverviewDto {
  consumedExpenseInCents: number;
  expenseItems: PlannedVsActualExpenseItemDto[];
  expenseVarianceInCents: number;
  incomeItems: PlannedVsActualIncomeItemDto[];
  incomeVarianceInCents: number;
  plannedExpenseInCents: number;
  plannedIncomeInCents: number;
  receivedIncomeInCents: number;
  yearMonth: string;
}

export interface MonthlyDashboardCreditCardDto {
  accountId: string;
  availableLimitInCents: number;
  committedInCents: number;
  creditLimitInCents: number;
  name: string;
  utilizationPercentage: number;
}

export interface MonthlyDashboardInsightsDto {
  commitmentsDueNext30DaysInCents: number;
  highestSingleExpenseAmountInCents: number;
  highestSingleExpenseDescription: string | null;
  netCashFlowInCents: number;
  overdueCommitmentsInCents: number;
  primaryAccountType: AccountType | null;
  topExpenseCategoryAmountInCents: number;
  topExpenseCategoryName: string | null;
  topExpenseCategorySharePercentage: number | null;
}
