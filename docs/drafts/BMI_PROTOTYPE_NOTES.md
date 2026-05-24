# BMI Gold Prototype Notes

**Status:** Prototype only — GPT Review Required  
**Constraint:** No deploy, no commit, no registry, no route, no toolsConfig, no production integration.

---

## Problems

The prototype validates the Gold Tool Contract visually and structurally, but it is not yet production-ready. It currently lives only in `client/src/prototypes/BMIGoldPrototype.tsx` and is not connected to any route. Styling is prototype-level and should not be considered final design. The trust layer uses placeholder reference labels and does not yet include final citation URLs or access dates. FAQ, Related Tools, and References are static placeholders. The prototype does not yet include schema implementation, breadcrumb integration, analytics events, accessibility audit, or registry identity.

---

## Missing Parts

- GPT review of the prototype structure.
- Victor approval before any commit or integration.
- Final source URLs for WHO, CDC, and NIH.
- Final FAQ list and wording.
- Related article inventory confirmation.
- Related tool route confirmation without touching registry.
- Accessibility review for headings, contrast, keyboard behavior, and form labels.
- Mobile behavior review on real browser viewport.
- Schema plan conversion into implementation only after approval.
- Production BMI replacement decision, if ever requested later.

---

## Next Actions

1. Submit prototype screenshots and notes for GPT review.
2. Confirm whether render order should keep Trust after Knowledge or split into early Trust Banner plus full Trust section.
3. Confirm whether Result Intelligence should show all BMI categories or only the active category by default on mobile.
4. Confirm final related tools and article cluster.
5. After GPT review and Victor approval, decide whether to create a production-ready component or keep iterating in prototype.

---

## Explicit Non-Actions

- Did not deploy.
- Did not commit.
- Did not modify registry.
- Did not modify routes.
- Did not modify toolsConfig.
- Did not replace current BMI.
- Did not create production integration.
