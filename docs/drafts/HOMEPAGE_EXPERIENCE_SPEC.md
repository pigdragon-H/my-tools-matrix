# Homepage Experience Spec

Formula Universe Task H02 defines the target homepage as a draft-only experience specification. This document is not an implementation plan for immediate production work, and it contains no TSX, route changes, registry changes, or production integration instructions. Its purpose is to describe the intended homepage experience so GPT review and Victor approval can happen before any code work begins.

The target homepage should evolve from a simple category directory into a guided Formula Universe entry point. The homepage should help visitors understand what the product is, find a useful tool quickly, discover related topics, move between calculators and educational content, and enter longer semantic journeys such as BMI → BMR → TDEE → Calories. The homepage should support both human visitors and AI-assisted discovery by presenting clear entities, relationships, intent clusters, and trust signals.

## Hero

### Purpose

The Hero section should immediately explain Formula Universe as a trusted calculator, formula, and knowledge discovery system. It should communicate that visitors can calculate, understand, compare, and continue into related tools or guides. The current homepage hero is broad and useful, but the target hero should be more explicit about the universe concept, the breadth of tools, and the guided relationship between calculators and explanations.

### User intent

The Hero should satisfy first-arrival intent. A visitor may arrive with a vague need such as “I need a calculator,” a precise need such as “BMI calculator,” or a learning need such as “how is BMR calculated?” The Hero should make it obvious that the site supports all three behaviors: searching for a tool, browsing the universe, and learning from source-backed explanations.

### SEO role

The Hero should establish the homepage’s primary semantic identity. It should introduce the site as a calculator and formula universe rather than only a collection of category cards. The headline and supporting text should naturally include broad terms such as calculators, formulas, tools, health calculators, finance calculators, conversion tools, and knowledge guides without keyword stuffing. The Hero should also support internal linking by directing users to high-value discovery modules below.

### Knowledge role

The Hero should frame tools as explainable systems, not black-box widgets. It should tell users that each high-quality tool can include formulas, examples, limitations, FAQs, related guides, and next-step tools. This helps establish the knowledge layer before the visitor reaches a specific calculator.

### AI role

The Hero should provide a clean, machine-readable conceptual summary of the product if later translated into metadata, structured content, or AI discovery snippets. The language should clarify entities and relationships: Formula Universe contains calculators, formulas, guides, categories, topics, and tool journeys. This helps AI systems understand the homepage as a hub rather than a generic landing page.

### Mobile

On mobile, the Hero should be compact and action-first. The primary search or “find a tool” action should appear above the fold. Supporting proof points should be short, stacked, and scannable. The Hero should avoid large decorative space because mobile users need fast access to search, featured tools, or category exploration.

### Desktop

On desktop, the Hero can use a two-column layout. The left side should carry the headline, explanation, search/CTA, and trust cues. The right side can preview popular journeys, featured calculators, or an abstract universe map. The desktop experience should make the homepage feel like a product hub rather than a static directory.

### Conversion role

The Hero should convert uncertainty into action. Its main conversion is not payment; it is tool discovery. The primary action should guide users to search or explore, while secondary actions can direct them to featured tools, topic clusters, or knowledge guides. Success means the visitor understands what to do next within seconds.

## Featured Tools

### Purpose

Featured Tools should surface a curated set of high-value calculators rather than forcing every visitor to scan all categories. This section should highlight tools with strong demand, strong educational potential, or strategic importance in the Gold Tool pipeline. Examples could include BMI, BMR, TDEE, calories, mortgage, compound interest, percentage, unit conversion, and date/time utilities, pending review.

### User intent

Users often arrive wanting the most common tools without knowing the category path. Featured Tools should serve shortcut intent. A visitor should be able to see a familiar tool name, understand its use case, and enter the calculator directly without navigating through a full category directory.

### SEO role

Featured Tools should strengthen internal link equity toward priority tool pages. It should expose crawlable links to high-value calculators and help search engines understand which tools are important. The section should use descriptive labels and short summaries rather than vague card titles.

### Knowledge role

Each featured tool card should show that the calculator includes more than an input form. It can preview formula explanations, examples, FAQs, or related next tools. This reinforces the idea that Formula Universe connects calculation with understanding.

### AI role

Featured Tools should create clear entity connections between the homepage and individual calculator entities. If later paired with structured data or internal JSON, it could help AI agents identify the most important tools, their categories, and their relationships to guides and clusters.

### Mobile

On mobile, Featured Tools should appear as a compact horizontal carousel or stacked priority list. The first few cards should be the most valuable and should remain readable without dense metadata. Touch targets must be large enough for direct navigation.

### Desktop

On desktop, Featured Tools can use a grid with clear hierarchy. Each card should include the tool name, one-line use case, category label, and optional “next journey” hint. The grid should not overwhelm users with too many cards; curation matters more than volume.

### Conversion role

This section converts browsing into calculator entry. It should reduce friction for visitors who already know what they want and help them reach a tool quickly. It can also move users into Gold Tool experiences once those tools are reviewed and approved for production exposure.

## Featured Topics

### Purpose

Featured Topics should organize user intent around human concepts rather than internal category names alone. Topics may include health planning, personal finance, time and date, math help, unit conversion, developer utilities, pregnancy and family, fitness goals, or business calculations, depending on available reviewed content.

### User intent

Some visitors know their problem but not the exact calculator. A visitor may think “I want to understand weight loss,” “I need salary math,” or “I need date calculations.” Featured Topics should capture this exploratory intent and lead visitors to relevant tools and guides.

### SEO role

Featured Topics can support topical authority by grouping related tools and knowledge pages. Topic pages or topic modules can create strong internal linking around semantic themes, helping search engines understand the breadth and depth of the Formula Universe content graph.

### Knowledge role

Topics should connect calculators with explainers, examples, limitations, and related questions. For example, a health topic may connect BMI, BMR, TDEE, calories, healthy weight range explanations, and medical disclaimers. This helps users learn in context.

### AI role

Featured Topics provide semantic clusters that AI systems can interpret as intent groups. These clusters can later support recommendation logic, natural-language search, and AI summaries such as “tools for weight management” or “calculators for loan planning.”

### Mobile

On mobile, topics should appear as simple, tappable chips or cards with short labels. The section should avoid long paragraphs and should support quick scanning. A mobile user should be able to pick a topic with one thumb action.

### Desktop

On desktop, topics can appear as a richer grid or cluster map. Each topic can show a short description and a few linked tools or guides. Desktop space allows a more editorial presentation, but the layout should still prioritize clarity.

### Conversion role

Featured Topics convert vague intent into structured exploration. They are important for users who are not ready to choose a specific tool but can choose a subject area. They also create pathways into multi-step journeys.

## Universe Explorer

### Purpose

Universe Explorer should become the central browsing system of the homepage. It should allow users to move across categories, tools, formulas, topics, and guides. It can replace the feeling of a static directory with an interactive or structured map of the Formula Universe.

### User intent

Explorer intent is broad and investigative. Users may want to browse all categories, compare tools, find a formula, or discover what is available. Universe Explorer should support both direct navigation and curiosity-driven discovery.

### SEO role

Universe Explorer should expose important internal links in a structured and crawlable way. It should help distribute authority across categories and priority tools. It may also support future index pages for categories, formulas, and topics.

### Knowledge role

The Explorer should show that tools are connected to knowledge pages, FAQs, examples, and formula explanations. It should make the knowledge graph visible enough for users to understand that each calculator belongs to a broader learning system.

### AI role

Universe Explorer is the strongest AI-facing section conceptually. It can define the site’s entity graph: categories contain tools, tools use formulas, formulas support guides, guides connect to related questions, and journeys connect tools together. Even before implementation, the spec should preserve these relationships for later AI-assisted discovery.

### Mobile

On mobile, Universe Explorer should be simplified into searchable categories, expandable groups, or progressive disclosure. It should not display an overly dense map. The mobile version should prioritize “search,” “popular categories,” and “continue exploring” links.

### Desktop

On desktop, Universe Explorer can be richer and more visual. It may use columns, tabs, grouped cards, or a node-like browsing map. The key is to remain accessible and crawlable rather than relying only on visual effects.

### Conversion role

Universe Explorer converts passive browsing into intentional navigation. It should help users find a tool even when they arrive without a precise query. It also creates opportunities to surface reviewed Gold Tools and high-value topic journeys.

## Knowledge Hub

### Purpose

Knowledge Hub should make educational content visible from the homepage. The current homepage links to the blog, but the target homepage should actively surface guides, explanations, source-backed articles, review policies, and learning paths.

### User intent

Some visitors want to understand, not just calculate. They may ask what a formula means, how a result should be interpreted, whether a calculator is medically or financially reliable, or what to do after receiving a result. Knowledge Hub should satisfy interpretation and trust intent.

### SEO role

Knowledge Hub should strengthen content discovery and topical authority. It should link to guides and explainers that answer informational search queries. It should also help bridge tool pages and article pages, increasing internal link depth and reducing orphaned content.

### Knowledge role

This section is the core expression of Formula Universe as a learning system. It should show that calculations are paired with explanations, limitations, examples, and sources. It should include or link to editorial standards where relevant.

### AI role

Knowledge Hub can provide AI systems with source-backed context for calculator outputs. In future AI-assisted experiences, it can anchor explanations, caveats, and follow-up recommendations. It should be structured in a way that separates factual explanations from personalized advice.

### Mobile

On mobile, Knowledge Hub should surface a small number of high-value guide cards with clear titles. It should not become a long article feed above important tool discovery sections. The mobile layout should include a simple “View all guides” path.

### Desktop

On desktop, Knowledge Hub can combine featured guides, editorial policy links, and topic-based guide groups. The presentation should make trust visible without overwhelming the main calculator discovery experience.

### Conversion role

Knowledge Hub converts calculation users into informed return users. It also supports trust conversion: visitors may be more willing to use a tool when they see explanations, sources, and limitations. The desired action is reading a guide, continuing to a related tool, or entering a journey.

## Tool Clusters

### Purpose

Tool Clusters should present guided multi-tool journeys. Instead of treating each calculator as isolated, clusters show natural sequences such as BMI → BMR → TDEE → Calories → Progress, Mortgage → Affordability → Payment → Amortization, or Percentage → Discount → Tax → Tip.

### User intent

Cluster intent appears after a user realizes one calculation is only part of a larger task. A BMI user may next need calorie planning; a loan user may next need affordability; a date user may next need working days. Tool Clusters should make those next steps obvious.

### SEO role

Tool Clusters can create strong internal linking between related calculators and guides. They help search engines understand topical relationships and user journeys. They may also support future hub pages for clusters once reviewed.

### Knowledge role

Clusters explain why tools are related. They can include short educational bridges between steps, such as “BMI screens weight category, BMR estimates resting energy needs, TDEE estimates daily expenditure, and calorie tools help plan intake.” This creates meaningful knowledge continuity.

### AI role

Tool Clusters are key to AI recommendations. They encode next-best-tool relationships and can later support AI prompts such as “Based on this result, the next useful calculator may be TDEE.” The spec should keep clusters cautious and non-diagnostic, especially for health contexts.

### Mobile

On mobile, clusters should appear as simple vertical step flows. Each step should be tappable, with short labels and minimal supporting text. Mobile users should understand the journey at a glance.

### Desktop

On desktop, clusters can be shown as horizontal flows, cards, or node paths. Desktop can support multiple clusters side by side, but each should remain visually simple and easy to scan.

### Conversion role

Tool Clusters convert one-off calculator use into deeper engagement. They encourage users to continue through related tools and knowledge pages. This is one of the homepage’s strongest retention and journey-building mechanisms.

## Latest Guides

### Purpose

Latest Guides should surface recent or strategically important articles. This section makes the content layer visible and gives returning visitors a reason to continue exploring. It should not replace Knowledge Hub; rather, it should provide freshness and editorial momentum.

### User intent

Visitors may want current explanations, new calculators, updated formulas, or educational articles. Latest Guides supports users who are browsing, learning, or returning after a previous visit.

### SEO role

Latest Guides helps expose new content to users and crawlers. It can improve internal discovery for fresh articles and support faster indexing. It also reinforces that the site is maintained rather than static.

### Knowledge role

The section should highlight guides that deepen understanding of tools, formulas, and common questions. It should prioritize useful, source-backed, evergreen or recently updated content rather than thin updates.

### AI role

Latest Guides can provide time-sensitive signals for AI systems if freshness is later represented in metadata. It also helps distinguish stable formula references from newer editorial content.

### Mobile

On mobile, Latest Guides should be compact and likely appear lower on the page. Cards should have readable titles, short summaries, and clear categories. The section should avoid excessive scrolling before core tool discovery is complete.

### Desktop

On desktop, Latest Guides can use a three-column editorial card layout with article titles, categories, update labels, and short summaries. It should also include a clear link to the full guide or blog index.

### Conversion role

Latest Guides converts casual visitors into readers and returning users. It can also route readers back into tools through contextual links, supporting a bidirectional tool ↔ knowledge loop.

## Footer

### Purpose

The Footer should become a structured navigation and trust layer rather than only a basic policy link area. It should include key categories, popular tools, knowledge links, company/trust pages, policies, and possibly editorial standards once approved.

### User intent

Footer intent is often secondary but important. Users may be looking for privacy, terms, about pages, category indexes, source policies, popular tools, or a way to continue browsing after reaching the end of the page.

### SEO role

The Footer can support sitewide internal linking, but it should avoid becoming a spammy link dump. It should expose durable, high-level paths such as category indexes, popular tools, knowledge hub, about, privacy, terms, and review policy. This helps crawlers understand site structure.

### Knowledge role

The Footer should provide access to trust and editorial information. For formula and health/finance-related tools, users should be able to find information about sources, limitations, disclaimers, and review practices.

### AI role

The Footer can clarify site identity, policy pages, and canonical navigation. AI systems often use repeated sitewide links to understand the most important sections of a site. The footer should reinforce stable entities rather than noisy temporary pages.

### Mobile

On mobile, the Footer should be organized into collapsible or clearly grouped link sections. It should remain usable without creating an overwhelming wall of links. Policy links must be easy to find.

### Desktop

On desktop, the Footer can use multiple columns: Tools, Topics, Knowledge, Company, and Legal. It should be visually calm and consistent with the rest of the homepage.

### Conversion role

The Footer supports recovery and continuation. A visitor who reaches the bottom should still have clear paths to popular tools, topics, guides, and trust pages. It can convert dead-end scrolling into further exploration.

## Draft-only guardrails

This specification is intentionally non-code. It does not approve production implementation. Before code work begins, the experience spec should be reviewed against the homepage audit, gap analysis, Formula Universe strategy, accessibility requirements, SEO requirements, and GPT/Victor approval gates. No commit, deploy, TSX edit, route change, registry edit, or production integration is authorized by this document.
