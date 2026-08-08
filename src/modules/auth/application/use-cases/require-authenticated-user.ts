import type { AuthenticatedUser } from "../../domain/entities/authenticated-user";
import { AuthenticationRequiredError } from "../errors/authentication-required-error";
import type { AuthGateway } from "../ports/auth-gateway";

export class RequireAuthenticatedUser {
  constructor(private readonly authGateway: AuthGateway) {}

  async execute(): Promise<AuthenticatedUser> {
    const user = await this.authGateway.getCurrentUser();

    if (!user) {
      throw new AuthenticationRequiredError();
    }

    return user;
  }
}

