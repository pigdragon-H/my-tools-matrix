# BMI Production Checklist

**Status:** Draft only — GPT review required  
**Task:** Task 06.8 BMI Production Hardening Plan  
**Constraint:** Planning only. No TSX rewrite, no production integration, no commit, no deploy.

## Pre deploy

- [ ] GPT review completed.
- [ ] Victor approval completed.
- [ ] Production route identity approved.
- [ ] Registry identity approved.
- [ ] toolsConfig placement approved if required.
- [ ] Current BMI replacement strategy approved explicitly.
- [ ] Accessibility score is at least 90.
- [ ] SEO score is at least 90.
- [ ] Trust score is at least 90.
- [ ] Performance score is at least 85.
- [ ] Total score is at least 90.
- [ ] Medical disclaimer approved.
- [ ] Adult-only scope approved.
- [ ] Children, pregnancy, athletes, and medical-decision limitations included.
- [ ] CDC, WHO, NIH, or approved equivalent source URLs added.
- [ ] Category risk language reviewed.
- [ ] Conversion layer safety rules approved.
- [ ] Goal BMI behavior approved.
- [ ] Needed weight calculation approved or removed.
- [ ] Estimated timeline logic approved or kept as non-functional copy.
- [ ] Save / Share behavior approved, disabled, or removed.
- [ ] Keyboard navigation tested.
- [ ] Screen reader behavior tested.
- [ ] Contrast tested.
- [ ] Mobile touch targets tested.
- [ ] Mobile layouts tested at common widths.
- [ ] Input validation and error states tested.
- [ ] Unit switching tested.
- [ ] FAQ behavior tested.
- [ ] Related tool routes validated.
- [ ] Future article links validated or omitted.
- [ ] FAQ schema validated.
- [ ] Breadcrumb schema validated.
- [ ] Tool schema validated.
- [ ] HowTo schema decision documented.
- [ ] Canonical URL confirmed.
- [ ] Title and meta confirmed.
- [ ] Bundle/performance review completed.
- [ ] Rollback plan confirmed.

## Post deploy

- [ ] Production route loads successfully.
- [ ] Calculator accepts valid metric inputs.
- [ ] Calculator accepts valid imperial inputs.
- [ ] Invalid inputs show safe error states.
- [ ] BMI category ranges match approved source rules.
- [ ] Result card displays expected value, status, risk summary, recommended action, and next tool.
- [ ] Conversion layer displays only approved safe language.
- [ ] Save / Share behavior matches approved state.
- [ ] FAQ renders and expands correctly.
- [ ] Related tools link to correct approved destinations.
- [ ] References link to approved source URLs.
- [ ] Schema is present and valid in production.
- [ ] Metadata title and description are correct.
- [ ] Mobile route renders correctly.
- [ ] No console errors appear in normal use.
- [ ] No hydration mismatch appears if SSR is used.
- [ ] Analytics events, if approved, fire only as intended.
- [ ] Homepage exposure, if approved, points to the correct production route.

## Monitoring

- [ ] Monitor page load and interaction errors.
- [ ] Monitor calculator input error rates.
- [ ] Monitor unit switching usage.
- [ ] Monitor example-card usage.
- [ ] Monitor result calculation events if analytics are approved.
- [ ] Monitor related-tool clickthrough.
- [ ] Monitor FAQ engagement.
- [ ] Monitor Save / Share interest only if placeholders become approved interactions.
- [ ] Monitor search indexing and schema validity.
- [ ] Monitor accessibility feedback or support reports.
- [ ] Monitor medical-safety feedback.
- [ ] Monitor bounce or exit after result card to evaluate conversion layer usefulness.
- [ ] Monitor mobile performance separately from desktop.

## Rollback

- [ ] Identify rollback owner before deploy.
- [ ] Document previous production BMI route state.
- [ ] Document registry state before deploy.
- [ ] Document toolsConfig state before deploy.
- [ ] Keep current production BMI available until replacement is explicitly approved and stable.
- [ ] Define rollback trigger for calculation error.
- [ ] Define rollback trigger for broken route or homepage exposure.
- [ ] Define rollback trigger for invalid schema or metadata issue.
- [ ] Define rollback trigger for trust/source issue.
- [ ] Define rollback trigger for accessibility blocker.
- [ ] Define rollback trigger for medical-safety concern.
- [ ] Confirm rollback removes homepage exposure if needed.
- [ ] Confirm rollback restores previous registry/toolsConfig state if modified.
- [ ] Confirm rollback does not delete audit documentation.
- [ ] After rollback, create a review note describing cause, impact, and next action.

## Checklist decision rule

If any required pre-deploy item fails, do not deploy. If post-deploy checks fail in a way that affects calculation correctness, accessibility, trust, medical safety, schema integrity, or route stability, trigger rollback review immediately. No production action should occur without GPT review and Victor approval.
