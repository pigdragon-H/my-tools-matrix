import { type ReactNode, useEffect } from "react";
import { Link } from "wouter";
import { setSeoMeta } from "@/lib/seo";

export interface ArticleTemplateTocItem {
  id: string;
  title: string;
  level?: 2 | 3;
}

export interface ArticleTemplateFaq {
  question: string;
  answer: string;
}

export interface ArticleTemplateRelatedTool {
  title: string;
  description: string;
  href: string;
}

export interface ArticlePageTemplateProps {
  title: string;
  subtitle: string;
  description: string;
  content: ReactNode;
  tableOfContents?: ArticleTemplateTocItem[];
  faqs?: ArticleTemplateFaq[];
  relatedTools?: ArticleTemplateRelatedTool[];
  authorName?: string;
  publishedAt?: string;
  updatedAt?: string;
  canonicalUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
}

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const defaultFaqs: ArticleTemplateFaq[] = [
  {
    question: "這篇文章適合誰閱讀？",
    answer: "適合想快速理解主題、建立基本判斷框架，並搭配工具矩陣進行實作的讀者。",
  },
  {
    question: "文章內容是否由 AI 產生？",
    answer: "工具矩陣文章可由 AI 協助整理與撰寫，但主題、核心觀點與發布前審定會由人工把關。",
  },
  {
    question: "文章可以取代專業建議嗎？",
    answer: "不可以。文章提供知識整理與決策輔助，涉及投資、醫療、法律或稅務時，仍建議諮詢專業人士。",
  },
  {
    question: "可以搭配哪些工具使用？",
    answer: "每篇文章下方可配置相關工具連結，協助你從閱讀延伸到計算、比較與實作。",
  },
  {
    question: "文章會持續更新嗎？",
    answer: "重要主題會依資料更新、工具功能與使用者回饋持續修訂。",
  },
];

export default function ArticlePageTemplate({
  title,
  subtitle,
  description,
  content,
  tableOfContents = [],
  faqs = defaultFaqs,
  relatedTools = [],
  authorName = "PiGragon-H｜工具矩陣的園丁",
  publishedAt,
  updatedAt,
  canonicalUrl,
  seoTitle,
  seoDescription,
}: ArticlePageTemplateProps) {
  const pageTitle = seoTitle ?? `${title}｜工具矩陣知識庫`;
  const metaDescription = seoDescription ?? description;

  useEffect(() => {
    setSeoMeta({ title: pageTitle, description: metaDescription });
  }, [pageTitle, metaDescription]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    alternativeHeadline: subtitle,
    description: metaDescription,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "工具矩陣",
    },
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    mainEntityOfPage: canonicalUrl,
    inLanguage: "zh-Hant-TW",
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
      <JsonLd data={articleSchema} />
      {faqs.length > 0 && <JsonLd data={faqSchema} />}

      <article>
        <header className="border-b bg-gradient-to-br from-background via-muted/30 to-background">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="text-sm font-medium text-primary">工具矩陣知識庫</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-5 text-xl leading-8 text-muted-foreground">{subtitle}</p>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span>作者：{authorName}</span>
              {publishedAt && <span>發布：{publishedAt}</span>}
              {updatedAt && <span>更新：{updatedAt}</span>}
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="rounded-2xl border bg-card p-5" aria-labelledby="toc-heading">
              <h2 id="toc-heading" className="font-semibold">
                目錄
              </h2>
              {tableOfContents.length > 0 ? (
                <ol className="mt-4 space-y-2 text-sm">
                  {tableOfContents.map((item) => (
                    <li key={item.id} className={item.level === 3 ? "pl-4" : undefined}>
                      <a className="text-muted-foreground transition hover:text-primary" href={`#${item.id}`}>
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">可在此放入 H2/H3 章節錨點，協助讀者快速跳轉。</p>
              )}
            </nav>
          </aside>

          <div className="min-w-0">
            <section className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-h2:text-2xl prose-h3:text-xl prose-p:leading-8">
              {content}
            </section>

            <section className="mt-12" aria-labelledby="article-faq-section">
              <h2 id="article-faq-section" className="text-2xl font-semibold tracking-tight">
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
              <section className="mt-12" aria-labelledby="article-related-tools-section">
                <h2 id="article-related-tools-section" className="text-2xl font-semibold tracking-tight">
                  相關工具
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
          </div>
        </div>
      </article>
    </main>
  );
}
