import { Link } from "wouter";
import { FileText, Plus, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminArticles() {
  const { lang } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {lang === "zh" ? "知識庫文章" : "Articles"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "zh"
              ? "撰寫、發布、與 AI 協作管理知識庫內容。"
              : "Write, publish, and collaborate with AI on knowledge base content."}
          </p>
        </div>
        <Button disabled className="gap-2">
          <Plus className="h-4 w-4" />
          {lang === "zh" ? "新增文章" : "New article"}
        </Button>
      </div>

      <Card className="border-dashed">
        <CardContent className="p-10 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-blue-500" />
          <h2 className="mt-4 text-xl font-bold">
            {lang === "zh"
              ? "Phase E 將在此啟用"
              : "Phase E will activate this"}
          </h2>
          <p className="mt-2 max-w-xl mx-auto text-sm text-muted-foreground">
            {lang === "zh"
              ? "完整文章 CRUD、Markdown 編輯器、MDX 預覽、Claude Sonnet 4.6 AI 摘要、機械味偵測、人類化重寫、審核流程、AI 投稿 API。"
              : "Full article CRUD, Markdown editor, MDX preview, Claude Sonnet 4.6 AI summary, machine-tone detection, humanization rewrite, review workflow, AI submission API."}
          </p>
          <ul className="mt-4 inline-block text-left text-xs text-muted-foreground space-y-1">
            <li>✓ {lang === "zh" ? "Markdown / MDX 編輯器" : "Markdown / MDX editor"}</li>
            <li>✓ {lang === "zh" ? "Claude Sonnet 4.6 AI 摘要" : "Claude Sonnet 4.6 AI summary"}</li>
            <li>✓ {lang === "zh" ? "機械味偵測 + 人類化重寫" : "Machine-tone detection + humanization"}</li>
            <li>✓ {lang === "zh" ? "草稿 → 待審 → 已發布 流程" : "Draft → Review → Published workflow"}</li>
            <li>✓ {lang === "zh" ? "AI 投稿 API（給 Claude/GPT/SuperNinja）" : "AI submission API (Claude/GPT/SuperNinja)"}</li>
            <li>✓ {lang === "zh" ? "圖片上傳到 Supabase Storage" : "Image upload to Supabase Storage"}</li>
            <li>✓ {lang === "zh" ? "/api/articles 對 AI 公開" : "/api/articles public for AI"}</li>
            <li>✓ {lang === "zh" ? "/llms.txt 自動產生" : "/llms.txt auto-generated"}</li>
          </ul>
          <div className="mt-6">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                ← {lang === "zh" ? "回儀表板" : "Back to dashboard"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
