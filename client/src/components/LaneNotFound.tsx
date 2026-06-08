// ============================================================
// LaneNotFound — 賽道詳情頁找不到內容時的共用回退畫面
// ============================================================
// 沿用既有 ArticlePage 的「找不到」慣例（雙語 + 回上層按鈕），
// 不引入新的 404 頁，避免污染既有路由。只增不刪。
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export function LaneNotFound({
  backHref,
  backLabel,
}: {
  backHref: string;
  backLabel: { zh: string; en: string };
}) {
  const { lang } = useLanguage();
  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);
  return (
    <div className="container py-20 max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold tracking-tight">
        {t("找不到這篇內容", "Content not found")}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {t(
          "這篇內容可能尚未發布或網址有誤。",
          "This content may not be published yet or the URL is incorrect."
        )}
      </p>
      <Button asChild className="mt-6 gap-2">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" />
          {backLabel[lang]}
        </Link>
      </Button>
    </div>
  );
}
