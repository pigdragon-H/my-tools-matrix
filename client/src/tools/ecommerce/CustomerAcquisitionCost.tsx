import ProfessionalToolShell, { ToolConfig } from "../ProfessionalToolShell";

const config: ToolConfig = {
  "kind": "cac",
  "zhTitle": "獲客成本計算器",
  "enTitle": "Customer Acquisition Cost",
  "zhDescription": "計算CAC與LTV/CAC。",
  "enDescription": "Calculate CAC and LTV/CAC.",
  "formulaZh": "CAC = 行銷費用 ÷ 新客戶數",
  "formulaEn": "CAC = marketing spend / new customers",
  "fields": [
    {
      "key": "a",
      "zh": "行銷費用",
      "en": "Marketing spend",
      "defaultValue": "5000"
    },
    {
      "key": "b",
      "zh": "新增客戶",
      "en": "New customers",
      "defaultValue": "100"
    },
    {
      "key": "c",
      "zh": "LTV",
      "en": "LTV",
      "defaultValue": "300"
    }
  ],
  "noteZh": "此工具提供估算與決策輔助，請依實際情況調整。",
  "noteEn": "This tool provides estimates for planning; adjust for real-world details."
};

export default function CustomerAcquisitionCost() {
  return <ProfessionalToolShell config={config} />;
}
