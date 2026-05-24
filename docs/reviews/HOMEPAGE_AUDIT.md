# Homepage Audit

**Status:** Draft only — GPT review required  
**Task:** H01 Homepage Reconstruction Audit  
**Audited file:** `client/src/pages/Home.tsx`  
**Route context:** `/` and `/tools` route to `Home` in `client/src/App.tsx`  
**Constraint:** Audit only. No code, no TSX edits, no production change, no commit, no deploy.

## Executive summary

The current homepage is a simple category-entry homepage. It has a clear hero, a short trust/features bar, a 12-category grid, and a footer. This structure is functional for broad category browsing, but it is not yet a Formula Universe reconstruction homepage. It does not sufficiently expose Gold Tools, knowledge content, semantic clusters, featured topics, article discovery, search, or a Universe Explorer. The homepage currently behaves like a category directory rather than a guided discovery surface for tools, topics, and knowledge systems.

## Hero clarity

The hero communicates the product as a tool matrix that supports decisions with data. It includes a clear headline, supporting paragraph, and two calls to action: start using finance tools and read articles. The message is understandable, but it is generic and does not yet communicate the Formula Universe concept, Gold Tools, or high-value tool discovery. The primary CTA routes directly to finance tools, which may be too narrow for a universal homepage.

**Readiness:** Medium.

## Trust

The homepage includes a three-item feature bar with instant calculation, privacy safety, and visual output. This is useful trust framing, especially local calculation and privacy. However, trust remains generic. It does not mention source quality, formulas, review standards, accuracy boundaries, medical/financial disclaimers by universe, or Gold Tool quality criteria.

**Readiness:** Medium-low.

## Navigation

The homepage links to `/tools/finance`, `/blog`, category pages through the grid, and footer destinations including blog, about, finance tools, health tools, privacy policy, and terms. This provides basic navigation but lacks high-level discovery paths such as search, featured tools, featured guides, universe explorer, and semantic clusters. The `/tools` route also maps to Home, which may create ambiguity between homepage and tool index.

**Readiness:** Medium.

## Universe visibility

Universe visibility is limited. The homepage shows 12 categories from `categoriesConfig`, but it does not frame them as universes, galaxies, clusters, or knowledge domains. It does not explain how Finance, Health, Dev, Science, or other categories relate to each other. There is no Universe Explorer module.

**Readiness:** Low-medium.

## Knowledge visibility

Knowledge visibility is weak. The homepage has a blog CTA and footer blog link, but no visible knowledge hub, latest guides, educational topics, formulas, explanations, or article cards. The current page primarily exposes tool categories, not knowledge content.

**Readiness:** Low.

## Search

No search module is visible in the current homepage file. Users must choose a category or click blog; they cannot quickly search for BMI, CAGR, JSON Formatter, TDEE, ROI, or topic guides from the homepage. Search is a major discovery gap.

**Readiness:** Low.

## Featured tools

The category cards show up to three tool previews per category, which partially supports tool discovery. However, there is no dedicated Featured Tools section for high-value tools, newly reconstructed Gold Tools, popular tools, or cross-universe recommendations. Tool previews are nested inside category cards and may not be enough for direct tool discovery.

**Readiness:** Medium-low.

## Featured topics

No dedicated featured topics section is present. The homepage does not surface topics such as body composition, investment growth, JSON formatting, tax planning, productivity, travel planning, or unit conversion. Topic discovery is therefore underdeveloped.

**Readiness:** Low.

## Tool discovery

Tool discovery is category-first. Users can scan 12 category cards and see up to three tools per category. This works for users who already understand the category they need, but it is less effective for users searching by task, formula, problem, or intent. There is no search, no popular tools module, no recently updated tools, no Gold Tools module, and no intent-based discovery.

**Readiness:** Medium.

## Article discovery

Article discovery is minimal. The hero has a blog button and the footer links to blog, but there are no latest guides, featured guides, article clusters, or topic cards on the homepage. Article discovery is not integrated into the homepage journey.

**Readiness:** Low.

## Semantic cluster exposure

Semantic cluster exposure is absent. The homepage does not show related tool clusters such as BMI → BMR → TDEE → Calories, CAGR → ROI → Compound Interest, or JSON Formatter → JSON Validator → JSON Minifier. This prevents the homepage from demonstrating the reconstruction strategy of connected tools and knowledge.

**Readiness:** Low.

## Mobile

The homepage uses responsive grid classes and likely stacks well on mobile. The hero, features bar, category grid, and footer should be readable. However, mobile discovery may become long because 12 category cards stack vertically and there is no search shortcut or featured module near the top. Mobile needs a faster path to high-value tools and search.

**Readiness:** Medium.

## Conversion

The homepage has two hero CTAs and category cards, but conversion is not optimized. The primary CTA points to finance tools rather than a universal explorer or high-intent tool. There is no Gold Tool CTA, no popular tools section, no search-first conversion, no newsletter/save/continue path, and no guided journey from tool to article or article to tool.

**Readiness:** Medium-low.

## Footer

The footer is simple and useful. It includes brand text, blog, about, finance tools, health tools, privacy, and terms. It does not include a broader universe index, popular tools, featured guides, source/review policy, or contact/support path. Footer is acceptable for MVP but not complete for a reconstruction homepage.

**Readiness:** Medium.

## Overall verdict

The current homepage is stable as an MVP category directory but not sufficient as the Formula Universe homepage. It should be reconstructed into a layered discovery experience with Hero, Featured Tools, Featured Topics, Universe Explorer, Knowledge Hub, Tool Clusters, Latest Guides, and Footer. The highest-priority gaps are search, knowledge visibility, semantic clusters, featured tools, and article discovery. No production change should be made until GPT review and Victor approval define the target homepage architecture.
