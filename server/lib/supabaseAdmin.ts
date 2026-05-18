import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables"
  );
}

// Server-side Supabase client for JWT verification
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export type SupabaseUser = {
  id: string;
  email: string | null;
  role: "user" | "admin";
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

/**
 * Verify a Supabase JWT token from the Authorization header or cookie.
 * Returns the Supabase user if valid, null otherwise.
 */
export async function verifySupabaseToken(
  token: string
): Promise<SupabaseUser | null> {
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }

    const user = data.user;
    // Admin check: look at app_metadata.role (set via Supabase dashboard or SQL)
    // or user_metadata.role as fallback
    const appRole = (user.app_metadata as any)?.role;
    const metaRole = (user.user_metadata as any)?.role;
    const role: "user" | "admin" =
      appRole === "admin" || metaRole === "admin" ? "admin" : "user";

    return {
      id: user.id,
      email: user.email ?? null,
      role,
      user_metadata: user.user_metadata as Record<string, unknown>,
      app_metadata: user.app_metadata as Record<string, unknown>,
    };
  } catch (err) {
    console.warn("[Supabase Auth] Token verification failed:", err);
    return null;
  }
}
