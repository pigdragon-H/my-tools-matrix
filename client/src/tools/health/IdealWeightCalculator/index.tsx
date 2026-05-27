/**
 * Ideal Weight Calculator
 * 
 * 理想體重計算器 - 使用 Health 通用模版
 * 
 * 基於身高和性別計算理想體重範圍
 * 使用多種公式（Devine、Miller、Robinson、Hamwi）
 */

import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import HealthGenericTemplate from "@/components/templates/HealthGenericTemplate";
import type { CalculationResult, InputField, NextTool, LocalText } from "@/components/templates/HealthGenericTemplate";

type Lang = "zh" | "en";

// Localization
const locales = {
  zh: {
    title: "理想體重計算器",
    description: "根據身高和性別計算理想體重範圍，幫助您制定健康的體重目標。",
    disclaimer: "本計算器基於通用公式，結果僅供參考。理想體重因人而異，受遺傳、肌肉量、骨密度等因素影響。請諮詢醫療專業人員以獲得個性化建議。",
    
    heightLabel: "身高",
    heightPlaceholder: "輸入身高",
    heightHelp: "以厘米為單位",
    
    genderLabel: "性別",
    genderPlaceholder: "選擇性別",
    male: "男性",
    female: "女性",
    
    resultCategory: "理想體重範圍",
    resultUnit: "kg",
    
    formulas: {
      devine: "Devine 公式",
      miller: "Miller 公式",
      robinson: "Robinson 公式",
      hamwi: "Hamwi 公式",
    },
    
    details: "根據多種公式計算的理想體重範圍",
    warning: "理想體重因人而異，受遺傳、肌肉量、骨密度等多種因素影響。本結果僅供參考，不能替代專業醫療建議。",
    
    nextSteps: [
      "使用 BMI 計算器檢查您的當前狀況",
      "計算 BMR 以了解您的基礎代謝率",
      "使用 TDEE 計算器規劃每日熱量",
      "根據需要制定減重或增重計畫",
    ],
    
    relatedTools: "相關工具",
  },
  en: {
    title: "Ideal Weight Calculator",
    description: "Calculate your ideal weight range based on height and gender to help set healthy weight goals.",
    disclaimer: "This calculator uses general formulas and results are for reference only. Ideal weight varies by individual and is affected by genetics, muscle mass, bone density, and other factors. Consult a healthcare professional for personalized advice.",
    
    heightLabel: "Height",
    heightPlaceholder: "Enter height",
    heightHelp: "in centimeters",
    
    genderLabel: "Gender",
    genderPlaceholder: "Select gender",
    male: "Male",
    female: "Female",
    
    resultCategory: "Ideal Weight Range",
    resultUnit: "kg",
    
    formulas: {
      devine: "Devine Formula",
      miller: "Miller Formula",
      robinson: "Robinson Formula",
      hamwi: "Hamwi Formula",
    },
    
    details: "Ideal weight range calculated using multiple formulas",
    warning: "Ideal weight varies by individual and is affected by genetics, muscle mass, bone density, and other factors. This result is for reference only and cannot replace professional medical advice.",
    
    nextSteps: [
      "Use BMI Calculator to check your current status",
      "Calculate BMR to understand your basal metabolic rate",
      "Use TDEE Calculator to plan daily calories",
      "Create a weight loss or gain plan as needed",
    ],
    
    relatedTools: "Related Tools",
  },
};

const l = (key: string, lang: Lang) => {
  const locale = locales[lang];
  return key.split(".").reduce((obj: any, k) => obj?.[k], locale) || key;
};

// Ideal Weight Calculation Formulas
function calculateIdealWeight(height: number, gender: string) {
  const isMale = gender === "male";
  
  // All formulas use height in inches
  const heightInches = height / 2.54;
  
  // Devine Formula
  const devine = isMale 
    ? 50 + 2.3 * (heightInches - 60)
    : 45.5 + 2.3 * (heightInches - 60);
  
  // Miller Formula
  const miller = isMale
    ? 56.2 + 1.41 * (heightInches - 60)
    : 53.1 + 1.36 * (heightInches - 60);
  
  // Robinson Formula
  const robinson = isMale
    ? 52 + 1.9 * (heightInches - 60)
    : 49 + 1.7 * (heightInches - 60);
  
  // Hamwi Formula
  const hamwi = isMale
    ? 48 + 2.7 * (heightInches - 60)
    : 45.5 + 2.2 * (heightInches - 60);
  
  return {
    devine: Math.round(devine * 10) / 10,
    miller: Math.round(miller * 10) / 10,
    robinson: Math.round(robinson * 10) / 10,
    hamwi: Math.round(hamwi * 10) / 10,
  };
}

export default function IdealWeightCalculator() {
  const { lang } = useLanguage();
  
  const inputs: InputField[] = [
    {
      id: "height",
      label: { zh: l("heightLabel", "zh"), en: l("heightLabel", "en") },
      placeholder: { zh: l("heightPlaceholder", "zh"), en: l("heightPlaceholder", "en") },
      type: "number",
      min: 100,
      max: 250,
      step: 0.1,
      unit: { zh: "厘米", en: "cm" },
      help: { zh: l("heightHelp", "zh"), en: l("heightHelp", "en") },
    },
    {
      id: "gender",
      label: { zh: l("genderLabel", "zh"), en: l("genderLabel", "en") },
      placeholder: { zh: l("genderPlaceholder", "zh"), en: l("genderPlaceholder", "en") },
      type: "select",
      options: [
        { value: "male", label: { zh: l("male", "zh"), en: l("male", "en") } },
        { value: "female", label: { zh: l("female", "zh"), en: l("female", "en") } },
      ],
    },
  ];
  
  const calculate = (values: Record<string, number>) => {
    const height = values.height;
    const gender = Object.keys(values).find(k => k === "gender") ? "male" : "female";
    
    if (height < 100 || height > 250) {
      throw new Error("Invalid height");
    }
    
    const weights = calculateIdealWeight(height, gender);
    const min = Math.min(weights.devine, weights.miller, weights.robinson, weights.hamwi);
    const max = Math.max(weights.devine, weights.miller, weights.robinson, weights.hamwi);
    const avg = Math.round((min + max) / 2 * 10) / 10;
    
    return {
      value: avg,
      unit: "kg",
      category: `${min.toFixed(1)} - ${max.toFixed(1)} kg`,
      details: {
        zh: `根據多種公式計算的理想體重範圍：\n• Devine: ${weights.devine} kg\n• Miller: ${weights.miller} kg\n• Robinson: ${weights.robinson} kg\n• Hamwi: ${weights.hamwi} kg`,
        en: `Ideal weight range calculated using multiple formulas:\n• Devine: ${weights.devine} kg\n• Miller: ${weights.miller} kg\n• Robinson: ${weights.robinson} kg\n• Hamwi: ${weights.hamwi} kg`,
      },
      warning: { zh: l("warning", "zh"), en: l("warning", "en") },
      nextSteps: [
        { zh: l("nextSteps.0", "zh"), en: l("nextSteps.0", "en") },
        { zh: l("nextSteps.1", "zh"), en: l("nextSteps.1", "en") },
        { zh: l("nextSteps.2", "zh"), en: l("nextSteps.2", "en") },
        { zh: l("nextSteps.3", "zh"), en: l("nextSteps.3", "en") },
      ],
    };
  };
  
  const resultDisplay = (result: CalculationResult, lang: Lang) => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
        <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
          {lang === "zh" ? "理想體重範圍" : "Ideal Weight Range"}
        </p>
        <p className="text-3xl font-bold text-green-900 dark:text-green-100">
          {result.category}
        </p>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
          {lang === "zh" ? result.details?.zh : result.details?.en}
        </p>
      </div>
    </div>
  );
  
  const nextTools: NextTool[] = [
    { name: { zh: "BMI 計算器", en: "BMI Calculator" }, href: "/tools/health/bmi-calculator" },
    { name: { zh: "BMR 計算器", en: "BMR Calculator" }, href: "/tools/health/bmr-calculator" },
    { name: { zh: "TDEE 計算器", en: "TDEE Calculator" }, href: "/tools/health/tdee-calculator" },
    { name: { zh: "體脂率計算器", en: "Body Fat Calculator" }, href: "/tools/health/body-fat-calculator" },
  ];
  
  return (
    <HealthGenericTemplate
      title={{ zh: l("title", "zh"), en: l("title", "en") }}
      description={{ zh: l("description", "zh"), en: l("description", "en") }}
      inputs={inputs}
      calculate={calculate}
      resultDisplay={resultDisplay}
      nextTools={nextTools}
      disclaimer={{ zh: l("disclaimer", "zh"), en: l("disclaimer", "en") }}
    />
  );
}
