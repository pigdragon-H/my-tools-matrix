# BMI Gold Tool — Component Tree Draft

**Status:** Draft Only — GPT Review Required  
**Constraint:** Tree only. No TSX. No implementation. No component creation. No commit.

---

## Primary Page Tree

```text
ToolPage
├── Hero
│   ├── Eyebrow
│   ├── ToolName
│   ├── ShortIntro
│   ├── UseCases
│   └── PrimaryCTA
│
├── TrustBanner
│   ├── ScreeningToolNotice
│   ├── NotDiagnosisNotice
│   ├── ReferenceSummary
│   └── DisclaimerLink
│
├── QuickGuide
│   ├── StepChooseUnits
│   ├── StepEnterHeight
│   ├── StepEnterWeight
│   └── StepReadResult
│
├── CalculatorShell
│   ├── InputArea
│   │   ├── UnitSystemSelector
│   │   ├── MetricHeightInput
│   │   ├── MetricWeightInput
│   │   ├── ImperialFeetInput
│   │   ├── ImperialInchesInput
│   │   ├── ImperialWeightInput
│   │   └── AdultContextNotice
│   │
│   ├── Examples
│   │   ├── MetricExample
│   │   └── ImperialExample
│   │
│   ├── CalculatorActions
│   │   ├── CalculateButton
│   │   ├── ResetButton
│   │   └── CopyResultButton
│   │
│   └── ResultCard
│       ├── BMIValue
│       ├── BMICategory
│       ├── RangeLabel
│       ├── ShortMeaning
│       └── SafetyReminder
│
├── ResultIntelligence
│   ├── UnderweightPanel
│   │   ├── Meaning
│   │   ├── HealthRisks
│   │   ├── RecommendedActions
│   │   └── RelatedTools
│   ├── NormalPanel
│   │   ├── Meaning
│   │   ├── HealthRisks
│   │   ├── RecommendedActions
│   │   └── RelatedTools
│   ├── OverweightPanel
│   │   ├── Meaning
│   │   ├── HealthRisks
│   │   ├── RecommendedActions
│   │   └── RelatedTools
│   ├── ObesityIPanel
│   │   ├── Meaning
│   │   ├── HealthRisks
│   │   ├── RecommendedActions
│   │   └── RelatedTools
│   ├── ObesityIIPanel
│   │   ├── Meaning
│   │   ├── HealthRisks
│   │   ├── RecommendedActions
│   │   └── RelatedTools
│   └── ObesityIIIPanel
│       ├── Meaning
│       ├── HealthRisks
│       ├── RecommendedActions
│       └── RelatedTools
│
├── DecisionPath
│   ├── HighBMIPath
│   │   ├── CheckBMR
│   │   ├── CheckTDEE
│   │   ├── CaloriePlanning
│   │   ├── BodyCompositionContext
│   │   └── ProfessionalGuidanceNotice
│   ├── NormalBMIPath
│   │   ├── MaintainHabits
│   │   ├── OptionalTDEE
│   │   ├── OptionalBodyFat
│   │   └── KnowledgeHubLink
│   └── LowBMIPath
│       ├── ReviewNutrition
│       ├── CheckBMR
│       ├── CalorieSurplusContext
│       └── ProfessionalGuidanceNotice
│
├── FormulaSection
│   ├── CoreFormula
│   ├── MetricFormula
│   ├── ImperialFormula
│   ├── VariableDefinitions
│   ├── UnitRules
│   └── RoundingRules
│
├── KnowledgeLayer
│   ├── WhatIsBMI
│   ├── History
│   ├── Limitations
│   ├── WhenNotToUseBMI
│   ├── ChildrenContext
│   ├── AthletesContext
│   ├── PregnancyContext
│   ├── BMIVsBodyFat
│   └── BMIVsWaistRatio
│
├── FAQ
│   ├── FAQItemWhatIsBMI
│   ├── FAQItemIsDiagnosis
│   ├── FAQItemHealthyRange
│   ├── FAQItemImperialFormula
│   ├── FAQItemAthletes
│   ├── FAQItemChildren
│   ├── FAQItemPregnancy
│   └── FAQItemNextSteps
│
├── RelatedTools
│   ├── BMRCalculatorLink
│   ├── TDEECalculatorLink
│   ├── CaloriesCalculatorLink
│   ├── BodyFatCalculatorLink
│   ├── WaterIntakeCalculatorLink
│   └── WaistRatioToolLink
│
├── RelatedArticles
│   ├── BMIGuideArticle
│   ├── BMIVsBMRArticle
│   ├── BMILimitationsArticle
│   ├── IdealWeightGuideArticle
│   └── FAQClusterArticle
│
├── References
│   ├── WHOReference
│   ├── CDCReference
│   └── NIHReference
│
└── SchemaPlan
    ├── FAQSchemaPlan
    ├── HowToSchemaPlan
    ├── ToolSchemaPlan
    ├── BreadcrumbSchemaPlan
    └── EntitySchemaPlan
```

---

## Layout Grouping Tree

```text
GoldToolLayout
├── TopExperience
│   ├── Hero
│   ├── TrustBanner
│   ├── QuickGuide
│   └── CalculatorShell
│
├── InterpretationExperience
│   ├── ResultCard
│   ├── ResultIntelligence
│   └── DecisionPath
│
├── KnowledgeExperience
│   ├── FormulaSection
│   ├── KnowledgeLayer
│   └── FAQ
│
├── NavigationExperience
│   ├── RelatedTools
│   └── RelatedArticles
│
└── TrustAndMachineLayer
    ├── References
    └── SchemaPlan
```

---

## Mobile Linear Tree

```text
MobileToolPage
├── Hero
├── TrustBanner
├── QuickGuide
├── InputArea
├── CalculatorActions
├── ResultCard
├── ResultIntelligence
├── DecisionPath
├── FormulaSection
├── KnowledgeLayer
├── FAQ
├── RelatedTools
├── RelatedArticles
├── References
└── SchemaPlan
```

---

## Notes for GPT Review

This tree is intentionally conceptual. It does not create or require React components yet. The next step after GPT review should be deciding which nodes are layout primitives, which are content schema entries, and which are tool-specific modules.
