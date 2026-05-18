/**
 * sdk.ts — Manus OAuth SDK (DEPRECATED)
 *
 * This file is kept as an empty stub to avoid breaking any residual imports.
 * Authentication has been migrated to Supabase Auth.
 * See server/lib/supabaseAdmin.ts for the new auth implementation.
 */

export const sdk = {
  // No-op: authentication is now handled by Supabase JWT verification in context.ts
  authenticateRequest: async (_req: unknown) => null,
};
