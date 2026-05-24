# Homepage Knowledge Notes — H08

## Knowledge ideas

Knowledge v1 upgrades the previous placeholder area into a static editorial surface that can later support reviewed explanations, formulas, examples, and limitations. The current homepage now presents four knowledge entry points: Investment, Health, Developer, and Science. Each block is intentionally static and does not read from a registry, content feed, route manifest, or dynamic recommendation system.

Investment should eventually explain concepts such as CAGR, compound growth, FIRE, retirement assumptions, withdrawal rates, inflation, and risk. This area must avoid personalized financial advice and should include clear assumptions whenever it becomes linked to live guide pages. Health should eventually cover BMI, BMR, calories, progress tracking, and related health calculations with non-diagnostic wording and safety disclaimers. Developer should eventually cover JSON, API, Regex, formatting, validation, encoding, and deploy-adjacent workflows with verified destinations only. Science should eventually cover units, formulas, conversions, models, and experimental context with explicit formula sources and limitations.

## Cluster ideas

Tool Clusters v1 introduces three static cluster placeholders: Finance, Health, and Developer. The Finance cluster currently models a future path from CAGR to Retirement to FIRE to Withdrawal. The Health cluster currently models BMI to BMR to Calories to Progress. The Developer cluster currently models JSON to API to Regex to Deploy. These are not active recommendations, personalized suggestions, or navigable routes in this phase.

Future clusters should be reviewed as editorial objects rather than inferred automatically from labels alone. Each cluster should define a user intent, a safe ordering, required disclaimers, and the destination status of every tool or guide. Finance clusters should distinguish education from advice. Health clusters should include non-diagnostic language. Developer clusters should only include destinations that exist and have stable tool behavior.

## Future graph

A future knowledge graph can connect tools, topics, formulas, examples, guides, limitations, and next-step relationships. Candidate relationship types include `explains`, `uses_formula`, `has_example`, `has_limitation`, `belongs_to_cluster`, `related_tool`, `next_step`, `guide_for`, and `requires_disclaimer`. The graph should remain transparent and reviewable before powering homepage personalization or search.

The safest next step is to keep registry identity, route identity, and editorial knowledge identity separate until each source is reviewed. Once the graph is approved, homepage modules can gradually move from static placeholders to generated cards, but every generated card should still be traceable to reviewed metadata and canonical website keys.
