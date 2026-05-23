import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "travelBudget",
  "zhTitle": "旅遊預算計算器",
  "enTitle": "Travel Budget Calculator",
  "zhDescription": "依天數與風格估算預算。",
  "enDescription": "Estimate budget by days and travel style.",
  "formulaZh": "總預算 = 每日預算 × 天數",
  "formulaEn": "Total budget = daily budget × days",
  "fields": [
    {
      "key": "style",
      "zh": "旅遊風格",
      "en": "Travel style",
      "type": "select",
      "defaultValue": "comfort",
      "options": [
        {
          "value": "economy",
          "zh": "經濟",
          "en": "Economy"
        },
        {
          "value": "comfort",
          "zh": "舒適",
          "en": "Comfort"
        },
        {
          "value": "luxury",
          "zh": "豪華",
          "en": "Luxury"
        }
      ]
    },
    {
      "key": "a",
      "zh": "天數",
      "en": "Days",
      "defaultValue": "5"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function TravelBudgetCalculator() {
  return <ProfessionalToolShell config={config} />;
}
