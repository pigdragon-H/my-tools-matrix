# Import Audit — Legacy Tool Paths

Generated for P0 Emergency Fix and revised by P0 Fix Revision: Sitemap Legacy Cleanup. This audit tracks legacy tool path aliases only. `tools/dev` is canonical and is not a legacy alias.

## Canonical Key Decision

| Key | Status | Notes |
|---|---|---|
| `finance` | Canonical | Replaces legacy `fin`. |
| `health` | Canonical | Replaces legacy `hlt`. |
| `productivity` | Canonical | Replaces legacy `prd`. |
| `dev` | Canonical | Not legacy. No migration and no review-only cleanup required for this key. |

## Summary

| Pattern | Matches | Canonical replacement | Status |
|---|---:|---|---|
| `tools/hlt` | 0 | `tools/health` | Clear in current audit; validator still guards against future regression. |
| `tools/fin` | 26 | `tools/finance` | P0 legacy finance alias detected in sitemap; audit-only in this task. |
| `tools/prd` | 0 | `tools/productivity` | Clear in current audit; validator still guards against future regression. |
| `tools/dev` | Not audited as legacy | `tools/dev` | Canonical. Do not migrate. |

## Audit Table

| File | Old path | New path | Priority |
|---|---|---|---|
| client/public/sitemap.xml | `tools/fin` | `tools/finance` | P0 |
| _No matches found_ | `tools/hlt` | `tools/health` | CLEAR |
| _No matches found_ | `tools/prd` | `tools/productivity` | CLEAR |

## Notes

The audit intentionally separates canonical `tools/finance` from legacy `tools/fin`, and canonical `tools/dev` from legacy cleanup concerns. The current exact legacy sitemap findings are documented in `docs/reviews/SITEMAP_LEGACY_AUDIT.md`. This task does not modify `client/public/sitemap.xml`, routes, registry files, `Home.tsx`, or `App.tsx`.
