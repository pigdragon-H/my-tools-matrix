import { type ReactNode } from "react";
import { Redirect } from "wouter";
import { Loader2, Shield } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Wraps any /admin route. Redirects to /login if not authenticated,
 * shows an "access denied" screen if authenticated but not admin role.
 */
export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { lang } = useLanguage();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    const returnTo = encodeURIComponent(window.location.pathname);
    return <Redirect to={`/login?returnTo=${returnTo}`} />;
  }

  if (user.role !== "admin") {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Shield className="h-12 w-12 text-amber-500" />
        <h1 className="text-2xl font-bold">
          {lang === "zh" ? "權限不足" : "Access Denied"}
        </h1>
        <p className="max-w-md text-muted-foreground">
          {lang === "zh"
            ? "此頁面僅限管理員存取。如果您是管理員，請聯繫系統管理員開通權限。"
            : "This page is restricted to admins. Please contact the site owner if you believe this is an error."}
        </p>
        <p className="text-xs text-muted-foreground">
          {lang === "zh" ? "登入身分：" : "Signed in as: "}
          <code className="rounded bg-muted px-2 py-0.5">{user.email}</code>
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
