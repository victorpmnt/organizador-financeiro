import type { AuthenticatedUser } from "../../domain/entities/authenticated-user";
import type { AuthGateway } from "../ports/auth-gateway";

export class GetCurrentUser {
  constructor(private readonly authGateway: AuthGateway) {}

  execute(): Promise<AuthenticatedUser | null> {
    return this.authGateway.getCurrentUser();
  }
}

