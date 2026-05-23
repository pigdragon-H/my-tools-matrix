import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "educationFund",
  "zhTitle": "教育基金計算器",
  "enTitle": "Education Fund Calculator",
  "zhDescription": "專業教育工具與學習分析。",
  "enDescription": "Professional education and learning analysis.",
  "formulaZh": "依輸入資料計算與產生建議",
  "formulaEn": "Calculate and suggest from inputs",
  "fields": [
    {
      "key": "a",
      "zh": "子女年齡",
      "en": "Child age",
      "defaultValue": "8"
    },
    {
      "key": "b",
      "zh": "目標大學費用",
      "en": "Target college cost",
      "defaultValue": "80000"
    },
    {
      "key": "c",
      "zh": "年報酬率",
      "en": "Annual return",
      "unitZh": "%",
      "unitEn": "%",
      "defaultValue": "5"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function EducationFund() {
  return <ProfessionalToolShell config={config} />;
}
