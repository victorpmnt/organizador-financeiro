import type { RequireAuthenticatedUser } from "@/modules/auth";

import type { Commitment } from "../../domain/entities/commitment";
import type { CommitmentRepository } from "../ports/commitment-repository";

export class ListOpenCommitments {
  constructor(
    private readonly commitmentRepository: CommitmentRepository,
    private readonly requireAuthenticatedUser: RequireAuthenticatedUser,
  ) {}

  async execute(): Promise<Commitment[]> {
    const user = await this.requireAuthenticatedUser.execute();

    return this.commitmentRepository.listOpenByUser(user.id);
  }
}
