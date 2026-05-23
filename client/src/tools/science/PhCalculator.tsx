import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "ph",
  "zhTitle": "pH酸鹼值計算器",
  "enTitle": "pH Calculator",
  "zhDescription": "判斷酸鹼性並估算離子濃度。",
  "enDescription": "Classify acidity and estimate ion concentration.",
  "formulaZh": "pH = -log10[H⁺]",
  "formulaEn": "pH = -log10[H⁺]",
  "fields": [
    {
      "key": "a",
      "zh": "pH值",
      "en": "pH value",
      "defaultValue": "7"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function PhCalculator() {
  return <ProfessionalToolShell config={config} />;
}
