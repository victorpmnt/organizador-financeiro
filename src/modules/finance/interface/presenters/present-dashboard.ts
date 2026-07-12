import { formatCurrency } from "@/lib/formatters/currency";

import type { MonthlyDashboardDto } from "../../application/dtos/monthly-dashboard-dto";
import type { DashboardViewModel } from "../view-models/dashboard-view-model";

export function presentDashboard(data: MonthlyDashboardDto): DashboardViewModel {
  return {
    freeBalance: formatCurrency(data.freeBalanceInCents),
    mealBenefitBalance: formatCurrency(data.mealBenefitBalanceInCents),
    transportBenefitBalance: formatCurrency(data.transportBenefitBalanceInCents),
    committedAmount: formatCurrency(data.committedInCents),
    safeCreditLimit: formatCurrency(data.safeCreditLimitInCents),
  };
}
