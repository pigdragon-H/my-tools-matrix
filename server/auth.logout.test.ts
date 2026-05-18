/**
 * auth.logout.test.ts
 *
 * Tests for the auth.logout procedure.
 * After migrating to Supabase Auth, logout is handled client-side via
 * supabase.auth.signOut(). The server-side logout procedure simply returns
 * { success: true } for compatibility.
 */

import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { SupabaseUser } from "./lib/supabaseAdmin";

function createAuthContext(): { ctx: TrpcContext } {
  const user: SupabaseUser = {
    id: "sample-uuid-1234-5678",
    email: "sample@example.com",
    role: "user",
    user_metadata: {},
    app_metadata: {},
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("auth.logout", () => {
  it("returns success (Supabase Auth: logout is client-side)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
  });
});
