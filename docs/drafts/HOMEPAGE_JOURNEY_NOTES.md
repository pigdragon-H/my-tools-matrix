# Homepage Journey Notes

Formula Universe Task H03.8 revised `client/src/prototypes/HomepageGoldPrototype.tsx` as a prototype-only homepage journey layer. The revision adds Journey Cards and Next Step Suggestions after the discovery layer. The prototype remains isolated and does not edit `Home.tsx`, does not edit `App.tsx`, does not create routes, does not register production components, does not connect to shared tool configuration, does not deploy, and does not commit.

## Journey ideas

The main idea behind the H03.8 revision is that discovery should not stop at search results or individual calculator cards. A visitor should be able to move from a broad intent into a connected journey. The homepage can therefore become a map of useful sequences rather than only a directory of available tools.

The Retirement Journey demonstrates a finance and planning path: FIRE → CAGR → Retirement → Withdrawal. This journey begins with a human goal, early financial independence, then connects to a growth metric, a retirement planning context, and finally a withdrawal concept. In future review, this journey should be treated carefully because finance content must remain informational and should avoid implying investment advice, guaranteed retirement outcomes, or personalized financial planning.

The Weight Loss Journey demonstrates a health and fitness path: BMI → BMR → Calories → Progress. This journey begins with a screening-style calculator, moves into energy estimation, then calorie planning, then progress context. In future review, this journey requires strong disclaimers because BMI, BMR, calories, and progress can be medically sensitive. The journey should never imply diagnosis, treatment, guaranteed weight loss, or individualized medical advice.

The Developer Journey demonstrates a utility workflow: JSON → API → Regex → Deploy. This journey starts from structured data, moves into API usage, validates or transforms patterns, and then ends with a shipping/deployment concept. This path can help Formula Universe serve developer utility users without presenting the site as only a health or finance calculator collection.

These journeys are intentionally broad and static in the prototype. Their purpose is to show the homepage structure and retention model, not to finalize production taxonomy or tool eligibility.

## Retention ideas

Journey Cards can improve retention by giving users a reason to continue after the first click. A user who arrives for one calculator may realize that the calculator is part of a larger task. For example, a visitor searching for BMI may continue to BMR, calories, and progress. A visitor searching for CAGR may continue into retirement and withdrawal concepts. A visitor searching for JSON may continue into API and Regex utilities.

Next Step Suggestions can reduce dead ends. The prompt “What should I do next?” helps a visitor choose between broad exploration, direct tool usage, knowledge reading, and multi-step journeys. This is especially useful after the discovery layer because users may not yet know whether they need a topic, a calculator, an explanation, or a sequence.

Retention should be based on usefulness rather than manipulation. The homepage should not pressure users through endless loops. Each journey should have a clear educational reason to exist and should help the user complete a real task. If a journey does not add clarity, it should not be promoted.

Future retention prototypes could test recently viewed tools, continue-your-journey cards, topic-based saved paths, related guide prompts, and result-to-next-tool suggestions. Any persistence or personalization should be reviewed for privacy, user control, and transparency.

## Knowledge graph expansion

The Journey Cards point toward a broader Formula Universe knowledge graph. In this model, a journey is not merely a visual card. It is a structured relationship between topics, tools, formulas, guides, disclaimers, examples, FAQs, and next steps.

The Retirement Journey could connect nodes such as FIRE, CAGR, compound interest, inflation, retirement age, savings rate, withdrawal rate, and retirement planning guides. The Weight Loss Journey could connect BMI, BMR, TDEE, calories, activity factors, healthy weight range explanations, and medical disclaimers. The Developer Journey could connect JSON Formatter, JSON Minifier, API, JWT, Regex, validation, deployment, and developer utility guides.

A production knowledge graph should define relationships explicitly. Possible relationship types include “uses formula,” “belongs to topic,” “next recommended tool,” “requires disclaimer,” “explained by guide,” “has FAQ,” “has example,” and “part of journey.” These relationships should be reviewable before they are exposed in homepage UI or AI-assisted recommendations.

AI-assisted expansion should remain constrained. The graph can support suggestions like “users who start with BMI may also need BMR,” but it should not make unsafe claims such as “you should lose weight” or “this withdrawal plan is safe.” For sensitive categories, recommendations should be framed as educational context and should include safe disclaimers.

Future graph work should also include governance. The team should define who can add a journey, what evidence or search demand supports it, which tools are mature enough to appear in it, what disclaimers are required, how stale journeys are retired, and how GPT/Victor review is recorded before production exposure.

## Draft-only guardrail

This document is a prototype revision note only. It does not approve production implementation, route changes, registry changes, shared configuration changes, homepage replacement, deployment, or commit. The revised prototype and screenshots must wait for GPT review and Victor approval.
