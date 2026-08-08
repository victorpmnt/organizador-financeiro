import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { Transaction } from "../../domain/entities/transaction";
import { resolveMonthRange } from "../../domain/services/month";
import type { TransactionRepository } from "../ports/transaction-repository";

export interface ListTransactionsByMonthInput {
  yearMonth: string;
}

export class ListTransactionsByMonth {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(input: ListTransactionsByMonthInput): Promise<Transaction[]> {
    const user = await this.requireAuthenticatedUser.execute();
    const { endDate, startDate } = resolveMonthRange(input.yearMonth);

    return this.transactionRepository.listByUserAndDateRange(user.id, startDate, endDate);
  }
}
