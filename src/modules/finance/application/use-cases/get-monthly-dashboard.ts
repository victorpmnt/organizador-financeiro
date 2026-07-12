import type { MonthlyDashboardDto } from "../dtos/monthly-dashboard-dto";
import type { FinanceRepository } from "../ports/finance-repository";

export interface GetMonthlyDashboardInput {
  userId: string;
  yearMonth: string;
}

export class GetMonthlyDashboard {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async execute(input: GetMonthlyDashboardInput): Promise<MonthlyDashboardDto> {
    return this.financeRepository.getMonthlyDashboard(input.userId, input.yearMonth);
  }
}
