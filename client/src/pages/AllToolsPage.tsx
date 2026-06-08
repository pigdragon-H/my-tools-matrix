// ============================================================
// AllToolsPage - /tools 全站工具總覽（樞紐頁）
// 修復 Navbar「查看所有工具」連結指向空白頁的瑕疵
// 同時作為 SEO 內部連結樞紐與 AdSense 豐富內容頁
// ============================================================

import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@shared/categoriesConfig";
import { tools } from "@shared/toolsConfig";
import { CategoryIcon } from "@/components/CategoryIcon";
import { setSeoMeta } from "@/lib/seo";

// 預先計算每個分類的工具數量（動態，新增工具自動更新）
const toolCountByCategory: Record<string, number> = {};
for (const tool of tools) {
  toolCountByCategory[tool.category] = (toolCountByCategory[tool.category] ?? 0) + 1;
}

export default function AllToolsPage() {
  useEffect(() => {
    setSeoMeta({
      title: "全部工具｜Formula Universe",
      description: `Formula Universe 全站 ${tools.length}+ 個上線工具，橫跨 ${categories.length} 大知識領域：財經、健康、開發、教育、法律、設計、科學、語言、電商、旅遊與 AI。免費、快速、適合台灣使用情境的線上計算與決策輔助工具。`,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="border-b border-border bg-[linear-gradient(135deg,#eff6ff_0%,#f5f3ff_45%,#ecfeff_100%)] dark:bg-slate-950 dark:border-blue-950/60">
        <div className="container py-12">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回首頁
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-background/80 p-3 text-blue-600">
              <Layers className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">全部工具</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                全站 <span className="font-bold text-blue-700 dark:text-blue-300">{tools.length}+</span> 個上線工具，橫跨 {categories.length} 大知識領域。選擇一個領域，探索為真實決策情境設計的線上工具。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 領域卡片網格 ──────────────────────────────────── */}
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, idx) => {
            const count = toolCountByCategory[cat.key] ?? 0;
            const seq = String(idx + 1).padStart(2, "0");
            return (
              <Link key={cat.key} href={`/category/${cat.key}`}>
                <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-xl p-3 ${cat.bgColor} ${cat.color}`}>
                      <CategoryIcon iconName={cat.icon} className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-black text-muted-foreground">{seq}</span>
                  </div>
                  <h2 className="mt-4 text-lg font-bold group-hover:text-primary transition-colors">
                    {cat.name}
                    <span className="ml-2 text-sm font-medium text-primary">({count})</span>
                  </h2>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{cat.nameEn}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground line-clamp-2">{cat.description}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
                    前往領域 <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
