# Homepage Journey Notes

Status: H07 production journey migration v1. This document records the intent, risks, and future direction for the Journey Cards and Next Step Suggestions added to `Home.tsx`. No commit was performed as part of this task.

## Journey ideas

Journey v1 adds a static layer after Discovery v1 and before Featured Tools. The purpose is to show how Formula Universe can eventually move beyond isolated calculators into structured, multi-step user paths. The current implementation is intentionally static and does not personalize, route, or query any registry.

The Retirement Journey connects FIRE, CAGR, Retirement, and Withdrawal. This path suggests a future educational flow where a user can begin with an independence concept, understand growth rates, move into retirement planning context, and then learn about withdrawal assumptions. In future production work, this journey must avoid financial advice claims and should include clear limitations and source context.

The Weight Loss Journey connects BMI, BMR, Calories, and Progress. This path suggests a future health-related learning flow from screening to energy estimation and progress tracking. Because health topics are sensitive, future versions should include disclaimers, non-diagnostic wording, and review from an editorial or safety owner before the path becomes interactive.

The Developer Journey connects JSON, API, Regex, and Deploy. This path suggests a future workflow for developers who need to format or validate data, connect it to API workflows, refine patterns, and move toward deployment. Future versions should only link to deploy-related content if that destination exists and is appropriate for the platform.

The Next Step Suggestions block adds example follow-up patterns: After BMI to BMR to Calories, After CAGR to Retirement to FIRE, and After JSON to API to Regex. These examples are intentionally non-clickable and non-personalized. They show the shape of future suggestions without making the homepage behave like a recommendation system.

## Retention ideas

Journeys can improve retention by helping users understand what to do after a single calculation. A user who calculates BMI may need BMR or calorie context. A user who calculates CAGR may need retirement or FIRE context. A user who formats JSON may need API or regex help. The value is not only the first tool visit but the next useful step.

The homepage can eventually use journeys as learning paths, not funnels. A good journey should reduce confusion, provide context, and help users move safely through related calculations. It should not trap users, over-prescribe actions, or imply that every visitor should follow the same path.

Future retention work could include saved recent paths, resume-later journey cards, guide bundles, progress indicators, and non-invasive reminders. These ideas require separate privacy, account, and analytics review. H07 does not implement any of them.

The strongest retention pattern may be content continuity. Each journey should connect a tool result with a formula explanation, limitations, example calculation, and related guide. This lets the user leave with understanding rather than only a number.

## Knowledge graph expansion

Journey v1 points toward a richer knowledge graph. In the graph, tools, topics, guides, formulas, examples, and limitations can become connected nodes. A journey is then a curated traversal through that graph rather than a hardcoded list of cards.

The Retirement Journey could connect topic nodes such as FIRE and Retirement to tool nodes such as CAGR and withdrawal calculators, plus guide nodes about assumptions, inflation, time horizon, risk, and limitations. The Weight Loss Journey could connect BMI, BMR, calories, and progress with health disclaimers, safety boundaries, and example interpretation. The Developer Journey could connect JSON, API, Regex, and Deploy with data validation, formatting, testing, and implementation guides.

Future graph relationship types may include next_step, explains, belongs_to_topic, requires_context, has_limitation, related_tool, example_for, and guide_for. Each relationship should have an owner, a review status, and a rollback plan before it influences production navigation.

The graph should distinguish between educational adjacency and recommended action. For example, BMI can be related to BMR and calories, but the system should not imply that a user must calculate calories or follow a weight loss plan. CAGR can be related to retirement and FIRE, but it should not imply financial planning advice. JSON can be related to API and Regex, but it should not imply deployment readiness.

## Future personalization

Future personalization should not begin until the static journey model is reviewed and safe. If personalization is introduced, the homepage must clearly explain what signals are used, how suggestions are generated, and whether data is stored. Users should be able to use the homepage without personalization.

A first safe step could be session-local suggestions based only on the last opened tool. For example, if a user opens BMI, a session-local panel could show BMR and Calories as related educational next steps. This should not require account storage or sensitive profiling.

A later step could use explicit user-selected goals such as finance planning, health calculation, or developer utilities. Even then, the suggestions should remain optional and transparent. Sensitive domains should require stricter review and more conservative language.

Personalization should never convert educational relationships into medical, financial, legal, or professional advice. The journey layer should remain a navigation and learning aid. Any AI-assisted journey generation should require separate governance, source review, explanation controls, and rollback readiness.
