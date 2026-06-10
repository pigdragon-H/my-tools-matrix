import { useEffect } from "react";
import { Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustStrip } from "@/components/business/TrustStrip";
import { useLanguage } from "@/contexts/LanguageContext";
import { setSeoMeta } from "@/lib/seo";

export default function Contact() {
  const { lang } = useLanguage();
  const lastUpdated = "2025-01-15";

  useEffect(() => {
    setSeoMeta({
      title: lang === "zh" ? "聯絡我們｜Formula Universe" : "Contact Us | Formula Universe",
      description:
        lang === "zh"
          ? "聯絡 Formula Universe 團隊：內容更正、工具建議、合作與隱私相關請求。"
          : "Contact the Formula Universe team for corrections, tool suggestions, partnerships, and privacy-related requests.",
    });
  }, [lang]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-muted/30">
        <div className="container py-12 md:py-16">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
            {lang === "zh" ? "聯絡與回饋" : "Contact & Feedback"}
          </p>
          <h1 className="mt-3 text-3xl font-black md:text-5xl">
            {lang === "zh" ? "聯絡 Formula Universe" : "Contact Formula Universe"}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
            {lang === "zh"
              ? "如果您發現公式錯誤、資料來源需更新、工具結果異常，或希望提出合作與隱私請求，請透過下方信箱聯絡。我們會依內容風險與影響範圍排序處理。"
              : "If you find a formula error, outdated source, unexpected tool result, or want to submit a partnership or privacy request, contact us using the email below. We prioritize issues by risk and user impact."}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {lang === "zh" ? "最後更新" : "Last updated"}: {lastUpdated} · Formula Universe Editorial Team
          </p>
        </div>
      </section>

      <section className="container grid gap-5 py-10 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Mail className="mb-2 h-6 w-6 text-blue-600" />
            <CardTitle>{lang === "zh" ? "一般聯絡" : "General contact"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>{lang === "zh" ? "工具建議、錯誤回報、商務合作與一般問題。" : "Tool suggestions, bug reports, partnerships, and general questions."}</p>
            <a className="font-bold text-blue-700 hover:underline dark:text-blue-300" href="mailto:hello@formulauniverse.dev">hello@formulauniverse.dev</a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MessageSquare className="mb-2 h-6 w-6 text-emerald-600" />
            <CardTitle>{lang === "zh" ? "內容更正" : "Content corrections"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            {lang === "zh"
              ? "請附上頁面 URL、問題描述、建議修正與可查證來源。我們會優先處理醫療、財務、法律與安全相關內容。"
              : "Please include the page URL, issue description, suggested correction, and verifiable source. We prioritize medical, financial, legal, and safety-related content."}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <ShieldCheck className="mb-2 h-6 w-6 text-violet-600" />
            <CardTitle>{lang === "zh" ? "隱私請求" : "Privacy requests"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            {lang === "zh"
              ? "若要詢問資料、Cookie、刪除請求或其他隱私事項，請在主旨標註 Privacy Request，以便我們辨識與回覆。"
              : "For data, cookie, deletion, or other privacy matters, include Privacy Request in the subject so we can identify and respond appropriately."}
          </CardContent>
        </Card>
      </section>

      <TrustStrip lang={lang} variant="compact" />
    </div>
  );
}
