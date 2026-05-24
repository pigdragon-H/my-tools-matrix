# Homepage Gaps

**Status:** Draft only — GPT review required  
**Task:** H01 Homepage Reconstruction Audit  
**Audited file:** `client/src/pages/Home.tsx`  
**Constraint:** Audit only. No code, no TSX edits, no production change, no commit, no deploy.

| Current | Problem | Impact | Fix | Priority |
|---|---|---|---|---|
| Hero describes a general tool matrix and decision support. | Does not communicate Formula Universe, Gold Tools, or semantic knowledge system. | Users may not understand the platform’s reconstruction direction or quality promise. | Reframe hero around tools, formulas, guides, and connected knowledge. | High |
| Primary CTA links to `/tools/finance`. | CTA is too narrow for a universal homepage. | New users may assume the site is finance-first rather than multi-universe. | Use a universal CTA such as Explore Tools, Search Tools, or Open Universe Explorer. | High |
| Secondary CTA links to `/blog`. | Article discovery is isolated rather than integrated. | Users may not discover guides connected to tools. | Add Knowledge Hub and Latest Guides modules on homepage. | High |
| Feature bar shows instant calculation, privacy, and visual output. | Trust is generic and does not describe source quality, formula review, or Gold Tool standards. | Quality signal is weaker than required for health/finance tools. | Add trust language for formulas, sources, review standards, and disclaimers. | Medium-high |
| Homepage shows 12 category cards. | Categories are not framed as universes, clusters, or knowledge domains. | Universe architecture is invisible. | Add Universe Explorer with category/domain descriptions and cross-links. | High |
| Category cards show up to three tools each. | Featured tools are buried inside category cards. | High-value tools such as BMI, CAGR, JSON Formatter may not be discovered quickly. | Add dedicated Featured Tools section. | High |
| No visible search module. | Users cannot directly search by tool, formula, task, or topic. | Major discovery friction on desktop and mobile. | Add homepage search with tool/topic/article suggestions. | Critical |
| No featured topics section. | Task-based discovery is missing. | Users must know category taxonomy before exploring. | Add Featured Topics such as Body Composition, Investment Growth, JSON Utilities, Tax Planning. | High |
| No Knowledge Hub section. | Educational content is not visible from the homepage. | Articles and guides do not support tool journeys. | Add Knowledge Hub with guides, formulas, and explainers. | High |
| No Latest Guides section. | Fresh or important content is not promoted. | Blog value is hidden behind a generic CTA. | Add Latest Guides with article cards and topic labels. | Medium-high |
| No Tool Clusters section. | Semantic relationships like BMI → BMR → TDEE → Calories are not exposed. | Users cannot move naturally across related tools. | Add Tool Clusters module for semantic journeys. | High |
| No semantic cluster exposure. | Reconstruction knowledge graph is invisible. | Homepage does not support Formula Universe strategy. | Show cluster maps for Health, Finance, Dev, and other priority universes. | High |
| Footer links only a few destinations. | Footer lacks universe index, popular tools, source/review policy, and guide links. | Footer does not reinforce discovery or trust. | Expand footer with universes, popular tools, knowledge, policies, and review standards. | Medium |
| `/tools` route maps to Home. | Homepage and tool index may be ambiguous. | Users and SEO may see unclear page identity. | Decide whether `/tools` should be a dedicated tool directory. | Medium-high |
| Mobile layout likely stacks 12 cards. | Mobile users must scroll a long category list before discovering specific tools. | Mobile discovery friction increases. | Add mobile-first search and featured tools near top. | High |
| No conversion-oriented homepage path. | Users see CTAs but not a guided journey. | Lower engagement with tools and articles. | Add paths: Search → Tool, Featured Tool → Related Guide, Topic → Cluster. | Medium-high |
| No homepage metadata audit in file beyond defaultSeo usage. | SEO title/meta may be generic. | Homepage search presence may be weak. | Define homepage-specific title/meta aligned with Formula Universe. | Medium |
| No visible source or methodology link. | Trust policy is not easy to find. | Health/finance tool trust may be weaker. | Add review policy or source/methodology link in trust/footer area. | Medium-high |
