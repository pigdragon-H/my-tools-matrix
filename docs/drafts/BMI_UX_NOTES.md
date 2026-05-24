# BMI UX Notes

**Status:** Prototype revision — GPT review required  
**Task:** Task 05.5 BMI Gold UX Revision  
**Scope:** Prototype only  
**File revised:** `client/src/prototypes/BMIGoldPrototype.tsx`  
**Constraints:** No commit, no deploy, no production integration, no registry change, no route change, no toolsConfig change, no current BMI replacement.

## Problems

The previous BMI Gold prototype had the correct Gold Tool sections, but the experience still behaved like a section stack. Users could read the page from top to bottom, but the sequence did not strongly guide them from action to interpretation. The calculator and examples were present, yet they did not feel like a deliberate onboarding step. The result card displayed the BMI value and category, but it was not visual enough for a health screening tool because it lacked a clear band placeholder, risk summary, recommended action, and a single related next tool. The decision path existed, but it needed a more explicit visual flow for the common high-BMI journey from BMI into BMR, TDEE, and Calories.

## Improvements

The revised prototype now uses a guided experience flow: Hero, Quick Action Card, Examples, Calculator, Result Card, Result Intelligence, Decision Path, Knowledge, and FAQ. The new Quick Action Card introduces an adult male example with 70kg and 175cm, shows a BMI preview, and includes one-click fill behavior. The calculator area now keeps examples beside the inputs so users can start from a known case and then edit values. The Result Card is more visual and includes the BMI value, status, color band placeholder, risk summary, recommended action, and related next tool. Result Intelligence remains close to the result so users can compare their category against the full BMI range. The Decision Path now shows the requested high-BMI flow as BMI high → BMR → TDEE → Calories, making the next-step logic easier to understand.

## Open issues

The color band is still a placeholder and needs final visual design review before production implementation. The prototype does not include real navigation for related tools, schema output, analytics, accessibility testing, or final medical-source citations. The Quick Action Card currently includes only one required adult male example plus a high-BMI path demo; GPT review should decide whether additional examples are needed for female, imperial, underweight, or athlete contexts. The result recommendations are still category-level draft text and should be reviewed for medical safety language. The current file remains prototype-only and should not be connected to routes, registry, toolsConfig, or the production BMI calculator without GPT review and Victor approval.
