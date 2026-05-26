import type { Translations } from "./zh"

const en: Translations = {
  // Hero
  badge: "Health · Biometrics · Gold Tool",
  title: "BMR Calculator · Complete Metabolic Assessment",
  subtitle: "BMR Calculator guided experience",
  intro: "Calculate your Basal Metabolic Rate (BMR) accurately using the Mifflin-St Jeor formula. Understand how many calories your body burns at rest, get personalized metabolic insights, and discover the next steps for your health goals.",
  cta: "Calculate Now",

  // Quick Guide
  quickGuideBadge: "Quick Guide",
  quickGuideTitle: "3 Steps to Calculate Your BMR",
  step1: "Enter your basic info: gender, age, height, weight",
  step2: "System calculates your BMR automatically (kcal/day)",
  step3: "Review category, interpretation, advice, and related tools",

  // Examples
  examplesBadge: "Real Examples",
  examplesTitle: "BMR Varies Across Demographics",
  example1Title: "25-year-old Female",
  example1Desc: "Height 165cm, Weight 60kg → BMR = 1,400 kcal/day",
  example2Title: "35-year-old Male",
  example2Desc: "Height 180cm, Weight 80kg → BMR = 1,800 kcal/day",
  example3Title: "50-year-old Female",
  example3Desc: "Height 160cm, Weight 65kg → BMR = 1,300 kcal/day",

  // Calculator
  calculatorBadge: "Calculator",
  calculatorTitle: "Calculate Your BMR",
  gender: "Gender",
  male: "Male",
  female: "Female",
  age: "Age",
  height: "Height",
  weight: "Weight",
  calculate: "Calculate BMR",
  cm: "cm",
  kg: "kg",

  // Result
  resultBadge: "Result",
  yourBMR: "Your BMR",
  kcalPerDay: "kcal/day",
  category: "Category",

  // Categories
  lowMetabolism: "Low Metabolism",
  lowMetabolismRange: "< 1200 kcal (F) / < 1400 kcal (M)",
  lowMetabolismMeaning: "BMR below standard range, possibly related to low muscle mass, aging, or special physiological conditions.",
  lowMetabolismRisks: "Possible causes: insufficient muscle mass, prolonged dieting, hypothyroidism, or metabolic adaptation.",
  lowMetabolismActions: "Increase resistance training to build muscle mass, ensure adequate protein intake, avoid extreme dieting.",

  normalLowMetabolism: "Normal-Low",
  normalLowMetabolismRange: "1200-1500 kcal",
  normalLowMetabolismMeaning: "BMR in the normal-low range, typically seen in smaller-framed or lower-muscle individuals.",
  normalLowMetabolismRisks: "Usually no special risks, but balance diet and exercise carefully.",
  normalLowMetabolismActions: "Maintain balanced nutrition, exercise 3-4 times weekly, track weight and body composition regularly.",

  normalMetabolism: "Normal Range",
  normalMetabolismRange: "1500-2000 kcal",
  normalMetabolismMeaning: "BMR in healthy normal range, indicating good metabolic efficiency.",
  normalMetabolismRisks: "Metabolism is normal, no special risks.",
  normalMetabolismActions: "Maintain current habits, track every 3 months, combine with TDEE for weight management.",

  highMetabolism: "High Metabolism",
  highMetabolismRange: "> 2000 kcal",
  highMetabolismMeaning: "Higher BMR, usually associated with greater muscle mass or younger age.",
  highMetabolismRisks: "Good metabolism, focus on maintaining muscle mass and nutrition.",
  highMetabolismActions: "Ensure adequate protein and calorie intake, maintain regular exercise, monitor health indicators.",

  // Result Intelligence
  resultIntelligenceBadge: "Result Intelligence",
  resultIntelligenceTitle: "What Does Your BMR Mean?",
  resultIntelligenceDesc: "Your Basal Metabolic Rate (BMR) is the number of calories your body burns at complete rest each day. This number is influenced by age, gender, height, weight, and muscle mass.",

  // Decision Layer
  decisionLayerBadge: "Next Steps",
  decisionLayerTitle: "What's Next Based on Your BMR?",
  nextStep1: "Calculate TDEE (Total Daily Energy Expenditure) = BMR × Activity Factor",
  nextStep2: "Set calorie intake based on goals (weight loss, maintenance, or muscle gain)",
  nextStep3: "Recalculate every 3 months",

  // Human Advisory
  humanAdvisoryBadge: "Expert Advice",
  humanAdvisoryTitle: "Specific Recommendations by BMR Range",
  advisory1Title: "Low Metabolism (< 1200/1400 kcal)",
  advisory1Desc: "Likely low muscle mass; increase resistance training. Avoid extreme dieting; ensure adequate protein and micronutrients.",
  advisory2Title: "Normal Range (1500-2000 kcal)",
  advisory2Desc: "Maintain current habits, track every 3 months. Combine with TDEE for weight management.",
  advisory3Title: "High Metabolism (> 2000 kcal)",
  advisory3Desc: "Good metabolism; focus on maintaining muscle mass. Ensure adequate protein and calorie intake.",

  // Formula
  formulaBadge: "Formula",
  formulaTitle: "BMR Calculation Formula (Mifflin-St Jeor)",
  formulaMale: "Male: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age + 5",
  formulaFemale: "Female: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age - 161",
  formulaVariables: "Variables: weight (kg), height (cm), age (years)",
  formulaNote: "The Mifflin-St Jeor formula is the most accurate BMR calculation method currently available, widely used in clinical and research settings.",

  // Knowledge
  knowledgeBadge: "Knowledge",
  knowledgeTitle: "About Basal Metabolic Rate (BMR)",
  knowledgeDefinition: "Basal Metabolic Rate (BMR) is the number of calories your body burns at complete rest while fasting to maintain basic physiological functions like heart rate, breathing, and body temperature regulation.",
  knowledgeLimitations: "Limitations: BMR cannot account for body composition differences (same weight but different muscle mass = different BMR); illness, stress, and hormonal changes affect actual metabolism; not applicable to pregnant women, nursing mothers, or those with special medical conditions.",

  // Trust
  trustBadge: "Trust Statement",
  trustTitle: "Data Sources and Disclaimer",
  trustSource: "Formula based on Mifflin-St Jeor (1990) research, endorsed by the Academy of Nutrition and Dietetics (AND).",
  trustDisclaimer: "This tool is for educational reference only and cannot replace professional medical or nutritional advice. Consult qualified healthcare professionals for health concerns.",

  // FAQ
  faqBadge: "FAQ",
  faqTitle: "Frequently Asked Questions About BMR",
  faq1Q: "What's the difference between BMR and TDEE?",
  faq1A: "BMR is metabolism at rest; TDEE includes activity. TDEE = BMR × Activity Factor.",
  faq2Q: "Does BMR decrease with age?",
  faq2A: "Yes. BMR decreases about 2-8% per 10 years, mainly due to muscle loss with age.",
  faq3Q: "Does dieting lower BMR?",
  faq3A: "Extreme prolonged dieting can cause metabolic adaptation, reducing BMR by 10-25%. This is the body's protective mechanism.",
  faq4Q: "Can muscle training increase BMR?",
  faq4A: "Yes. Each 1 kg of added muscle increases BMR by about 6-10 kcal/day. Resistance training is an effective way to boost BMR.",
  faq5Q: "How often should I recalculate BMR?",
  faq5A: "Recalculate every 3 months, especially when weight, muscle mass, or age changes.",

  // Related Tools
  relatedToolsBadge: "Related Tools",
  relatedToolsTitle: "Explore Further",
  relatedTool1: "TDEE Calculator",
  relatedTool2: "Calorie Deficit Calculator",
  relatedTool3: "BMI Calculator",
  relatedTool4: "Protein Requirement Calculator",

  // Affiliate
  affiliateBadge: "Recommended Products",
  affiliateTitle: "Health Products to Complement BMR Calculation",
  affiliateItem1: "Smart Scale",
  affiliateItem2: "Body Fat Monitor",
  affiliateItem3: "Protein Supplement",
  affiliateItem4: "Fitness Plan",
  affiliateDisclaimer: "* Affiliate links. We may earn a commission.",

  // References
  referencesBadge: "References",
  referencesTitle: "Further Reading",
  reference1: "Original Mifflin-St Jeor Formula Research (1990)",
  reference2: "Academy of Nutrition and Dietetics (AND) Metabolic Assessment Guidelines",
  reference3: "Research on Muscle Mass and Metabolism Relationship",
  reference4: "Scientific Evidence on Metabolic Adaptation and Dieting",
}

export default en
