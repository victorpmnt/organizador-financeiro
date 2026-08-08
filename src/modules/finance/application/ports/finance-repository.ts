import type { MonthlyPlanDetailsDto } from "../dtos/monthly-plan-details-dto";
import type { MonthlyDashboardDto } from "../dtos/monthly-dashboard-dto";
import type { PlannedVsActualOverviewDto } from "../dtos/planned-vs-actual-dto";
import type { UpsertMonthlyPlanItemDto } from "../dtos/upsert-monthly-plan-dto";

export interface UpsertMonthlyPlanRecord {
  items: UpsertMonthlyPlanItemDto[];
  minimumFreeReserveInCents: number;
  notes: string | null;
  userId: string;
  yearMonth: string;
}

export interface FinanceRepository {
  comparePlannedVsActual(userId: string, yearMonth: string): Promise<PlannedVsActualOverviewDto>;
  getMonthlyDashboard(userId: string, yearMonth: string): Promise<MonthlyDashboardDto>;
  listMonthlyPlan(userId: string, yearMonth: string): Promise<MonthlyPlanDetailsDto>;
  upsertMonthlyPlan(input: UpsertMonthlyPlanRecord): Promise<MonthlyPlanDetailsDto>;
}
