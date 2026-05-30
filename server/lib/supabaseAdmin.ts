import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables. Auth will not work."
  );
}

// Public anon client — used to verify user JWTs from request headers.
export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Service-role client — full DB access, bypass RLS. Use only on server.
// Returns null if SUPABASE_SERVICE_ROLE_KEY is not set (so build doesn't crash).
export const supabaseService =
  supabaseServiceRoleKey && supabaseUrl
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

export type SupabaseUser = {
  id: string;
  email: string | null;
  role: "user" | "editor" | "admin";
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

/**
 * Verify a Supabase JWT token from the Authorization header.
 * Returns the user (with derived role) if valid, null otherwise.
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
    const appRole = (user.app_metadata as any)?.role;
    const metaRole = (user.user_metadata as any)?.role;
    const rawRole = appRole ?? metaRole ?? "user";
    const role: SupabaseUser["role"] =
      rawRole === "admin" || rawRole === "editor" ? rawRole : "user";

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
