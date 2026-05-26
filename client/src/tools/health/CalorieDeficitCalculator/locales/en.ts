const en = {
  // Badge & Title
  badge: "Health · Nutrition Planning · Gold Tool",
  title: "Calorie Deficit Calculator · Precision Fat Loss & Muscle Gain",
  subtitle: "Calorie Deficit Calculator guided experience",
  intro: "Set fat loss or muscle gain targets based on TDEE, automatically calculate daily calories and macronutrient distribution, and explore BMR, TDEE, and body fat tools.",
  trustNoteLabel: "Trust note:",
  trustNote: "Calorie deficit calculation is a reference tool, not medical diagnosis. Actual weight change depends on metabolism, hormones, exercise intensity, and more. Professional guidance recommended.",

  // Quick Action
  quickActionCard: "Quick Example Card",
  tryCommonExample: "Try common example",
  calorieDeficitPreview: "Calorie deficit preview",
  example: "Example",
  commonAdult: "Common adult",
  tdee: "Daily Total Energy Expenditure",
  goal: "Goal",
  oneClickFillExample: "One-click fill example",
  previewDeficitPath: "Preview fat loss decision path",
  examplesCalculator: "Examples → Calculator",
  enterOrFillValues: "Enter or fill values",
  examplesHelper: "Examples stay close to the calculator so users can start fast, then edit inputs without losing context.",

  // Unit System
  metric: "Metric",
  imperial: "Imperial",

  // Calculator
  calculator: "Calculator",
  tdeeValue: "Daily Total Energy Expenditure (kcal)",
  currentWeight: "Current Weight (kg)",
  goal: "Goal Setting",
  calculateButton: "Calculate Calorie Target",
  calculating: "Calculating...",
  enterValidValues: "Please enter valid values",

  // Goals
  fatLossSlow: "Slow Fat Loss (-10%, best for muscle preservation)",
  fatLossMedium: "Standard Fat Loss (-20%, recommended)",
  fatLossFast: "Aggressive Fat Loss (-25%, requires monitoring)",
  maintain: "Maintain Weight (0%)",
  muscleGainSlow: "Lean Muscle Gain (+10%, minimal fat)",
  muscleGainMedium: "Aggressive Muscle Gain (+15%, fast growth)",

  // Result Card
  resultCard: "Result Card",
  yourTdee: "Your TDEE",
  dailyTargetCalories: "Daily Target Calories",
  calorieDeficit: "Calorie Deficit",
  caloriesSurplus: "Calorie Surplus",
  caloriesDifference: "Calorie Difference",
  perDay: "/day",
  estimatedWeeklyChange: "Estimated Weekly Weight Change",
  estimatedMonthlyChange: "Estimated Monthly Weight Change",
  kg: "kg",

  // Macro Distribution
  macroDistribution: "Daily Macronutrient Distribution",
  protein: "Protein",
  carbs: "Carbohydrates",
  fat: "Fat",
  grams: "g",
  calories: "kcal",
  macroPercentage: "Percentage",

  // Meal Distribution
  mealDistribution: "Meal Distribution",
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
  perMeal: "/meal",

  // Knowledge Section
  knowledge: "Knowledge",
  calorieDeficitMeaning: "Meaning of Calorie Deficit",
  definition: "Definition",
  definitionText: "A calorie deficit occurs when calorie intake is less than calorie expenditure, which is necessary for fat loss.",
  limitations: "Limitations",
  limitationsText: "Calorie deficit does not guarantee all weight loss is fat. Muscle loss, hormones, and sleep also affect outcomes.",
  semanticNeighbors: "Related Metrics",
  semanticNeighborsText: "TDEE, BMR, metabolic rate, exercise intensity, diet quality, and recovery all influence final results.",
  metricFormula: "Target Calories = TDEE × (1 + Deficit Percentage)",
  imperialFormula: "Weekly Weight Change ≈ (Deficit ÷ 7700 kcal/kg) × 7 days",

  // FAQ
  faq: "FAQ",
  commonQuestions: "Common Questions",

  // FAQ Items
  q1: "Is calorie deficit the only way to lose fat?",
  a1: "Yes. Regardless of diet type, fat loss requires a calorie deficit. However, diet quality, protein intake, and exercise affect muscle preservation during fat loss.",

  q2: "Is a bigger deficit always better?",
  a2: "No. Large deficits (>30%) often cause muscle loss, metabolic adaptation, and hunger. Usually -10% to -20% is more balanced.",

  q3: "Why isn't my weight changing as predicted?",
  a3: "Weight is affected by many factors: water retention, hormones, digestive content, muscle gain, sleep, and stress. Use 4-week average weight instead of daily data.",

  q4: "Do I need a calorie surplus to gain muscle?",
  a4: "Usually yes. Small surplus (+10% to +15%) combined with resistance training promotes muscle growth, but large surplus increases fat gain.",

  q5: "How often should I check progress?",
  a5: "Weigh yourself 3-5 times per week and calculate weekly average. Evaluate progress every 4 weeks and adjust calorie target based on results.",

  q6: "What should I do after calculating?",
  a6: "Verify BMR and TDEE accuracy first, then adjust diet based on goals. Combine with body fat percentage and waist circumference for complete assessment.",

  // Decision Path
  decisionPath: "Decision Path",
  highDeficitEnergyPath: "Fat Loss Decision Path",
  step: "Step",
  decisionNode1: "Calculate TDEE",
  decisionNode2: "Set Deficit",
  decisionNode3: "Distribute Macros",
  decisionNode4: "Track Progress",
  decisionDesc1: "First understand your daily total energy expenditure",
  decisionDesc2: "Set appropriate calorie deficit based on goals",
  decisionDesc3: "Allocate protein, carbs, and fat by goal",
  decisionDesc4: "Regularly check weight and progress, adjust strategy",

  // Trust & References
  trustRelatedReferences: "Trust · Related Tools · References",
  trust: "Trust",
  trustText: "This calculator is based on universal principles from nutrition science and exercise physiology. Individual results vary by metabolism, training, and diet quality.",
  relatedTools: "Related Tools",
  references: "References",
  referencesText: "Calculations based on research from NIH, International Society of Sports Nutrition, and nutrition journals.",

  // Premium
  premiumTitle: "Unlock Complete Nutrition Tracking",
  premiumFeature1: "📊 Progress Tracking",
  premiumFeature2: "📄 Nutrition Report Export",
  premiumFeature3: "🤖 AI Personalized Recommendations",
  upgradePremium: "Upgrade Premium — $3.99/mo",

  // Next Tool Recommendations
  nextTool: "BMR Calculator",
  recommendedTools: "BMR Calculator · TDEE Calculator · Body Fat Calculator · Water Intake Calculator",
} as const;

export default en;
export type Translations = typeof en;
