import type { MonthlyDashboardDto } from "../../application/dtos/monthly-dashboard-dto";
import type { FinanceRepository } from "../../application/ports/finance-repository";

export class InMemoryFinanceRepository implements FinanceRepository {
  async getMonthlyDashboard(): Promise<MonthlyDashboardDto> {
    return {
      freeBalanceInCents: 0,
      mealBenefitBalanceInCents: 0,
      transportBenefitBalanceInCents: 0,
      committedInCents: 0,
      safeCreditLimitInCents: 0,
    };
  }
}
