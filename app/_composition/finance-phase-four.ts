import "server-only";

import { RequireAuthenticatedUser } from "@/modules/auth";
import { SupabaseAuthGateway } from "@/modules/auth/infrastructure/supabase/supabase-auth-gateway";
import { ComparePlannedVsActual } from "@/modules/finance/application/use-cases/compare-planned-vs-actual";
import { GetMonthlyDashboard } from "@/modules/finance/application/use-cases/get-monthly-dashboard";
import { ListMonthlyPlan } from "@/modules/finance/application/use-cases/list-monthly-plan";
import { UpsertMonthlyPlan } from "@/modules/finance/application/use-cases/upsert-monthly-plan";
import { SupabaseCategoryRepository } from "@/modules/finance/infrastructure/supabase/repositories/supabase-category-repository";
import { SupabaseFinanceRepository } from "@/modules/finance/infrastructure/supabase/repositories/supabase-finance-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createFinancePhaseFourUseCases() {
  const client = await createSupabaseServerClient();
  const requireAuthenticatedUser = new RequireAuthenticatedUser(
    new SupabaseAuthGateway(client),
  );

  const categoryRepository = new SupabaseCategoryRepository(client);
  const financeRepository = new SupabaseFinanceRepository(client);

  return {
    comparePlannedVsActual: new ComparePlannedVsActual(
      financeRepository,
      requireAuthenticatedUser,
    ),
    getMonthlyDashboard: new GetMonthlyDashboard(
      financeRepository,
      requireAuthenticatedUser,
    ),
    listMonthlyPlan: new ListMonthlyPlan(financeRepository, requireAuthenticatedUser),
    upsertMonthlyPlan: new UpsertMonthlyPlan(
      categoryRepository,
      financeRepository,
      requireAuthenticatedUser,
    ),
  };
}
