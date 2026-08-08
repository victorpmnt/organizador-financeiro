import "server-only";

import { RequireAuthenticatedUser } from "@/modules/auth";
import { SupabaseAuthGateway } from "@/modules/auth/infrastructure/supabase/supabase-auth-gateway";
import { CreateImmediateExpense } from "@/modules/finance/application/use-cases/create-immediate-expense";
import { CreateIncomeEntry } from "@/modules/finance/application/use-cases/create-income-entry";
import { GetBucketBalances } from "@/modules/finance/application/use-cases/get-bucket-balances";
import { ListTransactionsByMonth } from "@/modules/finance/application/use-cases/list-transactions-by-month";
import { SupabaseAccountRepository } from "@/modules/finance/infrastructure/supabase/repositories/supabase-account-repository";
import { SupabaseCategoryRepository } from "@/modules/finance/infrastructure/supabase/repositories/supabase-category-repository";
import { SupabaseTransactionRepository } from "@/modules/finance/infrastructure/supabase/repositories/supabase-transaction-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createFinancePhaseTwoUseCases() {
  const client = await createSupabaseServerClient();
  const requireAuthenticatedUser = new RequireAuthenticatedUser(
    new SupabaseAuthGateway(client),
  );

  const accountRepository = new SupabaseAccountRepository(client);
  const categoryRepository = new SupabaseCategoryRepository(client);
  const transactionRepository = new SupabaseTransactionRepository(client);

  return {
    createImmediateExpense: new CreateImmediateExpense(
      accountRepository,
      categoryRepository,
      transactionRepository,
      requireAuthenticatedUser,
    ),
    createIncomeEntry: new CreateIncomeEntry(
      accountRepository,
      transactionRepository,
      requireAuthenticatedUser,
    ),
    getBucketBalances: new GetBucketBalances(
      accountRepository,
      transactionRepository,
      requireAuthenticatedUser,
    ),
    listTransactionsByMonth: new ListTransactionsByMonth(
      transactionRepository,
      requireAuthenticatedUser,
    ),
  };
}
