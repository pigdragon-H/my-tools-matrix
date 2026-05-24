# Homepage Prototype Notes

Formula Universe Task H03 produced a prototype-only homepage artifact at `client/src/prototypes/HomepageGoldPrototype.tsx`. This file is not connected to production routing, not registered in any tool registry, not wired to shared tool configuration, and not intended for deployment. It exists only for GPT review and Victor approval as the next step after the H02 homepage experience specification, user flow, and component tree.

## Problems

The current production homepage was previously audited as a stable MVP directory rather than a full Formula Universe homepage. The H03 prototype addresses that directional problem by giving the homepage a stronger product identity, adding a visible visitor flow, and introducing discovery layers beyond category browsing. However, the prototype is still intentionally static. It does not validate how real homepage data will load, how category counts will be represented, or how actual tool and article URLs should be selected after review.

The prototype also relies on placeholder curation. Featured tools, featured topics, knowledge cards, latest guides, and cluster paths are examples designed to show structure, not final editorial decisions. Before production work, the team must decide which tools are eligible for homepage prominence and which guides have enough quality, source support, and review coverage to be surfaced.

Another problem is that the prototype demonstrates the intended experience visually but does not yet solve homepage governance. The homepage will eventually need clear rules for what qualifies as a featured tool, a featured topic, a knowledge hub item, a latest guide, or a cluster step. Without governance, the homepage could become cluttered or inconsistent over time.

## Missing sections

The prototype includes all H03-required sections: Hero, Featured Tools, Featured Topics, Universe Explorer, Knowledge Hub, Tool Clusters, Latest Guides, and Footer. It does not include several possible future production sections because H03 requested a prototype based on the H02 structure only.

Missing or deferred sections include a real global search experience, personalized or recently used tools, localization controls, explicit editorial standards preview, source policy expansion, popular formulas, category-level statistics, user feedback prompts, homepage analytics events, accessibility annotations, schema output previews, and error/empty states. These are not failures of H03, but they should be tracked for later hardening.

The prototype also does not include a dedicated trust band between Hero and Featured Tools. Trust is currently implied through prototype labels, knowledge cards, and footer placeholders. A production-ready homepage may need a more explicit trust layer that explains privacy, source review, formula transparency, and responsible-use disclaimers.

## Risks

The largest risk is premature production integration. The prototype should not replace `Home.tsx`, modify `App.tsx`, create routes, update registries, or connect to `toolsConfig` before GPT review and Victor approval. It is intentionally isolated under `client/src/prototypes/`.

A second risk is over-promising AI or health/finance guidance. The prototype uses language about journeys, related tools, and next steps. In production, those flows must remain educational and non-diagnostic. Health clusters such as BMI → BMR → TDEE → Calories must avoid implying treatment, guaranteed weight loss, or personalized medical advice. Finance clusters must avoid implying financial advice or guaranteed outcomes.

A third risk is homepage density. The target homepage has many sections, and the desktop prototype can support that density more easily than mobile. On mobile, the section order, card count, and disclosure model will need careful testing so visitors are not forced through excessive scrolling before finding a tool.

There is also a content freshness risk. Latest Guides should not become a stale block. If the section is introduced in production, it needs a maintained editorial source or a deliberate reviewed content selection process.

Finally, there is an accessibility risk. The prototype uses visual hierarchy, cards, and flows, but it has not been tested with keyboard navigation, screen readers, focus states, semantic landmarks, contrast validation, or touch target audits. Production work must treat accessibility as a release gate rather than a cleanup task.

## Future ideas

A future iteration could add a real homepage search prototype with static search suggestions for tools, formulas, topics, and guides. This would make the Hero more action-oriented and test whether visitors prefer search-first discovery over card browsing.

The Universe Explorer could become a richer prototype that shows collapsible categories, formula groups, and tool relationships. A later version could test a tabbed explorer, a graph-like explorer, or an intent-first explorer that begins with questions such as “What do you want to calculate?”

Featured Topics could evolve into semantic topic hubs. For example, Health planning could contain BMI, BMR, TDEE, calories, healthy weight range guides, disclaimers, and source notes. Finance planning could contain compound interest, mortgage, payment, savings, and amortization paths. These topic hubs should be reviewed before appearing on the homepage.

Tool Clusters could become the foundation for Formula Universe journeys. Each cluster could have a short explanation of why the steps are related, a safe disclaimer where needed, and links to both calculators and guides. A future cluster prototype should test multiple journeys beyond the BMI example.

The Knowledge Hub could include a stronger trust layer with source quality, review status, last updated labels, and editorial policy links. This would support both users and search engines by making reliability visible.

A later production planning task should define homepage release criteria similar to the BMI hardening workflow: accessibility threshold, SEO threshold, trust threshold, performance threshold, schema validation, mobile QA, content review, rollback plan, and GPT/Victor approval gates.

## Draft-only guardrail

This notes file does not authorize production implementation. No commit, deploy, route integration, registry update, shared config connection, `Home.tsx` edit, or `App.tsx` edit is approved by Task H03. The prototype must wait for GPT review and Victor approval.
