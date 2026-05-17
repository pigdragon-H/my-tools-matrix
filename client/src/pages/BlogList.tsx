// ============================================================
// BlogList - /blog 知識庫首頁
// 顯示 12 個分類卡片，每張含文章數量與最新 3 篇標題
// ============================================================

import { Link } from "wouter";
import { BookOpen, ChevronRight, Loader2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { categories } from "@shared/categoriesConfig";
import { CategoryIcon } from "@/components/CategoryIcon";

export default function BlogList() {
  // 取得按分類分組的文章資料
  const { data: grouped, isLoading } = trpc.blog.listGroupedByCategory.useQuery();

  // 建立 category → 分組資料的 map，方便查詢
  const groupMap = new Map(
    (grouped ?? []).map((g) => [g.category, g])
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/20">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">首頁</Link>
            <span>/</span>
            <span className="text-foreground font-medium">知識庫</span>
          </nav>
        </div>
      </div>

      <div className="container py-10">
        {/* Page title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">知識庫</h1>
        </div>
        <p className="text-muted-foreground mb-10 ml-12">
          12 大領域的深度文章，每篇都附有免費計算工具，讓知識直接轉化為行動。
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">載入中...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat) => {
              const group = groupMap.get(cat.key);
              const count = group?.count ?? 0;
              const latest = group?.latest ?? [];

              return (
                <Link key={cat.key} href={`/blog/${cat.key}`}>
                  <Card className="h-full cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <CategoryIcon iconName={cat.icon} className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h2 className="font-semibold text-sm leading-tight">{cat.name}</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {count} 篇
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {latest.length > 0 ? (
                        <ul className="space-y-1.5">
                          {latest.map((article) => (
                            <li key={article.id} className="flex items-start gap-1.5">
                              <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed group-hover:text-foreground/80 transition-colors">
                                {article.title}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground/60 italic">
                          文章即將上線，敬請期待
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        查看所有文章
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
