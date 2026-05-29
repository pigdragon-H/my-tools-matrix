import { Link } from "wouter";
import { ArrowRight, BookOpen, Feather, HeartHandshake, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const principles = [
  {
    title: "知",
    description: "整理公式、指標、工具用法與決策脈絡，讓知識能被查找、理解與重複使用。",
    icon: BookOpen,
  },
  {
    title: "行",
    description: "把知識落到可操作的計算器、流程與檢查點，協助使用者做出下一步行動。",
    icon: Feather,
  },
  {
    title: "樂趣",
    description: "讓工具不只是冷冰冰的表格，而是能陪伴學習、工作與生活探索的花園。",
    icon: Sprout,
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-blue-200/70 bg-[linear-gradient(135deg,#eff6ff_0%,#f5f3ff_48%,#fff7ed_100%)] dark:border-blue-950/60 dark:bg-slate-950">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-900/20">
              <HeartHandshake className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">關於我們</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              Formula Universe / 工具矩陣是一座 AI Native Knowledge Infrastructure，目標是把工具、公式、解釋、範例、限制與下一步行動串成可信任的決策入口。
            </p>
          </div>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-5xl space-y-8">
          <Card className="border-indigo-100 bg-white/90 shadow-xl shadow-indigo-900/5 dark:border-indigo-950/60 dark:bg-white/5">
            <CardContent className="p-7 md:p-10">
              <h2 className="text-3xl font-bold tracking-tight">為什麼建立工具矩陣</h2>
              <div className="mt-5 space-y-4 text-base leading-8 text-muted-foreground">
                <p>
                  在財務、健康、開發、學習與日常規劃中，人們經常需要快速查公式、估算結果、理解限制，並把結果轉成具體決策。工具矩陣存在的目的，就是把這些分散需求整理成可重複使用的知識與工具系統。
                </p>
                <p>
                  我們不把首頁當成單純的工具清單，而是把它設計成使用者意圖的入口：從問題開始，進入合適的工具、知識文章、決策路徑與下一步行動。
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 md:grid-cols-3">
            {principles.map(({ title, description, icon: Icon }) => (
              <Card key={title} className="bg-white/90 dark:bg-white/5">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:border-blue-950/60 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-950">
            <CardContent className="p-7 md:p-10">
              <h2 className="text-3xl font-bold tracking-tight">我們正在建立什麼</h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground">
                這裡會逐步擴展為涵蓋財經投資、健康生活、職場效率、開發工具、教育學習、法律法規、創意設計、科學工程、語言文字、電商零售、旅遊地理與 AI 工具的知識宇宙。每個工具都會保留公式、解釋、範例、限制與語意位置，讓未來能接上 AI 分析與更完整的知識探索。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="gap-2">
                  <Link href="/tools/health/bmi-calculator">
                    從 BMI 工具開始 <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/blog">
                    前往知識庫 <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
