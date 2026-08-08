import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { MonthlyDashboardDto } from "../dtos/monthly-dashboard-dto";
import type { FinanceRepository } from "../ports/finance-repository";

export interface GetMonthlyDashboardInput {
  yearMonth: string;
}

export class GetMonthlyDashboard {
  constructor(
    private readonly financeRepository: FinanceRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(input: GetMonthlyDashboardInput): Promise<MonthlyDashboardDto> {
    const user = await this.requireAuthenticatedUser.execute();

    return this.financeRepository.getMonthlyDashboard(user.id, input.yearMonth);
  }
}
