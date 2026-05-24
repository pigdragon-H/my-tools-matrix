# BMI Calculator — Gold Tool Specification v1

**Project:** Formula Universe  
**Phase:** Reconstruction  
**Status:** Draft Only — GPT Review Required  
**Target Tool:** BMI Calculator  
**Universe:** Health  
**Template Purpose:** Health universe Gold Tool template  
**Modification Rule:** No production tool changes, no registry changes, no TSX, no component, no commit.

---

## 1. Hero

### Tool Name

BMI Calculator

### Short Intro

The BMI Calculator estimates Body Mass Index from height and weight, then maps the result to standard adult BMI categories so users can understand whether their weight-to-height ratio falls within an underweight, healthy, overweight, or obesity range.

### Primary Value Proposition

Calculate BMI quickly, understand what the result means, and learn how BMI should and should not be used as a health screening metric.

### Use Cases

The BMI Calculator is intended for general adult health screening, personal wellness tracking, fitness baseline review, health article support, and educational comparison between metric and imperial measurement systems. It is especially useful for users who want a quick standardized weight-to-height indicator before exploring related tools such as BMR, TDEE, Calories, and Body Fat calculators.

### Important Health Disclaimer

BMI is a screening tool, not a medical diagnosis. It does not directly measure body fat, muscle mass, bone density, pregnancy status, ethnicity-specific risk, or individual medical conditions. Users should consult a qualified healthcare professional for personalized health advice.

---

## 2. Input Schema

### Input Field 1: Measurement System

**Field label:** Unit System  
**Unit:** Metric or Imperial  
**Example:** Metric  
**Placeholder:** Select unit system  
**Validation rules:** Must be one of the supported unit systems. The selected system controls which height and weight inputs are shown.

### Input Field 2A: Height — Metric

**Field label:** Height  
**Unit:** centimeters or meters  
**Example:** 170 cm  
**Placeholder:** Enter height, e.g. 170  
**Validation rules:** Must be a positive number. Recommended adult range is 50–250 cm. If using meters, accepted range is 0.5–2.5 m. Values outside plausible human range should show a warning or validation message.

### Input Field 2B: Height — Imperial

**Field label:** Height  
**Unit:** feet and inches  
**Example:** 5 ft 7 in  
**Placeholder:** Feet: 5, Inches: 7  
**Validation rules:** Feet must be a non-negative integer or decimal greater than 0 when combined with inches. Inches must be from 0 to less than 12 if separated from feet. Total height must be positive and should be validated against plausible adult range.

### Input Field 3A: Weight — Metric

**Field label:** Weight  
**Unit:** kilograms  
**Example:** 65 kg  
**Placeholder:** Enter weight, e.g. 65  
**Validation rules:** Must be a positive number. Recommended adult range is 10–500 kg. Values outside plausible human range should show a warning or validation message.

### Input Field 3B: Weight — Imperial

**Field label:** Weight  
**Unit:** pounds  
**Example:** 143 lb  
**Placeholder:** Enter weight, e.g. 143  
**Validation rules:** Must be a positive number. Recommended adult range is 22–1100 lb. Values outside plausible human range should show a warning or validation message.

### Input Field 4: Age Context Optional

**Field label:** Adult age confirmation  
**Unit:** Adult / child context  
**Example:** Adult 20+  
**Placeholder:** Select adult context  
**Validation rules:** BMI adult categories are intended for adults. If the user indicates child or teen context, the result should display a warning that child BMI requires age- and sex-specific percentile charts.

---

## 3. Result Interpretation

### Primary Result

The tool should output a BMI value rounded to one decimal place by default, with an optional exact value available for copy or advanced display.

Example result:

```text
BMI: 22.5
Category: Healthy weight
```

### Adult BMI Ranges

| BMI Range | Category | Meaning | General Recommendation |
|---|---|---|---|
| Below 18.5 | Underweight | Weight may be low relative to height. | Consider reviewing nutrition, health history, and professional guidance if unintended. |
| 18.5–24.9 | Healthy weight | Weight-to-height ratio is within the standard adult healthy range. | Maintain balanced nutrition, physical activity, sleep, and preventive care. |
| 25.0–29.9 | Overweight | Weight may be higher than the standard healthy range. | Consider lifestyle review and related metrics such as waist circumference, body fat, and activity level. |
| 30.0–34.9 | Obesity Class I | BMI indicates elevated weight-related health risk for many adults. | Consider consulting a healthcare professional for personalized assessment. |
| 35.0–39.9 | Obesity Class II | BMI indicates higher weight-related health risk for many adults. | Professional medical guidance is recommended. |
| 40.0 and above | Obesity Class III | BMI indicates very high weight-related health risk for many adults. | Professional medical guidance is strongly recommended. |

### Interpretation Rules

The result section should avoid judgmental language. It should explain BMI as a general screening indicator and include caveats for athletes, older adults, pregnancy, children, and people with atypical body composition. When the BMI is outside the healthy range, recommendations should be framed as next-step guidance rather than diagnosis.

### Recommended Result Copy

If BMI is in a healthy range, the tool can say that the result is within the standard adult healthy range, while still reminding users that BMI is only one health indicator. If BMI is underweight, overweight, or in an obesity category, the tool should recommend considering related measures and professional guidance rather than making a medical conclusion.

---

## 4. Formula Section

### Core Formula

```text
BMI = weight / height²
```

### Metric Formula

```text
BMI = weight(kg) / [height(m)]²
```

### Imperial Formula

```text
BMI = 703 × weight(lb) / [height(in)]²
```

### Variable Definitions

**BMI** is Body Mass Index.  
**weight** is body weight. In metric mode it is measured in kilograms. In imperial mode it is measured in pounds.  
**height** is body height. In metric mode it is measured in meters. In imperial mode it is measured in total inches.  
**703** is the standard conversion factor used when pounds and inches are used instead of kilograms and meters.

### Unit Rules

For metric input, centimeters must be converted to meters before squaring height. For imperial input, feet and inches must be converted to total inches before applying the imperial BMI formula.

### Rounding Rules

The default display should round BMI to one decimal place. Internal calculation should preserve full numeric precision before final display rounding.

---

## 5. Usage Guide

### Step 1: Choose the Measurement System

Select metric if your height and weight are in centimeters or meters and kilograms. Select imperial if your height and weight are in feet, inches, and pounds.

### Step 2: Enter Height

Enter your height using the selected unit system. In metric mode, height can be entered in centimeters. In imperial mode, height should be entered as feet and inches.

### Step 3: Enter Weight

Enter your body weight using the selected unit system. Use kilograms for metric mode and pounds for imperial mode.

### Step 4: Calculate BMI

The calculator converts the inputs into the correct formula, calculates BMI, rounds the result, and assigns an adult BMI category.

### Step 5: Read the Interpretation

Review the category explanation and recommendations. Remember that BMI is a screening metric and does not directly measure body fat or overall health.

### Step 6: Explore Related Tools

Use related tools such as BMR, TDEE, Calories, and Body Fat calculators to build a more complete health and fitness picture.

---

## 6. FAQ

### 1. What is BMI?

BMI stands for Body Mass Index. It is a number calculated from height and weight that is commonly used as a general adult weight-status screening tool.

### 2. Is BMI a diagnosis?

No. BMI is not a diagnosis. It is a screening measure that can indicate whether weight may be low, normal, or high relative to height, but it cannot determine individual health status by itself.

### 3. What is a healthy BMI range for adults?

For most adults, a BMI from 18.5 to 24.9 is commonly categorized as healthy weight. However, individual risk can vary based on body composition, age, sex, ethnicity, medical history, and lifestyle.

### 4. Why does the imperial formula use 703?

The number 703 is a conversion factor that adapts the metric BMI formula for pounds and inches. It allows BMI to be calculated using weight in pounds and height in inches.

### 5. Can athletes have misleading BMI results?

Yes. Athletes or people with high muscle mass may have a high BMI even if their body fat level is not high. BMI does not distinguish between muscle, fat, bone, and other body tissues.

### 6. Is BMI accurate for children and teenagers?

Adult BMI categories should not be used directly for children and teenagers. Child and teen BMI interpretation usually requires age- and sex-specific percentile charts.

### 7. Can BMI be used during pregnancy?

BMI during pregnancy requires special clinical interpretation. Standard adult BMI categories are not sufficient for evaluating pregnancy-related weight changes.

### 8. What should I do if my BMI is outside the healthy range?

Use the result as a starting point for awareness, not as a diagnosis. Consider reviewing nutrition, activity, sleep, waist circumference, body fat percentage, and consulting a healthcare professional for personalized guidance.

### 9. How often should I check BMI?

BMI does not need to be checked daily. It may be useful for occasional tracking over time, especially when combined with other health indicators.

### 10. What tools should I use after BMI?

Useful follow-up tools include BMR Calculator, TDEE Calculator, Calories Calculator, and Body Fat Calculator because they provide additional context about energy needs, activity level, and body composition.

---

## 7. Related Tools

### BMR Calculator

**Relationship:** Next-step health metabolism tool  
**Reason:** After BMI, users often want to understand basal metabolic rate and estimated daily energy needs.

### TDEE Calculator

**Relationship:** Next-step daily energy tool  
**Reason:** TDEE expands BMR by adding activity level, making it useful for weight maintenance, loss, or gain planning.

### Calories Calculator

**Relationship:** Practical planning tool  
**Reason:** Calorie planning helps users translate health goals into daily intake targets.

### Body Fat Calculator

**Relationship:** Complementary body composition tool  
**Reason:** Body fat estimates can provide context that BMI cannot, especially for users with high or low muscle mass.

---

## 8. Metadata

### Semantic Tags

```text
health
bmi
body mass index
weight status
adult screening
height weight calculator
health metric
wellness
body composition context
```

### Search Intent

```text
calculate BMI
BMI calculator
what is my BMI
healthy BMI range
BMI chart adults
BMI formula
BMI kg cm
BMI pounds inches
underweight overweight obesity category
```

### Cluster

```text
HLT / Biometrics / Weight Status Screening
```

### Tool Type

```text
calculator
health screening
metric interpretation
```

### Primary Entity

```text
Body Mass Index
```

### Input Entities

```text
height
weight
unit system
adult context
```

### Output Entities

```text
BMI value
BMI category
result interpretation
next-step recommendation
```

### Related Tools Metadata

```json
{
  "relatedTools": [
    {
      "name": "BMR Calculator",
      "relationship": "next-step",
      "reason": "Estimate basal metabolic rate after BMI screening."
    },
    {
      "name": "TDEE Calculator",
      "relationship": "next-step",
      "reason": "Estimate daily calorie expenditure using activity level."
    },
    {
      "name": "Calories Calculator",
      "relationship": "practical-planning",
      "reason": "Translate weight and wellness goals into intake planning."
    },
    {
      "name": "Body Fat Calculator",
      "relationship": "complementary",
      "reason": "Add body composition context that BMI cannot measure directly."
    }
  ]
}
```

### Risk Level

```text
medium
```

### Disclaimer Required

```text
yes
```

### Registry Constraint

No canonical tool ID is assigned in this draft. Canonical identity must remain registry-owned.

---

## GPT Review Notes

This draft is intended for GPT review before any implementation work. Review should verify whether BMI is an appropriate first Health Gold Tool template, whether the input schema and interpretation language are medically cautious enough, and whether metadata should be stored in registry, page-level content, or a future knowledge graph layer.

---

## 9. Knowledge Layer

### What is BMI?

Body Mass Index, usually abbreviated as BMI, is a standardized health metric that compares body weight with height. It is calculated by dividing weight by the square of height. The result is used as a simple screening indicator for adult weight status. BMI does not directly measure body fat, but it gives a quick population-level estimate of whether a person's weight is low, within a standard healthy range, or elevated relative to height.

### History

BMI originated from the work of Belgian mathematician and statistician Adolphe Quetelet in the nineteenth century. The metric was originally known as the Quetelet Index and was developed as a statistical description of human body proportions, not as an individual diagnostic tool. In the twentieth century, BMI became widely adopted in public health because it is easy to calculate, inexpensive, and useful for comparing population-level weight categories. Its modern use as a screening metric should therefore be understood in context: it is practical and scalable, but not complete.

### Limitations

BMI has important limitations. It does not distinguish fat mass from lean mass, does not measure fat distribution, does not account for bone density, and does not reflect individual metabolic health. Two people with the same BMI may have very different body compositions and health profiles. BMI can also vary in meaning across age groups, sex, ethnicity, athletic training status, and clinical conditions.

### When NOT to use BMI

BMI should not be used as a standalone medical diagnosis. It should not be used alone for children, teenagers, pregnant users, competitive athletes, older adults with muscle loss, people with edema or fluid retention, or anyone whose body composition differs significantly from the general adult population. In these contexts, BMI may still provide a rough number, but interpretation requires other measurements or professional guidance.

### Children

Children and teenagers should not be evaluated with adult BMI category thresholds. Pediatric BMI interpretation usually depends on age- and sex-specific percentile charts. A BMI value that appears normal by adult standards may mean something different for a growing child or adolescent.

### Athletes

Athletes and people with high muscle mass may receive a BMI result in the overweight or obesity range even when their body fat is not elevated. Because muscle is denser than fat, BMI can overestimate health risk in highly trained individuals. For athletes, body fat percentage, performance context, waist measurements, and clinical evaluation are often more informative.

### Pregnancy

BMI during pregnancy requires special interpretation. Pregnancy changes body weight, fluid levels, and body composition. Standard adult BMI categories should not be used to judge pregnancy weight status without clinical context. Pre-pregnancy BMI may be used by healthcare professionals as one factor in pregnancy weight-gain guidance.

### BMI vs Body Fat

BMI compares weight to height. Body fat percentage estimates how much of total body weight is fat mass. BMI is easier to calculate, but body fat percentage can provide more direct body composition context. However, body fat estimates also vary by measurement method and may have accuracy limitations.

### BMI vs Waist Ratio

Waist-based metrics, such as waist-to-height ratio or waist circumference, help estimate central fat distribution. Central fat distribution can be relevant to metabolic risk. BMI and waist-based measures answer different questions: BMI estimates weight relative to height, while waist ratio provides additional context about body shape and fat distribution.

---

## 10. Semantic Graph

The BMI Calculator should be represented as a body composition screening node inside the Health universe. It should connect to metabolism, energy expenditure, calorie planning, body composition, hydration, and broader wellness tools.

### Graph Relationship Model

```text
BMI ↔ BMR ↔ TDEE ↔ Calories ↔ Body Fat ↔ Water Intake
```

### BMI ↔ BMR

BMI identifies weight-status category from height and weight. BMR estimates basal metabolic energy needs from body characteristics. The relationship is a next-step relationship: after users understand BMI, they often want to understand baseline calorie needs.

### BMR ↔ TDEE

BMR is the resting baseline. TDEE expands BMR by adding activity level. The relationship is a formula dependency relationship: TDEE typically uses BMR as a foundation and multiplies it by an activity factor.

### TDEE ↔ Calories

TDEE estimates daily energy expenditure. Calories tools help users translate daily energy needs into intake targets for maintenance, weight loss, or weight gain. The relationship is a practical planning relationship.

### Calories ↔ Body Fat

Calorie balance influences body weight over time, but scale weight does not reveal body composition. Body Fat tools provide complementary context about fat mass and lean mass. The relationship is a composition-context relationship.

### Body Fat ↔ Water Intake

Body composition and wellness planning often connect to hydration, training, and daily habits. Water Intake tools support broader wellness behavior but should not be treated as a direct BMI diagnostic dependency. The relationship is a wellness-adjacent relationship.

### BMI ↔ Body Fat

BMI and Body Fat should be directly cross-linked because users often confuse them. BMI is a height-weight screening metric, while body fat percentage estimates composition. The relationship is a comparison and clarification relationship.

### BMI ↔ Waist Ratio

If a Waist Ratio tool exists or is planned, BMI should link to it as an additional body-shape and risk-context metric. The relationship is a complementary screening relationship.

---

## 11. Search Intent Layer

### Primary Intent

```text
BMI calculator
```

The primary intent is transactional-informational. Users want to enter height and weight, calculate BMI, and understand the resulting category immediately.

### Secondary Intents

```text
healthy BMI
BMI chart
ideal weight
body fat
weight loss
```

### Intent Mapping

**healthy BMI** should map to result interpretation and adult BMI range explanations.  
**BMI chart** should map to category ranges and visual range presentation.  
**ideal weight** should map to related tools and caution language because BMI alone should not define a personal ideal weight.  
**body fat** should map to BMI vs Body Fat and related Body Fat Calculator links.  
**weight loss** should map to TDEE, Calories, BMR, and safe planning disclaimers.

### Search Experience Requirement

The page should satisfy quick calculation intent at the top while also supporting deeper educational intent below the calculator. Users arriving from search should be able to calculate BMI within seconds, then continue into interpretation, limitations, and related tools if needed.

---

## 12. Content Cluster

### Tool

BMI Calculator

### Supporting Articles

#### BMI Guide

A beginner-friendly guide explaining what BMI is, how it is calculated, adult ranges, examples, and safe interpretation.

#### BMI vs BMR

An explanatory article comparing BMI as a body-size screening metric and BMR as an energy metabolism estimate.

#### BMI Limitations

A deeper article explaining when BMI can be misleading, including athletes, children, pregnancy, older adults, and body composition differences.

#### Ideal Weight Guide

A guide explaining why ideal weight is not a single universal number and how BMI, waist ratio, body fat, health goals, and clinical context may contribute to a broader assessment.

#### FAQ Cluster

A structured FAQ cluster covering common BMI search questions, including healthy BMI, BMI chart interpretation, BMI by age, BMI for women and men, BMI for athletes, BMI for children, and BMI vs body fat.

### Cluster Strategy

The BMI Calculator should serve as the central conversion and assessment tool. Supporting articles should capture educational search intent and link back to the calculator. Related tools should capture next-step action intent, especially BMR, TDEE, Calories, Body Fat, and Water Intake.

---

## 13. AI Metadata

```yaml
entity_type: health metric
cluster: body composition
intent: assessment
difficulty: basic
related_universe: HLT
galaxy: BIO
```

### AI Retrieval Notes

The BMI Calculator should be retrievable for queries about adult BMI calculation, BMI category interpretation, body composition screening, healthy BMI range, BMI formula, and BMI limitations. AI systems should avoid presenting BMI as a diagnosis and should preserve the distinction between screening, interpretation, and medical advice.

### Safety and Disclaimer Metadata

```yaml
risk_level: medium
medical_disclaimer_required: true
not_for_standalone_diagnosis: true
children_require_percentile_context: true
pregnancy_requires_clinical_context: true
athletes_require_body_composition_context: true
```

### Graph Metadata Draft

```json
{
  "entity_type": "health metric",
  "cluster": "body composition",
  "intent": "assessment",
  "difficulty": "basic",
  "related_universe": "HLT",
  "galaxy": "BIO",
  "semantic_neighbors": [
    "BMR",
    "TDEE",
    "Calories",
    "Body Fat",
    "Water Intake",
    "Waist Ratio"
  ],
  "primary_search_intent": "BMI calculator",
  "secondary_search_intents": [
    "healthy BMI",
    "BMI chart",
    "ideal weight",
    "body fat",
    "weight loss"
  ]
}
```

---

## 14. Result Intelligence Layer

BMI result is not enough. A Gold Tool must interpret the result, explain risk context, recommend safe next steps, and route the user to related tools or educational content. The output should not stop at a single number or category.

### Underweight

**Range:** BMI below 18.5

**Meaning:** The user's weight may be low relative to height according to standard adult BMI categories. This may reflect low body fat, low muscle mass, illness, undernutrition, or other personal health factors.

**Health risks:** Potential concerns may include nutrient deficiency, fatigue, reduced immune resilience, bone health concerns, hormonal disruption, or unintended weight loss. The tool must avoid diagnosing these conditions and should frame them as possible concerns to discuss with a professional.

**Recommended actions:** Encourage the user to review recent weight changes, nutrition quality, appetite, activity level, and medical history. If low BMI is unintentional or associated with symptoms, recommend professional healthcare guidance.

**Related tools:** BMR Calculator, Calories Calculator, Ideal Weight Guide, BMI Limitations article.

### Normal

**Range:** BMI 18.5–24.9

**Meaning:** The user's BMI falls within the standard adult healthy weight range. This suggests weight is within a commonly recommended range relative to height, but it does not guarantee metabolic health or ideal body composition.

**Health risks:** Risk is generally lower at a population level than in underweight or obesity ranges, but individual risk may still depend on waist circumference, blood pressure, blood glucose, cholesterol, lifestyle, genetics, and medical history.

**Recommended actions:** Encourage maintenance habits such as balanced nutrition, regular activity, sleep, hydration, and periodic health screening. Recommend body composition or waist ratio tools when users want a deeper assessment.

**Related tools:** TDEE Calculator, Water Intake Calculator, Body Fat Calculator, Waist Ratio tool if available.

### Overweight

**Range:** BMI 25.0–29.9

**Meaning:** The user's weight may be above the standard healthy range for their height. For many adults, this can be associated with increased health risk, but BMI alone cannot determine body fat or clinical status.

**Health risks:** Potential population-level associations include increased risk of high blood pressure, insulin resistance, sleep apnea, joint strain, and cardiometabolic conditions. However, risk varies by body composition and fat distribution.

**Recommended actions:** Encourage checking additional context such as waist ratio, body fat estimate, activity level, and nutrition patterns. Suggest using BMR and TDEE to understand energy needs before making weight-management decisions.

**Related tools:** BMR Calculator, TDEE Calculator, Calories Calculator, Body Fat Calculator, BMI vs Body Fat article.

### Obesity I

**Range:** BMI 30.0–34.9

**Meaning:** The user's BMI falls into Obesity Class I. At a population level, this range is associated with increased likelihood of weight-related health risk, though BMI remains a screening tool rather than a diagnosis.

**Health risks:** Potential risks may include higher likelihood of hypertension, type 2 diabetes, sleep apnea, cardiovascular disease, fatty liver disease, and joint stress. The tool should present these as risk associations, not individual diagnoses.

**Recommended actions:** Recommend professional guidance if the user is concerned, has symptoms, or is planning significant weight change. Suggest reviewing BMR, TDEE, calorie planning, activity level, and sustainable lifestyle goals.

**Related tools:** TDEE Calculator, Calories Calculator, Body Fat Calculator, Water Intake Calculator, Weight Loss article cluster.

### Obesity II

**Range:** BMI 35.0–39.9

**Meaning:** The user's BMI falls into Obesity Class II. At a population level, this is associated with higher weight-related health risk than Obesity Class I.

**Health risks:** Potential risks may include elevated cardiometabolic risk, sleep apnea, mobility limitations, joint pain, and increased likelihood of chronic disease. The tool should clearly recommend professional assessment without creating alarmist copy.

**Recommended actions:** Encourage consultation with a qualified healthcare professional for personalized evaluation and planning. If the user wants to understand energy needs, guide them toward BMR and TDEE, but emphasize that health decisions should not rely only on calculator outputs.

**Related tools:** BMR Calculator, TDEE Calculator, Calories Calculator, Body Fat Calculator, professional-care guidance content.

### Obesity III

**Range:** BMI 40.0 and above

**Meaning:** The user's BMI falls into Obesity Class III. This category is associated with very high population-level weight-related health risk.

**Health risks:** Potential risks may include increased likelihood of type 2 diabetes, cardiovascular disease, severe sleep apnea, mobility limitations, and other chronic conditions. The tool must remain careful: it should not diagnose, but it should strongly encourage professional guidance.

**Recommended actions:** Recommend professional medical evaluation and individualized support. Related calculators can provide educational context, but treatment or weight-management decisions should be made with healthcare guidance.

**Related tools:** BMR Calculator, TDEE Calculator, Calories Calculator, Body Fat Calculator, BMI Limitations article, healthcare disclaimer content.

---

## 15. Decision Layer

The Decision Layer defines what the BMI page should recommend after interpreting a result. It should guide users from awareness to context to action, without pretending that BMI alone is sufficient.

### High BMI Decision Path

```text
BMI high
↓
Check interpretation category
↓
Review BMI limitations
↓
Check BMR
↓
Check TDEE
↓
Estimate calorie target
↓
Consider calorie deficit only if appropriate
↓
Review activity, nutrition, sleep, hydration
↓
Use Body Fat or Waist Ratio for composition context
↓
Seek professional guidance when risk, symptoms, or major lifestyle change is involved
```

### Low BMI Decision Path

```text
BMI low
↓
Check whether weight change is intentional or unintentional
↓
Review appetite, nutrition quality, activity level, and symptoms
↓
Estimate BMR and calorie needs
↓
Consider calorie surplus only if appropriate
↓
Seek professional guidance if low BMI is unexplained, symptomatic, or persistent
```

### Normal BMI Decision Path

```text
BMI normal
↓
Confirm BMI is only one screening metric
↓
Review lifestyle goals
↓
Check TDEE for maintenance planning if useful
↓
Use Body Fat or Waist Ratio if body composition context is desired
↓
Explore Knowledge Hub articles for prevention and wellness education
```

### Decision Safety Rules

The tool should not prescribe a diet, medical treatment, or guaranteed weight-loss plan. It can recommend related calculators and educational content, but it must keep health decisions contextual and encourage professional guidance for medical concerns.

---

## 16. User Journey Layer

The User Journey Layer maps how a visitor should move through the BMI Gold Tool page and into the broader Formula Universe knowledge system.

### Primary Journey

```text
Visitor
↓
BMI tool
↓
Input height and weight
↓
BMI result
↓
Interpretation
↓
Related tools
↓
Supporting articles
↓
Knowledge Hub
```

### Journey Stage 1: Visitor

The visitor usually arrives with a quick calculation intent such as “BMI calculator” or “healthy BMI.” The page must satisfy this intent immediately with a visible calculator and clear input fields.

### Journey Stage 2: BMI Tool

The user enters height and weight, chooses the unit system, and receives a BMI value. The calculator must validate inputs and explain errors clearly.

### Journey Stage 3: Interpretation

The user sees the BMI range, category meaning, health-risk context, and cautious recommendations. This stage transforms the tool from a calculator into a knowledge node.

### Journey Stage 4: Related Tools

The page recommends BMR, TDEE, Calories, Body Fat, Water Intake, and Waist Ratio tools based on the user's likely next question. Links should explain why each tool is related.

### Journey Stage 5: Articles

The user can continue into article content such as BMI Guide, BMI vs BMR, BMI Limitations, Ideal Weight Guide, and FAQ cluster pages.

### Journey Stage 6: Knowledge Hub

The Knowledge Hub acts as the long-term educational destination, connecting BMI to body composition, metabolism, calorie planning, and health screening concepts.

---

## 17. Trust Layer

The BMI Gold Tool must include a trust layer because health content can influence user decisions. Trust is created through cautious language, authoritative references, transparent formulas, and a clear distinction between screening and diagnosis.

### Reference Sources

#### WHO

The World Health Organization is an authoritative source for adult BMI categories and population-level weight-status classification. WHO references should be used to explain common BMI thresholds and public health context.

#### CDC

The Centers for Disease Control and Prevention provides accessible BMI explanations, adult BMI categories, and important caveats about BMI as a screening measure. CDC references are especially useful for explaining that BMI does not directly measure body fat.

#### NIH

The National Institutes of Health provides medically oriented context for weight, health risk, and related conditions. NIH references can support careful explanations of risk associations while avoiding individual diagnosis.

### Screening Tool Statement

BMI is a screening tool. It can help identify possible weight-status categories at a population level, but it is not a diagnosis and does not replace clinical evaluation.

### Not Diagnosis Statement

The tool must explicitly state that BMI does not diagnose disease, body fat level, metabolic health, or personal medical risk. Users with health concerns, symptoms, pregnancy, child or teen context, athletic body composition, or major weight-change plans should consult qualified professionals.

### Reference Display Requirement

References should appear near the formula, interpretation, or trust section. They should be clearly labeled and should not be hidden behind unrelated UI. The page should distinguish between formula references, category references, and health disclaimer references.

---

## 18. Structured Data Layer

This section defines structured data requirements only. It does not implement schema markup. Implementation should wait until GPT review and Victor approval.

### FAQ Schema

The FAQ section should be eligible for FAQ structured data. Each FAQ entry should have a clear question and concise answer. FAQ schema should cover BMI definition, healthy range, formula, limitations, children, athletes, pregnancy, and BMI versus body fat.

### HowTo Schema

The Usage Guide may be eligible for HowTo structured data if implemented as a step-by-step calculation guide. Steps should include choosing units, entering height, entering weight, calculating BMI, reading interpretation, and exploring related tools.

### Tool Schema

The calculator should be described as an interactive tool or web application entity where supported. The schema should identify the tool name, purpose, input requirements, output type, and category. It must not invent a registry-owned canonical ID.

### Breadcrumb Schema

Breadcrumb schema should represent the navigation hierarchy. A draft path may be:

```text
Home → Health → Biometrics → BMI Calculator
```

The final breadcrumb structure must follow the approved site taxonomy and registry identity model.

### Entity Schema

The BMI concept should be represented as a health metric entity. Entity metadata should include aliases such as Body Mass Index, BMI, adult BMI, and weight-status screening metric. The entity schema should connect to related entities such as BMR, TDEE, Body Fat, Calories, Water Intake, and Waist Ratio.

### Structured Data Safety Rules

Structured data must reflect visible page content. It should not claim medical diagnosis capability. It should not represent BMI as a treatment, prescription, or clinical decision tool. It should preserve the distinction between general education and medical advice.
