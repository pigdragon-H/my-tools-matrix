# FORMULA UNIVERSE ENTERPRISE CONSTITUTION
# Version: 3.0 FINAL
# Status: ACTIVE — All AI Must Follow
# Owner: Victor (PiGragon-H)
# Architect: GPT
# Auditor: Claude
# Execution: Manus, SuperNinja
# Last Updated: 2026-05-27

---

## PRIME DIRECTIVE

Formula Universe is NOT a calculator website.
Every tool must become:
Knowledge Assistant + Decision Assistant + Business Unit

Forbidden:
- Calculator only
- Empty FAQ
- No references
- No journey
- No monetization

---

## PART 1: CATEGORY CONSTITUTION v2

Single source rule:
Internal key = Display = URL = SEO = Analytics = ALL SAME

Canonical Category Keys:

| Key | ZH | EN | URL |
|---|---|---|---|
| finance | 財經投資 | Finance | /tools/finance |
| health | 健康生活 | Health | /tools/health |
| developer | 開發工具 | Developer | /tools/developer |
| education | 教育學習 | Education | /tools/education |
| science | 科學工程 | Science | /tools/science |
| travel | 旅遊地理 | Travel | /tools/travel |
| productivity | 職場效率 | Productivity | /tools/productivity |
| ai | AI 工具 | AI Tools | /tools/ai |

Forbidden abbreviations (permanent):
- fin, dev, edu, trv, prd
- /tools/dev, /tools/fin
- category: "dev"

Legacy redirects required:
- /tools/dev -> /tools/developer
- /tools/fin -> /tools/finance

---

## PART 2: AI GOVERNANCE

Victor (Universe Architect):
- Direction, Approval, Business decisions
- Forbidden: manual code copy, manual validation

GPT (Architecture Brain):
- Architecture, Constitution, Acceptance

Claude (Universe Auditor):
- Knowledge, Business spec, Quality Gate (PASS/FAIL)

SuperNinja (UI Layer):
- UI design, Journey, Components

Manus (Execution Agent):
- Batch production, Code execution, Direct push

Rule: AI first, Human last.
Victor approves, AI executes.

---

## PART 3: TOOL STATE MACHINE

States: LEGACY -> REBUILDING -> GOLD -> PUBLISHED

Maintain: docs/TOOL_REBUILD_STATUS.md

Example:
- BMI = GOLD
- BMR = REBUILDING
- CAGR = LEGACY

---

## PART 4: HOMEPAGE CONSTITUTION

Strategy: PATCH (upgrade, not rebuild)
Homepage = Gold Entry Prototype

Section order (fixed, no reorder):
1. Hero
2. Discovery
3. Journey
4. Knowledge Hub
5. Tool Clusters
6. Latest Guides
7. Trust
8. About Formula Universe v2
9. CTA
10. Footer

Homepage business reserve:
- AdSlot
- SponsorCard
- PremiumGate entry
- Feature flags
- Analytics reserve
- ZH/EN switch

---

## PART 5: BMI GOLD MASTER STRATEGY

BMI = Gold Tool Master (mother template)
Strategy: REBUILD, not patch

All future tools clone from BMI:
- Health: BMR, TDEE, Calories, Protein, Body Fat
- Finance: CAGR, Retirement, FIRE, Withdrawal
- Developer: JSON, Regex, API, JWT

---

## PART 6: GOLD TOOL FACTORY — 15 LAYERS

Every tool MUST contain ALL layers:

L1: Hero
- Tool name (zh + en)
- Purpose, Audience, CTA
- Language switch (top-right, ZH/EN)

L2: Quick Guide
- 3-5 steps, one sentence each

L3: Examples
- Minimum 3: Normal, High, Low
- Each: input + output + interpretation

L4: Calculator
- Accurate calculation
- Input validation
- Formula display

L5: Result Intelligence
- Specific interpretation of current result
- Risk + Action recommendation
FORBIDDEN: "BMI = 22.5, done."
REQUIRED: "BMI = 22.5, normal range. Maintain calories, resistance training, monthly tracking."

L6: Human Advisory
- Minimum 3 zones: low/normal/high
- Each zone: meaning + decision + warning + limit

L7: Journey Layer
- Tool decision journey
- Example: BMI -> BMR -> TDEE -> Deficit -> Progress

L8: Knowledge
- Definition
- Complete formula (with variable explanation)
- Interpretation method
- Limitations
- Context

L9: FAQ
- Minimum 4 deep questions
- Must cover: accuracy, comparison, limitations

L10: Related Tools (3-6)

L11: Related Articles (2-4)

L12: References
- WHO, CDC, NIH or other authorities
- Mandatory for health/finance/science tools

L13: Trust
- Source statement + scope + disclaimer

L14: Business Layer (MANDATORY)
- AdSenseWrapper (import + use)
- Affiliate block (bilingual + disclaimer)
- AdSlot reserve positions

L15: Premium Layer (reserve, no activation)
- PremiumGate component
- Feature flag: ENABLE_PREMIUM = false

---

## PART 7: KNOWLEDGE CONSTITUTION

Forbidden: result = number, done.

Required for every tool:
- Meaning interpretation
- Risk explanation
- Action advice
- Context
- Journey connection
- Limitation statement

---

## PART 8: I18N CONSTITUTION

All tools: ZH + EN mandatory.

Browser locale detection (required):
const getBrowserLang = (): Lang => {
  const locale = (typeof navigator !== "undefined" && navigator.language) || "zh"
  return locale.startsWith("zh") ? "zh" : "en"
}

File structure:
locales/
  zh.ts
  en.ts

Language switch button (top-right, fixed style):
[繁中] [EN] — pill button, blue selected state

Forbidden:
- Hardcoded text in JSX
- Inline { zh: "...", en: "..." } objects
- External i18n packages

---

## PART 9: DESIGN SYSTEM CONSTITUTION

Single UI system. No per-tool design drift.

Spacing: 8px grid
Cards: Hero, Journey, Knowledge, Premium, Affiliate, Ads
Buttons: Primary, Secondary, Premium

Forbidden:
- New UI packages per tool
- Custom design per tool

---

## PART 10: SEO CONSTITUTION

Every tool must have:
- Meta title + description
- OG tags
- FAQ schema
- Tool schema
- Breadcrumb
- Journey links (internal linking)

Forbidden: calculator page with no SEO structure

---

## PART 11: ANALYTICS RESERVE

Reserve only. No activation now.

Tools: GA4, Posthog (future)

Events to reserve:
- homepage_view
- tool_view
- tool_submit
- journey_click
- knowledge_click
- premium_click
- affiliate_click

---

## PART 12: BUSINESS OPERATING SYSTEM

Monetization reserved from architecture layer.

A. Ads (AdSense)
- Component: AdSenseWrapper.tsx (exists)
- Reserve: AdSlot.tsx (to build)
- Positions: Hero below, Knowledge middle, FAQ below
- No AdSense script now

B. Affiliate
- Component: AffiliateCard.tsx (to build)
- Now: href = #affiliate-xxx
- Later: replace with real links
- Examples by category:
  health -> scale, body fat monitor, protein, course
  finance -> ETF, broker, course
  travel -> Booking, insurance, tickets
  developer -> tool subscriptions, courses

C. Sponsor
- Component: SponsorCard.tsx (to build)
- Examples: WHO, CDC, partners, brands

---

## PART 13: PREMIUM + STRIPE CONSTITUTION

Reserve only. No live billing.

Components to build:
- PricingCard.tsx
- CheckoutButton.tsx
- SubscriptionCard.tsx
- BillingStatus.tsx
- PremiumGate.tsx

Plans:
- FREE: single calculation
- PRO: history, tracking, export, AI advisor
- TEAM: shared, knowledge base
- AGENCY: white label, multi-user

Feature flags (all default OFF):
- ENABLE_ADS = false
- ENABLE_PREMIUM = false
- ENABLE_STRIPE = false
- ENABLE_AFFILIATE = true
- ENABLE_AI = false
- ENABLE_ANALYTICS = false
- ENABLE_SPONSOR = false

Backend reserve:
payments/stripe/webhooks/subscriptions/billing/

ABSOLUTELY FORBIDDEN:
- Real charges
- Real Stripe keys
- Active webhooks

---

## PART 14: AI ADVISOR SYSTEM (FUTURE)

Free: single result
Premium:
- Journey tracking
- Weekly analysis
- AI recommendations
- Export

Example BMI Premium:
Free: BMI = 22.5
Premium: 8-week fat loss roadmap + protein plan + training + tracking

---

## PART 15: EXECUTION PIPELINE

Spec
  -> Clone (copy BMI mother template)
  -> Knowledge Fill
  -> Journey
  -> Business Layer
  -> Premium Layer (reserve)
  -> Self Review
  -> Claude Validation (PASS/FAIL)
  -> git push origin main
  -> Published

---

## PART 16: QUALITY GATE

PASS only if ALL conditions met:

Structure:
[ ] Hero exists (badge + title + subtitle + CTA)
[ ] Language switch exists (top-right)
[ ] Quick Guide exists
[ ] Examples minimum 3
[ ] Calculator correct
[ ] Result Intelligence exists (not empty)
[ ] Human Advisory minimum 3 zones
[ ] Journey Layer exists
[ ] Knowledge exists (definition + formula + limits)
[ ] FAQ minimum 4 deep questions
[ ] Related Tools exists
[ ] References exists
[ ] Trust exists

Business:
[ ] AdSenseWrapper import exists
[ ] AdSenseWrapper used (correct position)
[ ] Affiliate block exists (bilingual)
[ ] Affiliate disclaimer exists
[ ] Premium Layer reserved

Technical:
[ ] ZH switch works
[ ] EN switch works
[ ] No hardcoded text
[ ] No empty sections
[ ] category key is full word
[ ] Folder structure correct (with locales/)
[ ] export function name correct
[ ] pnpm run build success
[ ] SEO meta tags exist

Otherwise: FAIL

---

## PART 17: SELF REVIEW CONSTITUTION

Mandatory before any commit:

Check:
[ ] No empty sections
[ ] No hardcoded text
[ ] Business layer exists
[ ] Journey exists
[ ] FAQ exists and deep
[ ] References exist
[ ] Premium reserved
[ ] ZH/EN both work
[ ] pnpm build success

---

## PART 18: PHASE PLAN

Phase A: Homepage upgrade (ACTIVE)
Phase B: BMI Gold Master rebuild (ACTIVE)
Phase C: Alpha batch
  Health: BMI, BMR, TDEE, Calories, Protein, Body Fat
  Finance: CAGR, Retirement, FIRE, Withdrawal
  Developer: JSON, Regex, API, JWT
Phase D: Mass production (100+ tools)
Phase E: Business activation (Ads + Affiliate + Premium + Stripe)
Phase F: AI Advisor activation

---

## PART 19: FOLDER STRUCTURE

Tools:
client/src/tools/[category]/[ToolName]/
  index.tsx
  locales/
    zh.ts
    en.ts

Pages:
client/src/pages/[PageName]/
  index.tsx
  locales/
    zh.ts
    en.ts

Business components:
client/src/components/business/
  AdSlot.tsx (to build)
  SponsorCard.tsx (to build)
  PremiumGate.tsx (to build)

Config:
client/src/config/
  featureFlags.ts (to build)

Analytics:
client/src/analytics/
  events.ts (to build)

---

## VERSION HISTORY

| Version | Date | Notes |
|---|---|---|
| v1.0 | 2026-05-26 | Initial |
| v2.0 | 2026-05-27 | Category full words, business layer |
| v3.0 | 2026-05-27 | Complete GPT v3 integration, AI governance, state machine, design system, SEO, analytics |

---

Formula Universe = AI Native Knowledge + Business Infrastructure
Not a calculator. A knowledge empire.

Universe Architect: Victor (PiGragon-H)
Architecture Brain: GPT
Universe Auditor: Claude
Execution Agent: Manus
UI Layer: SuperNinja
