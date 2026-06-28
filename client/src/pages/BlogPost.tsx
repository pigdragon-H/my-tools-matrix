// ============================================================
// /blog/:slug — render published article from Supabase via tRPC.
// Falls back gracefully if article not found.
// ============================================================
import { useEffect } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { ArrowLeft, Calendar, Tag, Loader2 } from "lucide-react";
import { useReadProgress } from "@/hooks/useReadProgress";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustStrip } from "@/components/business/TrustStrip";
import { getStaticArticle } from "@/lib/staticArticles";
import { getCategoryLabel, normalizeBlogCategoryKey } from "@/lib/laneCategories";
import { StaticArticleView } from "./ArticlePage";
import { getToolById, getToolByPath, type Tool } from "@shared/toolsConfig";

export default function BlogPost() {
  const { lang } = useLanguage();
  const [, params] = useRoute<{ slug: string }>("/blog/:slug");
  const slug = params?.slug ?? "";
  const [, setLocation] = useLocation();

  // Static (MANUS-authored) article lookup by slug alone, ignoring category.
  // NOTE（修補 2026-06-29）：這個 fallback 原本會直接在 /blog/:slug 這個網址
  // 原地渲染跟 /blog/:category/:slug 一模一樣的內容。兩個網址各自的
  // <link rel="canonical"> 都指向自己，Google 因此把其中一個判定成
  // 「重複網頁；使用者未選取標準網頁」（GSC 實際看到的症狀）。
  // 修法：只要這篇文章有明確分類（category），代表它真正的標準網址是
  // /blog/<category>/<slug>，這裡一律轉址過去，不在裸 slug 網址重複渲染。
  // 只有極少數「真的沒有分類、裸 slug 本身就是正式網址」的根層級文章
  // （category 為空字串）才維持原地渲染。
  const staticArticle = getStaticArticle(undefined, slug);
  const staticArticleNeedsRedirect = Boolean(staticArticle?.category);

  useEffect(() => {
    if (staticArticle && staticArticleNeedsRedirect) {
      setLocation(`/blog/${staticArticle.category}/${staticArticle.slug}`, {
        replace: true,
      });
    }
  }, [staticArticle, staticArticleNeedsRedirect, setLocation]);

  // 已讀進度（純前端 localStorage）。靜態文章由 StaticArticleView 以 "blog-static"
  // 命名空間標記,這裡只負責 DB 文章的 "blog" 命名空間,避免重複/錯置。
  const { markRead } = useReadProgress("blog");
  useEffect(() => {
    if (slug && !staticArticle) markRead(slug);
  }, [slug, staticArticle, markRead]);

  const articleQuery = trpc.articles.getBySlug.useQuery(
    { slug, locale: lang },
    { enabled: !!slug && !staticArticle, retry: false }
  );

  if (staticArticle) {
    if (staticArticleNeedsRedirect) {
      // 轉址中：不渲染重複內容，避免短暫閃現跟目標頁一樣的內容。
      return null;
    }
    return <StaticArticleView article={staticArticle} />;
  }

  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);

  if (articleQuery.isLoading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-4 t-small text-muted-foreground">
          {t("載入文章中…", "Loading article…")}
        </p>
      </div>
    );
  }

  const article = articleQuery.data as any;

  if (!article) {
    return (
      <div className="fu-typo container py-20 max-w-2xl mx-auto text-center">
        <h1 className="t-h2 tracking-tight">
          {t("找不到這篇文章", "Article not found")}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {t(
            "這篇文章可能尚未發布或網址有誤。",
            "This article may not be published yet or the URL is incorrect."
          )}
        </p>
        <Button asChild className="mt-6 gap-2">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4" />
            {t("回到工具知識庫", "Back to Tool Knowledge")}
          </Link>
        </Button>
      </div>
    );
  }

  const publishedAt = article.published_at
    ? new Date(article.published_at).toLocaleDateString()
    : "—";

  // Safety gate for public article pages:
  // DB seed/sample content may contain raw internal routes (e.g. /admin/articles).
  // Never expose admin/API/login routes or raw route strings publicly. Only render
  // real tools resolved from toolsConfig, with friendly names.
  const blockedPublicPrefixes = ["/admin", "/api", "/login", "/auth", "/_", "/internal"];
  const safeReferencedTools: Tool[] = Array.isArray(article.tools_referenced)
    ? article.tools_referenced
        .map((raw: unknown) => (typeof raw === "string" ? raw.trim() : ""))
        .filter((href: string) =>
          href && !blockedPublicPrefixes.some((prefix) => href.startsWith(prefix))
        )
        .map((href: string) => getToolByPath(href) || getToolById(href))
        .filter((tool: Tool | undefined): tool is Tool => Boolean(tool))
    : [];

  return (
    <div className="fu-typo">
      <article className="container py-12 md:py-16 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-6 gap-2 -ml-3">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4" />
            {t("回到工具知識庫", "Back to Tool Knowledge")}
          </Link>
        </Button>

        {article.cover_image && (
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full aspect-[16/9] object-cover rounded-2xl mb-8 shadow"
          />
        )}

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="uppercase">
              {article.locale}
            </Badge>
            {article.category_key && (
              <Badge variant="secondary">{getCategoryLabel("blog", normalizeBlogCategoryKey(article.category_key))[lang]}</Badge>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {publishedAt}
            </span>
          </div>

          <h1 className="t-h1 font-black tracking-tight">
            {article.title}
          </h1>

          {article.description && (
            <p className="t-lead text-muted-foreground">
              {article.description}
            </p>
          )}

          {article.ai_summary && (
            <Card className="bg-blue-50/60 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
              <CardContent className="p-4 text-sm">
                <div className="font-bold text-blue-700 dark:text-blue-300 mb-1">
                  {t("AI 摘要", "AI summary")}
                </div>
                <p className="leading-7">{article.ai_summary}</p>
              </CardContent>
            </Card>
          )}
        </header>

        <div className="prose prose-blue dark:prose-invert max-w-none mt-10 prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:leading-8 prose-p:text-[1.0625rem] prose-li:text-[1.0625rem] prose-p:leading-[1.75]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content_mdx ?? ""}
          </ReactMarkdown>
        </div>

        {Array.isArray(article.tags) && article.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {article.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {safeReferencedTools.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-muted-foreground mb-2">
              {t("相關工具", "Related tools")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {safeReferencedTools.map((tool) => (
                <Button key={tool!.id} asChild variant="outline" size="sm">
                  <Link href={tool!.path}>{tool!.name}</Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </article>

      <TrustStrip lang={lang} variant="default" />
    </div>
  );
}
