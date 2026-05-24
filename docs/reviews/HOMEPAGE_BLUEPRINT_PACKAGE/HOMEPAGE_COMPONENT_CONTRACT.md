# HOMEPAGE_COMPONENT_CONTRACT.md

## Purpose

This document defines the component contract for the Formula Universe homepage. The homepage is the gateway into an AI Native Knowledge Operating System. Components must therefore be designed as stable knowledge-system sections, not decorative landing-page blocks.

This document is a contract only. It does not authorize `.tsx` edits, route changes, registry changes, Canonical ID creation, commits, or deployment.

## Global Contract Rules

1. Components must not create Canonical IDs.
2. Components must not modify `tool-registry.json`.
3. Components must not bypass registry or taxonomy.
4. Components must not introduce unapproved routes.
5. Components must not import prototype components into production.
6. Components may show static placeholders only when clearly marked as static.
7. Dynamic behavior must wait for Registry, taxonomy, and AI infrastructure approval.
8. The category key `dev` must not be replaced with `developer` in implementation data.

## Recommended Component Boundary

The homepage may be implemented either as local section components inside `Home.tsx` or as extracted React components. Extraction is not required unless explicitly authorized.

Target component names:

```txt
HeroSection
DiscoverySection
JourneySection
KnowledgeSection
ClusterSection
GuideSection
TrustSection
AboutSection
CTASection
FooterSection
```

## Shared Types

The following TypeScript-style contracts describe expected shape. They are specification only.

```ts
type StaticLink = {
  label: string;
  href?: string;
  status: "safe-route" | "placeholder" | "future-registry" | "future-ai";
};

type SectionMode = "static" | "registry-future" | "ai-future";

type DisclaimerLevel = "none" | "finance" | "health" | "legal" | "ai";
```

## HeroSection

### Responsibility

Introduce Formula Universe and provide the first entry points into tools, knowledge, and journeys.

### Props

```ts
type HeroSectionProps = {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  primaryCta: StaticLink;
  secondaryCta: StaticLink;
  tertiaryCta?: StaticLink;
  searchPlaceholder?: string;
  mode: SectionMode;
};
```

### Data Source

Current: static hardcoded copy or homepage copy config.  
Future: copy system config. Search may later use Registry or AI after approval.

### Forbidden Direct Changes

- Do not connect live AI search without approval.
- Do not add new routes without route review.
- Do not allow title wrapping regression.
- Do not import prototype Hero components.

## DiscoverySection

### Responsibility

Help users enter through tools, topics, knowledge, and discovery flow.

### Props

```ts
type DiscoverySectionProps = {
  title: string;
  subtitle: string;
  searchCards: Array<{
    title: string;
    description: string;
    mode: SectionMode;
  }>;
  trendingTools: string[];
  trendingTopics: string[];
  flowSteps: string[];
};
```

### Data Source

Current: static hardcoded placeholders.  
Future: Registry, SEO index, analytics, or knowledge graph.

### Forbidden Direct Changes

- Do not imply live search when search is static.
- Do not generate tool IDs.
- Do not link to non-existing pages.

## JourneySection

### Responsibility

Present structured decision paths across domains.

### Props

```ts
type JourneySectionProps = {
  journeys: JourneyCard[];
};

type JourneyCard = {
  id: "retirement" | "weight-loss" | "developer" | "ai" | "seo" | "travel" | string;
  title: string;
  domainKey: "finance" | "health" | "dev" | "ai" | "travel" | "productivity" | "education" | "science";
  steps: string[];
  description: string;
  disclaimerLevel: DisclaimerLevel;
  link?: StaticLink;
  mode: SectionMode;
};
```

### Required Static Journeys

```txt
Retirement: FIRE → CAGR → Retirement → Withdrawal
Weight Loss: BMI → BMR → Calories → Progress
Developer: JSON → API → Regex → Deploy
AI: Prompt → Token → Cost → Evaluation
SEO: Keyword → SERP → Content → Schema
Travel: Budget → Currency → Timezone → Itinerary
```

### Data Source

Current: static hardcoded cards.  
Future: journey registry derived from tool registry and knowledge graph.

### Forbidden Direct Changes

- Do not create journey links to unapproved routes.
- Do not create Canonical IDs.
- Do not make financial or medical advice claims.
- Do not use `developer` as a category key; use `dev`.

## KnowledgeSection

### Responsibility

Explain the knowledge layer behind tools and journeys.

### Props

```ts
type KnowledgeSectionProps = {
  title: string;
  subtitle: string;
  nodes: KnowledgeCard[];
};

type KnowledgeCard = {
  title: string;
  domainKey: string;
  description: string;
  relationships?: Array<"explains" | "uses_formula" | "has_example" | "has_limitation" | "next_step" | "related_tool">;
  mode: SectionMode;
};
```

### Data Source

Current: static Knowledge Hub cards.  
Future: knowledge node registry and relationship graph.

### Forbidden Direct Changes

- Do not generate AI explanations without reference control.
- Do not imply knowledge graph is live before graph data exists.

## ClusterSection

### Responsibility

Display stable taxonomy clusters for the tool universe.

### Props

```ts
type ClusterSectionProps = {
  clusters: ToolCluster[];
};

type ToolCluster = {
  visualKey: "FIN" | "HLT" | "DEV" | "EDU" | "SCI" | "TRV" | "PRD" | "AI";
  categoryKey: "finance" | "health" | "dev" | "education" | "science" | "travel" | "productivity" | "ai";
  title: string;
  description: string;
  toolCount?: number;
  link?: StaticLink;
  mode: SectionMode;
};
```

### Data Source

Current: static cluster cards.  
Future: canonical category config and registry-derived counts.

### Forbidden Direct Changes

- Do not invent category keys.
- Do not use `developer` instead of `dev`.
- Do not show registry-derived counts unless verified.

## GuideSection

### Responsibility

Surface educational guide entries tied to formulas, tools, and journeys.

### Props

```ts
type GuideSectionProps = {
  guides: GuideCard[];
};

type GuideCard = {
  title: string;
  summary: string;
  domainKey: string;
  relatedTools?: string[];
  href?: string;
  mode: SectionMode;
};
```

### Data Source

Current: static guide placeholders.  
Future: content index, SEO article registry, or CMS.

### Forbidden Direct Changes

- Do not link to missing guides.
- Do not generate SEO articles inside homepage implementation tasks.

## TrustSection

### Responsibility

Communicate system trust, architecture discipline, and reviewability.

### Props

```ts
type TrustSectionProps = {
  title: string;
  subtitle: string;
  claims: TrustClaim[];
};

type TrustClaim = {
  label: string;
  description: string;
  verified: boolean;
  source?: string;
};
```

### Data Source

Current: static conservative claims.  
Future: verified registry metrics and graph metrics.

### Forbidden Direct Changes

- Do not use unverified scale claims.
- Do not claim live AI personalization unless implemented.

## AboutSection

### Responsibility

Explain Formula Universe as an AI Native Knowledge Operating System.

### Props

```ts
type AboutSectionProps = {
  title: string;
  body: string;
  pillars: Array<{
    title: string;
    description: string;
  }>;
};
```

### Data Source

Static copy system.

### Forbidden Direct Changes

- Do not turn About into marketing fluff.
- Do not claim features that do not exist.

## CTASection

### Responsibility

Provide final action choices.

### Props

```ts
type CTASectionProps = {
  title: string;
  subtitle: string;
  actions: StaticLink[];
};
```

### Data Source

Current: static CTAs.  
Future: personalized journey recommendation after AI approval.

### Forbidden Direct Changes

- Do not create unapproved CTA routes.
- Do not add live personalization without AI infrastructure approval.

## FooterSection

### Responsibility

Provide compact brand summary, stable navigation, and policy links.

### Props

```ts
type FooterSectionProps = {
  brandSummary: string;
  navLinks: StaticLink[];
  policyLinks: StaticLink[];
  copyright: string;
};
```

### Data Source

Static site config or hardcoded safe links.

### Forbidden Direct Changes

- Do not use Footer as a second homepage.
- Do not add registry-generated links without approval.

## Contract Acceptance

A homepage implementation satisfies this contract only if it:

- Uses the H12 render order.
- Includes at least 6 Journey cards.
- Includes exactly 8 Tool Cluster cards.
- Includes a dedicated About section.
- Keeps Hero title visually stable.
- Does not import prototypes into production.
- Does not modify Registry, Canonical IDs, or category keys.
