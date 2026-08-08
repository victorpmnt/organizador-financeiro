import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/supabase/database.types";

import type { MonthlyDashboardDto } from "../../../application/dtos/monthly-dashboard-dto";
import type { MonthlyPlanDetailsDto } from "../../../application/dtos/monthly-plan-details-dto";
import type { PlannedVsActualOverviewDto } from "../../../application/dtos/planned-vs-actual-dto";
import type {
  FinanceRepository,
  UpsertMonthlyPlanRecord,
} from "../../../application/ports/finance-repository";
import { FinancePersistenceError } from "../../../application/errors/finance-persistence-error";
import type { Account } from "../../../domain/entities/account";
import type { Category } from "../../../domain/entities/category";
import type { Commitment } from "../../../domain/entities/commitment";
import type { MonthlyPlanDetails } from "../../../domain/entities/monthly-plan";
import type { Transaction } from "../../../domain/entities/transaction";
import { calculateBucketBalances } from "../../../domain/services/calculate-bucket-balances";
import { buildMonthlyDashboard } from "../../../domain/services/build-monthly-dashboard";
import { buildPlannedVsActual } from "../../../domain/services/build-planned-vs-actual";
import { resolveMonthRange } from "../../../domain/services/month";
import { mapAccountRow } from "../mappers/account-mapper";
import { mapCategoryRow } from "../mappers/category-mapper";
import { mapCommitmentRow } from "../mappers/commitment-mapper";
import { mapMonthlyPlanItemRow, mapMonthlyPlanRow } from "../mappers/monthly-plan-mapper";
import { mapTransactionRow } from "../mappers/transaction-mapper";

type MonthlyPlanRow = Database["public"]["Tables"]["monthly_plans"]["Row"];
type MonthlyPlanItemRow = Database["public"]["Tables"]["monthly_plan_items"]["Row"];
type UpsertMonthlyPlanPayload = {
  items: MonthlyPlanItemRow[];
  plan: MonthlyPlanRow;
};

function isRecord(value: Json): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseUpsertMonthlyPlanPayload(payload: Json): MonthlyPlanDetails {
  if (!isRecord(payload) || !isRecord(payload.plan) || !Array.isArray(payload.items)) {
    throw new FinancePersistenceError("Unable to parse monthly plan upsert result.");
  }

  const result = payload as unknown as UpsertMonthlyPlanPayload;

  return {
    items: result.items.map(mapMonthlyPlanItemRow),
    plan: mapMonthlyPlanRow(result.plan),
  };
}

export class SupabaseFinanceRepository implements FinanceRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async upsertMonthlyPlan(input: UpsertMonthlyPlanRecord): Promise<MonthlyPlanDetailsDto> {
    const { data, error } = await this.client.rpc("upsert_monthly_plan", {
      p_items: input.items as unknown as Json,
      p_minimum_free_reserve_in_cents: input.minimumFreeReserveInCents,
      p_month: resolveMonthRange(input.yearMonth).monthDate,
      p_notes: input.notes,
    });

    if (error) {
      throw new FinancePersistenceError("Unable to upsert monthly plan.", error.code);
    }

    return parseUpsertMonthlyPlanPayload(data);
  }

  async listMonthlyPlan(userId: string, yearMonth: string): Promise<MonthlyPlanDetailsDto> {
    const monthDate = resolveMonthRange(yearMonth).monthDate;
    const { data: planRow, error: planError } = await this.client
      .from("monthly_plans")
      .select()
      .eq("user_id", userId)
      .eq("month", monthDate)
      .maybeSingle();

    if (planError) {
      throw new FinancePersistenceError("Unable to load monthly plan.", planError.code);
    }

    if (planRow === null) {
      return { items: [], plan: null };
    }

    const { data: itemRows, error: itemError } = await this.client
      .from("monthly_plan_items")
      .select()
      .eq("user_id", userId)
      .eq("monthly_plan_id", planRow.id)
      .order("expected_on", { ascending: true })
      .order("created_at", { ascending: true });

    if (itemError) {
      throw new FinancePersistenceError("Unable to load monthly plan items.", itemError.code);
    }

    return {
      items: itemRows.map(mapMonthlyPlanItemRow),
      plan: mapMonthlyPlanRow(planRow),
    };
  }

  async comparePlannedVsActual(
    userId: string,
    yearMonth: string,
  ): Promise<PlannedVsActualOverviewDto> {
    const { categories, monthlyPlan, settledCommitments, transactionsInMonth } = await this.loadPhaseFourContext(
      userId,
      yearMonth,
    );

    return buildPlannedVsActual({
      categories,
      planItems: monthlyPlan.items,
      settledTransactionIds: new Set(
        settledCommitments
          .map((commitment) => commitment.settlementTransactionId)
          .filter((id): id is string => id !== null),
      ),
      transactionsInMonth,
      yearMonth,
    });
  }

  async getMonthlyDashboard(userId: string, yearMonth: string): Promise<MonthlyDashboardDto> {
    const {
      accounts,
      categories,
      monthlyPlan,
      openCommitments,
      settledCommitments,
      transactionsAll,
      transactionsInMonth,
    } = await this.loadPhaseFourContext(userId, yearMonth);
    const comparison = buildPlannedVsActual({
      categories,
      planItems: monthlyPlan.items,
      settledTransactionIds: new Set(
        settledCommitments
          .map((commitment) => commitment.settlementTransactionId)
          .filter((id): id is string => id !== null),
      ),
      transactionsInMonth,
      yearMonth,
    });

    return buildMonthlyDashboard({
      accounts,
      balances: calculateBucketBalances(accounts, transactionsAll),
      categories,
      commitments: openCommitments,
      comparison,
      minimumFreeReserveInCents: monthlyPlan.plan?.minimumFreeReserveInCents ?? 0,
      today: new Date().toISOString().slice(0, 10),
      transactionsInMonth,
    });
  }

  private async loadPhaseFourContext(userId: string, yearMonth: string): Promise<{
    accounts: Account[];
    categories: Category[];
    monthlyPlan: MonthlyPlanDetailsDto;
    openCommitments: Commitment[];
    settledCommitments: Commitment[];
    transactionsAll: Transaction[];
    transactionsInMonth: Transaction[];
  }> {
    const { endDate, startDate } = resolveMonthRange(yearMonth);
    const [
      accountsResult,
      categoriesResult,
      transactionsAllResult,
      transactionsMonthResult,
      openCommitmentsResult,
      settledCommitmentsResult,
      monthlyPlan,
    ] = await Promise.all([
      this.client.from("accounts").select().eq("user_id", userId).eq("is_active", true),
      this.client.from("categories").select().eq("user_id", userId),
      this.client
        .from("transactions")
        .select()
        .eq("user_id", userId)
        .eq("affects_balance", true)
        .order("occurred_on", { ascending: false })
        .order("created_at", { ascending: false }),
      this.client
        .from("transactions")
        .select()
        .eq("user_id", userId)
        .gte("occurred_on", startDate)
        .lte("occurred_on", endDate)
        .order("occurred_on", { ascending: false })
        .order("created_at", { ascending: false }),
      this.client.from("commitments").select().eq("user_id", userId).is("settled_at", null),
      this.client.from("commitments").select().eq("user_id", userId).not("settlement_transaction_id", "is", null),
      this.listMonthlyPlan(userId, yearMonth),
    ]);

    if (accountsResult.error) {
      throw new FinancePersistenceError("Unable to load accounts.", accountsResult.error.code);
    }
    if (categoriesResult.error) {
      throw new FinancePersistenceError("Unable to load categories.", categoriesResult.error.code);
    }
    if (transactionsAllResult.error) {
      throw new FinancePersistenceError(
        "Unable to load balance-affecting transactions.",
        transactionsAllResult.error.code,
      );
    }
    if (transactionsMonthResult.error) {
      throw new FinancePersistenceError("Unable to load monthly transactions.", transactionsMonthResult.error.code);
    }
    if (openCommitmentsResult.error) {
      throw new FinancePersistenceError("Unable to load open commitments.", openCommitmentsResult.error.code);
    }
    if (settledCommitmentsResult.error) {
      throw new FinancePersistenceError("Unable to load settled commitments.", settledCommitmentsResult.error.code);
    }

    return {
      accounts: accountsResult.data.map(mapAccountRow),
      categories: categoriesResult.data.map(mapCategoryRow),
      monthlyPlan,
      openCommitments: openCommitmentsResult.data.map(mapCommitmentRow),
      settledCommitments: settledCommitmentsResult.data.map(mapCommitmentRow),
      transactionsAll: transactionsAllResult.data.map(mapTransactionRow),
      transactionsInMonth: transactionsMonthResult.data.map(mapTransactionRow),
    };
  }
}
