import type {
  MonthlyDashboardCreditCardDto,
  MonthlyDashboardInsightsDto,
} from "./planned-vs-actual-dto";

export interface MonthlyDashboardDto {
  committedInCents: number;
  consumedExpenseInCents: number;
  creditCards: MonthlyDashboardCreditCardDto[];
  freeBalanceInCents: number;
  freeAvailableInCents: number;
  freeCommittedInCents: number;
  insights: MonthlyDashboardInsightsDto;
  mealBenefitBalanceInCents: number;
  mealBenefitAvailableInCents: number;
  mealBenefitCommittedInCents: number;
  minimumFreeReserveInCents: number;
  plannedExpenseInCents: number;
  plannedIncomeInCents: number;
  receivedIncomeInCents: number;
  safeCreditLimitInCents: number;
  transportBenefitAvailableInCents: number;
  transportBenefitBalanceInCents: number;
  transportBenefitCommittedInCents: number;
  yearMonth: string;
}
