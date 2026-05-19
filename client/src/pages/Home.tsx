// ============================================================
// Home - 工具矩陣首頁
// 顯示 12 個分類卡片（非工具列表）
// ============================================================

import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categories } from "@shared/categoriesConfig";
import { getToolsByCategory } from "@shared/toolsConfig";
import { CategoryIcon } from "@/components/CategoryIcon";
import { defaultSeo, setSeoMeta } from "@/lib/seo";

export default function Home() {
  useEffect(() => {
    setSeoMeta(defaultSeo);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Hero Section ────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container py-20 md:py-28">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4 text-xs font-medium">
              MVP 版本 · 持續更新中
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              工具矩陣
              <span className="block text-primary">讓每個決策都有數據支撐</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl">
              集結財經、健康、職場等 12 大領域的精準計算工具。免費使用，即時計算，
              幫助你在人生的每個重要時刻做出更明智的決策。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/tools/finance">
                  開始使用 <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/blog">閱讀文章</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </section>

      {/* ── Features Bar ────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="container py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Zap, title: "即時計算", desc: "所有工具在瀏覽器本地運算，無需等待" },
              { icon: Shield, title: "隱私安全", desc: "資料不上傳，計算完全在你的裝置上" },
              { icon: BarChart3, title: "視覺化輸出", desc: "圖表與表格讓結果一目了然" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 py-2">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12 Categories Grid ──────────────────────────────── */}
      <section className="container py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">選擇你需要的工具類別</h2>
          <p className="mt-2 text-muted-foreground">
            12 大領域，每個類別都有專業計算工具等你探索
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((cat) => {
            const catTools = getToolsByCategory(cat.key);
            const featuredTools = catTools.slice(0, 3);
            const toolCount = catTools.length;

            return (
              <Link key={cat.key} href={`/tools/${cat.key}`}>
                <div
                  className={`group relative rounded-xl border border-border p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md cursor-pointer h-full ${cat.bgColor}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`rounded-lg p-2 bg-background/80 ${cat.color}`}>
                      <CategoryIcon iconName={cat.icon} className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {toolCount > 0 ? `${toolCount} 個工具` : "即將推出"}
                    </Badge>
                  </div>

                  {/* Category name */}
                  <h3 className="font-semibold text-base mb-1">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {cat.description}
                  </p>

                  {/* Featured tools preview */}
                  {featuredTools.length > 0 && (
                    <ul className="space-y-1">
                      {featuredTools.map((tool) => (
                        <li
                          key={tool.id}
                          className="text-xs text-muted-foreground flex items-center gap-1.5"
                        >
                          <span className="h-1 w-1 rounded-full bg-current opacity-50 shrink-0" />
                          <span className="truncate">{tool.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {toolCount === 0 && (
                    <p className="text-xs text-muted-foreground italic">開發中，敬請期待</p>
                  )}

                  {/* Arrow indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className={`h-4 w-4 ${cat.color}`} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border bg-muted/20">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary">工具矩陣</span>
              <span className="text-xs text-muted-foreground">讓每個決策都有數據支撐</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <Link href="/blog" className="hover:text-foreground transition-colors">
                部落格
              </Link>
              <Link href="/tools/finance" className="hover:text-foreground transition-colors">
                財經工具
              </Link>
              <Link href="/tools/health" className="hover:text-foreground transition-colors">
                健康工具
              </Link>
              <span className="text-border">|</span>
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
                隱私權政策
              </Link>
              <Link href="/terms-of-service" className="hover:text-foreground transition-colors">
                服務條款
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
