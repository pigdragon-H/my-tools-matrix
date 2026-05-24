// ============================================================
// Home - Homepage Skeleton V1
// Skeleton-only production migration.
// Static placeholder sections only.
// ============================================================

import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { defaultSeo, setSeoMeta } from "@/lib/seo";

export default function Home() {
  useEffect(() => {
    setSeoMeta(defaultSeo);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Hero Section ────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container py-20 md:py-28">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4 text-xs font-medium">
              MVP 版本 · 持續更新中
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              工具矩陣
              <span className="block text-primary">讓每個決策都有數據支撐</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              集結財經、健康、職場等 12 大領域的精準計算工具。免費使用，即時計算，
              幫助你在人生的每個重要時刻做出更明智的決策。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/tools/finance">
                  開始使用 <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/blog">閱讀文章</Link>
              </Button>
            </div>
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </section>

      {/* ── Feature Bar ─────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="container py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3 py-2">
              <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">即時計算</p>
                <p className="text-xs text-muted-foreground">所有工具在瀏覽器本地運算，無需等待</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2">
              <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">隱私安全</p>
                <p className="text-xs text-muted-foreground">資料不上傳，計算完全在你的裝置上</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2">
              <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">視覺化輸出</p>
                <p className="text-xs text-muted-foreground">圖表與表格讓結果一目了然</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Discovery V1 Placeholder ───────────────────────── */}
      <section className="border-b border-border bg-background">
        <div className="container py-16">
          <div className="mb-8 max-w-2xl">
            <Badge variant="outline" className="mb-3">Discovery v1</Badge>
            <h2 className="text-2xl font-bold md:text-3xl">Quick Search</h2>
            <p className="mt-2 text-muted-foreground">
              Placeholder-only discovery area for future tool, topic, and knowledge search patterns.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6">
              <p className="text-sm font-semibold">Search tools</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Future calculator lookup placeholder. Static block only.
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6">
              <p className="text-sm font-semibold">Search topics</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Future semantic topic lookup placeholder. No live results.
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6">
              <p className="text-sm font-semibold">Search knowledge</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Future guide and explanation lookup placeholder. No dynamic source.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold">Trending Tools</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Static trend placeholders for future reviewed tool destinations.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="secondary">BMI</Badge>
                <Badge variant="secondary">CAGR</Badge>
                <Badge variant="secondary">JSON</Badge>
                <Badge variant="secondary">Mortgage</Badge>
                <Badge variant="secondary">TDEE</Badge>
              </div>
            </div>

            <div className="rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold">Trending Topics</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Static topic placeholders for future content and knowledge graph review.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="secondary">FIRE</Badge>
                <Badge variant="secondary">Weight Loss</Badge>
                <Badge variant="secondary">API</Badge>
                <Badge variant="secondary">JSON</Badge>
                <Badge variant="secondary">Retirement</Badge>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-dashed border-border bg-muted/20 p-6">
            <h3 className="text-lg font-semibold">Discovery Flow</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Static flow model for future homepage discovery behavior.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-background p-4 text-center text-sm font-semibold">Search</div>
              <div className="rounded-lg border border-border bg-background p-4 text-center text-sm font-semibold">Topic</div>
              <div className="rounded-lg border border-border bg-background p-4 text-center text-sm font-semibold">Tool</div>
              <div className="rounded-lg border border-border bg-background p-4 text-center text-sm font-semibold">Knowledge</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Journey V1 Placeholder ─────────────────────────── */}
      <section className="border-b border-border bg-muted/20">
        <div className="container py-16">
          <div className="mb-8 max-w-2xl">
            <Badge variant="outline" className="mb-3">Journey v1</Badge>
            <h2 className="text-2xl font-bold md:text-3xl">Journey Cards</h2>
            <p className="mt-2 text-muted-foreground">
              Static journey placeholders for future multi-step learning and tool paths. No personalization or routing is active.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-background p-6">
              <h3 className="text-lg font-semibold">Retirement Journey</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Future planning path placeholder for long-term finance topics.
              </p>
              <div className="mt-5 grid gap-2">
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm font-semibold">FIRE</div>
                <div className="text-center text-muted-foreground">↓</div>
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm font-semibold">CAGR</div>
                <div className="text-center text-muted-foreground">↓</div>
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm font-semibold">Retirement</div>
                <div className="text-center text-muted-foreground">↓</div>
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm font-semibold">Withdrawal</div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-6">
              <h3 className="text-lg font-semibold">Weight Loss Journey</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Future health calculation path placeholder with safety review required.
              </p>
              <div className="mt-5 grid gap-2">
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm font-semibold">BMI</div>
                <div className="text-center text-muted-foreground">↓</div>
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm font-semibold">BMR</div>
                <div className="text-center text-muted-foreground">↓</div>
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm font-semibold">Calories</div>
                <div className="text-center text-muted-foreground">↓</div>
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm font-semibold">Progress</div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-6">
              <h3 className="text-lg font-semibold">Developer Journey</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Future developer workflow placeholder for data cleanup and implementation support.
              </p>
              <div className="mt-5 grid gap-2">
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm font-semibold">JSON</div>
                <div className="text-center text-muted-foreground">↓</div>
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm font-semibold">API</div>
                <div className="text-center text-muted-foreground">↓</div>
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm font-semibold">Regex</div>
                <div className="text-center text-muted-foreground">↓</div>
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm font-semibold">Deploy</div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-dashed border-border bg-background p-6">
            <h3 className="text-lg font-semibold">Next Step Suggestions</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Static examples for future contextual suggestions. These are not personalized and do not navigate.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-muted/20 p-5">
                <p className="text-sm font-semibold">After BMI</p>
                <p className="mt-2 text-sm text-muted-foreground">→ BMR → Calories</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-5">
                <p className="text-sm font-semibold">After CAGR</p>
                <p className="mt-2 text-sm text-muted-foreground">→ Retirement → FIRE</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-5">
                <p className="text-sm font-semibold">After JSON</p>
                <p className="mt-2 text-sm text-muted-foreground">→ API → Regex</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Tools Placeholder ──────────────────────── */}
      <section className="container py-16">
        <div className="mb-8 max-w-2xl">
          <Badge variant="outline" className="mb-3">Skeleton v1</Badge>
          <h2 className="text-2xl font-bold md:text-3xl">Featured Tools</h2>
          <p className="mt-2 text-muted-foreground">
            Placeholder section reserved for reviewed featured calculator cards in a later phase.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6">
            <p className="text-sm font-semibold">Featured tool placeholder</p>
            <p className="mt-2 text-sm text-muted-foreground">Static placeholder block only. No dynamic source.</p>
          </div>
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6">
            <p className="text-sm font-semibold">Featured tool placeholder</p>
            <p className="mt-2 text-sm text-muted-foreground">Future approved tool card location.</p>
          </div>
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6">
            <p className="text-sm font-semibold">Featured tool placeholder</p>
            <p className="mt-2 text-sm text-muted-foreground">No live links added in skeleton v1.</p>
          </div>
        </div>
      </section>

      {/* ── Featured Topics Placeholder ─────────────────────── */}
      <section className="border-y border-border bg-muted/20">
        <div className="container py-16">
          <div className="mb-8 max-w-2xl">
            <Badge variant="outline" className="mb-3">Skeleton v1</Badge>
            <h2 className="text-2xl font-bold md:text-3xl">Featured Topics</h2>
            <p className="mt-2 text-muted-foreground">
              Placeholder section reserved for topic cards after content and route review.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-dashed border-border bg-background p-6">
              <p className="text-sm font-semibold">Topic placeholder</p>
              <p className="mt-2 text-sm text-muted-foreground">Future reviewed topic summary.</p>
            </div>
            <div className="rounded-xl border border-dashed border-border bg-background p-6">
              <p className="text-sm font-semibold">Topic placeholder</p>
              <p className="mt-2 text-sm text-muted-foreground">No interactive finder behavior in this phase.</p>
            </div>
            <div className="rounded-xl border border-dashed border-border bg-background p-6">
              <p className="text-sm font-semibold">Topic placeholder</p>
              <p className="mt-2 text-sm text-muted-foreground">Static block only.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Universe Explorer Placeholder ──────────────────── */}
      <section className="container py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <Badge variant="outline" className="mb-3">Skeleton v1</Badge>
            <h2 className="text-2xl font-bold md:text-3xl">Universe Explorer</h2>
            <p className="mt-2 text-muted-foreground">
              Placeholder for future category, formula, and tool index exploration. This replaces the dynamic category grid for now without connecting to shared configs.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-dashed border-border p-5">
              <p className="text-sm font-semibold">Category group placeholder</p>
              <p className="mt-2 text-sm text-muted-foreground">Static skeleton area.</p>
            </div>
            <div className="rounded-xl border border-dashed border-border p-5">
              <p className="text-sm font-semibold">Formula group placeholder</p>
              <p className="mt-2 text-sm text-muted-foreground">Future structure only.</p>
            </div>
            <div className="rounded-xl border border-dashed border-border p-5">
              <p className="text-sm font-semibold">Tool index placeholder</p>
              <p className="mt-2 text-sm text-muted-foreground">No dynamic source.</p>
            </div>
            <div className="rounded-xl border border-dashed border-border p-5">
              <p className="text-sm font-semibold">Topic index placeholder</p>
              <p className="mt-2 text-sm text-muted-foreground">No routes added.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Polish V1 Knowledge + Trust ───────────────────── */}
      <section className="border-y border-border bg-gradient-to-b from-muted/30 via-background to-muted/20">
        <div className="container py-14 md:py-20">
          <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
            <Badge variant="outline" className="mb-4">Polish v1</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Knowledge Hub</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
              Static knowledge entry points for future explanations, formulas, examples, and editorial review paths. The hub now reads as a structured layer between journeys, tools, and future guides.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-background p-6 shadow-sm transition-colors hover:border-primary/30">
              <div className="mb-4 h-1.5 w-10 rounded-full bg-primary/70" />
              <p className="text-base font-semibold">Investment</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Placeholder for CAGR, compound growth, retirement, risk, and planning explainers.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6 shadow-sm transition-colors hover:border-primary/30">
              <div className="mb-4 h-1.5 w-10 rounded-full bg-primary/70" />
              <p className="text-base font-semibold">Health</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Placeholder for BMI, BMR, calories, progress, and safety-reviewed health guidance.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6 shadow-sm transition-colors hover:border-primary/30">
              <div className="mb-4 h-1.5 w-10 rounded-full bg-primary/70" />
              <p className="text-base font-semibold">Developer</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Placeholder for JSON, API, Regex, formatting, validation, and workflow knowledge.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6 shadow-sm transition-colors hover:border-primary/30">
              <div className="mb-4 h-1.5 w-10 rounded-full bg-primary/70" />
              <p className="text-base font-semibold">Science</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Placeholder for units, formulas, conversions, models, and experimental context.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Polish V1 Trust Section ───────────────────────── */}
      <section className="container py-14 md:py-20">
        <div className="rounded-3xl border border-border bg-background p-6 shadow-sm md:p-8 lg:p-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <Badge variant="outline" className="mb-4">Trust layer</Badge>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Built as a formula universe, not a loose tool list.</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                Static trust signals clarify the product direction while keeping this phase visual-only. No recommendations, personalization, registry reads, or live counters are introduced.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-muted/30 p-5">
                <p className="text-2xl font-bold">1000+ tools</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Universe-scale coverage target for future reviewed calculators and utilities.</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-5">
                <p className="text-2xl font-bold">Knowledge graph</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Future relationship layer for formulas, guides, examples, and limitations.</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-5">
                <p className="text-2xl font-bold">Formula universe</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Consistent structure for calculation context, definitions, and next-step paths.</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-5">
                <p className="text-2xl font-bold">AI native</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Designed for future AI-assisted discovery while remaining static in this phase.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tool Clusters Polish V1 ───────────────────────── */}
      <section className="border-y border-border bg-muted/20">
        <div className="container py-14 md:py-20">
          <div className="mb-10 max-w-2xl md:mb-12">
            <Badge variant="outline" className="mb-4">Polish v1</Badge>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Tool Clusters</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
              Static cluster placeholders for future related-tool paths. These do not recommend, personalize, or navigate yet.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-dashed border-border bg-background p-6 shadow-sm">
              <p className="text-base font-semibold">Finance</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                CAGR → Retirement → FIRE → Withdrawal. Future cluster requires finance disclaimer review.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-border bg-background p-6 shadow-sm">
              <p className="text-base font-semibold">Health</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                BMI → BMR → Calories → Progress. Future cluster requires health safety language.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-border bg-background p-6 shadow-sm">
              <p className="text-base font-semibold">Developer</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                JSON → API → Regex → Deploy. Future cluster requires verified destinations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest Guides Polish V1 ───────────────────────── */}
      <section className="container py-14 md:py-20">
        <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4">Polish v1</Badge>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Latest Guides</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
              Static guide examples for future editorial cards. This phase does not connect to blog data or content registries.
            </p>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground md:text-right">
            Guide cards are intentionally balanced with equal padding and clearer titles for review readability.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-muted/20 p-6">
            <p className="text-base font-semibold">What is CAGR</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Future guide placeholder for compound annual growth rate concepts and examples.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 p-6">
            <p className="text-base font-semibold">BMI Guide</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Future guide placeholder for BMI context, limits, and non-diagnostic safety notes.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 p-6">
            <p className="text-base font-semibold">JSON Guide</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Future guide placeholder for formatting, validation, and practical JSON workflows.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 p-6">
            <p className="text-base font-semibold">Retirement Planning</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Future guide placeholder for planning assumptions, withdrawal context, and disclaimers.
            </p>
          </div>
        </div>
      </section>

      {/* ── Polish V1 CTA ─────────────────────────────────── */}
      <section className="border-y border-border bg-gradient-to-r from-primary/10 via-muted/30 to-background">
        <div className="container py-14 md:py-20">
          <div className="rounded-3xl border border-border bg-background/90 p-6 shadow-sm md:p-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
              <div>
                <Badge variant="outline" className="mb-4">Next step</Badge>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Choose a clear path into the universe.</h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                  Static CTA cards clarify the homepage ending without adding new navigation behavior, personalization, or dynamic sources.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-muted/20 p-5">
                  <p className="text-base font-semibold">Explore tools</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Browse calculators and utilities by reviewed category paths.</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/20 p-5">
                  <p className="text-base font-semibold">Explore knowledge</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Move from formulas to guides, examples, and editorial context.</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/20 p-5">
                  <p className="text-base font-semibold">Start journey</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Use Journey cards as future structured paths across topics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background">
        <div className="container py-10 md:py-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">工具矩陣</span>
                <span className="text-xs text-muted-foreground">讓每個決策都有數據支撐</span>
              </div>
              <p className="mt-3 max-w-md text-xs leading-6 text-muted-foreground">
                Formula Universe homepage polish keeps the footer compact, readable, and clearly separated from the final CTA.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-muted-foreground md:justify-end">
              <Link href="/blog" className="transition-colors hover:text-foreground">
                部落格
              </Link>
              <Link href="/about" className="transition-colors hover:text-foreground">
                關於我們
              </Link>
              <Link href="/tools/finance" className="transition-colors hover:text-foreground">
                財經工具
              </Link>
              <Link href="/tools/health" className="transition-colors hover:text-foreground">
                健康工具
              </Link>
              <Link href="/privacy-policy" className="transition-colors hover:text-foreground">
                隱私權政策
              </Link>
              <Link href="/terms-of-service" className="transition-colors hover:text-foreground">
                服務條款
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
