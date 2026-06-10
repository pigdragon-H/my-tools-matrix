import { useState, useEffect } from "react";
import { Link, useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  Save,
  Send,
  Sparkles,
  Wand2,
  AlertCircle,
  CheckCircle2,
  Eye,
  Loader2,
  Trash2,
  FileText,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories } from "@shared/categoriesConfig";

type ArticleDraft = {
  id?: string;
  slug: string;
  locale: "zh" | "en";
  status:
    | "draft"
    | "in_review"
    | "needs_revision"
    | "published"
    | "rejected"
    | "archived";
  title: string;
  description: string;
  cover_image: string;
  content_mdx: string;
  ai_summary: string;
  ai_keywords: string[];
  category_key: string;
  tools_referenced: string[];
  tags: string[];
};

const empty: ArticleDraft = {
  slug: "",
  locale: "zh",
  status: "draft",
  title: "",
  description: "",
  cover_image: "",
  content_mdx: "# 標題\n\n寫點什麼...\n",
  ai_summary: "",
  ai_keywords: [],
  category_key: "",
  tools_referenced: [],
  tags: [],
};

export default function AdminArticleEditor() {
  const { lang } = useLanguage();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/admin/articles/:id");
  const id = match ? params?.id : undefined;
  const isNew = id === "new" || !id;

  const utils = trpc.useUtils();
  const aiStatus = trpc.articles.aiStatus.useQuery();
  const existing = trpc.articles.getById.useQuery(
    { id: id! },
    { enabled: Boolean(id) && !isNew }
  );

  const createM = trpc.articles.create.useMutation();
  const updateM = trpc.articles.update.useMutation();
  const publishM = trpc.articles.publish.useMutation();
  const archiveM = trpc.articles.archive.useMutation();
  const aiSummarizeM = trpc.articles.aiSummarize.useMutation();
  const aiDetectM = trpc.articles.aiDetectMachineTone.useMutation();
  const aiHumanizeM = trpc.articles.aiHumanize.useMutation();

  const [draft, setDraft] = useState<ArticleDraft>(empty);
  const [loaded, setLoaded] = useState(isNew);
  const [toast, setToast] = useState<{ kind: "ok" | "fail"; msg: string } | null>(
    null
  );
  const [machineToneResult, setMachineToneResult] = useState<{
    score: number;
    issues: { phrase: string; reason: string }[];
  } | null>(null);

  useEffect(() => {
    if (existing.data && !loaded) {
      setDraft({
        id: existing.data.id,
        slug: existing.data.slug,
        locale: existing.data.locale,
        status: existing.data.status,
        title: existing.data.title,
        description: existing.data.description ?? "",
        cover_image: existing.data.cover_image ?? "",
        content_mdx: existing.data.content_mdx ?? "",
        ai_summary: existing.data.ai_summary ?? "",
        ai_keywords: existing.data.ai_keywords ?? [],
        category_key: existing.data.category_key ?? "",
        tools_referenced: existing.data.tools_referenced ?? [],
        tags: existing.data.tags ?? [],
      });
      setLoaded(true);
    }
  }, [existing.data, loaded]);

  const flash = (kind: "ok" | "fail", msg: string) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const save = async () => {
    try {
      if (isNew || !draft.id) {
        const created = await createM.mutateAsync({
          slug: draft.slug,
          locale: draft.locale,
          status: draft.status,
          title: draft.title,
          description: draft.description,
          cover_image: draft.cover_image,
          content_mdx: draft.content_mdx,
          ai_summary: draft.ai_summary,
          ai_keywords: draft.ai_keywords,
          category_key: draft.category_key,
          tools_referenced: draft.tools_referenced,
          tags: draft.tags,
        });
        flash("ok", lang === "zh" ? "✅ 已新增" : "✅ Created");
        navigate(`/admin/articles/${created.id}`);
      } else {
        await updateM.mutateAsync({
          id: draft.id,
          ...draft,
        });
        flash("ok", lang === "zh" ? "✅ 已儲存" : "✅ Saved");
      }
      utils.articles.listAll.invalidate();
    } catch (e) {
      flash("fail", String(e));
    }
  };

  const publish = async () => {
    if (!draft.id) {
      await save();
      return;
    }
    try {
      await publishM.mutateAsync({ id: draft.id });
      flash("ok", lang === "zh" ? "✅ 已發布" : "✅ Published");
      setDraft({ ...draft, status: "published" });
      utils.articles.listAll.invalidate();
    } catch (e) {
      flash("fail", String(e));
    }
  };

  const archive = async () => {
    if (!draft.id) return;
    if (!confirm(lang === "zh" ? "封存這篇文章?" : "Archive this article?"))
      return;
    try {
      await archiveM.mutateAsync({ id: draft.id });
      utils.articles.listAll.invalidate();
      navigate("/admin/articles");
    } catch (e) {
      flash("fail", String(e));
    }
  };

  const runAiSummary = async () => {
    try {
      const res = await aiSummarizeM.mutateAsync({
        title: draft.title,
        content: draft.content_mdx,
        locale: draft.locale,
      });
      setDraft({
        ...draft,
        ai_summary: res.summary,
        ai_keywords: res.keywords,
      });
      flash("ok", lang === "zh" ? "✨ AI 摘要完成" : "✨ AI summary done");
    } catch (e) {
      flash("fail", String(e));
    }
  };

  const runMachineToneCheck = async () => {
    try {
      const res = await aiDetectM.mutateAsync({
        content: draft.content_mdx,
        locale: draft.locale,
      });
      setMachineToneResult(res);
      flash(
        res.score >= 7 ? "fail" : "ok",
        lang === "zh"
          ? `機械味分數: ${res.score}/10`
          : `Machine-tone score: ${res.score}/10`
      );
    } catch (e) {
      flash("fail", String(e));
    }
  };

  const runHumanize = async () => {
    try {
      const res = await aiHumanizeM.mutateAsync({
        text: draft.content_mdx,
        locale: draft.locale,
      });
      setDraft({ ...draft, content_mdx: res.rewritten });
      flash("ok", lang === "zh" ? "🧹 已人類化" : "🧹 Humanized");
    } catch (e) {
      flash("fail", String(e));
    }
  };

  if (!isNew && existing.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const aiReady = aiStatus.data?.anthropicConfigured;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link href="/admin/articles">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {lang === "zh" ? "返回列表" : "Back"}
            </Button>
          </Link>
          <h1 className="text-xl font-black flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isNew
              ? lang === "zh"
                ? "新增文章"
                : "New article"
              : draft.title || (lang === "zh" ? "(未命名)" : "(Untitled)")}
          </h1>
          <Badge
            variant={
              draft.status === "published"
                ? "default"
                : draft.status === "in_review"
                ? "secondary"
                : "outline"
            }
          >
            {draft.status}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={createM.isPending || updateM.isPending} className="gap-1">
            {createM.isPending || updateM.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {lang === "zh" ? "儲存" : "Save"}
          </Button>
          {!isNew && draft.status !== "published" && (
            <Button
              onClick={publish}
              disabled={publishM.isPending}
              className="gap-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {publishM.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {lang === "zh" ? "發布" : "Publish"}
            </Button>
          )}
          {!isNew && (
            <Button onClick={archive} variant="outline" size="icon" title={lang === "zh" ? "封存" : "Archive"}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {toast && (
        <Alert variant={toast.kind === "fail" ? "destructive" : "default"}>
          {toast.kind === "ok" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{toast.msg}</AlertDescription>
        </Alert>
      )}

      {!aiReady && (
        <Alert className="border-amber-300 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {lang === "zh"
              ? "ANTHROPIC_API_KEY 尚未設定。AI 摘要 / 機械味偵測 / 人類化等功能無法使用。"
              : "ANTHROPIC_API_KEY not set. AI features unavailable."}
          </AlertDescription>
        </Alert>
      )}

      {/* Frontmatter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {lang === "zh" ? "文章資訊" : "Frontmatter"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="title">{lang === "zh" ? "標題" : "Title"}</Label>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={draft.slug}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                })
              }
              className="font-mono text-xs"
              placeholder="my-article-slug"
            />
          </div>
          <div>
            <Label htmlFor="locale">
              {lang === "zh" ? "語言" : "Locale"}
            </Label>
            <select
              id="locale"
              value={draft.locale}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  locale: e.target.value as "zh" | "en",
                })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="zh">繁體中文 (zh)</option>
              <option value="en">English (en)</option>
            </select>
          </div>
          <div>
            <Label htmlFor="category">
              {lang === "zh" ? "工具分類" : "Tool category"}
            </Label>
            <select
              id="category"
              value={draft.category_key}
              onChange={(e) =>
                setDraft({ ...draft, category_key: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name} / {c.nameEn}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">
              {lang === "zh" ? "簡介 (給人類看)" : "Description (for humans)"}
            </Label>
            <Textarea
              id="description"
              rows={2}
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="cover">{lang === "zh" ? "封面圖 URL" : "Cover image URL"}</Label>
            <Input
              id="cover"
              value={draft.cover_image}
              onChange={(e) =>
                setDraft({ ...draft, cover_image: e.target.value })
              }
              className="font-mono text-xs"
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Editor + Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">
            {lang === "zh" ? "內文 (Markdown)" : "Content (Markdown)"}
          </CardTitle>
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={runAiSummary}
              disabled={!aiReady || aiSummarizeM.isPending}
              className="gap-1"
            >
              {aiSummarizeM.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              {lang === "zh" ? "AI 摘要" : "AI Summary"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={runMachineToneCheck}
              disabled={!aiReady || aiDetectM.isPending}
              className="gap-1"
            >
              {aiDetectM.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              {lang === "zh" ? "機械味" : "Machine-tone"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={runHumanize}
              disabled={!aiReady || aiHumanizeM.isPending}
              className="gap-1"
            >
              {aiHumanizeM.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Wand2 className="h-3 w-3" />
              )}
              {lang === "zh" ? "人類化" : "Humanize"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="edit">
            <TabsList>
              <TabsTrigger value="edit">{lang === "zh" ? "編輯" : "Edit"}</TabsTrigger>
              <TabsTrigger value="preview" className="gap-1">
                <Eye className="h-3 w-3" />
                {lang === "zh" ? "預覽" : "Preview"}
              </TabsTrigger>
              <TabsTrigger value="split">
                {lang === "zh" ? "並排" : "Split"}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <Textarea
                value={draft.content_mdx}
                onChange={(e) =>
                  setDraft({ ...draft, content_mdx: e.target.value })
                }
                className="min-h-[500px] font-mono text-sm"
              />
            </TabsContent>
            <TabsContent value="preview">
              <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border border-border bg-white p-4 dark:bg-slate-900 min-h-[500px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {draft.content_mdx || "_(empty)_"}
                </ReactMarkdown>
              </div>
            </TabsContent>
            <TabsContent value="split">
              <div className="grid gap-3 lg:grid-cols-2">
                <Textarea
                  value={draft.content_mdx}
                  onChange={(e) =>
                    setDraft({ ...draft, content_mdx: e.target.value })
                  }
                  className="min-h-[500px] font-mono text-sm"
                />
                <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border border-border bg-white p-4 dark:bg-slate-900 min-h-[500px] overflow-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {draft.content_mdx || "_(empty)_"}
                  </ReactMarkdown>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {machineToneResult && (
            <div className="mt-4 rounded-md border border-border bg-muted/30 p-3 text-sm">
              <div className="font-bold">
                {lang === "zh" ? "機械味檢測結果" : "Machine-tone analysis"}:{" "}
                <span
                  className={
                    machineToneResult.score >= 7
                      ? "text-red-600"
                      : machineToneResult.score >= 4
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }
                >
                  {machineToneResult.score}/10
                </span>
              </div>
              {machineToneResult.issues.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs">
                  {machineToneResult.issues.map((iss, i) => (
                    <li key={i}>
                      <code className="bg-amber-100 dark:bg-amber-950/40 px-1 rounded">
                        {iss.phrase}
                      </code>{" "}
                      — {iss.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            {lang === "zh" ? "AI 結構化欄位 (給 AI / RAG 用)" : "AI metadata (for AI / RAG)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="ai-summary">
              {lang === "zh" ? "AI 摘要" : "AI summary"}
            </Label>
            <Textarea
              id="ai-summary"
              rows={3}
              value={draft.ai_summary}
              onChange={(e) =>
                setDraft({ ...draft, ai_summary: e.target.value })
              }
              placeholder={
                lang === "zh"
                  ? "簡潔摘要,給 LLM 用。可點上方「AI 摘要」按鈕自動生成。"
                  : "Concise summary for LLM consumption. Click 'AI Summary' above to generate."
              }
            />
          </div>
          <div>
            <Label htmlFor="ai-kw">
              {lang === "zh" ? "關鍵詞 (用 , 分隔)" : "Keywords (comma-separated)"}
            </Label>
            <Input
              id="ai-kw"
              value={draft.ai_keywords.join(", ")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  ai_keywords: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="tags">
              {lang === "zh" ? "Tags (用 , 分隔)" : "Tags (comma-separated)"}
            </Label>
            <Input
              id="tags"
              value={draft.tags.join(", ")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  tags: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="tools">
              {lang === "zh"
                ? "關聯工具 ID (用 , 分隔, e.g. bmi-calculator)"
                : "Related tool IDs (comma-separated)"}
            </Label>
            <Input
              id="tools"
              value={draft.tools_referenced.join(", ")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  tools_referenced: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="font-mono text-xs"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
