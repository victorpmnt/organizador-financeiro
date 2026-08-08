import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { CommittedBalancesDto } from "../dtos/committed-balances-dto";
import type { CommitmentRepository } from "../ports/commitment-repository";

export class GetCommittedBalances {
  constructor(
    private readonly commitmentRepository: CommitmentRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(): Promise<CommittedBalancesDto> {
    const user = await this.requireAuthenticatedUser.execute();
    const commitments = await this.commitmentRepository.listOpenByUser(user.id);

    return commitments.reduce<CommittedBalancesDto>(
      (totals, commitment) => {
        if (commitment.bucket === "meal_benefit") {
          totals.mealBenefitCommittedInCents += commitment.amountInCents;
        } else if (commitment.bucket === "transport_benefit") {
          totals.transportBenefitCommittedInCents += commitment.amountInCents;
        } else {
          totals.freeCommittedInCents += commitment.amountInCents;
        }

        return totals;
      },
      {
        freeCommittedInCents: 0,
        mealBenefitCommittedInCents: 0,
        transportBenefitCommittedInCents: 0,
      },
    );
  }
}
