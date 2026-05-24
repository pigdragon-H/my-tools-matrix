# Homepage Skeleton Notes

Status: H05 production migration v1, skeleton only. This document records what is intentionally missing, what risks remain, and what should happen in later phases after GPT review. No commit or deploy was performed as part of this task.

## Missing

The skeleton intentionally does not include the discovery layer. There is no Quick Search placeholder, no search mode selector, no trending tools area, no trending topics area, and no discovery flow. The homepage still has the existing global search control from the broader app shell, but H05 did not add any new homepage-specific discovery system.

The skeleton intentionally does not include the journey layer. There are no journey cards, no retirement journey, no weight loss journey, no developer journey, and no next-step suggestion panel. The Tool Clusters section is only a static placeholder and does not recommend or sequence tools.

The skeleton does not connect to dynamic homepage data. It does not use `categoriesConfig`, `toolsConfig`, a registry, a feed, or a generated index. The former dynamic category grid has been replaced by a static Universe Explorer placeholder so the future structure can be reviewed before data integration.

The skeleton does not add new routes or route behavior. Existing links in the kept Hero and Footer remain, but the new placeholder sections do not introduce new clickable destinations. This prevents unfinished topic, guide, tool cluster, or knowledge paths from appearing production-ready.

The skeleton does not include final editorial content. Featured Tools, Featured Topics, Knowledge Hub, Tool Clusters, and Latest Guides all use placeholder copy. These areas still need reviewed content, approved source ownership, safety wording, and route mapping before becoming real homepage modules.

## Risks

The most visible risk is that production now shows English placeholder labels inside a primarily Traditional Chinese homepage. This is acceptable for skeleton review but should not ship as final copy. Before deployment approval, the team should decide whether the homepage language remains Chinese, becomes bilingual intentionally, or moves to an English Formula Universe positioning.

Another risk is the temporary removal of the dynamic category grid. The previous homepage gave users broad category browsing through shared configuration data. The skeleton keeps the overall homepage stable but reduces direct category discoverability until the Universe Explorer is implemented with reviewed links or approved data sources.

There is a conversion risk because static placeholder sections add page length without adding real user actions. If kept too long, the skeleton may dilute the current hero CTAs and footer links. Later phases should either populate these sections with approved destinations or hide unfinished blocks before release.

There is an SEO risk if placeholder copy remains in production for too long. Search engines and users should not see thin placeholder content as final homepage content. The skeleton should be treated as an internal review step, not the final SEO surface.

There is a product safety risk in future phases when health, finance, and planning topics are added. The skeleton avoids that risk by not adding topic or journey recommendations yet, but later phases must include disclaimers, content review, and careful wording.

There is a technical risk from the existing app startup dependency on Supabase environment variables during local preview. The homepage rendered successfully when local placeholder environment values were supplied, but future verification should ensure production and preview environments have the required variables configured.

## Next phases

The next phase should populate the skeleton with reviewed static content for Featured Tools and Featured Topics. This should happen before adding interactive discovery. Tool cards should only link to stable, existing routes, and topic cards should only appear after topic destinations and safety copy are approved.

After that, the Universe Explorer should be designed as the replacement for the old category grid. It should preserve broad browsing coverage while avoiding premature dependency on unreviewed registry data. A later version may reconnect to approved shared configuration, but H05 intentionally avoided that integration.

The Knowledge Hub and Latest Guides sections should be connected only after editorial ownership is clear. Formula explanations, examples, limitations, and guide cards should come from reviewed content, not placeholder titles or unmaintained feeds.

Tool Clusters should be expanded after the relationship model is approved. Cluster language should remain optional and educational. It should not imply personalized advice or required next steps.

Only after the skeleton, content, and route destinations are stable should the discovery phase begin. That future phase can add Quick Search, trending tools, trending topics, and a discovery flow, but it should remain honest about whether search is functional or only navigational.

The journey phase should come after discovery and knowledge review. Journey cards should be curated, safety-reviewed, and reversible. They should guide users through learning paths without creating financial, health, or professional advice claims.
