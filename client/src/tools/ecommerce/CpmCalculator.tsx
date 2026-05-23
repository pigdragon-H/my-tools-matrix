import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "cpm",
  "zhTitle": "CPM計算器",
  "enTitle": "CPM Calculator",
  "zhDescription": "計算每千次曝光成本。",
  "enDescription": "Calculate cost per thousand impressions.",
  "formulaZh": "CPM = 花費 ÷ 曝光數 × 1000",
  "formulaEn": "CPM = spend / impressions × 1000",
  "fields": [
    {
      "key": "a",
      "zh": "總花費",
      "en": "Ad spend",
      "defaultValue": "1200"
    },
    {
      "key": "b",
      "zh": "曝光數",
      "en": "Impressions",
      "defaultValue": "80000"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function CpmCalculator() {
  return <ProfessionalToolShell config={config} />;
}
