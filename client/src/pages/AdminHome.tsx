import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";

/**
 * Phase A placeholder — will be replaced by the real AdminLayout in Phase B.
 * Confirms login works and admin role is correctly detected.
 */
export default function AdminHome() {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();

  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            {lang === "zh" ? "後台管理（建構中）" : "Admin (under construction)"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {lang === "zh"
              ? "Phase A 完成：Auth 基建已就緒。Phase B 將加入完整側邊欄與分頁。"
              : "Phase A complete: auth wired. Phase B will add the full sidebar and tabs."}
          </p>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          {lang === "zh" ? "登出" : "Sign out"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {lang === "zh" ? "登入成功 — 帳號資訊" : "Signed in — Account info"}
          </CardTitle>
          <CardDescription>
            {lang === "zh"
              ? "下面欄位確認 Supabase JWT 與 admin role 解析正常。"
              : "These fields confirm Supabase JWT and admin role are parsed correctly."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="ID" value={user?.id ?? "—"} />
          <Row label="Email" value={user?.email ?? "—"} />
          <Row
            label={lang === "zh" ? "暱稱" : "Display name"}
            value={user?.name ?? "—"}
          />
          <Row label="Role" value={user?.role ?? "—"} highlight />
        </CardContent>
      </Card>

      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
        <strong>{lang === "zh" ? "下一步 (Phase B)：" : "Next (Phase B):"}</strong>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>{lang === "zh" ? "5 分頁側邊欄 (Dashboard / Articles / Settings / Users / Health)" : "Sidebar with 5 tabs"}</li>
          <li>{lang === "zh" ? "Phase 13 儀表板還原" : "Restore Phase 13 dashboard analytics"}</li>
          <li>{lang === "zh" ? "FeatureFlag / AdSense / Premium 設定面板" : "FeatureFlag / AdSense / Premium settings panel"}</li>
          <li>{lang === "zh" ? "知識庫文章 CRUD + Markdown 編輯器 + AI 摘要" : "Article CRUD + Markdown editor + AI summary"}</li>
        </ul>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-dashed pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <code
        className={`rounded px-2 py-0.5 font-mono ${
          highlight
            ? "bg-blue-600 text-white"
            : "bg-muted text-foreground"
        }`}
      >
        {value}
      </code>
    </div>
  );
}
