# BMI Conversion Notes

**Status:** Prototype only — GPT review required  
**Task:** Task 05.8 BMI Conversion Layer  
**Revised file:** `client/src/prototypes/BMIGoldPrototype.tsx`  
**Constraints:** No commit, no deploy, no production integration, no registry change, no route change, no toolsConfig change, no current BMI replacement.

## Retention ideas

The BMI result should not end at a single number. The revised conversion layer encourages users to continue by turning the result into a short health journey. The Progress Insight Card gives users a reason to stay on the page because it translates the BMI score into a goal-oriented placeholder: current BMI, goal BMI, needed weight change, and an estimated timeline placeholder. This creates a natural next interaction without promising medical advice. The Motivation Card reinforces a safe target BMI range and keeps the next steps visible. Save and Share placeholders suggest future retention mechanics, such as saving a baseline result, returning for progress checks, or sharing a non-diagnostic summary, while intentionally avoiding implementation during this prototype phase.

## Conversion ideas

The strongest conversion path is from BMI into adjacent tools. A high BMI result can point to BMR, then TDEE, then Calories, and eventually Weight Loss planning. A normal BMI result can point to TDEE, Body Fat, Water Intake, and maintenance-oriented tools. An underweight result can point to BMR, calorie planning, and nutrition guidance. The prototype uses a suggested next-tool area in the Result Card and a Motivation Card with BMR, TDEE, Calories, and Weight Loss. These prompts can become internal links only after GPT review, Victor approval, and production integration approval. The Save / Share UI can become a conversion point later, but in this task it remains placeholder-only with no persistence, no account flow, no export, and no share implementation.

## Future journey

A future production version could support a multi-step health journey: Current result, BMI interpretation, BMR estimate, TDEE estimate, calorie target, progress tracking, and periodic reassessment. The journey should remain medically cautious and should not imply diagnosis, guaranteed weight loss, or personalized treatment. Future work should define safe copy rules, source-backed assumptions, accessibility behavior, schema implications, and analytics events. Any journey feature should also distinguish between adults, children, pregnancy, athletes, and clinical-risk contexts. Before implementation, the team should decide whether goal BMI defaults to 23, whether users can set their own target, how timelines are calculated, and how to prevent unsafe recommendations.
