# Homepage Component Tree

Formula Universe Task H02 defines this component tree as a draft-only structural planning artifact. It is not TSX, not code, and not production integration. It exists only to describe the target homepage hierarchy for review.

```text
Homepage
├── Hero
│   ├── UniversePromise
│   ├── PrimarySearchOrFinder
│   ├── PrimaryCallToAction
│   ├── SecondaryCallToAction
│   └── TrustSignals
│
├── FeaturedTools
│   ├── SectionHeader
│   ├── FeaturedToolCard
│   ├── FeaturedToolCard
│   ├── FeaturedToolCard
│   └── ViewMoreToolsLink
│
├── FeaturedTopics
│   ├── SectionHeader
│   ├── TopicCard
│   ├── TopicCard
│   ├── TopicCard
│   └── TopicIndexLink
│
├── UniverseExplorer
│   ├── SectionHeader
│   ├── CategoryGroups
│   ├── FormulaGroups
│   ├── ToolIndexPreview
│   ├── TopicIndexPreview
│   └── ExplorerCallToAction
│
├── KnowledgeHub
│   ├── SectionHeader
│   ├── FeaturedGuideCard
│   ├── FormulaExplanationCard
│   ├── SourceAndReviewPolicyLink
│   └── KnowledgeIndexLink
│
├── ToolClusters
│   ├── SectionHeader
│   ├── ClusterPath
│   │   ├── ClusterStep
│   │   ├── ClusterStep
│   │   ├── ClusterStep
│   │   └── ClusterStep
│   ├── ClusterPath
│   └── ClusterIndexLink
│
├── LatestGuides
│   ├── SectionHeader
│   ├── LatestGuideCard
│   ├── LatestGuideCard
│   ├── LatestGuideCard
│   └── BlogOrGuidesIndexLink
│
└── Footer
    ├── ToolLinks
    ├── TopicLinks
    ├── KnowledgeLinks
    ├── CompanyLinks
    └── LegalLinks
```

## Structural notes

The target homepage should be organized as a discovery sequence. Hero introduces the universe and provides immediate action. FeaturedTools catches direct calculator intent. FeaturedTopics catches problem-based intent. UniverseExplorer provides broad browsing. KnowledgeHub makes explanation and trust visible. ToolClusters create semantic journeys. LatestGuides provides freshness and article discovery. Footer gives persistent navigation, policy access, and end-of-page recovery.

The component names above are descriptive planning names only. They should not be interpreted as implementation requirements, file names, imports, TSX components, route changes, or production architecture until the homepage reconstruction receives GPT review and Victor approval.

## Draft-only guardrail

No code is included in this document. No TSX is authorized. No production homepage work is authorized. No route, registry, config, deploy, or commit action is authorized by this component tree.
