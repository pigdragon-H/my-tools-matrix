# SAFE LOCK Checkpoint - SEO Canonical / Sitemap Repair

Date: 2026-07-08

## Locked Baseline

- Branch: `safe-fix/seo-canonical-sitemap-20260708`
- Baseline commit: `523b5146b37272d906390eef9b8638e16d53b370`
- Production URL audited: `https://my-tools-matrix-production.up.railway.app/`
- GitHub repository: `pigdragon-H/my-tools-matrix`

## Authorized Repair Scope

This checkpoint protects the site before making narrow SEO corrections only:

- Align canonical URLs with the final public route format that currently returns `200`.
- Align sitemap `<loc>` URLs with those canonical final URLs.
- Stop sitemap generation from stamping every URL with the deployment date as `<lastmod>`.
- Keep existing indexed no-trailing-slash URLs reachable through the current redirects.

## Explicit Safety Limits

- No GitHub push without Victor's confirmation.
- No Railway deploy without Victor's confirmation.
- No destructive Git commands.
- No route deletion.
- No removal of existing indexed tools, articles, blueprints, opportunities, or knowledge pages from the sitemap.
- No use of pasted secrets in shell history or source files.

## Rollback Plan

Because work happens on a separate branch, the safest rollback is:

1. Stay on or switch back to `main`.
2. Do not merge this branch.
3. If a later merge happens and must be undone, revert the specific remediation commit instead of resetting shared history.

## Verification Required Before Approval

- Regenerate `public/sitemap.xml` and `client/public/sitemap.xml`.
- Verify sitemap URL count remains at or above the current public indexable surface.
- Verify representative sitemap URLs use canonical final URLs.
- Verify canonical generation does not point to redirecting URLs.
- Run the existing SEO indexability verification script after updating it for the chosen canonical URL style.
