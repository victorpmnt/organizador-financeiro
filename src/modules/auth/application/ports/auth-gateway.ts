import type { AuthenticatedUser } from "../../domain/entities/authenticated-user";

export interface AuthGateway {
  getCurrentUser(): Promise<AuthenticatedUser | null>;
}

