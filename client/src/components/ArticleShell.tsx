// ============================================================
// ArticleShell — 四賽道共用的內容渲染外殼（含 AdSense 商業骨架）
// ============================================================
//
// 設計目的（架構憲法 §四 / §八）：把「文章渲染 + 商業骨架」抽成單一
// 共用元件，藍圖 / 機會情報 / 知識中心三賽道（以及未來工作流）共用。
// 改一處，全站一致。
//
// 商業骨架（AdSense-ready，與既有 StaticArticleView 一致）：
//   #8 AdSlot(after-intro) → 正文上半 → #14 AdSlot(mid，段落邊界自動切)
//   → 正文下半 → 關鍵字 → AffiliateGrid → PremiumTeaser → NewsletterCta
//   → TrustStrip
//
// ── 給接手的 AI / 工程師（HANDOFF）─────────────────────────
//  • 任何賽道頁只要組好 ArticleShellProps 丟進來即可，不必各自重寫骨架。
//  • affiliateItems 依賽道/分類給；沒給就用 default（finance）。
//  • slotPrefix 讓不同賽道的廣告位 data-slot 可區分（如 "blueprint","opp"）。
//  • headerSlot / footerExtra 供賽道注入專屬區塊（如藍圖的「關聯工作流」）。
// ============================================================
import { useEffect, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/business/AdSlot";
import { AffiliateGrid, type AffiliateItem } from "@/components/business/AffiliateGrid";
import { PremiumTeaser } from "@/components/business/PremiumTeaser";
import { NewsletterCta } from "@/components/business/NewsletterCta";
import { TrustStrip } from "@/components/business/TrustStrip";
import { RelatedContent } from "@/components/business/RelatedContent";
import type { RelatedGroups } from "@/lib/laneContent";
import { setSeoMeta } from "@/lib/seo";
import { useReadProgress } from "@/hooks/useReadProgress";

export interface ArticleShellProps {
  /** 雙語標題。 */
  title: { zh: string; en: string };
  /** 雙語摘要。 */
  description: { zh: string; en: string };
  /** Markdown 正文（已去 frontmatter）。 */
  body: string;
  /** 發布日期 YYYY-MM-DD。 */
  publishedAt?: string;
  /** 分類 / 領域標籤（雙語顯示文字）。 */
  categoryLabel?: { zh: string; en: string };
  /** 關鍵字（顯示用）。 */
  keywords?: string[];
  /** 回上層 hub 的連結與文字。 */
  backHref: string;
  backLabel: { zh: string; en: string };
  /** 廣告位前綴（區分賽道）。 */
  slotPrefix: string;
  /** 賽道專屬聯盟卡片；不給用 default。 */
  affiliateItems?: AffiliateItem[];
  /** Newsletter 來源追蹤字串。 */
  newsletterSource: string;
  /** 標題下方注入（如工具連結卡）。 */
  headerSlot?: ReactNode;
  /** 正文之後、聯盟之前注入（如藍圖的「關聯工作流」區塊）。 */
  footerExtra?: ReactNode;
  /** [階段A] 已讀進度：進頁時把此 slug 標記為已讀（純前端）。 */
  readProgress?: { laneId: string; slug: string };

  // ── metadata 驅動商業層（per-article 覆寫；未設定 = 維持現狀） ──
  /** false = 本篇隱藏廣告位；未設定/true = 顯示（與全站 ENABLE_ADS 仍為 AND）。 */
  adsEnabled?: boolean;
  /** false = 本篇隱藏 PremiumTeaser；未設定/true = 顯示。 */
  premiumGate?: boolean;
  /** PremiumTeaser 位置：top（正文前）/ middle（正文中段）/ bottom（預設，正文後）。 */
  premiumGatePosition?: "top" | "middle" | "bottom";
  /** false = 本篇隱藏 Newsletter CTA；未設定/true = 顯示。 */
  newsletterCta?: boolean;

  // ── 三主軸關聯內容（跨軸導流；未給 = 整塊隱藏，向下相容）──
  /** 已解析的三軸關聯卡片（laneContent.resolveRelations 產出）。 */
  relations?: RelatedGroups;
}

const DEFAULT_AFFILIATES: AffiliateItem[] = [
  { label: { zh: "AI 工具推薦", en: "AI Tools" }, description: { zh: "提升生產力的精選工具", en: "Curated productivity tools" }, href: "#affiliate-ai-tools", emoji: "🤖" },
  { label: { zh: "線上課程", en: "Online Course" }, description: { zh: "從入門到進階", en: "Beginner to advanced" }, href: "#affiliate-course", emoji: "🎓" },
  { label: { zh: "雲端與自動化", en: "Cloud & Automation" }, description: { zh: "n8n / Zapier / 雲服務", en: "n8n / Zapier / cloud" }, href: "#affiliate-automation", emoji: "⚙️" },
];

// ArticleShell 已在頁首渲染正式 H1；若內容 Markdown 也以 H1 開頭，先移除，避免首屏重複標題。
function stripLeadingMarkdownH1(body: string): string {
  return body.replace(/^\s*#(?!#)\s+[^\n\r]+\r?\n+/, "").trimStart();
}

// 在段落邊界把正文切兩半，中段插 #14 廣告位。
function splitBody(body: string): [string, string] {
  const cleanBody = stripLeadingMarkdownH1(body);
  const paras = cleanBody.split(/\n{2,}/);
  if (paras.length < 4) return [cleanBody, ""];
  const mid = Math.ceil(paras.length / 2);
  return [paras.slice(0, mid).join("\n\n"), paras.slice(mid).join("\n\n")];
}

export function ArticleShell(props: ArticleShellProps) {
  const { lang } = useLanguage();
  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);

  // [階段A] 進文章頁 → 標記已讀（純前端 localStorage）。
  const { markRead } = useReadProgress(props.readProgress?.laneId ?? "");
  useEffect(() => {
    if (props.readProgress) markRead(props.readProgress.slug);
  }, [props.readProgress, markRead]);

  useEffect(() => {
    setSeoMeta({
      title: `${props.title[lang]}｜Formula Universe`,
      description: props.description[lang],
    });
  }, [lang, props.title, props.description]);

  const [firstHalf, secondHalf] = splitBody(props.body);
  const affiliates = props.affiliateItems ?? DEFAULT_AFFILIATES;

  // metadata 驅動：未設定一律維持現狀（向下相容）。
  const showAds = props.adsEnabled !== false;
  const showPremium = props.premiumGate !== false;
  const showNewsletter = props.newsletterCta !== false;
  const premiumPos = props.premiumGatePosition ?? "bottom";

  return (
    <article className="fu-typo max-w-3xl mx-auto px-5 sm:px-6 py-10">
      <Link href={props.backHref}>
        <Button variant="ghost" size="sm" className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {props.backLabel[lang]}
        </Button>
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          {props.categoryLabel && (
            <Badge variant="secondary" className="gap-1 px-3 py-1 text-xs leading-normal">
              <Tag className="w-3 h-3" />
              {props.categoryLabel[lang]}
            </Badge>
          )}
          {props.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {props.publishedAt}
            </span>
          )}
        </div>
        <h1 className="t-h1">{props.title[lang]}</h1>
        <p className="t-lead text-muted-foreground mt-4 mb-6 max-w-2xl leading-relaxed">{props.description[lang]}</p>
      </header>

      {props.headerSlot}

      {/* PremiumTeaser — top 位置（正文前） */}
      {showPremium && premiumPos === "top" && (
        <div className="my-6">
          <PremiumTeaser lang={lang} />
        </div>
      )}

      {/* #8 — AdSlot after intro */}
      {showAds && (
        <div className="my-6">
          <AdSlot slot={`${props.slotPrefix}-after-intro`} position="top" variant="responsive" />
        </div>
      )}

      <div className="prose prose-slate dark:prose-invert max-w-none t-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{firstHalf}</ReactMarkdown>
      </div>

      {/* PremiumTeaser — middle 位置（正文中段） */}
      {showPremium && premiumPos === "middle" && (
        <div className="my-6">
          <PremiumTeaser lang={lang} />
        </div>
      )}

      {secondHalf && (
        <>
          {/* #14 — AdSlot mid-article */}
          {showAds && (
            <div className="my-6">
              <AdSlot slot={`${props.slotPrefix}-mid`} position="middle" variant="responsive" />
            </div>
          )}
          <div className="prose prose-slate dark:prose-invert max-w-none t-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{secondHalf}</ReactMarkdown>
          </div>
        </>
      )}

      {props.keywords && props.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8">
          {props.keywords.map((k) => (
            <Badge key={k} variant="outline" className="px-3 py-1 text-xs leading-normal">{k}</Badge>
          ))}
        </div>
      )}

      {props.footerExtra}

      {/* 三主軸關聯內容 — 跨軸導流（無資料時自動隱藏） */}
      {props.relations && <RelatedContent lang={lang} groups={props.relations} />}

      <div className="mt-10 space-y-8">
        <AffiliateGrid lang={lang} items={affiliates} />
        {showPremium && premiumPos === "bottom" && <PremiumTeaser lang={lang} />}
        {showNewsletter && <NewsletterCta lang={lang} source={props.newsletterSource} />}
      </div>

      <div className="mt-10">
        <TrustStrip lang={lang} variant="default" />
      </div>
    </article>
  );
}
