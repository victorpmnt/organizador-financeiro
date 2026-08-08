import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

import type { AuthGateway } from "../../application/ports/auth-gateway";
import type { AuthenticatedUser } from "../../domain/entities/authenticated-user";

export class SupabaseAuthGateway implements AuthGateway {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getCurrentUser(): Promise<AuthenticatedUser | null> {
    const { data, error } = await this.client.auth.getClaims();

    if (error || !data?.claims.sub) {
      return null;
    }

    return {
      email: typeof data.claims.email === "string" ? data.claims.email : null,
      id: data.claims.sub,
    };
  }
}

