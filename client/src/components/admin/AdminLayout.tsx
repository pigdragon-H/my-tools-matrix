import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  Activity,
  LogOut,
  Home,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

type NavItem = {
  href: string;
  icon: typeof LayoutDashboard;
  label: { zh: string; en: string };
  comingSoon?: boolean;
};

const NAV: NavItem[] = [
  {
    href: "/admin",
    icon: LayoutDashboard,
    label: { zh: "儀表板", en: "Dashboard" },
  },
  {
    href: "/admin/articles",
    icon: FileText,
    label: { zh: "知識庫文章", en: "Articles" },
  },
  {
    href: "/admin/settings",
    icon: Settings,
    label: { zh: "商業設定", en: "Business Settings" },
  },
  {
    href: "/admin/users",
    icon: Users,
    label: { zh: "用戶管理", en: "Users" },
    comingSoon: true,
  },
  {
    href: "/admin/health",
    icon: Activity,
    label: { zh: "系統健康", en: "System Health" },
    comingSoon: true,
  },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const [location] = useLocation();

  const isActive = (href: string) =>
    href === "/admin"
      ? location === "/admin"
      : location.startsWith(href);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-950/30">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-white dark:bg-slate-900">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-black">
              {lang === "zh" ? "後台管理" : "Admin"}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Formula Universe
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-blue-950/40"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label[lang]}</span>
                  {item.comingSoon && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                      }`}
                    >
                      {lang === "zh" ? "即將" : "Soon"}
                    </span>
                  )}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-3 px-2 text-xs">
            <div className="font-bold text-foreground">{user?.name}</div>
            <div className="truncate text-muted-foreground">{user?.email}</div>
            <div className="mt-1 inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              {user?.role}
            </div>
          </div>
          <div className="space-y-1">
            <Link href="/">
              <a className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                <Home className="h-3.5 w-3.5" />
                {lang === "zh" ? "回前台" : "Back to site"}
              </a>
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              {lang === "zh" ? "登出" : "Sign out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-30 flex items-center gap-2 overflow-x-auto border-b border-border bg-white px-4 py-2 dark:bg-slate-900">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label[lang]}
              </a>
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <main className="flex-1 min-w-0 pt-16 md:pt-0">
        <div className="container max-w-6xl py-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
