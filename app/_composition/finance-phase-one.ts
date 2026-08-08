import "server-only";

import { RequireAuthenticatedUser } from "@/modules/auth";
import { SupabaseAuthGateway } from "@/modules/auth/infrastructure/supabase/supabase-auth-gateway";
import { CreateAccount } from "@/modules/finance/application/use-cases/create-account";
import { CreateCategory } from "@/modules/finance/application/use-cases/create-category";
import { ListAccounts } from "@/modules/finance/application/use-cases/list-accounts";
import { ListCategories } from "@/modules/finance/application/use-cases/list-categories";
import { SupabaseAccountRepository } from "@/modules/finance/infrastructure/supabase/repositories/supabase-account-repository";
import { SupabaseCategoryRepository } from "@/modules/finance/infrastructure/supabase/repositories/supabase-category-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createFinancePhaseOneUseCases() {
  const client = await createSupabaseServerClient();
  const requireAuthenticatedUser = new RequireAuthenticatedUser(
    new SupabaseAuthGateway(client),
  );

  const accountRepository = new SupabaseAccountRepository(client);
  const categoryRepository = new SupabaseCategoryRepository(client);

  return {
    createAccount: new CreateAccount(accountRepository, requireAuthenticatedUser),
    createCategory: new CreateCategory(categoryRepository, requireAuthenticatedUser),
    listAccounts: new ListAccounts(accountRepository, requireAuthenticatedUser),
    listCategories: new ListCategories(categoryRepository, requireAuthenticatedUser),
  };
}
