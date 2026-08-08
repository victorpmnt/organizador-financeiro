import type { MonthlyDashboardDto } from "../../application/dtos/monthly-dashboard-dto";
import type { MonthlyPlanDetailsDto } from "../../application/dtos/monthly-plan-details-dto";
import type { PlannedVsActualOverviewDto } from "../../application/dtos/planned-vs-actual-dto";
import type { FinanceRepository, UpsertMonthlyPlanRecord } from "../../application/ports/finance-repository";
import type { Account } from "../../domain/entities/account";
import type { Category } from "../../domain/entities/category";
import type { Commitment } from "../../domain/entities/commitment";
import type { MonthlyPlan, MonthlyPlanItem } from "../../domain/entities/monthly-plan";
import type { Transaction } from "../../domain/entities/transaction";
import { calculateBucketBalances } from "../../domain/services/calculate-bucket-balances";
import { buildMonthlyDashboard } from "../../domain/services/build-monthly-dashboard";
import { buildPlannedVsActual } from "../../domain/services/build-planned-vs-actual";
import { resolveMonthRange } from "../../domain/services/month";

const now = "2026-08-08T00:00:00.000Z";

export class InMemoryFinanceRepository implements FinanceRepository {
  readonly accounts: Account[] = [];
  readonly categories: Category[] = [];
  readonly commitments: Commitment[] = [];
  readonly monthlyPlanItems: MonthlyPlanItem[] = [];
  readonly monthlyPlans: MonthlyPlan[] = [];
  readonly transactions: Transaction[] = [];

  async upsertMonthlyPlan(input: UpsertMonthlyPlanRecord): Promise<MonthlyPlanDetailsDto> {
    const month = resolveMonthRange(input.yearMonth).monthDate;
    const existingPlanIndex = this.monthlyPlans.findIndex(
      (plan) => plan.userId === input.userId && plan.month === month,
    );
    const planId = existingPlanIndex >= 0 ? this.monthlyPlans[existingPlanIndex]!.id : `plan-${this.monthlyPlans.length + 1}`;
    const plan: MonthlyPlan = {
      createdAt: existingPlanIndex >= 0 ? this.monthlyPlans[existingPlanIndex]!.createdAt : now,
      id: planId,
      minimumFreeReserveInCents: input.minimumFreeReserveInCents,
      month,
      notes: input.notes,
      updatedAt: now,
      userId: input.userId,
    };

    if (existingPlanIndex >= 0) {
      this.monthlyPlans[existingPlanIndex] = plan;
    } else {
      this.monthlyPlans.push(plan);
    }

    for (let index = this.monthlyPlanItems.length - 1; index >= 0; index -= 1) {
      if (this.monthlyPlanItems[index]!.monthlyPlanId === planId) {
        this.monthlyPlanItems.splice(index, 1);
      }
    }

    const items = input.items.map((item, index) => {
      const category = item.categoryId === null ? null : this.categories.find((entry) => entry.id === item.categoryId) ?? null;
      const planItem: MonthlyPlanItem = {
        amountInCents: item.amountInCents,
        bucket: item.bucket,
        categoryId: item.categoryId,
        createdAt: now,
        description: item.description,
        expectedOn: item.expectedOn,
        expenseNature: category?.expenseNature ?? null,
        id: `plan-item-${this.monthlyPlanItems.length + index + 1}`,
        incomeSource: item.incomeSource,
        kind: item.kind,
        monthlyPlanId: planId,
        updatedAt: now,
        userId: input.userId,
      };
      this.monthlyPlanItems.push(planItem);
      return planItem;
    });

    return { items, plan };
  }

  async listMonthlyPlan(userId: string, yearMonth: string): Promise<MonthlyPlanDetailsDto> {
    const month = resolveMonthRange(yearMonth).monthDate;
    const plan = this.monthlyPlans.find((entry) => entry.userId === userId && entry.month === month) ?? null;

    if (plan === null) {
      return { items: [], plan: null };
    }

    return {
      items: this.monthlyPlanItems.filter((item) => item.monthlyPlanId === plan.id),
      plan,
    };
  }

  async comparePlannedVsActual(userId: string, yearMonth: string): Promise<PlannedVsActualOverviewDto> {
    const plan = await this.listMonthlyPlan(userId, yearMonth);
    const { endDate, startDate } = resolveMonthRange(yearMonth);
    const settledTransactionIds = new Set(
      this.commitments
        .filter((commitment) => commitment.userId === userId && commitment.settlementTransactionId !== null)
        .map((commitment) => commitment.settlementTransactionId as string),
    );

    return buildPlannedVsActual({
      categories: this.categories.filter((category) => category.userId === userId),
      planItems: plan.items,
      settledTransactionIds,
      transactionsInMonth: this.transactions.filter(
        (transaction) =>
          transaction.userId === userId &&
          transaction.occurredOn >= startDate &&
          transaction.occurredOn <= endDate,
      ),
      yearMonth,
    });
  }

  async getMonthlyDashboard(userId: string, yearMonth: string): Promise<MonthlyDashboardDto> {
    const comparison = await this.comparePlannedVsActual(userId, yearMonth);
    const plan = await this.listMonthlyPlan(userId, yearMonth);
    const { endDate, startDate } = resolveMonthRange(yearMonth);
    const accounts = this.accounts.filter((account) => account.userId === userId && account.isActive);
    const transactionsAll = this.transactions.filter(
      (transaction) => transaction.userId === userId && transaction.affectsBalance,
    );
    const openCommitments = this.commitments.filter(
      (commitment) => commitment.userId === userId && commitment.settledAt === null,
    );

    return buildMonthlyDashboard({
      accounts,
      balances: calculateBucketBalances(accounts, transactionsAll),
      categories: this.categories.filter((category) => category.userId === userId),
      commitments: openCommitments,
      comparison,
      minimumFreeReserveInCents: plan.plan?.minimumFreeReserveInCents ?? 0,
      today: "2026-08-08",
      transactionsInMonth: this.transactions.filter(
        (transaction) =>
          transaction.userId === userId &&
          transaction.occurredOn >= startDate &&
          transaction.occurredOn <= endDate,
      ),
    });
  }
}
