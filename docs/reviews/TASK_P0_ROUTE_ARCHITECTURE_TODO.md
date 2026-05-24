# Task P0 TODO — Route Architecture Correction

## Safety
- [x] Run pwd and confirm repo location.
- [x] Run git rev-parse --show-toplevel and confirm single repo.
- [x] Confirm no commit and no deploy.

## Task 1 — Import Audit
- [x] Search whole repo for legacy import/path references: tools/hlt, tools/fin, tools/prd, tools/dev.
- [x] Create docs/reviews/IMPORT_AUDIT.md with File, Old path, New path, Priority columns.

## Task 2 — Migration Script
- [x] Create scripts/migrate-legacy-imports.ts.
- [x] Ensure script replaces tools/hlt → tools/health and tools/fin → tools/finance.
- [x] Do not execute migration script.

## Task 3 — Validator
- [x] Create scripts/validate-imports.ts.
- [x] Ensure validator fails on tools/hlt, tools/fin, or legacy alias references.

## Task 4 — Route Future Plan
- [x] Create docs/reviews/TOOLPAGE_REFACTOR.md.
- [x] Document current 229 lazy imports → registry driven future plan.
- [x] Include target dynamic loader concept only, with no implementation.

## Final Verification
- [x] Verify forbidden files were not modified by this P0 task: Home.tsx, App.tsx, registry, routes. Note: Home.tsx has a pre-existing uncommitted H07 diff.
- [x] Verify expected files exist.
- [x] Verify no commit.
