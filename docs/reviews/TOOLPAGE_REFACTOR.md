# ToolPage Refactor Plan — Registry Driven Loader

## Scope

This document is a future architecture plan only. It does not implement a route refactor, does not modify `ToolPage.tsx`, does not modify app routes, and does not modify the registry. The current P0 task is limited to audit artifacts, a non-executed migration helper, a validator, and this plan for GPT review.

## Current State

`client/src/pages/ToolPage.tsx` currently contains a large static lazy-import map. The known scale is approximately 229 lazy imports, with route/tool identity coupled directly to component imports. This makes legacy path aliases easy to preserve by accident, because each tool entry can independently encode an old category key, old directory name, or old URL segment.

The architecture risk is that route identity and filesystem component loading are maintained manually in the same file. When canonical website keys change from legacy aliases such as `hlt` and `fin` to canonical keys such as `health` and `finance`, static import maps can retain old paths even after registry or metadata migrations are completed elsewhere.

## Target Direction

The future target should be registry driven:

```text
registry
  ↓
dynamic loader
  ↓
tool render
```

The registry should be the source of truth for canonical tool identity. `website_key` should be canonical only, for example `health` and `finance`, not legacy aliases such as `hlt` or `fin`. The loader should derive the component import path from reviewed registry metadata instead of manually maintaining hundreds of lazy imports in `ToolPage.tsx`.

The conceptual target is:

```ts
const Tool = lazy(() =>
  import(`../tools/${website_key}/${component}`)
);
```

This snippet is a target concept only. It should not be implemented until bundler constraints, component naming rules, registry schema, and fallback behavior are reviewed. Vite and other bundlers may require constrained dynamic imports, generated import maps, or `import.meta.glob` rather than arbitrary runtime string imports.

## Proposed Migration Phases

### Phase 1 — Guardrails

Keep the new validator in CI or preflight so legacy aliases cannot re-enter the codebase. The validator should fail on `tools/hlt`, `tools/fin`, `hlt/<tool>`, and `fin/<tool>`. It should be extended only after a product decision defines canonical replacements for other aliases.

### Phase 2 — Registry Contract Review

Confirm that every tool registry entry has enough information to render the tool without hand-coded route maps. Required fields should include canonical `website_key`, canonical public path, stable tool slug, component identifier, display name, status, and safety metadata. Legacy aliases should be represented only as redirects or migration metadata, never as primary identity.

### Phase 3 — Generated Loader Map

Prefer a generated loader map or `import.meta.glob` wrapper over fully manual lazy imports. A generated map can preserve bundler compatibility while keeping registry as the source of truth. The generation step should validate that each registry component exists at the canonical path and should output a deterministic loader module.

### Phase 4 — ToolPage Simplification

Refactor `ToolPage.tsx` so it receives the canonical route parameters, resolves the tool registry entry, loads the component through the generated loader, and renders the shared tool shell. At this stage, `ToolPage.tsx` should no longer know about hundreds of individual component imports.

### Phase 5 — Redirect and Alias Cleanup

Legacy URLs such as `/tools/fin/...` or `/tools/hlt/...` should be handled as explicit redirects if product requirements need backwards compatibility. Redirect rules should live outside canonical render identity. The canonical render path should remain `/tools/finance/...` or `/tools/health/...`.

## Required Review Questions

Before implementation, GPT/reviewers should answer whether dynamic imports should use `import.meta.glob`, a generated TypeScript loader module, or a constrained switch generated from registry. Reviewers should also confirm whether `dev` is already canonical or should be renamed in a separate product decision. Finally, reviewers should define whether legacy public URLs are permanently redirected, temporarily redirected, or removed from sitemap and routing.

## Non-Goals For This P0 Task

This task does not change `ToolPage.tsx`. It does not touch `Home.tsx`, `App.tsx`, routes, registry data, or sitemap files. It does not execute the migration script. It does not deploy and does not commit.
