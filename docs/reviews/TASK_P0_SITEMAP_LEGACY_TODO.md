# Task P0 Revision TODO — Sitemap Legacy Cleanup

## Safety
- [x] Run pwd and confirm workspace location.
- [x] Run git rev-parse --show-toplevel and confirm single repo.
- [x] Confirm no commit and no deploy.

## Sitemap Audit
- [x] Search client/public/sitemap.xml for /tools/fin/, /tools/hlt/, and /tools/prd/.
- [x] Create docs/reviews/SITEMAP_LEGACY_AUDIT.md with URL, Old, New, Priority columns.
- [x] Do not modify client/public/sitemap.xml.

## Import Audit Revision
- [x] Update docs/reviews/IMPORT_AUDIT.md to remove tools/dev review-only list.
- [x] Mark dev as canonical and not legacy.

## Validator Revision
- [x] Update scripts/validate-imports.ts to ensure dev detection is removed.
- [x] Keep legacy checks for tools/hlt, tools/fin, tools/prd and alias equivalents.

## Final Verification
- [x] Verify sitemap unchanged.
- [x] Verify no Home.tsx, App.tsx, routes, registry, or shared edits by this task. Note: Home.tsx has a pre-existing H07 diff.
- [x] Verify expected files exist.
- [x] Verify no commit.
