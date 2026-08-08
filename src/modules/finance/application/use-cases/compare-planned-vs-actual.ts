import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { PlannedVsActualOverviewDto } from "../dtos/planned-vs-actual-dto";
import type { FinanceRepository } from "../ports/finance-repository";
import { resolveMonthRange } from "../../domain/services/month";

export interface ComparePlannedVsActualInput {
  yearMonth: string;
}

export class ComparePlannedVsActual {
  constructor(
    private readonly financeRepository: FinanceRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(input: ComparePlannedVsActualInput): Promise<PlannedVsActualOverviewDto> {
    const user = await this.requireAuthenticatedUser.execute();
    const yearMonth = resolveMonthRange(input.yearMonth).monthDate.slice(0, 7);

    return this.financeRepository.comparePlannedVsActual(user.id, yearMonth);
  }
}
