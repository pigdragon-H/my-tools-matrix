import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "roas",
  "zhTitle": "ROAS/CPC計算器",
  "enTitle": "ROAS CPC Calculator",
  "zhDescription": "計算ROAS與盈虧平衡ROAS。",
  "enDescription": "Calculate ROAS and break-even ROAS.",
  "formulaZh": "ROAS = 廣告營收 ÷ 廣告花費",
  "formulaEn": "ROAS = ad revenue / ad spend",
  "fields": [
    {
      "key": "a",
      "zh": "廣告花費",
      "en": "Ad spend",
      "defaultValue": "1000"
    },
    {
      "key": "b",
      "zh": "廣告營收",
      "en": "Ad revenue",
      "defaultValue": "3500"
    },
    {
      "key": "c",
      "zh": "毛利率",
      "en": "Gross margin",
      "unitZh": "%",
      "unitEn": "%",
      "defaultValue": "40"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function RoasCpcCalculator() {
  return <ProfessionalToolShell config={config} />;
}
