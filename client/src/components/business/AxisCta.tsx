// ============================================================
// AxisCta — AI 三主軸欄目專屬 CTA
// ============================================================
//
// P0 目的：讓三主軸不只互相連結，也能在每篇文章結尾形成明確下一步：
// blueprint → checklist / tools / knowledge
// knowledge → next question / business application
// opportunity → tracking / related blueprint / validation
//
// 本元件只處理語意 CTA，不取代既有 NewsletterCta / PremiumTeaser / RelatedContent。
// ============================================================
import { Link } from "wouter";
import { ArrowRight, BookOpen, Compass, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/contexts/LanguageContext";
import type { AiContentType, AiCtaType, AiOperatingStatus, Bilingual } from "../../../../shared/laneSchemas";

export interface AxisCtaProps {
  lang: Lang;
  contentType?: AiContentType;
  ctaType?: AiCtaType;
  topicId?: string;
  operatingStatus?: AiOperatingStatus;
  title: Bilingual;
  primaryHref?: string;
}

const DEFAULT_HREF: Record<AiContentType, string> = {
  blueprint: "/blueprints",
  knowledge: "/knowledge",
  opportunity: "/opportunities",
};

const COPY: Record<AiContentType, {
  icon: typeof Compass;
  eyebrow: Bilingual;
  heading: Bilingual;
  body: Bilingual;
  action: Bilingual;
}> = {
  blueprint: {
    icon: Compass,
    eyebrow: { zh: "AI 創業藍圖下一步", en: "Next step for this blueprint" },
    heading: { zh: "把這篇藍圖轉成 90 天執行清單", en: "Turn this blueprint into a 90-day execution checklist" },
    body: {
      zh: "先保留這個 topic，接著查看配套知識、相關情報與工具。量產系統會用 topicId 追蹤它是否已形成完整商業閉路。",
      en: "Save this topic, then review its supporting knowledge, opportunity signals and tools. The production system tracks whether it forms a complete commercial loop.",
    },
    action: { zh: "查看更多藍圖", en: "Explore more blueprints" },
  },
  knowledge: {
    icon: BookOpen,
    eyebrow: { zh: "AI 知識庫下一題", en: "Next question in the knowledge graph" },
    heading: { zh: "把概念接到商業應用與風險判斷", en: "Connect this concept to business use and risk judgment" },
    body: {
      zh: "知識節點不是終點。繼續追蹤同 topic 的藍圖與情報，確認這個概念何時能變成工具、流程或商業方案。",
      en: "A knowledge node is not the endpoint. Follow the same topic into blueprints and opportunities to see when it becomes a tool, workflow or business model.",
    },
    action: { zh: "回到知識庫", en: "Back to AI Knowledge" },
  },
  opportunity: {
    icon: Lightbulb,
    eyebrow: { zh: "機會情報追蹤", en: "Opportunity tracking" },
    heading: { zh: "判斷這個機會是否值得升格為藍圖", en: "Decide whether this opportunity should become a blueprint" },
    body: {
      zh: "機會情報會先保留訊號、風險與升格狀態。若驗證足夠，下一步應連到可執行藍圖或產生新的藍圖候選。",
      en: "Opportunity intelligence preserves signals, risks and escalation state. If validation is strong enough, it should link to an executable blueprint or create a new candidate.",
    },
    action: { zh: "查看更多情報", en: "Explore opportunities" },
  },
};

function normalizeContentType(contentType?: AiContentType, ctaType?: AiCtaType): AiContentType | undefined {
  if (contentType) return contentType;
  if (ctaType === "blueprint_checklist") return "blueprint";
  if (ctaType === "knowledge_next_question") return "knowledge";
  if (ctaType === "opportunity_tracking") return "opportunity";
  return undefined;
}

export function AxisCta(props: AxisCtaProps) {
  const type = normalizeContentType(props.contentType, props.ctaType);
  if (!type) return null;

  const copy = COPY[type];
  const Icon = copy.icon;
  const href = props.primaryHref ?? DEFAULT_HREF[type];

  return (
    <section
      className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-7"
      data-section="ai-axis-cta"
      data-content-type={type}
      data-topic-id={props.topicId ?? ""}
      data-cta-type={props.ctaType ?? ""}
      data-operating-status={props.operatingStatus ?? ""}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1 rounded-full bg-background p-2 text-primary shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {copy.eyebrow[props.lang]}
          </p>
          <h2 className="mt-2 text-xl font-bold leading-tight text-foreground sm:text-2xl">
            {copy.heading[props.lang]}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            {copy.body[props.lang]}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href={href}>
                {copy.action[props.lang]}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {props.topicId && (
              <span className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
                topicId: {props.topicId}
              </span>
            )}
            {props.operatingStatus && (
              <span className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
                status: {props.operatingStatus}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
