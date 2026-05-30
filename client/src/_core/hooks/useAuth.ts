import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: "user" | "editor" | "admin";
  lastSignInAt: string | null;
  createdAt: string | null;
};

function mapSupabaseUser(user: User): AuthUser {
  const appRole = (user.app_metadata as any)?.role;
  const metaRole = (user.user_metadata as any)?.role;
  const rawRole = appRole ?? metaRole ?? "user";
  const role: "user" | "editor" | "admin" =
    rawRole === "admin" || rawRole === "editor" ? rawRole : "user";
  const name =
    (user.user_metadata as any)?.full_name ??
    (user.user_metadata as any)?.name ??
    user.email?.split("@")[0] ??
    null;
  return {
    id: user.id,
    email: user.email ?? null,
    name,
    role,
    lastSignInAt: user.last_sign_in_at ?? null,
    createdAt: user.created_at ?? null,
  };
}

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;
    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, loading, user]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    logout,
    refresh: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
    },
  };
}
