import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "nps",
  "zhTitle": "NPS淨推薦值計算器",
  "enTitle": "Net Promoter Score",
  "zhDescription": "計算NPS分數與評級。",
  "enDescription": "Calculate NPS score and rating.",
  "formulaZh": "NPS = 推薦者% - 批評者%",
  "formulaEn": "NPS = promoters% - detractors%",
  "fields": [
    {
      "key": "a",
      "zh": "推薦者數",
      "en": "Promoters",
      "defaultValue": "120"
    },
    {
      "key": "b",
      "zh": "被動者數",
      "en": "Passives",
      "defaultValue": "50"
    },
    {
      "key": "c",
      "zh": "批評者數",
      "en": "Detractors",
      "defaultValue": "30"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function NetPromoterScore() {
  return <ProfessionalToolShell config={config} />;
}
