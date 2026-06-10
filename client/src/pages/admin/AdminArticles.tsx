// ============================================================
// /admin/articles — list all articles (admin/editor)
// ============================================================
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  FileText,
  Plus,
  Sparkles,
  Bot,
  User as UserIcon,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { ARTICLE_STATUSES } from "@shared/const";
import { getCategoryLabel, normalizeBlogCategoryKey } from "@/lib/laneCategories";

type StatusFilter = "all" | (typeof ARTICLE_STATUSES)[number];

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  in_review:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  published:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200",
  archived: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

export default function AdminArticles() {
  const { lang } = useLanguage();
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<StatusFilter>("all");

  const listQuery = trpc.articles.listAll.useQuery({
    status: status === "all" ? undefined : status,
    limit: 100,
  });

  const items = listQuery.data ?? [];

  const counts = useMemo(() => {
    const acc: Record<string, number> = { all: items.length };
    for (const a of items) {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
    }
    return acc;
  }, [items]);

  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {t("知識庫文章", "Articles")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "撰寫、發布、與 AI 協作管理知識庫內容。所有文章都有狀態機:草稿 → 審核中 → 已發布。",
              "Write, publish, and collaborate with AI on knowledge base content. State machine: draft → in_review → published."
            )}
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => navigate("/admin/articles/new")}
        >
          <Plus className="h-4 w-4" />
          {t("新增文章", "New article")}
        </Button>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            {t("狀態", "Status")}
          </div>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as StatusFilter)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("全部", "All")} ({counts.all ?? 0})
              </SelectItem>
              {ARTICLE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s} ({counts[s] ?? 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {listQuery.isFetching && (
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t("載入中…", "Loading…")}
            </span>
          )}
        </CardContent>
      </Card>

      {/* Error state */}
      {listQuery.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("無法載入文章", "Failed to load articles")}</AlertTitle>
          <AlertDescription className="text-xs">
            {listQuery.error.message}
            <br />
            {t(
              "提示:這通常代表 Supabase 中的 articles 資料表尚未建立。請執行 Phase F 的 SQL migration。",
              "Hint: this usually means the articles table is not yet created in Supabase. Run the Phase F SQL migration."
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Empty state */}
      {!listQuery.error && items.length === 0 && !listQuery.isFetching && (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center space-y-3">
            <Sparkles className="h-10 w-10 mx-auto text-blue-500" />
            <h3 className="text-lg font-bold">
              {t("尚無文章", "No articles yet")}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t(
                "點擊「新增文章」開始撰寫,或使用 AI 助手協作。所有文章都會經過反機械語感檢測。",
                "Click 'New article' to start writing, or collaborate with the AI assistant. All articles pass through anti-machine-tone detection."
              )}
            </p>
            <Button
              className="gap-2"
              onClick={() => navigate("/admin/articles/new")}
            >
              <Plus className="h-4 w-4" />
              {t("新增文章", "New article")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {items.length > 0 && (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">
                    {t("標題", "Title")}
                  </th>
                  <th className="px-4 py-3 font-semibold w-[80px]">
                    {t("語言", "Locale")}
                  </th>
                  <th className="px-4 py-3 font-semibold w-[120px]">
                    {t("狀態", "Status")}
                  </th>
                  <th className="px-4 py-3 font-semibold w-[100px]">
                    {t("作者", "Author")}
                  </th>
                  <th className="px-4 py-3 font-semibold w-[160px]">
                    {t("更新時間", "Updated")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((a: any) => (
                  <tr
                    key={a.id}
                    className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                    onClick={() => navigate(`/admin/articles/${a.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{a.title || "(untitled)"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        /{a.slug}
                        {a.category_key ? ` · ${getCategoryLabel("blog", normalizeBlogCategoryKey(a.category_key))[lang]}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="uppercase">
                        {a.locale}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          STATUS_BADGE[a.status] ?? STATUS_BADGE.draft
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {a.ai_source ? (
                        <span className="inline-flex items-center gap-1 text-xs text-purple-700 dark:text-purple-300">
                          <Bot className="h-3 w-3" />
                          {a.ai_source}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <UserIcon className="h-3 w-3" />
                          {a.author_role ?? "human"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(a.updated_at ?? a.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Helper link */}
      <div className="text-xs text-muted-foreground">
        {t("公開 API:", "Public API:")}{" "}
        <Link
          href="/api/articles"
          className="underline text-blue-700 dark:text-blue-300"
        >
          /api/articles
        </Link>{" "}
        ·{" "}
        <Link
          href="/llms.txt"
          className="underline text-blue-700 dark:text-blue-300"
        >
          /llms.txt
        </Link>
      </div>
    </div>
  );
}
