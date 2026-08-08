import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { MonthlyPlanDetailsDto } from "../dtos/monthly-plan-details-dto";
import type { FinanceRepository } from "../ports/finance-repository";
import { resolveMonthRange } from "../../domain/services/month";

export interface ListMonthlyPlanInput {
  yearMonth: string;
}

export class ListMonthlyPlan {
  constructor(
    private readonly financeRepository: FinanceRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(input: ListMonthlyPlanInput): Promise<MonthlyPlanDetailsDto> {
    const user = await this.requireAuthenticatedUser.execute();
    const yearMonth = resolveMonthRange(input.yearMonth).monthDate.slice(0, 7);

    return this.financeRepository.listMonthlyPlan(user.id, yearMonth);
  }
}
