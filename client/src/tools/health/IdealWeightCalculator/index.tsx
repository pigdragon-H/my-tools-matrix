import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";

type UnitSystem = "metric" | "imperial";
type Lang = "zh" | "en";
type WeightCategory = "underweight" | "normal" | "overweight";
type LocalText = { zh: string; en: string };

type CategoryInfo = {
  key: WeightCategory;
  label: LocalText;
  meaning: LocalText;
  risks: LocalText;
  actions: LocalText;
  nextTool: LocalText;
  tools: LocalText[];
};

const l = (value: LocalText, lang: Lang) => value[lang];

// L6: Human Advisory - 理想體重區域分類
const categoryInfo: CategoryInfo[] = [
  {
    key: "underweight",
    label: { zh: "低於理想體重", en: "Below Ideal Weight" },
    meaning: { zh: "當前體重低於計算的理想體重範圍。", en: "Current weight is below the calculated ideal weight range." },
    risks: { zh: "可能與營養不足、代謝問題或健康狀況有關。", en: "May be associated with undernutrition, metabolic issues, or health conditions." },
    actions: { zh: "建議檢視飲食營養、能量攝入和整體健康狀況。若持續偏低，請尋求專業指導。", en: "Review nutrition, energy intake, and overall health. Seek professional guidance if persistent." },
    nextTool: { zh: "BMR 計算機", en: "BMR Calculator" },
    tools: [{ zh: "BMR 計算機", en: "BMR Calculator" }, { zh: "TDEE 計算機", en: "TDEE Calculator" }, { zh: "BMI 計算機", en: "BMI Calculator" }],
  },
  {
    key: "normal",
    label: { zh: "理想體重範圍", en: "Ideal Weight Range" },
    meaning: { zh: "當前體重在計算的理想體重範圍內。", en: "Current weight is within the calculated ideal weight range." },
    risks: { zh: "通常表示體重與身高的比例較為健康，但需結合其他健康指標評估。", en: "Generally indicates a healthy weight-to-height ratio, but should be combined with other health metrics." },
    actions: { zh: "維持均衡飲食、規律運動、充足睡眠。定期使用 BMI、體脂率等工具進行全面評估。", en: "Maintain balanced nutrition, regular exercise, adequate sleep. Use BMI and body composition tools for comprehensive assessment." },
    nextTool: { zh: "BMI 計算機", en: "BMI Calculator" },
    tools: [{ zh: "BMI 計算機", en: "BMI Calculator" }, { zh: "TDEE 計算機", en: "TDEE Calculator" }, { zh: "BMR 計算機", en: "BMR Calculator" }],
  },
  {
    key: "overweight",
    label: { zh: "高於理想體重", en: "Above Ideal Weight" },
    meaning: { zh: "當前體重高於計算的理想體重範圍。", en: "Current weight is above the calculated ideal weight range." },
    risks: { zh: "可能與較高的代謝風險相關，但需結合 BMI、體脂率等指標進行全面評估。", en: "May be associated with higher metabolic risk, but should be assessed with BMI and body composition metrics." },
    actions: { zh: "建議先計算 BMI、TDEE、體脂率，了解完整的健康狀況後再制定體重管理計劃。", en: "Calculate BMI, TDEE, and body fat percentage to understand your complete health profile before planning weight management." },
    nextTool: { zh: "BMI 計算機", en: "BMI Calculator" },
    tools: [{ zh: "BMI 計算機", en: "BMI Calculator" }, { zh: "BMR 計算機", en: "BMR Calculator" }, { zh: "TDEE 計算機", en: "TDEE Calculator" }],
  },
];

export default function IdealWeightCalculator() {
  const { lang } = useLanguage();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [height, setHeight] = useState<number>(170);
  const [currentWeight, setCurrentWeight] = useState<number>(70);

  // L4: Calculator - 精確計算
  const calculations = useMemo(() => {
    const heightM = unitSystem === "metric" ? height / 100 : height * 0.0254;
    
    // BMI 反推法：理想體重 = 身高(m)² × 22
    const idealWeightCenter = heightM * heightM * 22;
    const idealWeightMin = idealWeightCenter * 0.9;
    const idealWeightMax = idealWeightCenter * 1.1;

    // 與當前體重的對比
    const weightDifference = currentWeight - idealWeightCenter;
    let category: WeightCategory;
    
    if (currentWeight < idealWeightMin) {
      category = "underweight";
    } else if (currentWeight > idealWeightMax) {
      category = "overweight";
    } else {
      category = "normal";
    }

    return {
      idealWeightCenter: Math.round(idealWeightCenter * 10) / 10,
      idealWeightMin: Math.round(idealWeightMin * 10) / 10,
      idealWeightMax: Math.round(idealWeightMax * 10) / 10,
      weightDifference: Math.round(weightDifference * 10) / 10,
      category,
    };
  }, [height, currentWeight, unitSystem]);

  const categoryData = categoryInfo.find((c) => c.key === calculations.category);
  const unit = unitSystem === "metric" ? "kg" : "lbs";
  const heightUnit = unitSystem === "metric" ? "cm" : "in";

  // L3: Examples - 三個示例
  const examples = [
    {
      title: { zh: "示例 1：身高 160 cm", en: "Example 1: Height 160 cm" },
      description: { zh: "女性常見身高", en: "Common female height" },
      height: 160,
      idealWeight: Math.round((160 / 100) * (160 / 100) * 22 * 10) / 10,
    },
    {
      title: { zh: "示例 2：身高 175 cm", en: "Example 2: Height 175 cm" },
      description: { zh: "男性常見身高", en: "Common male height" },
      height: 175,
      idealWeight: Math.round((175 / 100) * (175 / 100) * 22 * 10) / 10,
    },
    {
      title: { zh: "示例 3：身高 180 cm", en: "Example 3: Height 180 cm" },
      description: { zh: "較高身材", en: "Taller stature" },
      height: 180,
      idealWeight: Math.round((180 / 100) * (180 / 100) * 22 * 10) / 10,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* L1: Hero */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-400 to-rose-400 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {lang === "zh" ? "理想體重計算器" : "Ideal Weight Calculator"}
              </h1>
              <p className="text-lg opacity-90">
                {lang === "zh"
                  ? "根據身高計算理想體重範圍，了解您的健康體重目標。"
                  : "Calculate your ideal weight range based on height and understand your healthy weight goals."}
              </p>
            </div>
            <button className="px-4 py-2 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100">
              {lang === "zh" ? "繁中" : "EN"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-8">
          <span>{lang === "zh" ? "首頁" : "Home"}</span>
          <span className="mx-2">/</span>
          <span>{lang === "zh" ? "健康生活" : "Health"}</span>
          <span className="mx-2">/</span>
          <span className="text-purple-600 font-semibold">
            {lang === "zh" ? "理想體重計算器" : "Ideal Weight Calculator"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* L2: Quick Guide */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mb-8">
              <h3 className="font-bold text-blue-900 mb-3">
                {lang === "zh" ? "快速指南" : "Quick Guide"}
              </h3>
              <ol className="text-sm text-blue-800 space-y-2">
                <li>1. {lang === "zh" ? "輸入您的身高（公分或英寸）" : "Enter your height (cm or inches)"}</li>
                <li>2. {lang === "zh" ? "輸入您的當前體重（可選）" : "Enter your current weight (optional)"}</li>
                <li>3. {lang === "zh" ? "查看理想體重範圍" : "View your ideal weight range"}</li>
                <li>4. {lang === "zh" ? "根據結果調整健康計劃" : "Adjust your health plan based on results"}</li>
                <li>5. {lang === "zh" ? "使用相關工具進行深入評估" : "Use related tools for deeper assessment"}</li>
              </ol>
            </div>

            {/* L4: Calculator */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {lang === "zh" ? "計算您的理想體重" : "Calculate Your Ideal Weight"}
              </h2>

              {/* Unit System Toggle */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setUnitSystem("metric")}
                  className={`px-4 py-2 rounded font-semibold ${
                    unitSystem === "metric"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {lang === "zh" ? "公制" : "Metric"}
                </button>
                <button
                  onClick={() => setUnitSystem("imperial")}
                  className={`px-4 py-2 rounded font-semibold ${
                    unitSystem === "imperial"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {lang === "zh" ? "英制" : "Imperial"}
                </button>
              </div>

              {/* Input Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {lang === "zh" ? "身高" : "Height"} ({heightUnit})
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {lang === "zh" ? "當前體重（可選）" : "Current Weight (Optional)"} ({unit})
                  </label>
                  <input
                    type="number"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* L5: Result Intelligence */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {lang === "zh" ? "您的理想體重結果" : "Your Ideal Weight Results"}
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    {lang === "zh" ? "最低" : "Minimum"}
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {calculations.idealWeightMin}
                  </p>
                  <p className="text-xs text-gray-500">{unit}</p>
                </div>

                <div className="bg-white rounded-lg p-4 text-center border-2 border-purple-500">
                  <p className="text-sm text-gray-600 mb-2">
                    {lang === "zh" ? "目標" : "Target"}
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {calculations.idealWeightCenter}
                  </p>
                  <p className="text-xs text-gray-500">{unit}</p>
                </div>

                <div className="bg-white rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    {lang === "zh" ? "最高" : "Maximum"}
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {calculations.idealWeightMax}
                  </p>
                  <p className="text-xs text-gray-500">{unit}</p>
                </div>
              </div>

              {/* Current Weight Comparison */}
              {currentWeight && (
                <div className="bg-white rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-2">
                    {lang === "zh" ? "與理想體重的差異" : "Difference from Ideal Weight"}
                  </p>
                  <p className="text-2xl font-bold">
                    <span className={calculations.weightDifference > 0 ? "text-red-600" : "text-green-600"}>
                      {calculations.weightDifference > 0 ? "+" : ""}
                      {calculations.weightDifference} {unit}
                    </span>
                  </p>
                </div>
              )}

              {/* L6: Human Advisory */}
              {categoryData && (
                <div className={`rounded-lg p-6 ${
                  calculations.category === "normal"
                    ? "bg-green-50 border-l-4 border-green-500"
                    : calculations.category === "underweight"
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "bg-orange-50 border-l-4 border-orange-500"
                }`}>
                  <h3 className="font-bold text-lg mb-3">
                    {l(categoryData.label, lang)}
                  </h3>
                  <p className="text-sm mb-3">{l(categoryData.meaning, lang)}</p>
                  <p className="text-sm font-semibold mb-2">
                    {lang === "zh" ? "風險提示：" : "Risk Notice:"}
                  </p>
                  <p className="text-sm mb-3">{l(categoryData.risks, lang)}</p>
                  <p className="text-sm font-semibold mb-2">
                    {lang === "zh" ? "建議行動：" : "Recommended Actions:"}
                  </p>
                  <p className="text-sm">{l(categoryData.actions, lang)}</p>
                </div>
              )}
            </div>

            {/* L3: Examples */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {lang === "zh" ? "計算示例" : "Calculation Examples"}
              </h2>

              <div className="space-y-4">
                {examples.map((example, idx) => (
                  <div key={idx} className="border-l-4 border-purple-300 pl-4 py-2">
                    <h4 className="font-bold">{l(example.title, lang)}</h4>
                    <p className="text-sm text-gray-600 mb-2">{l(example.description, lang)}</p>
                    <p className="text-sm">
                      {lang === "zh" ? "理想體重：" : "Ideal Weight: "}
                      <span className="font-bold text-purple-600">{example.idealWeight} kg</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* L8: Knowledge */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {lang === "zh" ? "知識庫" : "Knowledge"}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    {lang === "zh" ? "什麼是理想體重？" : "What is Ideal Weight?"}
                  </h3>
                  <p className="text-gray-700">
                    {lang === "zh"
                      ? "理想體重是指根據身高計算出的健康體重範圍。本計算器採用 BMI 反推法，以 BMI 22 為中心值計算理想體重，並提供 ±10% 的健康範圍。"
                      : "Ideal weight is the healthy weight range calculated based on height. This calculator uses the BMI reverse calculation method with BMI 22 as the center value, providing a healthy range of ±10%."}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">
                    {lang === "zh" ? "計算公式" : "Calculation Formula"}
                  </h3>
                  <p className="bg-gray-100 p-4 rounded font-mono text-sm">
                    {lang === "zh"
                      ? "理想體重 = 身高(m) × 身高(m) × 22\n理想體重範圍 = 理想體重 ± 10%"
                      : "Ideal Weight = Height(m) × Height(m) × 22\nIdeal Weight Range = Ideal Weight ± 10%"}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">
                    {lang === "zh" ? "如何解釋結果" : "How to Interpret Results"}
                  </h3>
                  <p className="text-gray-700">
                    {lang === "zh"
                      ? "結果顯示您的理想體重範圍。如果您的當前體重在此範圍內，說明您的體重與身高比例較為健康。但請注意，理想體重只是一個參考指標，應結合 BMI、體脂率、肌肉量等多個指標進行全面評估。"
                      : "The result shows your ideal weight range. If your current weight is within this range, your weight-to-height ratio is relatively healthy. However, note that ideal weight is just a reference indicator and should be combined with BMI, body fat percentage, muscle mass, and other metrics for comprehensive assessment."}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">
                    {lang === "zh" ? "限制與注意事項" : "Limitations and Considerations"}
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>
                      {lang === "zh"
                        ? "理想體重無法區分肌肉和脂肪，運動員可能體重較重但體脂率較低。"
                        : "Ideal weight cannot distinguish between muscle and fat; athletes may weigh more but have lower body fat percentage."}
                    </li>
                    <li>
                      {lang === "zh"
                        ? "此計算器不能替代專業醫療建議。如有健康疑慮，請諮詢醫療專業人員。"
                        : "This calculator cannot replace professional medical advice. Consult healthcare professionals for health concerns."}
                    </li>
                    <li>
                      {lang === "zh"
                        ? "理想體重因人而異，受遺傳、代謝、生活方式等多種因素影響。"
                        : "Ideal weight varies by individual and is influenced by genetics, metabolism, lifestyle, and other factors."}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* L9: FAQ */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {lang === "zh" ? "常見問題" : "Frequently Asked Questions"}
              </h2>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold mb-2">
                    {lang === "zh"
                      ? "Q1：理想體重計算器與 BMI 計算器有什麼區別？"
                      : "Q1: What is the difference between Ideal Weight Calculator and BMI Calculator?"}
                  </h4>
                  <p className="text-gray-700">
                    {lang === "zh"
                      ? "BMI 計算器根據當前體重計算 BMI 值，並提供分類（偏輕、正常、過重、肥胖）。理想體重計算器則根據身高計算應該達到的健康體重範圍。兩者互補，可結合使用。"
                      : "BMI Calculator calculates BMI based on current weight and provides categories. Ideal Weight Calculator calculates the healthy weight range you should aim for based on height. They complement each other and should be used together."}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold mb-2">
                    {lang === "zh"
                      ? "Q2：為什麼使用 BMI 22 作為理想體重的中心值？"
                      : "Q2: Why use BMI 22 as the center value for ideal weight?"}
                  </h4>
                  <p className="text-gray-700">
                    {lang === "zh"
                      ? "BMI 22 是亞洲地區公認的健康體重標準，代表在健康 BMI 範圍（18.5-24.9）的中心。這個值被多個衛生機構認可，適合全球用戶。"
                      : "BMI 22 is the recognized healthy weight standard in Asian regions and represents the center of the healthy BMI range (18.5-24.9). This value is recognized by multiple health organizations and is suitable for global users."}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold mb-2">
                    {lang === "zh"
                      ? "Q3：如果我的體重超出理想範圍怎麼辦？"
                      : "Q3: What should I do if my weight is outside the ideal range?"}
                  </h4>
                  <p className="text-gray-700">
                    {lang === "zh"
                      ? "首先使用 BMI 計算器了解您的 BMI 分類，然後計算 BMR 和 TDEE，制定合理的飲食和運動計劃。如果體重差異較大，建議尋求專業營養師或醫生的指導。"
                      : "First use the BMI Calculator to understand your BMI category, then calculate BMR and TDEE to develop a reasonable diet and exercise plan. If the weight difference is significant, seek guidance from a professional nutritionist or doctor."}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold mb-2">
                    {lang === "zh"
                      ? "Q4：理想體重計算器對所有人都適用嗎？"
                      : "Q4: Is the Ideal Weight Calculator applicable to everyone?"}
                  </h4>
                  <p className="text-gray-700">
                    {lang === "zh"
                      ? "本計算器適用於成年人。對於兒童、青少年、運動員、孕婦或有特殊健康狀況的人群，理想體重可能有所不同。建議這些人群諮詢專業醫療人員。"
                      : "This calculator is suitable for adults. For children, teenagers, athletes, pregnant women, or people with special health conditions, ideal weight may differ. These groups should consult healthcare professionals."}
                  </p>
                </div>
              </div>
            </div>

            {/* L7: Journey Layer */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {lang === "zh" ? "健康決策路徑" : "Health Decision Journey"}
              </h2>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                    1
                  </div>
                  <p className="font-semibold">{lang === "zh" ? "理想體重" : "Ideal Weight"}</p>
                </div>

                <div className="hidden md:block text-2xl text-purple-400">→</div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                    2
                  </div>
                  <p className="font-semibold">{lang === "zh" ? "BMI 評估" : "BMI Assessment"}</p>
                </div>

                <div className="hidden md:block text-2xl text-purple-400">→</div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-400 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                    3
                  </div>
                  <p className="font-semibold">{lang === "zh" ? "BMR 計算" : "BMR Calculation"}</p>
                </div>

                <div className="hidden md:block text-2xl text-purple-400">→</div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-300 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                    4
                  </div>
                  <p className="font-semibold">{lang === "zh" ? "TDEE 規劃" : "TDEE Planning"}</p>
                </div>
              </div>

              <p className="text-center text-gray-600 mt-6">
                {lang === "zh"
                  ? "了解理想體重後，使用 BMI 計算器評估當前狀況，計算 BMR 了解基礎代謝，最後規劃 TDEE 制定飲食計劃。"
                  : "After understanding your ideal weight, use BMI Calculator to assess your current status, calculate BMR to understand basal metabolism, and finally plan TDEE for your diet."}
              </p>
            </div>

            {/* L10: Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {lang === "zh" ? "相關工具" : "Related Tools"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="/tools/health/bmi-calculator" className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">
                  <h4 className="font-bold mb-2">{lang === "zh" ? "BMI 計算機" : "BMI Calculator"}</h4>
                  <p className="text-sm text-gray-600">
                    {lang === "zh" ? "評估當前體重狀況" : "Assess current weight status"}
                  </p>
                </a>

                <a href="/tools/health/bmr-calculator" className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">
                  <h4 className="font-bold mb-2">{lang === "zh" ? "BMR 計算機" : "BMR Calculator"}</h4>
                  <p className="text-sm text-gray-600">
                    {lang === "zh" ? "計算基礎代謝率" : "Calculate basal metabolic rate"}
                  </p>
                </a>

                <a href="/tools/health/tdee-calculator" className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">
                  <h4 className="font-bold mb-2">{lang === "zh" ? "TDEE 計算機" : "TDEE Calculator"}</h4>
                  <p className="text-sm text-gray-600">
                    {lang === "zh" ? "規劃每日熱量需求" : "Plan daily calorie needs"}
                  </p>
                </a>
              </div>
            </div>

            {/* L11: Related Articles */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {lang === "zh" ? "相關文章" : "Related Articles"}
              </h2>

              <div className="space-y-4">
                <a href="#" className="block p-4 border-l-4 border-purple-300 hover:border-purple-600 hover:bg-purple-50 transition">
                  <h4 className="font-bold mb-1">
                    {lang === "zh"
                      ? "如何科學地達到理想體重"
                      : "How to Scientifically Achieve Your Ideal Weight"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {lang === "zh"
                      ? "了解健康減重的科學方法和營養原則。"
                      : "Learn the science of healthy weight loss and nutrition principles."}
                  </p>
                </a>

                <a href="#" className="block p-4 border-l-4 border-purple-300 hover:border-purple-600 hover:bg-purple-50 transition">
                  <h4 className="font-bold mb-1">
                    {lang === "zh"
                      ? "體重管理的完整指南"
                      : "Complete Guide to Weight Management"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {lang === "zh"
                      ? "從飲食、運動到心理健康的全方位指導。"
                      : "Comprehensive guidance from diet, exercise to mental health."}
                  </p>
                </a>

                <a href="#" className="block p-4 border-l-4 border-purple-300 hover:border-purple-600 hover:bg-purple-50 transition">
                  <h4 className="font-bold mb-1">
                    {lang === "zh"
                      ? "BMI、理想體重與體脂率的區別"
                      : "Differences Between BMI, Ideal Weight, and Body Fat Percentage"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {lang === "zh"
                      ? "深入理解不同的健康指標及其應用。"
                      : "Deep understanding of different health metrics and their applications."}
                  </p>
                </a>
              </div>
            </div>

            {/* L12: References */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {lang === "zh" ? "參考資料" : "References"}
              </h2>

              <ul className="space-y-3 text-sm">
                <li>
                  <a href="https://www.who.int/tools/bmi" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    WHO - Body Mass Index (BMI)
                  </a>
                </li>
                <li>
                  <a href="https://www.cdc.gov/bmi/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    CDC - About Adult BMI
                  </a>
                </li>
                <li>
                  <a href="https://www.mdcalc.com/calc/68/ideal-body-weight-adjusted-body-weight" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    MDCalc - Ideal Body Weight Calculator
                  </a>
                </li>
                <li>
                  <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10621523/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    NIH - Variability in ideal body weight formulae
                  </a>
                </li>
              </ul>
            </div>

            {/* L13: Trust */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mb-8">
              <h3 className="font-bold text-blue-900 mb-3">
                {lang === "zh" ? "信任聲明" : "Trust Statement"}
              </h3>
              <p className="text-sm text-blue-800">
                {lang === "zh"
                  ? "本計算器基於公認的醫學標準（BMI 反推法）開發，參考 WHO、CDC、NIH 等權威機構的指南。計算結果僅供參考，不能替代專業醫療建議。如有健康疑慮，請諮詢合格的醫療專業人員。"
                  : "This calculator is developed based on recognized medical standards (BMI reverse calculation method) and references guidelines from authoritative organizations such as WHO, CDC, and NIH. The calculation results are for reference only and cannot replace professional medical advice. Consult qualified healthcare professionals for health concerns."}
              </p>
            </div>

            {/* Ad Slot */}
            <AdSlot slot="ideal-weight-knowledge" position="bottom" />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Ad Slot Sidebar */}
            <AdSlot slot="ideal-weight-sidebar" position="top" />

            {/* Premium Gate */}
            <PremiumGate />

            {/* Ad Slot Sidebar Bottom */}
            <AdSlot slot="ideal-weight-sidebar" position="bottom" />
          </div>
        </div>
      </div>

      {/* Ad Slot Footer */}
      <AdSlot slot="ideal-weight-footer" position="footer" />
    </div>
  );
}
