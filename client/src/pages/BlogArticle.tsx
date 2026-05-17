// ============================================================
// BlogArticle - /blog/:category/:articleId 動態文章頁
// 支援三層 URL 結構，從 tRPC blog.getById 讀取 Markdown 內容
// ============================================================

import { useParams, Link } from "wouter";
import { ArrowLeft, Clock, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { getCategoryByKey } from "@shared/categoriesConfig";

export default function BlogArticle() {
  const { category, articleId } = useParams<{ category: string; articleId: string }>();

  const { data: article, isLoading, error } = trpc.blog.getById.useQuery(
    { id: articleId ?? "", category: category },
    { enabled: !!articleId }
  );

  if (isLoading) {
    return (
      <div className="container py-20 flex items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">載入文章中...</span>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg font-medium">找不到此文章</p>
        <p className="text-muted-foreground mt-2 text-sm">文章 ID：{articleId}</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href={category ? `/blog/${category}` : "/blog"}>返回文章列表</Link>
        </Button>
      </div>
    );
  }

  const catInfo = article.category ? getCategoryByKey(article.category) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/20">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors">首頁</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-foreground transition-colors">知識庫</Link>
            {catInfo && (
              <>
                <span>/</span>
                <Link href={`/blog/${article.category}`} className="hover:text-foreground transition-colors">
                  {catInfo.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground font-medium line-clamp-1 max-w-[200px]">
              {article.title}
            </span>
          </nav>
        </div>
      </div>

      <article className="container py-10 max-w-3xl">
        {/* Back button */}
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
          <Link href={category ? `/blog/${category}` : "/blog"}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {catInfo ? `${catInfo.name}文章` : "所有文章"}
          </Link>
        </Button>

        {/* Article header */}
        <header className="mb-8">
          {catInfo && (
            <Badge variant="secondary" className="mb-3">
              {catInfo.name}
            </Badge>
          )}
          <h1 className="text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">
            {article.title}
          </h1>
          <p className="mt-3 text-muted-foreground text-base leading-relaxed">
            {article.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {article.publishedAt}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              約 {article.readingTime} 分鐘閱讀
            </span>
          </div>
        </header>

        <Separator className="mb-8" />

        {/* Markdown content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
          prose-p:leading-relaxed prose-p:text-base
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:font-semibold
          prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
          prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:bg-muted prose-pre:border prose-pre:border-border
          prose-ul:my-4 prose-li:my-1
          prose-table:text-sm">
          <Streamdown>{article.content}</Streamdown>
        </div>

        <Separator className="my-10" />

        {/* CTA Section */}
        {article.toolPath && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-lg font-bold mb-2">立即免費試算</h2>
            <p className="text-muted-foreground text-sm mb-4">
              理論看完了，現在用工具實際試算你的數字吧！
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link href={article.toolPath}>
                前往計算工具
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* Back to category */}
        <div className="mt-8 text-center">
          <Button asChild variant="ghost">
            <Link href={category ? `/blog/${category}` : "/blog"}>
              ← 返回{catInfo ? `${catInfo.name}文章列表` : "所有文章"}
            </Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
