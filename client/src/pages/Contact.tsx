import { useEffect } from "react";
import { Mail, MessageSquare, ShieldCheck, Bug, Briefcase, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustStrip } from "@/components/business/TrustStrip";
import { useLanguage } from "@/contexts/LanguageContext";
import { setSeoMeta } from "@/lib/seo";

export default function Contact() {
  const { lang } = useLanguage();
  const lastUpdated = "2026-06-10";
  const contactEmail = "pigragonh@gmail.com";

  useEffect(() => {
    setSeoMeta({
      title: lang === "zh" ? "聯絡我們｜Formula Universe" : "Contact Us | Formula Universe",
      description:
        lang === "zh"
          ? "聯絡 Formula Universe：工具錯誤、內容更正、合作、隱私請求、AdSense 或聯盟揭露相關問題。"
          : "Contact Formula Universe for tool errors, content corrections, partnerships, privacy requests, AdSense, or affiliate disclosure questions.",
    });
  }, [lang]);

  const cards = [
    {
      icon: Mail,
      title: lang === "zh" ? "一般聯絡" : "General contact",
      body: lang === "zh" ? "工具建議、一般問題、網站使用回饋或其他無法歸類的訊息。" : "Tool suggestions, general questions, site feedback, or messages that do not fit another category.",
    },
    {
      icon: Bug,
      title: lang === "zh" ? "工具錯誤回報" : "Tool error reports",
      body: lang === "zh" ? "請附上頁面 URL、輸入範例、預期結果、實際結果、截圖或可查證來源。醫療、財務、法律與安全相關問題會優先處理。" : "Include the page URL, sample input, expected result, actual result, screenshots, or verifiable sources. Medical, financial, legal, and safety-related issues are prioritized.",
    },
    {
      icon: MessageSquare,
      title: lang === "zh" ? "內容更正" : "Content corrections",
      body: lang === "zh" ? "若公式、定義、翻譯、資料來源或日期需要更新，請提供明確段落與可信來源。" : "If formulas, definitions, translations, sources, or dates need updates, provide the exact section and a reliable source.",
    },
    {
      icon: ShieldCheck,
      title: lang === "zh" ? "隱私請求" : "Privacy requests",
      body: lang === "zh" ? "資料查詢、刪除、Cookie、廣告或其他隱私事項，請在主旨標註 Privacy Request。" : "For access, deletion, cookie, advertising, or other privacy matters, include Privacy Request in the subject.",
    },
    {
      icon: Briefcase,
      title: lang === "zh" ? "合作與商務" : "Partnerships and business",
      body: lang === "zh" ? "合作、贊助、聯盟連結、資料授權或 Premium 方案討論，請清楚說明公司、網站、合作範圍與揭露需求。" : "For partnerships, sponsorships, affiliate links, data licensing, or Premium discussions, include your company, website, scope, and disclosure needs.",
    },
    {
      icon: Clock,
      title: lang === "zh" ? "回覆時程" : "Response time",
      body: lang === "zh" ? "我們通常會在 7 個工作日內回覆。複雜、需驗證或涉及第三方服務的問題可能需要更久。" : "We usually respond within 7 business days. Complex issues, verification, or third-party matters may take longer.",
    },
  ];

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
              ? "如果您發現公式錯誤、資料來源過期、工具結果異常、隱私問題、廣告或聯盟揭露疑問，請透過本頁信箱聯絡。我們會依風險、影響範圍與可驗證程度排序處理。"
              : "If you find a formula error, outdated source, unexpected tool result, privacy issue, or questions about ads or affiliate disclosures, contact us using the email on this page. We prioritize by risk, impact, and verifiability."}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {lang === "zh" ? "正式聯絡信箱" : "Official contact email"}: <a className="font-bold text-blue-700 hover:underline dark:text-blue-300" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {lang === "zh" ? "最後更新" : "Last updated"}: {lastUpdated} · Formula Universe Editorial Team
          </p>
        </div>
      </section>

      <section className="container grid gap-5 py-10 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="mb-2 h-6 w-6 text-blue-600" />
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p>{body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="container pb-14">
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black">{lang === "zh" ? "寄信前請包含哪些資訊？" : "What should you include?"}</h2>
          <div className="mt-5 grid gap-4 text-sm leading-7 text-muted-foreground md:grid-cols-2">
            <p>{lang === "zh" ? "請提供相關頁面 URL、問題類型、您看到的內容、您認為正確的內容、可查證來源，以及是否涉及健康、財務、法律或安全風險。" : "Include the relevant page URL, issue type, what you saw, what you believe is correct, verifiable sources, and whether it involves health, finance, legal, or safety risk."}</p>
            <p>{lang === "zh" ? "請不要在一般信件中提供不必要的敏感資料，例如身分證件、金融帳號、醫療紀錄、精確地址或密碼。" : "Do not include unnecessary sensitive information in general emails, such as government IDs, financial account numbers, medical records, precise addresses, or passwords."}</p>
          </div>
        </div>
      </section>

      <TrustStrip lang={lang} variant="compact" />
    </div>
  );
}
