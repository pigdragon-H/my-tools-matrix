# Phase G — Design Polish — CLOSEOUT

**Branch:** `feat/phase-G-design-polish`
**Base:** `c68ff62` (main)
**Commits:** 5 (Sprint A → E) + Sprint F audit captures (not committed — runtime artifacts)

## Why Phase G existed

User requested **"$50,000 international top-tier designer team quality"** for the Formula Universe storefront before mass-producing the next 5,000+ tools. v1 design audit was contaminated by OCR-summary errors, so v2 was redone with pixel inspection. v2 surfaced 6 actionable decisions, all approved by user.

## Sprint inventory

| Sprint | Theme | Commit |
| --- | --- | --- |
| **A** | Strip placeholders, brand sweep, footer year, stats banner rewrite | `728b966` |
| **B** | Tech × Nature Calm palette (warm-white cards, neutral grey-green bg, forest accent, warm-ink dark) | `1305e98` |
| **C** | Resend ESP wired (newsletter + per-plan early-access notify) | `fcbb946` |
| **D** | FlashBannerStrip — chevrons, pause-on-hover, keyboard nav (←/→), reduced-motion, slowed autoplay (4.2s → 6s) | `2bde7cb` |
| **E** | About.tsx full rewrite + Home.tsx Section 1 INTRODUCTION rhythm | `ff27a30` |
| **F** | Visual regression — 14 routes × {light, dark, mobile} = 42 screenshots | (audit-v3/) |

## Sprint A — Placeholder & brand cleanup

- Stats banner rewritten: `50000 / formula indicators (target)` → `6 / decision paths` (no aspirational vapor numbers)
- `CountUpStat` color fixed: `text-slate-900 dark:text-white` → `text-white drop-shadow-sm` (was invisible black-on-blue)
- Footer copyright: `© 2026` → `© {new Date().getFullYear()}`
- Footer "Categories" column: `grid grid-cols-2` → `flex flex-col` (single column, scannable)
- 13 files swept: `Tool Matrix` / `工具矩陣` / `工具矩阵` → `Formula Universe`
- `featureFlags.ts`: `ENABLE_ADS: true → false`, `ENABLE_NEWSLETTER: false → true`

## Sprint B — Tech × Nature Calm palette

- User explicitly rejected old-jade. New direction: emphasize AI / 科技 / 健康 / 科學 / 軟體 / 自然 with **reliable, steady operational integrity behind**.
- Implemented in `client/src/index.css` — Tailwind v4 CSS-based config (no `tailwind.config.ts`).
- Light mode: warm-white cards `oklch(0.98 0.005 110)`, neutral grey-green bg `oklch(0.985 0.004 130)`, indigo-600 primary preserved, forest-green accent `oklch(0.94 0.025 165)`.
- Dark mode: warm-ink base `oklch(0.16 0.012 220)`, blue/violet hierarchy preserved.

## Sprint C — Resend ESP

- New `server/routers/newsletter.ts` — tRPC mutation `newsletter.subscribe`. Direct `fetch` to Resend Audiences API (no SDK). Fail-soft stub-mode if `RESEND_API_KEY` missing. Treats 422 "already exists" as success.
- `NewsletterCta` rewritten — wired to mutation, loading spinner, aria-live feedback, accepts `source` prop.
- `PremiumTeaser` rewritten — "Plans in progress" badge removed; per-card "Notify me when available" reveals inline email form, posts with `source='pricing-interest:{plan}'`.

## Sprint D — Carousel polish

- ChevronLeft / ChevronRight prev/next buttons, absolute-positioned, focus-visible ring.
- Pause-on-hover via `isHovering` state, also pauses when keyboard focus is inside the strip.
- Keyboard nav: `←` / `→` advance slides when carousel has focus.
- "PAUSED" badge appears when paused so the user knows why autoplay stopped.
- Autoplay slowed 4.2s → 6s so readers can finish each slide; respects `prefers-reduced-motion`.

## Sprint E — About rewrite & Section 1 rhythm

- **About.tsx** — full rewrite. New structure:
  1. Hero: "Behind the technology, a quiet reliability" / 「在科技之後,留一份可靠」
  2. Six Pillars: AI · Technology · Health · Science · Software · Nature (3×2 grid)
  3. Operational Reliability: Our promise to users (4 cards — formulas traceable, data stays with you, mistakes get fixed, long-term not ad-driven)
  4. Why we built Formula Universe (narrative paragraph)
  5. Know · Act · Joy triad
  6. From the founder — PiGragon-H is a homophone of 豬龍 (zhū lóng); pig-dragon, by myself, free and at peace
  7. CTA: Start with one tool
  8. TrustStrip: Privacy / Terms / Editorial standards
- **Home.tsx Section 1** — second hero block converted into INTRODUCTION rhythm. Smaller h2 (was h1), `INTRODUCTION · 介紹` eyebrow, `py-16` instead of `py-28`, softer background gradient. Reads as section intro rather than "hero repeated twice" after the FlashBannerStrip carousel.

## Sprint F — Visual regression

Captured 42 full-page screenshots via Playwright + Vite preview server:

```
audit-v3/
├── light/   (14 routes @ 1440×900, light mode)
├── dark/    (14 routes @ 1440×900, dark mode)
└── mobile/  (14 routes @ 390×844, light mode)
```

**Routes captured:** home, about, dev, health, finance, media, knowledge, life, bmi, bmr, editorial, privacy, terms, notfound.

**Notes:**
- Category routes (dev, media, knowledge, life) render small (≈22kB) because static preview has no backend; they fetch tool lists from tRPC at runtime. This is expected — visual regression for those will run post-deploy on Railway.
- BMI / BMR pages ≈27kB locally — same reason; full-screen interactive UI hydrates via tRPC.
- Home, About, Editorial, Privacy, Terms render fully and look excellent in all three modes.

## Build status

- `pnpm build` passes — 2498 modules, 5.09s.
- 0 net-new typecheck errors introduced. Pre-existing errors in `BmiCalculator/BmrCalculator/locales` were verified on `c68ff62` baseline before Phase G work.

## Files changed (Phase G total)

```
client/src/components/business/NewsletterCta.tsx     | full rewrite
client/src/components/business/PremiumTeaser.tsx     | full rewrite
client/src/components/Navbar.tsx                     | brand sweep
client/src/config/featureFlags.ts                    | ads off, newsletter on
client/src/index.css                                 | palette rewrite
client/src/pages/About.tsx                           | full rewrite (~280 lines)
client/src/pages/Editorial.tsx                       | brand sweep
client/src/pages/Home.tsx                            | stats, footer, carousel, Section 1
client/src/pages/Privacy.tsx                         | brand sweep
client/src/pages/Terms.tsx                           | brand sweep
server/routers.ts                                    | register newsletter
server/routers/newsletter.ts                         | NEW
scripts/audit_screenshots_v3.py                      | NEW (Sprint F harness)
PHASE-G-CLOSEOUT.md                                  | NEW (this file)
```

## Next

1. Push branch to origin, open PR.
2. Deploy preview to Railway (use existing `scripts/railway-status.sh`).
3. Re-run Sprint F against deployed URL to capture category/tool routes with real backend data.
4. User review → merge to `main`.
