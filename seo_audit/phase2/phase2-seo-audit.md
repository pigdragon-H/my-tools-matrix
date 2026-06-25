# Phase 2 SEO Audit Report

Generated: 2026-06-25T22:45:35.171Z
Production base: https://my-tools-matrix-production.up.railway.app

## Executive Summary

- Sitemap URLs audited: 806
- SEO head issue rows: 0
- Duplicate title groups: 7
- Duplicate description groups: 2
- Static href/link orphan candidates: 452
- Data-driven inferred orphan candidates: 0
- Pages with JSON-LD in production head: 0
- Pages without JSON-LD in production head: 806

## URL Type Distribution

- tool_detail: 342
- article: 287
- knowledge_detail: 146
- category: 13
- trust_static: 5
- blueprint_detail: 3
- opportunity_detail: 3
- home: 1
- blog_index: 1
- tools_index: 1
- blueprints_index: 1
- opportunities_index: 1
- reserved_opportunity: 1
- knowledge_index: 1

## High-Risk SEO Head Issues

No head-level blocking issues found by this audit.

## Duplicate Title Groups

- count=2 title=投資報酬率計算機｜Formula Universe
  - /tools/finance/investment-return-calculator
  - /tools/finance/roi-calculator
- count=2 title=匯率換算計算機｜Formula Universe
  - /tools/finance/currency-converter
  - /tools/finance/exchange-rate-calculator
- count=2 title=股票損益計算機｜Formula Universe
  - /tools/finance/stock-profit-calculator
  - /tools/finance/stock-profit-loss-calculator
- count=2 title=購屋負擔能力計算機｜Formula Universe
  - /tools/finance/home-affordability-calculator
  - /tools/finance/affordability-calculator
- count=2 title=酒精濃度計算機｜Formula Universe
  - /tools/health/sobriety-calculator
  - /tools/health/alcohol-calculator
- count=2 title=購屋負擔能力計算機使用指南：如何把財務數字整理成可判斷的估算參考｜Formula Universe 工具知識庫
  - /blog/finance/affordability-calculator-guide
  - /blog/finance/home-affordability-calculator-guide
- count=2 title=酒精濃度計算機使用指南：如何理解身體數據與估算結果的限制｜Formula Universe 工具知識庫
  - /blog/health/alcohol-calculator-guide
  - /blog/health/sobriety-calculator-guide

## Duplicate Description Groups

- count=2 description=購屋負擔能力計算機可協助使用者整理與估算相關數字。本文說明適用情境、輸入檢查、結果解讀與限制，提醒工具結果僅作估算參考，不能取代專業意見。
  - /blog/finance/affordability-calculator-guide
  - /blog/finance/home-affordability-calculator-guide
- count=2 description=酒精濃度計算機可協助使用者整理與估算相關數字。本文說明適用情境、輸入檢查、結果解讀與限制，提醒工具結果僅作估算參考，不能取代專業意見。
  - /blog/health/alcohol-calculator-guide
  - /blog/health/sobriety-calculator-guide

## Internal Link / Orphan Risk

Static linked internal paths found: 375
Data-driven inferred linked paths found: 804
Combined linked paths found: 827
Sitemap URLs not found in literal static href/Link scan: 452
Sitemap URLs still not found after data-driven inference: 0

## Schema Coverage

Production pages with JSON-LD in head: 0
Production pages without JSON-LD in head: 806
Source files containing Schema/JSON-LD markers: 4
- client/src/pages/ArticlePage.tsx
- client/src/tools/converter/PdfMerge/index.tsx
- client/src/tools/converter/PdfToWord/index.tsx
- client/src/tools/developer/JsonFormatter/index.tsx

## E-E-A-T / Trust Signals

Core trust pages in sitemap: /about, /editorial, /contact, /privacy, /terms
Missing core trust pages: none
Source files with E-E-A-T terms: 742
Source files with trust/link terms: 256

## Recommended Phase 2 Fix Direction

1. Add sitewide Organization/WebSite JSON-LD and page-level BreadcrumbList JSON-LD during prerender/SSR injection so every indexable URL has baseline structured data.
2. Keep public URLs indexable; do not use noindex to resolve weak pages. Improve metadata, links, and context instead.
3. Prioritize the post-inference orphan list, not the literal href-only list, because most URLs are rendered from registries.
4. Strengthen E-E-A-T by making author/editorial/review/update signals consistently visible on article/tool/lane pages.
5. Track GSC Coverage, Page indexing, Sitemaps, and URL Inspection deltas weekly after deployment.
