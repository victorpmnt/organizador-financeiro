import "server-only";

import { RequireAuthenticatedUser } from "@/modules/auth";
import { SupabaseAuthGateway } from "@/modules/auth/infrastructure/supabase/supabase-auth-gateway";
import { CalculateSafeCreditLimit } from "@/modules/finance/application/use-cases/calculate-safe-credit-limit";
import { CreateCreditCardPurchase } from "@/modules/finance/application/use-cases/create-credit-card-purchase";
import { GetAvailableBalances } from "@/modules/finance/application/use-cases/get-available-balances";
import { GetCommittedBalances } from "@/modules/finance/application/use-cases/get-committed-balances";
import { ListOpenCommitments } from "@/modules/finance/application/use-cases/list-open-commitments";
import { PayCommitment } from "@/modules/finance/application/use-cases/pay-commitment";
import { SupabaseAccountRepository } from "@/modules/finance/infrastructure/supabase/repositories/supabase-account-repository";
import { SupabaseCategoryRepository } from "@/modules/finance/infrastructure/supabase/repositories/supabase-category-repository";
import { SupabaseCommitmentRepository } from "@/modules/finance/infrastructure/supabase/repositories/supabase-commitment-repository";
import { SupabaseTransactionRepository } from "@/modules/finance/infrastructure/supabase/repositories/supabase-transaction-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createFinancePhaseThreeUseCases() {
  const client = await createSupabaseServerClient();
  const requireAuthenticatedUser = new RequireAuthenticatedUser(
    new SupabaseAuthGateway(client),
  );

  const accountRepository = new SupabaseAccountRepository(client);
  const categoryRepository = new SupabaseCategoryRepository(client);
  const commitmentRepository = new SupabaseCommitmentRepository(client);
  const transactionRepository = new SupabaseTransactionRepository(client);

  return {
    calculateSafeCreditLimit: new CalculateSafeCreditLimit(
      accountRepository,
      transactionRepository,
      commitmentRepository,
      requireAuthenticatedUser,
    ),
    createCreditCardPurchase: new CreateCreditCardPurchase(
      accountRepository,
      categoryRepository,
      commitmentRepository,
      requireAuthenticatedUser,
    ),
    getAvailableBalances: new GetAvailableBalances(
      accountRepository,
      transactionRepository,
      commitmentRepository,
      requireAuthenticatedUser,
    ),
    getCommittedBalances: new GetCommittedBalances(
      commitmentRepository,
      requireAuthenticatedUser,
    ),
    listOpenCommitments: new ListOpenCommitments(
      commitmentRepository,
      requireAuthenticatedUser,
    ),
    payCommitment: new PayCommitment(
      accountRepository,
      commitmentRepository,
      requireAuthenticatedUser,
    ),
  };
}
