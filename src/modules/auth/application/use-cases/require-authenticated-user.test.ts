import { describe, expect, it } from "vitest";

import type { AuthenticatedUser } from "../../domain/entities/authenticated-user";
import { AuthenticationRequiredError } from "../errors/authentication-required-error";
import type { AuthGateway } from "../ports/auth-gateway";
import { RequireAuthenticatedUser } from "./require-authenticated-user";

class StubAuthGateway implements AuthGateway {
  constructor(private readonly user: AuthenticatedUser | null) {}

  async getCurrentUser() {
    return this.user;
  }
}

describe("RequireAuthenticatedUser", () => {
  it("returns the identity obtained from the server auth gateway", async () => {
    const expectedUser = { email: "user@example.com", id: "user-1" };
    const useCase = new RequireAuthenticatedUser(new StubAuthGateway(expectedUser));

    await expect(useCase.execute()).resolves.toEqual(expectedUser);
  });

  it("rejects unauthenticated requests", async () => {
    const useCase = new RequireAuthenticatedUser(new StubAuthGateway(null));

    await expect(useCase.execute()).rejects.toBeInstanceOf(AuthenticationRequiredError);
  });
});

