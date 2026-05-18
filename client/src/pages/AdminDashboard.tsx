import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllTools } from "../../../shared/toolsConfig";
import { categories } from "../../../shared/categoriesConfig";

// ── 小工具：格式化數字 ──────────────────────────────────────
function formatNum(n: number) {
  return n.toLocaleString("zh-TW");
}

// ── 工具名稱查詢 ────────────────────────────────────────────
const allTools = getAllTools();
function getToolName(toolId: string) {
  return allTools.find(t => t.id === toolId)?.name ?? toolId;
}

// ── 分類名稱查詢 ────────────────────────────────────────────
function getCategoryName(catId: string) {
  return categories.find(c => c.key === catId)?.name ?? catId;
}

// ── 色彩對應 ────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  finance: "bg-blue-500",
  health: "bg-green-500",
  productivity: "bg-purple-500",
  dev: "bg-orange-500",
  education: "bg-yellow-500",
  legal: "bg-red-500",
  design: "bg-pink-500",
  science: "bg-cyan-500",
  language: "bg-teal-500",
  ecommerce: "bg-indigo-500",
  travel: "bg-emerald-500",
  ai: "bg-violet-500",
};

// ── 統計卡片 ────────────────────────────────────────────────
function StatCard({ title, value, sub, loading }: {
  title: string;
  value: string | number;
  sub?: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── 主頁面 ──────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    document.title = "後台管理 | 工具矩陣";
  }, []);

  // 非 admin 導向首頁
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      navigate("/");
    }
  }, [authLoading, user, navigate]);

  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
    refetchInterval: 60_000, // 每分鐘自動刷新
  });

  const { data: recentCalcs, isLoading: recentLoading } = trpc.admin.recentCalculations.useQuery(
    { limit: 20 },
    { enabled: !!user && user.role === "admin" }
  );

  const { data: userList, isLoading: usersLoading } = trpc.admin.users.useQuery(
    { limit: 30 },
    { enabled: !!user && user.role === "admin" }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">載入中...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  // 計算最大值用於進度條
  const maxToolCount = stats?.toolRanking?.[0]?.count ?? 1;
  const maxCatCount = stats?.categoryBreakdown?.[0]?.count ?? 1;
  const maxTrend = Math.max(...(stats?.trendData?.map(d => d.count) ?? [1]), 1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">後台管理儀表板</h1>
            <p className="text-sm text-muted-foreground mt-1">
              工具使用統計 · 資料來源：{stats?.source === "supabase" ? "Supabase" : stats?.source === "mysql" ? "MySQL" : "無資料"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {user.name ?? "管理員"}
            </Badge>
            <Link href="/" className="text-sm text-primary hover:underline">
              ← 返回網站
            </Link>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="總計算次數"
            value={formatNum(stats?.totalCount ?? 0)}
            sub="所有工具累計"
            loading={statsLoading}
          />
          <StatCard
            title="今日計算次數"
            value={formatNum(stats?.todayCount ?? 0)}
            sub="今天 00:00 起"
            loading={statsLoading}
          />
          <StatCard
            title="活躍用戶數"
            value={formatNum(stats?.uniqueUsers ?? 0)}
            sub="已登入用戶"
            loading={statsLoading}
          />
          <StatCard
            title="工具總數"
            value={formatNum(allTools.length)}
            sub={`${categories.length} 個分類`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 工具使用排行 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">工具使用排行 Top 20</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : stats?.toolRanking?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">尚無計算記錄</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {stats?.toolRanking?.map((item, idx) => (
                    <div key={item.toolId} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-medium truncate">{getToolName(item.toolId)}</span>
                          <span className="text-xs text-muted-foreground ml-2 shrink-0">{formatNum(item.count)}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(item.count / maxToolCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 分類分佈 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">分類使用分佈</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : stats?.categoryBreakdown?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">尚無計算記錄</p>
              ) : (
                <div className="space-y-3">
                  {stats?.categoryBreakdown?.map(item => {
                    const pct = Math.round((item.count / (stats.totalCount || 1)) * 100);
                    const colorClass = (CATEGORY_COLORS as Record<string, string>)[item.category] ?? "bg-gray-500";
                    return (
                      <div key={item.category}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                            <span className="text-sm">{getCategoryName(item.category)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatNum(item.count)}</span>
                            <span className="text-xs">({pct}%)</span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colorClass} rounded-full transition-all`}
                            style={{ width: `${(item.count / maxCatCount) * 100}%` }}
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

        {/* 每日趨勢 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">最近 30 天每日計算趨勢</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : !stats?.trendData?.length ? (
              <p className="text-sm text-muted-foreground text-center py-6">尚無趨勢資料</p>
            ) : (
              <div className="flex items-end gap-1 h-24">
                {stats.trendData.map(d => {
                  const heightPct = (d.count / maxTrend) * 100;
                  return (
                    <div
                      key={d.date}
                      className="flex-1 flex flex-col items-center gap-1 group"
                      title={`${d.date}: ${d.count} 次`}
                    >
                      <div
                        className="w-full bg-primary/70 hover:bg-primary rounded-t transition-all cursor-default"
                        style={{ height: `${Math.max(heightPct, 4)}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
            {stats?.trendData && stats.trendData.length > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{stats.trendData[0]?.date}</span>
                <span>{stats.trendData[stats.trendData.length - 1]?.date}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 最近計算記錄 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">最近計算記錄</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : !recentCalcs?.length ? (
                <p className="text-sm text-muted-foreground text-center py-6">尚無計算記錄</p>
              ) : (
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground pb-2 border-b border-border">
                    <span>工具</span>
                    <span>分類</span>
                    <span>時間</span>
                  </div>
                  {recentCalcs.map(calc => (
                    <div key={calc.id} className="grid grid-cols-3 text-xs py-1.5 border-b border-border/50 last:border-0">
                      <span className="truncate text-foreground">{getToolName(calc.toolId)}</span>
                      <span className="text-muted-foreground">{getCategoryName(calc.category)}</span>
                      <span className="text-muted-foreground">
                        {new Date(calc.createdAt).toLocaleString("zh-TW", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 用戶列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">最近活躍用戶</CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : !userList?.length ? (
                <p className="text-sm text-muted-foreground text-center py-6">尚無用戶資料</p>
              ) : (
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground pb-2 border-b border-border">
                    <span>名稱</span>
                    <span>角色</span>
                    <span>最後登入</span>
                  </div>
                  {userList.map(u => (
                    <div key={u.id} className="grid grid-cols-3 text-xs py-1.5 border-b border-border/50 last:border-0 items-center">
                      <span className="truncate text-foreground">{u.name ?? "匿名"}</span>
                      <span>
                        <Badge
                          variant={u.role === "admin" ? "default" : "secondary"}
                          className="text-xs px-1.5 py-0"
                        >
                          {u.role === "admin" ? "管理員" : "用戶"}
                        </Badge>
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(u.lastSignedIn).toLocaleString("zh-TW", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 底部說明 */}
        <div className="mt-8 text-xs text-muted-foreground text-center">
          資料每 60 秒自動刷新 · 僅限管理員存取 ·
          <Link href="/privacy-policy" className="hover:text-foreground ml-1">隱私權政策</Link>
        </div>
      </div>
    </div>
  );
}
