import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { Transaction } from "../../domain/entities/transaction";
import { FinanceDomainError } from "../../domain/errors/finance-domain-error";
import type { TransactionRepository } from "../ports/transaction-repository";

export interface ListTransactionsByMonthInput {
  yearMonth: string;
}

function resolveMonthRange(yearMonth: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);

  if (!match) {
    throw new FinanceDomainError("yearMonth must use the YYYY-MM format.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new FinanceDomainError("yearMonth must use a valid calendar month.");
  }

  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthText = String(month).padStart(2, "0");

  return {
    endDate: `${year}-${monthText}-${String(lastDay).padStart(2, "0")}`,
    startDate: `${year}-${monthText}-01`,
  };
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
