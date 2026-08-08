import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/supabase/database.types";

import { FinancePersistenceError } from "../../../application/errors/finance-persistence-error";
import type {
  CommitmentMutationResult,
  CommitmentRepository,
  CreateCreditCardPurchaseRecord,
  PayCommitmentsRecord,
} from "../../../application/ports/commitment-repository";
import type { Commitment } from "../../../domain/entities/commitment";
import { mapCommitmentRow } from "../mappers/commitment-mapper";
import { mapTransactionRow } from "../mappers/transaction-mapper";

type CommitmentRow = Database["public"]["Tables"]["commitments"]["Row"];
type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

interface CommitmentRpcResult {
  commitments: CommitmentRow[];
  transaction: TransactionRow;
}

function isRecord(value: Json): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseMutationResult(payload: Json): CommitmentMutationResult {
  if (!isRecord(payload) || !Array.isArray(payload.commitments) || !isRecord(payload.transaction)) {
    throw new FinancePersistenceError("Unable to parse commitment mutation result.");
  }

  const result = payload as unknown as CommitmentRpcResult;

  return {
    commitments: result.commitments.map(mapCommitmentRow),
    transaction: mapTransactionRow(result.transaction),
  };
}

export class SupabaseCommitmentRepository implements CommitmentRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async createCreditCardPurchase(
    input: CreateCreditCardPurchaseRecord,
  ): Promise<CommitmentMutationResult> {
    const { data, error } = await this.client.rpc("create_credit_card_purchase", {
      p_account_id: input.accountId,
      p_amount_in_cents: input.amountInCents,
      p_category_id: input.categoryId,
      p_description: input.description,
      p_installment_count: input.installmentCount,
      p_occurred_on: input.occurredOn,
    });

    if (error) {
      throw new FinancePersistenceError("Unable to create credit card purchase.", error.code);
    }

    return parseMutationResult(data);
  }

  async listOpenByUser(userId: string): Promise<Commitment[]> {
    const { data, error } = await this.client
      .from("commitments")
      .select()
      .eq("user_id", userId)
      .is("settled_at", null)
      .order("due_on", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      throw new FinancePersistenceError("Unable to list open commitments.", error.code);
    }

    return data.map(mapCommitmentRow);
  }

  async payCommitments(input: PayCommitmentsRecord): Promise<CommitmentMutationResult> {
    const { data, error } = await this.client.rpc("pay_commitments", {
      p_commitment_ids: input.commitmentIds,
      p_description: input.description,
      p_occurred_on: input.occurredOn,
      p_paying_account_id: input.payingAccountId,
    });

    if (error) {
      throw new FinancePersistenceError("Unable to pay commitments.", error.code);
    }

    return parseMutationResult(data);
  }
}
