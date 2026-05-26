import type { Translations } from "./zh"

const en: Translations = {
  // Hero
  badge: "Health · Metabolism · Gold Tool",
  title: "TDEE Calculator · Complete Daily Energy Expenditure Assessment",
  subtitle: "TDEE Daily Energy Expenditure Calculator",
  intro: "Calculate your Total Daily Energy Expenditure (TDEE) accurately. Understand how many calories your body burns through daily activities. Combine your Basal Metabolic Rate (BMR) with activity factors to get personalized energy insights and weight management recommendations.",
  cta: "Calculate Now",
  trustNoteLabel: "Trust note:",
  trustNote: "TDEE is an estimation tool, not a diagnosis. It cannot account for individual metabolic variations, special physiological conditions, or medical situations.",

  // Quick Guide
  quickGuideBadge: "Quick Guide",
  quickGuideTitle: "3 Steps to Calculate Your TDEE",
  step1: "Enter your basic info: gender, age, height, weight, activity level",
  step2: "System calculates your BMR, then multiplies by activity factor to get TDEE",
  step3: "Review category, interpretation, advice, and related tools",

  // Examples
  examplesBadge: "Real Examples",
  examplesTitle: "TDEE Varies Across Activity Levels",
  example1Title: "30-year-old Male (Moderate Activity)",
  example1Desc: "Height 175cm, Weight 70kg → TDEE = 2,500 kcal/day",
  example2Title: "25-year-old Male (Active)",
  example2Desc: "Height 180cm, Weight 80kg → TDEE = 3,100 kcal/day",
  example3Title: "35-year-old Female (Light Activity)",
  example3Desc: "Height 165cm, Weight 60kg → TDEE = 1,900 kcal/day",

  // Calculator
  calculatorBadge: "Calculator",
  calculatorTitle: "Calculate Your TDEE",
  gender: "Gender",
  male: "Male",
  female: "Female",
  age: "Age",
  height: "Height",
  weight: "Weight",
  calculate: "Calculate TDEE",
  cm: "cm",
  kg: "kg",
  feet: "Feet",
  inches: "Inches",
  lb: "lb",
  activityLevelLabel: "Activity Level",
  activityLevel: "Activity Level",

  // Quick Action
  quickActionCard: "Quick Action Card",
  tryCommonExample: "Try a common adult example",
  tdeePreview: "TDEE preview",
  example: "Example",
  adultMale: "Adult male",
  oneClickFillExample: "One-click fill adult male example",
  previewActivePath: "Preview active path",
  oneClickFillAllowed: "Age 30 · 175cm · 70kg · Moderate activity · one-click fill allowed",
  activePathDemo: "Active person path",
  activePathDescription: "Age 25 · 180cm · 80kg · Active · shows high TDEE decision path",
  flowDemo: "Flow demo",

  // Examples & Calculator
  examplesCalculator: "Examples → Calculator",
  enterOrFillValues: "Enter or fill values",
  examplesHelper: "The prototype keeps examples close to the calculator so users can start fast, then edit inputs without losing context.",
  metric: "Metric",
  imperial: "Imperial",
  exampleCards: "Example cards",

  // Result
  resultBadge: "Result",
  yourTDEE: "Your TDEE",
  bmr: "Basal Metabolic Rate (BMR)",
  activityMultiplier: "Activity Factor",
  kcalPerDay: "kcal/day",
  category: "Category",
  label: "Category",
  range: "Range",

  // Categories
  veryLowTdee: "Very Low",
  veryLowTdeeRange: "< 1500 kcal/day",
  veryLowTdeeMeaning: "Very low daily energy expenditure, typically seen in sedentary, smaller-framed individuals.",
  veryLowTdeeRisks: "May lead to nutritional deficiency, low energy, fatigue, or reduced metabolic efficiency.",
  veryLowTdeeActions: "Ensure adequate nutrition, increase daily activity, avoid extreme dieting.",

  lowTdee: "Low",
  lowTdeeRange: "1500-2000 kcal/day",
  lowTdeeMeaning: "Low daily energy expenditure, typically seen in sedentary or lightly active individuals.",
  lowTdeeRisks: "Pay attention to diet quality and nutritional balance to avoid deficiency.",
  lowTdeeActions: "Maintain balanced nutrition, gradually increase activity, monitor weight and energy levels.",

  moderateTdee: "Moderate",
  moderateTdeeRange: "2000-2800 kcal/day",
  moderateTdeeMeaning: "Moderate daily energy expenditure, typically seen in moderately active individuals.",
  moderateTdeeRisks: "Normal metabolic level, balance diet and exercise carefully.",
  moderateTdeeActions: "Adjust calorie intake based on goals (weight loss, maintenance, or muscle gain), maintain regular exercise.",

  highTdee: "High",
  highTdeeRange: "2800-3500 kcal/day",
  highTdeeMeaning: "High daily energy expenditure, typically seen in active or physically demanding job individuals.",
  highTdeeRisks: "Ensure adequate calorie and nutrient intake to avoid energy deficit.",
  highTdeeActions: "Increase protein and complex carbohydrate intake, monitor weight and body composition regularly.",

  veryHighTdee: "Very High",
  veryHighTdeeRange: "> 3500 kcal/day",
  veryHighTdeeMeaning: "Very high daily energy expenditure, typically seen in very active or heavy physical labor individuals.",
  veryHighTdeeRisks: "Requires substantial calorie and nutrient support; nutritional deficiency may impact health and performance.",
  veryHighTdeeActions: "Ensure adequate protein, carbohydrate, and micronutrient intake, regular nutritional assessment.",

  // Result Intelligence
  resultIntelligenceBadge: "Result Intelligence",
  resultIntelligenceTitle: "What Does Your TDEE Mean?",
  resultIntelligenceDesc: "Your Total Daily Energy Expenditure (TDEE) is the total number of calories your body burns in a day, including your Basal Metabolic Rate (BMR) and calories burned through daily activities. This number is influenced by age, gender, height, weight, muscle mass, and activity level.",

  // Decision Layer
  decisionPath: "Decision Path",
  nextStepsTitle: "What's Next Based on Your TDEE?",
  screeningSignal: "Activity level screening",
  restingEnergy: "Resting energy (BMR)",
  dailyNeeds: "Daily needs (TDEE)",
  planIntake: "Plan intake",
  calorieIntake: "Calorie intake",
  step: "Step",

  // Knowledge
  knowledge: "Knowledge",
  tdeeKnowledgeTitle: "About Total Daily Energy Expenditure (TDEE)",
  definition: "Definition",
  definitionText: "TDEE is the total number of calories your body burns in a day, including your Basal Metabolic Rate (BMR), daily activity calories, and thermic effect of food (TEF).",
  limitations: "Limitations",
  limitationsText: "TDEE cannot account for individual metabolic variations, special physiological conditions, hormonal changes, or medical situations. Not applicable to pregnant women, nursing mothers, or those with special medical conditions.",
  semanticNeighbors: "Semantic neighbors",
  semanticNeighborsText: "BMR, TDEE, Calorie Deficit, Protein Requirement, Body Fat, and Activity Tracking expand the result context.",
  formulaText: "TDEE = BMR × Activity Factor\n\nActivity Factors:\nSedentary: 1.2\nLight Activity: 1.375\nModerate Activity: 1.55\nActive: 1.725\nVery Active: 1.9",

  // Trust
  trustBadge: "Trust Statement",
  trustTitle: "Data Sources and Disclaimer",
  trustSource: "Formula based on Mifflin-St Jeor (1990) research and Harris-Benedict activity factors, endorsed by the Academy of Nutrition and Dietetics (AND).",
  trustDisclaimer: "This tool is for educational reference only and cannot replace professional medical or nutritional advice. Consult qualified healthcare professionals for health concerns.",
  trustText: "References should include WHO, CDC, and NIH. TDEE is an estimation metric, not a diagnosis or medical treatment recommendation.",

  // FAQ
  faqBadge: "FAQ",
  faqTitle: "Frequently Asked Questions About TDEE",
  faq1Q: "What's the difference between TDEE and BMR?",
  faq1A: "BMR is metabolism at rest; TDEE includes activity. TDEE = BMR × Activity Factor.",
  faq2Q: "How do I choose the activity level?",
  faq2A: "Choose based on weekly exercise frequency and daily activity. Sedentary: 1.2, Light: 1.375, Moderate: 1.55, Active: 1.725, Very Active: 1.9.",
  faq3Q: "Can TDEE be used for weight loss?",
  faq3A: "Yes. Weight loss requires consuming fewer calories than TDEE (typically 300-500 kcal less), but not below BMR.",
  faq4Q: "Does exercise change TDEE?",
  faq4A: "Yes. Increasing exercise raises the activity factor, thus increasing TDEE.",
  faq5Q: "How often should I recalculate TDEE?",
  faq5A: "Recalculate every 3-6 months, especially when weight, muscle mass, or activity level changes.",

  // Related Tools
  relatedToolsBadge: "Related Tools",
  relatedToolsTitle: "Explore Further",
  relatedTool1: "BMR Calculator",
  relatedTool2: "Calorie Deficit Calculator",
  relatedTool3: "Protein Requirement Calculator",
  relatedTool4: "Body Fat Calculator",

  // Affiliate
  affiliateBadge: "Recommended Products",
  affiliateTitle: "Health Products to Complement TDEE Calculation",
  affiliateItem1: "Fitness Tracker",
  affiliateItem2: "Protein Supplement",
  affiliateItem3: "Nutrition App",
  affiliateItem4: "Fitness Plan",
  affiliateDisclaimer: "* Affiliate links. We may earn a commission.",

  // References
  referencesBadge: "References",
  referencesTitle: "Further Reading",
  reference1: "Original Mifflin-St Jeor Formula Research (1990)",
  reference2: "Academy of Nutrition and Dietetics (AND) Metabolic Assessment Guidelines",
  reference3: "Harris-Benedict Activity Factor Research",
  reference4: "Scientific Evidence on Activity Level and Energy Expenditure",

  // Common
  calories: "Calories",
  progress: "Progress",
  current: "Current",
  weightManagement: "Weight Management",
  faq: "FAQ",
  commonQuestions: "Common questions",
  trustRelatedReferences: "Trust · Related Tools · References",
  trust: "Trust",
  relatedTools: "Related Tools",
  references: "References",
  referencesText: "WHO classification context, CDC TDEE screening guidance, and NIH health risk context.",
}

export default en
