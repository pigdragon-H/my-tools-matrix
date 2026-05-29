import { Link } from "wouter";
import { ArrowRight, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categories } from "@shared/categoriesConfig";
import { CategoryIcon } from "@/components/CategoryIcon";

const featuredGuides = [
  {
    title: "BMI 與 BMR：健康規劃的起點",
    description: "理解身體質量指數與基礎代謝率如何輔助熱量、體重與日常健康決策。",
    href: "/tools/health/bmi-calculator",
  },
  {
    title: "CAGR 與複利：投資成長的核心公式",
    description: "用年化成長率與複利觀念建立投資報酬、退休金與資產配置的基本脈絡。",
    href: "/tools/finance/cagr-calculator",
  },
  {
    title: "JSON、Regex、API：開發者常用工作流",
    description: "從資料清理、格式驗證到 API 檢查，整理開發者工具的實用使用場景。",
    href: "/category/developer",
  },
];

export default function BlogList() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-blue-200/70 bg-[linear-gradient(135deg,#eff6ff_0%,#f5f3ff_48%,#ecfeff_100%)] dark:border-blue-950/60 dark:bg-slate-950">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/20">
              <BookOpen className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">知識庫</h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
              從公式、工具、範例與限制說明開始，把每一次計算延伸成可理解、可行動的知識脈絡。
            </p>
          </div>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">推薦閱讀路徑</h2>
            <p className="mt-3 text-muted-foreground">
              先從常用決策場景開始，搭配對應工具，把概念立即轉換成操作。
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2 md:self-auto">
            <Link href="/">
              回首頁 <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featuredGuides.map((guide) => (
            <Link key={guide.title} href={guide.href}>
              <Card className="h-full cursor-pointer border-blue-100 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-blue-950/60 dark:bg-white/5">
                <CardContent className="p-6">
                  <FileText className="mb-5 h-7 w-7 text-blue-600" />
                  <h3 className="text-xl font-bold">{guide.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{guide.description}</p>
                  <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
                    前往閱讀 / 使用工具 <ArrowRight className="h-4 w-4" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-blue-200/70 bg-blue-50/60 dark:border-blue-950/60 dark:bg-slate-950">
        <div className="container py-14 md:py-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">依知識領域探索</h2>
            <p className="mt-3 text-muted-foreground">
              12 大領域會逐步累積文章、公式解釋、工具範例與決策路徑。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat) => (
              <Link key={cat.key} href={`/category/${cat.key}`}>
                <Card className="h-full cursor-pointer bg-white/90 transition hover:-translate-y-1 hover:shadow-lg dark:bg-white/5">
                  <CardContent className="p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200">
                      <CategoryIcon iconName={cat.icon} className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold">{cat.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{cat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
