import { type ReactNode, useEffect } from "react";
import { Link } from "wouter";
import { setSeoMeta } from "@/lib/seo";

export interface ToolTemplateFaq {
  question: string;
  answer: string;
}

export interface ToolTemplateRelatedTool {
  title: string;
  description: string;
  href: string;
}

export interface ToolTemplateFormula {
  label: string;
  expression: string;
  description?: string;
}

export interface ToolPageTemplateProps {
  toolName: string;
  tagline: string;
  description: string;
  calculator: ReactNode;
  formulaTitle?: string;
  formulas?: ToolTemplateFormula[];
  howToUseSteps?: string[];
  faqs?: ToolTemplateFaq[];
  relatedTools?: ToolTemplateRelatedTool[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  categoryName?: string;
}

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const defaultHowToUseSteps = [
  "輸入你要計算或轉換的必要資料。",
  "確認欄位內容正確後，按下計算或產生結果。",
  "閱讀結果、公式說明與延伸工具，作為決策參考。",
];

const defaultFaqs: ToolTemplateFaq[] = [
  {
    question: "這個工具需要註冊才能使用嗎？",
    answer: "不需要。工具矩陣的核心工具預設可直接在瀏覽器中使用。",
  },
  {
    question: "計算結果可以作為正式決策依據嗎？",
    answer: "工具結果適合作為初步估算與決策輔助；若涉及法律、醫療、稅務或投資決策，建議再諮詢專業人士。",
  },
  {
    question: "我的輸入資料會被上傳嗎？",
    answer: "除非工具頁另有明確說明，計算通常在瀏覽器端完成，目標是降低不必要的資料傳輸。",
  },
  {
    question: "公式可以自行調整嗎？",
    answer: "此模板預留公式說明區，實際工具可依需求加入進階參數、假設條件與客製化設定。",
  },
  {
    question: "可以把這個工具分享給其他人嗎？",
    answer: "可以。你可以分享工具頁網址，讓其他人使用同一套計算流程。",
  },
];

export default function ToolPageTemplate({
  toolName,
  tagline,
  description,
  calculator,
  formulaTitle = "公式與計算邏輯",
  formulas = [],
  howToUseSteps = defaultHowToUseSteps,
  faqs = defaultFaqs,
  relatedTools = [],
  seoTitle,
  seoDescription,
  canonicalUrl,
  categoryName = "線上工具",
}: ToolPageTemplateProps) {
  const title = seoTitle ?? `${toolName}｜工具矩陣`;
  const metaDescription = seoDescription ?? description;

  useEffect(() => {
    setSeoMeta({ title, description: metaDescription });
  }, [title, metaDescription]);

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: toolName,
    applicationCategory: categoryName,
    operatingSystem: "Web Browser",
    description: metaDescription,
    url: canonicalUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "TWD",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <JsonLd data={softwareApplicationSchema} />
      {faqs.length > 0 && <JsonLd data={faqSchema} />}

      <section className="border-b bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-primary">{categoryName}</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{toolName}</h1>
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{tagline}</p>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">{description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="calculator-section">
        <div className="mb-5">
          <h2 id="calculator-section" className="text-2xl font-semibold tracking-tight">
            計算器
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">在下方輸入資料，系統會依工具邏輯即時計算或產生結果。</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">{calculator}</div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="formula-section">
        <h2 id="formula-section" className="text-2xl font-semibold tracking-tight">
          {formulaTitle}
        </h2>
        {formulas.length > 0 ? (
          <div className="mt-5 grid gap-4">
            {formulas.map((formula) => (
              <article key={`${formula.label}-${formula.expression}`} className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold">{formula.label}</h3>
                <code className="mt-3 block rounded-lg bg-muted px-3 py-2 text-sm text-foreground">{formula.expression}</code>
                {formula.description && <p className="mt-3 text-sm leading-6 text-muted-foreground">{formula.description}</p>}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted-foreground">此工具可在這裡補充公式、假設條件、資料來源與計算限制。</p>
        )}
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="how-to-use-section">
        <h2 id="how-to-use-section" className="text-2xl font-semibold tracking-tight">
          使用方式
        </h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          {howToUseSteps.slice(0, 3).map((step, index) => (
            <li key={step} className="rounded-xl border bg-card p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {index + 1}
              </span>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="faq-section">
        <h2 id="faq-section" className="text-2xl font-semibold tracking-tight">
          常見問題
        </h2>
        <div className="mt-5 divide-y rounded-2xl border bg-card">
          {faqs.slice(0, 5).map((faq) => (
            <article key={faq.question} className="p-5">
              <h3 className="font-semibold">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      {relatedTools.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="related-tools-section">
          <h2 id="related-tools-section" className="text-2xl font-semibold tracking-tight">
            相關工具推薦
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {relatedTools.map((tool) => (
              <Link key={tool.href} href={tool.href}>
                <article className="h-full rounded-xl border bg-card p-5 transition hover:border-primary hover:shadow-sm">
                  <h3 className="font-semibold">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{tool.description}</p>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
