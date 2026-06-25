# Phase 2 SEO Optimization Report

Generated: 2026-06-25T22:49:00Z
Repository: my-tools-matrix
Production base audited: https://my-tools-matrix-production.up.railway.app

## Scope

本階段依使用者要求處理六項 SEO 優化：逐頁差異化稽核、E-E-A-T 訊號補強、內部連結與孤兒頁檢查、結構化資料 Schema、GSC 持續監控、外部權威訊號。全程遵守公開 URL 不用 `noindex` 隱藏的政策，並避免在 sandbox 反覆執行 full build 或調整 `NODE_OPTIONS` heap；完整 build 驗證交由 GitHub Actions。

## Audit Evidence

Phase 2 production head audit covered 806 sitemap URLs. The latest audit output is stored in `seo_audit/phase2/summary.json`, `seo_audit/phase2/production-head-audit.json`, and `seo_audit/phase2/phase2-seo-audit.md`.

Key production audit findings before deployment of this Phase 2 code change:

- Sitemap URLs audited: 806
- Head-level blocking issue rows: 0
- Duplicate title groups: 7
- Duplicate description groups: 2
- Production pages with JSON-LD in head: 0
- Production pages without JSON-LD in head: 806
- Static href/link orphan candidates: 452
- Data-driven inferred orphan candidates: 0

The orphan audit was refined because the first literal href scan undercounted React/data-driven internal links. After adding sitemap/type-based inference for tools, categories, blog, knowledge, blueprints, and opportunities, no sitemap URL remained as an inferred orphan candidate.

## Implemented Fixes

### 1. Page Differentiation

The following duplicate tool metadata groups were differentiated in `shared/toolsConfig.ts` without removing or hiding any URL:

- `/tools/finance/roi-calculator` is now `ROI 投資回報率計算機` with a ROI/project/capital allocation description.
- `/tools/finance/exchange-rate-calculator` is now `即期匯率與手續費換算器` with a spread/fee/travel exchange description.
- `/tools/finance/stock-profit-loss-calculator` is now `股票獲利虧損試算器` with profit/loss/breakeven/return wording.
- `/tools/finance/affordability-calculator` is now `房貸負擔比試算器` with mortgage burden ratio and budget stress-test wording.
- `/tools/health/alcohol-calculator` is now `飲酒量與 BAC 估算器` with alcohol volume, body weight, time, and BAC-risk wording.

The following duplicate article frontmatter groups were differentiated:

- `shared/articles/finance/affordability-calculator-guide.md`
- `shared/articles/finance/home-affordability-calculator-guide.md`
- `shared/articles/health/alcohol-calculator-guide.md`
- `shared/articles/health/sobriety-calculator-guide.md`

Lightweight source verification in `seo_audit/phase2/source-verify.json` confirms 627 tool/article source rows now have zero duplicate titles and zero duplicate descriptions.

### 2. E-E-A-T Signals

The production sitemap already contains core trust pages: `/about`, `/editorial`, `/contact`, `/privacy`, `/terms`. Phase 2 Schema work reinforces these signals by making `Organization`, founder, publisher, editor, editorial policy URL, and Article author/editor fields explicit in JSON-LD. The SOP also requires weekly/monthly checks of author/editorial/update/source fields for important pages.

### 3. Internal Links and Orphan Pages

`scripts/phase2-seo-audit.mjs` was upgraded from literal href-only scanning to a combined model:

- Literal source links from `href`, `to`, `path`, `toolPath`, `routeBase`, and `canonicalPath`.
- Inferred data-driven links from `/tools`, `/tools/:category`, `/category/:category`, `/blog`, `/knowledge`, `/blueprints`, and `/opportunities` hubs to their detail pages.

Latest result: `inferredOrphanInSitemapCount = 0`. The original static-only orphan count remains documented as a crawler-method limitation, not a final orphan finding.

### 4. Structured Data Schema

`scripts/prerender.mjs` now injects JSON-LD into prerendered HTML head. Every prerendered public route receives baseline graph data:

- `Organization`
- `WebSite`
- `WebPage`
- `BreadcrumbList`

Tool pages additionally receive:

- `SoftwareApplication`

Article, knowledge, blueprint, and opportunity detail pages additionally receive:

- `Article`

The JSON-LD is injected during prerender so it appears in the production HTML head after deployment, addressing the production audit finding that all 806 pages currently have `jsonLdCount = 0`.

### 5. GSC Continuous Monitoring

`seo_audit/phase2/gsc-monitoring-and-authority-sop.md` defines a weekly GSC monitoring table, deployment freshness rule, URL Inspection checklist, and post-deployment sample URLs for title/canonical/robots/description/JSON-LD verification.

### 6. External Authority Signals

The same SOP includes an external authority tracking table covering brand profile, GitHub/README, editorial transparency, tool directory submissions, and content source citation improvements. The policy is quality-first: no mass low-quality backlink operations.

## Lightweight Verification Performed

Commands run locally were limited to source/static checks, not full build:

- `node --check scripts/prerender.mjs`
- `node scripts/phase2-seo-audit.mjs`
- `node scripts/phase2-source-verify.mjs`

`phase2-source-verify` result:

```json
{
  "checkedRows": 627,
  "duplicateTitles": [],
  "duplicateDescriptions": [],
  "schemaChecks": {
    "hasJsonLdScript": true,
    "hasOrganization": true,
    "hasWebSite": true,
    "hasBreadcrumbList": true,
    "hasSoftwareApplication": true,
    "hasArticle": true
  },
  "pass": true
}
```

## Required Next Validation

After commit and push, GitHub Actions must be used as the authoritative build validation environment. Railway production freshness must be checked separately after deployment by fetching production HTML heads and confirming JSON-LD and updated metadata are present.

## Recheck Addendum: Duplicate Verification Correction

A post-delivery manual review found that `sobriety-calculator` in the primary `shared/toolsConfig.ts` tools array still used `name: "酒精濃度計算機"`, while the previous report described it as differentiated toward sobriety/clearance time. That manual finding was valid. The previous `scripts/phase2-source-verify.mjs` was insufficient because it used a broad regex over any object with a `/tools/` path and therefore mixed the primary `export const tools: Tool[]` records with bottom-of-file shorthand constants. The corrected verifier now parses only the primary tools array and parses article frontmatter separately. It also explicitly checks all seven known duplicate groups.

The source was corrected so `/tools/health/sobriety-calculator` now uses `name: "清醒時間與酒精代謝計算機"` and a description focused on alcohol metabolism time and safe waiting interval. The complete before/after evidence is in `seo_audit/phase2/duplicate-recheck-report.md`. The corrected strict verification now reports zero duplicate titles, zero duplicate descriptions, no duplicate tool ids or paths in the primary array, no failures among the seven duplicate cases, and `pass: true`.
