import type { MonthlyDashboardDto } from "../dtos/monthly-dashboard-dto";

export interface FinanceRepository {
  getMonthlyDashboard(userId: string, yearMonth: string): Promise<MonthlyDashboardDto>;
}
