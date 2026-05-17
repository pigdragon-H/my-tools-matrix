// ============================================================
// BlogCategoryPage - /blog/:category
// 顯示特定分類的所有文章列表
// ============================================================

import { useParams, Link } from "wouter";
import { ArrowLeft, Clock, Calendar, ArrowRight, Loader2, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getCategoryByKey } from "@shared/categoriesConfig";
import { CategoryIcon } from "@/components/CategoryIcon";

export default function BlogCategoryPage() {
  const { category } = useParams<{ category: string }>();

  const catInfo = category ? getCategoryByKey(category) : null;

  const { data: articles, isLoading } = trpc.blog.listByCategory.useQuery(
    { category: category ?? "" },
    { enabled: !!category }
  );

  if (!catInfo) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg font-medium">找不到此分類</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/blog">返回知識庫</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/20">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">首頁</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-foreground transition-colors">知識庫</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{catInfo.name}</span>
          </nav>
        </div>
      </div>

      <div className="container py-10">
        {/* Back button */}
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4 mr-1" />
            所有分類
          </Link>
        </Button>

        {/* Category header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <CategoryIcon iconName={catInfo.icon} className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{catInfo.name}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{catInfo.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8 ml-14">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {isLoading ? "..." : `${articles?.length ?? 0} 篇文章`}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">載入文章中...</span>
          </div>
        ) : (articles ?? []).length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">此分類尚無文章，敬請期待。</p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/blog">瀏覽其他分類</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(articles ?? []).map((article) => (
              <Link key={article.id} href={`/blog/${category}/${article.id}`}>
                <Card className="group cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md h-full">
                  <CardHeader className="pb-3">
                    <Badge variant="secondary" className="w-fit text-xs mb-2">
                      {catInfo.name}
                    </Badge>
                    <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2 mt-1">
                      {article.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {article.publishedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readingTime} 分鐘
                        </span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
