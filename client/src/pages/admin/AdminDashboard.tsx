import { useMemo } from "react";
import { Link } from "wouter";
import {
  Calculator,
  Layers,
  TrendingUp,
  Users as UsersIcon,
  Activity,
  Sparkles,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function formatNum(n: number) {
  return n.toLocaleString("zh-TW");
}

function formatRelative(iso: string | null, lang: "zh" | "en") {
  if (!iso) return lang === "zh" ? "—" : "—";
  const ts = new Date(iso).getTime();
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return lang === "zh" ? "剛剛" : "just now";
  if (min < 60)
    return lang === "zh" ? `${min} 分鐘前` : `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return lang === "zh" ? `${hr} 小時前` : `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return lang === "zh" ? `${day} 天前` : `${day} d ago`;
  return new Date(iso).toLocaleDateString(lang === "zh" ? "zh-TW" : "en-US");
}

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  loading,
  highlight,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: typeof Calculator;
  loading?: boolean;
  highlight?: boolean;
}) {
  return (
    <Card
      className={
        highlight
          ? "border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-900/60 dark:from-blue-950/40 dark:to-indigo-950/30"
          : ""
      }
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-black text-foreground">
              {typeof value === "number" ? formatNum(value) : value}
            </div>
            {sub && (
              <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { lang } = useLanguage();

  const stats = trpc.admin.stats.useQuery();
  const ranking = trpc.admin.toolRanking.useQuery({ limit: 20 });
  const distribution = trpc.admin.categoryDistribution.useQuery();
  const trend = trpc.admin.dailyTrend.useQuery({ days: 30 });

  const trendMax = useMemo(() => {
    if (!trend.data) return 1;
    return Math.max(1, ...trend.data.map((d) => d.count));
  }, [trend.data]);

  const noDataYet = !stats.isLoading && (stats.data?.totalUsage ?? 0) === 0;

  return (
    <div className="space-y-6">
      {/* Header with last sign-in */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            {lang === "zh" ? "儀表板" : "Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "zh"
              ? "工具使用、用戶與內容的全站總覽。"
              : "Tools, users, and content overview."}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{lang === "zh" ? "本次登入" : "Signed in"}</span>
          </div>
          <div className="mt-0.5 font-mono font-bold">
            {formatRelative(user?.lastSignInAt ?? null, lang)}
          </div>
          {user?.email && (
            <div className="mt-0.5 truncate text-muted-foreground">
              {user.email}
            </div>
          )}
        </div>
      </div>

      {noDataYet && (
        <Card className="border-amber-300 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-amber-900 dark:text-amber-200">
                {lang === "zh"
                  ? "尚未接收到工具使用紀錄"
                  : "No tool usage data yet"}
              </p>
              <p className="mt-1 text-amber-800 dark:text-amber-300">
                {lang === "zh"
                  ? "Supabase 的 calculation_history 資料表會在 Phase F 建立。建立後此頁將自動填入真實數據。"
                  : "The calculation_history table will be created in Phase F. Once created, this page will auto-populate with real data."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title={lang === "zh" ? "總工具數" : "Tools"}
          value={stats.data?.totalTools ?? 0}
          icon={Calculator}
          loading={stats.isLoading}
        />
        <StatCard
          title={lang === "zh" ? "分類數" : "Categories"}
          value={stats.data?.totalCategories ?? 0}
          icon={Layers}
          loading={stats.isLoading}
        />
        <StatCard
          title={lang === "zh" ? "總計算次數" : "Total Calculations"}
          value={stats.data?.totalUsage ?? 0}
          icon={TrendingUp}
          loading={stats.isLoading}
          highlight
        />
        <StatCard
          title={lang === "zh" ? "今日計算" : "Today"}
          value={stats.data?.todayUsage ?? 0}
          icon={Activity}
          loading={stats.isLoading}
        />
        <StatCard
          title={lang === "zh" ? "總用戶數" : "Users"}
          value={stats.data?.totalUsers ?? 0}
          icon={UsersIcon}
          loading={stats.isLoading}
        />
        <StatCard
          title={lang === "zh" ? "今日新增" : "New Today"}
          value={stats.data?.todayUsers ?? 0}
          icon={Sparkles}
          loading={stats.isLoading}
        />
      </div>

      {/* Daily trend sparkline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {lang === "zh" ? "最近 30 天計算趨勢" : "Last 30 days trend"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trend.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="flex h-24 items-end gap-1">
              {(trend.data ?? []).map((d) => (
                <div
                  key={d.date}
                  className="flex-1 rounded-t bg-blue-500/80 transition hover:bg-blue-600"
                  style={{
                    height: `${Math.max(2, (d.count / trendMax) * 100)}%`,
                  }}
                  title={`${d.date}: ${d.count}`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-column: ranking + category distribution */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {lang === "zh" ? "工具使用排行 Top 20" : "Top 20 tools"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ranking.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (ranking.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {lang === "zh" ? "尚無使用紀錄。" : "No usage data yet."}
              </p>
            ) : (
              <ol className="space-y-1.5 text-sm">
                {ranking.data!.map((r, i) => (
                  <li
                    key={r.toolId}
                    className="flex items-center justify-between gap-3 rounded-md px-2 py-1 hover:bg-muted/50"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="w-5 text-right font-mono text-xs text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="truncate font-medium">{r.toolId}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {r.category}
                      </Badge>
                    </span>
                    <span className="font-mono font-bold text-blue-600">
                      {formatNum(r.count)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {lang === "zh" ? "分類使用分佈" : "Category distribution"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {distribution.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {(distribution.data ?? []).map((c) => {
                  const max = Math.max(
                    1,
                    ...(distribution.data ?? []).map((x) => x.count)
                  );
                  const pct = (c.count / max) * 100;
                  return (
                    <div key={c.key} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {lang === "zh" ? c.name : c.nameEn}
                        </span>
                        <span className="font-mono text-muted-foreground">
                          {formatNum(c.count)}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded bg-muted">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {lang === "zh" ? "快速操作" : "Quick actions"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Link href="/admin/articles">
            <a className="rounded-lg border border-border bg-white p-3 text-sm transition hover:border-blue-400 hover:shadow-sm dark:bg-slate-900">
              <div className="font-bold">
                📝 {lang === "zh" ? "新增文章" : "New article"}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {lang === "zh"
                  ? "撰寫或讓 AI 起草知識庫文章"
                  : "Write or have AI draft an article"}
              </div>
            </a>
          </Link>
          <Link href="/admin/settings">
            <a className="rounded-lg border border-border bg-white p-3 text-sm transition hover:border-blue-400 hover:shadow-sm dark:bg-slate-900">
              <div className="font-bold">
                ⚙️ {lang === "zh" ? "商業設定" : "Business settings"}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {lang === "zh"
                  ? "FeatureFlag / AdSense / Premium 訂價"
                  : "FeatureFlag / AdSense / Premium pricing"}
              </div>
            </a>
          </Link>
          <Link href="/admin/users">
            <a className="rounded-lg border border-border bg-white p-3 text-sm transition hover:border-blue-400 hover:shadow-sm dark:bg-slate-900">
              <div className="font-bold">
                👥 {lang === "zh" ? "用戶管理" : "Users"}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {lang === "zh" ? "(Phase E.8)" : "(Phase E.8)"}
              </div>
            </a>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
