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
import { AxisCta } from "@/components/business/AxisCta";
import type { RelatedGroups } from "@/lib/laneContent";
import type { AiContentType, AiCtaType, AiOperatingStatus } from "../../../shared/laneSchemas";
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
  /**
   * 文章配置影片連結（選填）。支援兩種來源，元件會自動判斷渲染方式：
   * 1. YouTube / Vimeo 連結 → 渲染成 iframe 嵌入播放器（快軌方案，2026-07-05 新增）
   * 2. 其他直接的影片檔案網址（例如未來 Supabase Storage 公開 URL，格式為
   *    https://<project>.supabase.co/storage/v1/object/public/... 或任何直接
   *    以 .mp4/.webm 結尾的網址）→ 渲染成原生 <video> 標籤
   * 兩種來源共用同一個欄位與同一套渲染邏輯，接上 Supabase Storage 時不需要
   * 改動這支元件，只需要在文章 frontmatter 填入 Storage 的公開網址即可。
   */
  videoUrl?: string;

  // ── metadata 驅動商業層（per-article 覆寫；未設定 = 維持現狀） ──
  /** false = 本篇隱藏廣告位；未設定/true = 顯示（與全站 ENABLE_ADS 仍為 AND）。 */
  adsEnabled?: boolean;
  /** false = 本篇隱藏 PremiumTeaser；未設定/true = 顯示。 */
  premiumGate?: boolean;
  /** PremiumTeaser 位置：top（正文前）/ middle（正文中段）/ bottom（預設，正文後）。 */
  premiumGatePosition?: "top" | "middle" | "bottom";
  /** false = 本篇隱藏 Newsletter CTA；未設定/true = 顯示。 */
  newsletterCta?: boolean;

  // ── AI 三主軸 P0 閉路語意（驅動欄目 CTA、DOM data 與後續機器可讀性）──
  contentType?: AiContentType;
  topicId?: string;
  operatingStatus?: AiOperatingStatus;
  ctaType?: AiCtaType;

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
/**
 * 判斷 videoUrl 的來源類型，決定用 iframe 嵌入（YouTube/Vimeo）還是原生
 * <video> 標籤（直接的影片檔案網址，例如未來的 Supabase Storage 公開連結）。
 * 這個判斷邏輯是「快軌」（YouTube）跟「正軌」（Supabase Storage）共用同一套
 * 渲染元件的關鍵——兩種來源都填同一個 videoUrl 欄位，元件自己判斷怎麼渲染，
 * 之後接上 Supabase Storage 時不需要新增欄位或改寫這支元件。
 */
function parseVideoEmbed(url: string): { type: "youtube"; embedSrc: string } | { type: "vimeo"; embedSrc: string } | { type: "file"; src: string } {
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (youtubeMatch) {
    return { type: "youtube", embedSrc: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { type: "vimeo", embedSrc: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }
  // 其餘一律當作直接的影片檔案網址處理（涵蓋未來 Supabase Storage 的
  // 公開 URL，格式通常是 https://<project>.supabase.co/storage/v1/object/public/...）
  return { type: "file", src: url };
}

function stripLeadingMarkdownH1(body: string): string {
  return body.replace(/^\s*#(?!#)\s+[^\n\r]+\r?\n+/, "").trimStart();
}

// 在段落邊界把正文切三段，每段之間各插一個廣告位（長文加密廣告密度）。
// 段落數不足時自動降級，確保短文不被過度切割。
function splitBody(body: string): [string, string, string] {
  const cleanBody = stripLeadingMarkdownH1(body);
  const paras = cleanBody.split(/\n{2,}/);
  if (paras.length < 4) return [cleanBody, "", ""];
  // 段落夠多（長文）才切三段；否則只切兩段（維持原行為）。
  if (paras.length >= 9) {
    const a = Math.ceil(paras.length / 3);
    const b = Math.ceil((paras.length * 2) / 3);
    return [
      paras.slice(0, a).join("\n\n"),
      paras.slice(a, b).join("\n\n"),
      paras.slice(b).join("\n\n"),
    ];
  }
  const mid = Math.ceil(paras.length / 2);
  return [paras.slice(0, mid).join("\n\n"), paras.slice(mid).join("\n\n"), ""];
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

  const [firstHalf, secondHalf, thirdPart] = splitBody(props.body);
  const affiliates = props.affiliateItems ?? DEFAULT_AFFILIATES;

  // 大表格 / 流程圖 / 架構圖（pre code block）下方注入「曝光型響應式廣告」。
  // 商業邏輯：讀者閱讀大表/架構圖時專注度與停留時間最高，是曝光黃金位。
  // 用 ReactMarkdown components 覆寫 table / pre，渲染原元素後緊接一個 AdSlot。
  // showAds 關閉時不注入；每個注入廣告以遞增 index 取得唯一 slot。
  const showAdsFlag = props.adsEnabled !== false;
  let inlineAdIdx = 0;
  const mdComponents = showAdsFlag
    ? {
        table: ({ node: _node, ...rest }: any) => {
          const idx = ++inlineAdIdx;
          return (
            <>
              <div className="overflow-x-auto">
                <table {...rest} />
              </div>
              <div className="my-6 not-prose" data-ad-context="table">
                <AdSlot slot={`${props.slotPrefix}-table-${idx}`} position="inline" variant="responsive" />
              </div>
            </>
          );
        },
        pre: ({ node: _node, children, ...rest }: any) => {
          // 安全抽取純文字內容，不對React元素樹做JSON.stringify（避免Provider等物件造成circular structure錯誤）
          const extractText = (node: any): string => {
            if (node == null) return "";
            if (typeof node === "string" || typeof node === "number") return String(node);
            if (Array.isArray(node)) return node.map(extractText).join("");
            if (typeof node === "object" && "props" in node && node.props?.children) {
              return extractText(node.props.children);
            }
            return "";
          };
          const raw = extractText(children);
          const isDiagram = /[┌┐└┘├┤┬┴┼─│╔╗╚╝═║▶►→↓↑]/.test(raw);
          if (!isDiagram) {
            return <pre {...rest}>{children}</pre>;
          }
          const idx = ++inlineAdIdx;
          return (
            <>
              <pre {...rest}>{children}</pre>
              <div className="my-6 not-prose" data-ad-context="diagram">
                <AdSlot slot={`${props.slotPrefix}-diagram-${idx}`} position="inline" variant="responsive" />
              </div>
            </>
          );
        },
      }
    : undefined;

  // metadata 驅動：未設定一律維持現狀（向下相容）。
  const showAds = props.adsEnabled !== false;
  const showPremium = props.premiumGate !== false;
  const showNewsletter = props.newsletterCta !== false;
  const premiumPos = props.premiumGatePosition ?? "bottom";

  return (
    <article
      className="fu-typo max-w-3xl mx-auto px-5 sm:px-6 py-10"
      data-main-content="article"
      data-content-type={props.contentType ?? ""}
      data-topic-id={props.topicId ?? ""}
      data-cta-type={props.ctaType ?? ""}
      data-operating-status={props.operatingStatus ?? ""}
    >
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

      {/* 文章配置影片（選填）。快軌：YouTube/Vimeo iframe；正軌：Supabase Storage
          等直接檔案網址用原生 <video>。兩者共用 videoUrl 欄位，見上方 parseVideoEmbed。 */}
      {props.videoUrl && (
        <div className="my-6 rounded-lg overflow-hidden bg-black" style={{ aspectRatio: "16 / 9" }}>
          {(() => {
            const embed = parseVideoEmbed(props.videoUrl!);
            if (embed.type === "file") {
              return (
                <video
                  className="w-full h-full"
                  src={embed.src}
                  controls
                  preload="metadata"
                  playsInline
                >
                  {lang === "zh" ? "您的瀏覽器不支援影片播放。" : "Your browser does not support video playback."}
                </video>
              );
            }
            return (
              <iframe
                className="w-full h-full"
                src={embed.embedSrc}
                title={props.title[lang]}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            );
          })()}
        </div>
      )}

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
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{firstHalf}</ReactMarkdown>
      </div>

      {/* PremiumTeaser — middle 位置（正文中段） */}
      {showPremium && premiumPos === "middle" && (
        <div className="my-6">
          <PremiumTeaser lang={lang} />
        </div>
      )}

      {secondHalf && (
        <>
          {/* #14 — AdSlot mid-article (1/3 處) */}
          {showAds && (
            <div className="my-6">
              <AdSlot slot={`${props.slotPrefix}-mid`} position="middle" variant="responsive" />
            </div>
          )}
          <div className="prose prose-slate dark:prose-invert max-w-none t-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{secondHalf}</ReactMarkdown>
          </div>
        </>
      )}

      {thirdPart && (
        <>
          {/* #14b — AdSlot mid-article 2 (2/3 處，長文加密) */}
          {showAds && (
            <div className="my-6">
              <AdSlot slot={`${props.slotPrefix}-mid2`} position="middle" variant="responsive" />
            </div>
          )}
          <div className="prose prose-slate dark:prose-invert max-w-none t-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{thirdPart}</ReactMarkdown>
          </div>
        </>
      )}

      {/* #20 — AdSlot bottom (正文結束後) */}
      {showAds && (
        <div className="my-6">
          <AdSlot slot={`${props.slotPrefix}-bottom`} position="bottom" variant="responsive" />
        </div>
      )}

      {props.keywords && props.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8">
          {props.keywords.map((k) => (
            <Badge key={k} variant="outline" className="px-3 py-1 text-xs leading-normal">{k}</Badge>
          ))}
        </div>
      )}

      {props.footerExtra}

      <AxisCta
        lang={lang}
        contentType={props.contentType}
        ctaType={props.ctaType}
        topicId={props.topicId}
        operatingStatus={props.operatingStatus}
        title={props.title}
      />

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
