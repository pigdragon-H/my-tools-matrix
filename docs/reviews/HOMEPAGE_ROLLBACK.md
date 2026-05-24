# Homepage Rollback Plan

Status: draft-only review document. This rollback plan does not implement production changes, authorize deployment, or modify `client/src/pages/Home.tsx`. It exists to define safe recovery expectations before any future homepage migration is approved.

## Purpose

The homepage is a high-visibility entry point for Formula Universe. Any migration from the current `Home.tsx` toward the homepage prototype should have a clear rollback plan before implementation begins. The safest rollback path is to preserve the existing production homepage until each new section is separately reviewed, tested, and approved. Rollback should be treated as a normal safety mechanism rather than a failure of the project.

## Rollback Triggers

Rollback should be triggered if the migrated homepage breaks access to existing category navigation, tool discovery, blog access, legal links, or core homepage CTAs. The current homepage already supports category browsing and stable footer navigation, so any future version that reduces basic findability should be paused or reverted.

Rollback should also be triggered by broken routes, missing assets, console errors, hydration errors, TypeScript build failures, visible layout corruption, mobile overflow, inaccessible keyboard focus, unreadable contrast, or heading order regressions. The homepage must remain usable on desktop and mobile before any release is considered safe.

Content and product safety issues should also trigger rollback. Examples include journey cards that imply financial advice, health cards that imply diagnosis or treatment, search UI that appears functional when it is only a placeholder, topic cards that point to incomplete pages, latest guides that are stale or nonexistent, and knowledge cards that lack source or review context.

SEO and trust issues may also justify rollback. These include duplicate headings that confuse page purpose, excessive footer links that appear spammy, loss of existing metadata, misleading claims about AI behavior, broken internal links, or a homepage that becomes slower, less clear, or less crawlable than the current production version.

## Restore Path

The primary restore path should be to return `client/src/pages/Home.tsx` to the last reviewed production version. Before any approved migration begins, the team should record the exact baseline commit or file snapshot that represents the stable homepage. If a migration is implemented in a branch, rollback should mean reverting the homepage-related change set from that branch before merge. If a migration has already been merged, rollback should use a targeted revert of the homepage migration commit rather than unrelated changes.

The restore path should preserve `App.tsx`, route definitions, shared tool configuration, category configuration, SEO helpers, and footer policy links unless those files were explicitly part of a separately approved change. The homepage rollback should not require deleting prototype files or review documents, because those are non-production artifacts. Instead, production should point back to the stable `Home.tsx` behavior while the prototype and planning docs remain available for review.

If the future implementation uses feature flags or phased section gates, rollback should first disable the newest section that caused the failure. For example, if journey cards cause safety or routing problems, the team should disable the journey layer while preserving the skeleton and discovery sections if they are stable. If the failure source is unclear, the team should restore the entire previous homepage and investigate in a separate branch.

After rollback, the team should verify that the homepage loads, primary CTAs work, category cards still resolve, footer links still resolve, SEO metadata is intact, mobile layout is stable, and no console errors remain. The rollback should be documented with the trigger, scope, restored state, and follow-up owner.

## Failure Modes

A structural failure mode occurs when the new homepage layout disrupts the core path from visitor to category or tool. This may happen if the production migration removes the current category grid too early, introduces too many sections before users can act, or pushes primary CTAs below confusing discovery elements.

A routing failure mode occurs when prototype placeholders become production links before the corresponding routes exist. Trending tools, trending topics, journey steps, knowledge cards, and latest guide cards all need verified destinations before they become clickable in production.

A content failure mode occurs when placeholder copy is mistaken for reviewed editorial content. This is especially risky in health and finance areas. Retirement, FIRE, weight loss, BMI, calories, and withdrawal content should be reviewed for disclaimers, limitations, and source quality before being presented as knowledge guidance.

A search expectation failure occurs when the Quick Search area suggests real search, semantic matching, AI guidance, or personalization that does not exist. If the production version only provides static navigation, the copy should say so clearly or use a simpler finder label.

A knowledge graph failure occurs when related tools, journeys, or next-step suggestions imply an authoritative relationship that has not been defined, reviewed, or maintained. Tool clusters should be curated and reversible, and next-step language should remain optional rather than prescriptive.

A performance failure occurs if the homepage becomes slow because of excessive client-side rendering, large visual sections, unoptimized assets, or unnecessary data loading. The homepage should remain lightweight and should not depend on large registries unless production performance is verified.

An accessibility failure occurs if the new design harms keyboard navigation, screen reader order, focus visibility, mobile readability, or color contrast. Because the homepage will contain many sections, semantic structure and heading hierarchy must be checked before release.

An SEO failure occurs if the migration creates duplicate page purpose, weakens metadata, creates thin content blocks, adds excessive internal links, or buries the main tool discovery path. SEO improvements should come from useful structure and reviewed knowledge, not from keyword-heavy sections.

## Rollback Readiness Checklist

Before any future production migration, the team should confirm that the stable homepage baseline is known, the migration can be reverted without touching unrelated files, section-level gates are available if used, routes are verified, content is reviewed, and an owner is assigned for rollback decisions. If any of these conditions are missing, production migration should wait.
