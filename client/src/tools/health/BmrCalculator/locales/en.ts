import type { Translations } from "./zh"

const en: Translations = {
  // Hero
  badge: "Health · Biometrics · GOLD TOOL",
  title: "BMR Basal Metabolic Rate Calculator",
  subtitle: "BMR Calculator guided experience",
  intro: "Calculate your basal metabolic rate using the Mifflin-St Jeor formula to understand your body's baseline calorie needs, then extend to TDEE, calorie deficit, and other next-step tools.",
  trustNoteLabel: "Trust note:",
  trustNote: "BMR is an estimation tool. Individual actual metabolism varies by body composition and health status. Pregnant women and patients with special conditions should consult a physician.",

  // Quick Action Card
  quickActionCard: "Quick Action Card",
  tryCommonAdultExample: "Try a common adult example",
  bmiPreview: "BMR preview",

  // Examples
  example: "Example",
  adultMale: "Adult male (age 30)",
  weight: "Weight",
  height: "Height",
  oneClickFillAdultMaleExample: "One-click fill adult male example",
  previewHighBmiDecisionPath: "Preview high BMR decision path",

  // Examples Calculator
  examplesCalculator: "Examples → Calculator",
  enterOrFillValues: "Enter or fill values",
  examplesHelper: "The prototype keeps examples close to the calculator so users can start fast, then edit inputs without losing context.",
  metric: "Metric",
  imperial: "Imperial",
  exampleCards: "Example cards",
  highBmiPathDemo: "High BMR path demo",
  oneClickFillAllowed: "70kg · 175cm · one-click fill allowed",
  highBmiPathDescription: "88kg · 170cm · shows BMR → TDEE → Calorie Deficit path.",
  flowDemo: "Flow demo",

  // Calculator
  calculator: "Calculator",
  heightCm: "Height (cm)",
  weightKg: "Weight (kg)",
  feet: "Feet",
  inches: "Inches",
  weightLb: "Weight (lb)",
  enterValidValues: "Enter valid values",

  // Result Card
  resultCard: "Result Card",
  current: "Current",
  currentBmi: "Current BMR",
  status: "BMR Category",
  riskSummary: "Metabolism Assessment",

  // Result Intelligence
  resultIntelligence: "Result Intelligence",
  emotionConversionLayer: "Emotion + Conversion Layer",
  screeningSignal: "Screening signal",
  interpretCategoryBeforeActing: "Interpret the category before acting",
  recommendedAction: "Recommended action",
  relatedNextTool: "Related next tool",

  // Progress Insight
  progressInsightCard: "Progress Insight Card",
  timeline: "Timeline",
  step: "Step",
  goal: "Goal",
  progress: "Progress",
  keepMomentum: "Keep momentum",
  possibleProgressTarget: "Your possible progress target",
  estimatedTimelinePlaceholder: "Estimated timeline placeholder",

  // Knowledge
  knowledge: "Knowledge",
  bmiMeaning: "What BMR means in the Health universe",
  definition: "Definition",
  definitionText: "BMR (Basal Metabolic Rate) is the minimum calories your body needs to maintain life functions at complete rest.",
  limitations: "Limitations",
  limitationsText: "BMR does not account for daily activities, exercise, stress, or hormonal changes. Higher muscle mass results in higher BMR.",
  semanticNeighbors: "Related Tools",
  semanticNeighborsText: "TDEE, Calorie Deficit, BMI, and Protein Calculator extend the result context.",
  metricFormula: "Male: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age + 5",
  imperialFormula: "Female: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age - 161",

  // FAQ
  commonQuestions: "Common questions",
  faq: "FAQ",

  // Trust
  trust: "Trust Statement",
  trustText: "This tool is based on the Mifflin-St Jeor formula, the most widely adopted BMR calculation standard in academia.",

  // References
  references: "References",
  referencesText: "Mifflin MD et al. (1990), WHO metabolic standards, NIH calorie requirement guidelines",

  // Related Tools
  relatedTools: "Related Tools",

  // Journey
  healthJourney: "Health Journey",
  turnBmiIntoJourney: "Turn BMR into a health journey",
  startJourney: "Start journey",

  // Save/Share
  saveUi: "Save",
  saveShareJourney: "Save / Share journey",
  saveShareNote: "Save your calculation results and decision path",
  saveSharePlaceholder: "Enter journey name",
  shareUi: "Share",

  // Prototype Note
  prototypeLayerNote: "Prototype layer note",

  // Others
  start: "Start",
  needed: "Needed",
  neededWeightNote: "Needed weight",
  planIntake: "Plan intake",
  calories: "Calories",
  dailyNeeds: "Daily needs",
  restingEnergy: "Resting energy",
  weightLoss: "Weight loss",
  targetBmiRange: "Target BMR range",
  bmiHigh: "BMR high",
  motivationCard: "Motivation Card",
  decisionPath: "Decision Path",
  highBmiEnergyPath: "If BMR is high, continue through the energy path",
  trustRelatedReferences: "Trust · Related Tools · References",
} as const

export default en
