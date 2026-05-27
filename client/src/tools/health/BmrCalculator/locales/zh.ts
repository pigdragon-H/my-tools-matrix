const zh = {
  // Hero
  badge: "健康 · 生物指標 · GOLD TOOL",
  title: "BMR 基礎代謝率計算機",
  subtitle: "BMR 計算引導體驗",
  intro: "透過 Mifflin-St Jeor 公式精確計算靜止代謝率，理解你的身體基礎熱量需求，並延伸到 TDEE、熱量赤字等下一步工具。",
  trustNoteLabel: "信任提醒：",
  trustNote: "BMR 是估算工具，個人實際代謝因體組成、健康狀況而異。孕婦及特殊疾病患者請諮詢醫師。",

  // Quick Action Card
  quickActionCard: "快速範例卡",
  tryCommonAdultExample: "試用常見成人範例",
  bmiPreview: "BMR 預覽",

  // Examples
  example: "範例",
  adultMale: "成年男性（30 歲）",
  weight: "體重",
  height: "身高",
  oneClickFillAdultMaleExample: "一鍵填入成年男性範例",
  previewHighBmiDecisionPath: "預覽高 BMR 決策路徑",

  // Examples Calculator
  examplesCalculator: "範例計算機",
  enterOrFillValues: "輸入或填入數值",
  examplesHelper: "原型在計算機附近保留範例，讓使用者快速開始，然後編輯輸入而不失去上下文。",
  metric: "公制",
  imperial: "英制",
  exampleCards: "範例卡",
  highBmiPathDemo: "高 BMR 路徑示範",
  flowDemo: "流程示範",
  highBmiPathDescription: "88kg · 170cm · 展示 BMR → TDEE → 熱量赤字路徑",

  // Calculator
  calculator: "計算機",
  heightCm: "身高（cm）",
  weightKg: "體重（kg）",
  feet: "英尺",
  inches: "英寸",
  weightLb: "體重（磅）",
  enterValidValues: "輸入有效數值",

  // Result Card
  resultCard: "結果卡",
  current: "當前",
  currentBmi: "當前 BMR",
  status: "BMR 分類",
  riskSummary: "代謝評估",

  // Result Intelligence
  resultIntelligence: "結果智能",
  emotionConversionLayer: "情感轉化層",
  screeningSignal: "篩查信號",
  interpretCategoryBeforeActing: "在採取行動前解釋分類",
  recommendedAction: "建議行動",
  relatedNextTool: "相關下一步工具",

  // Progress Insight
  progressInsightCard: "進度洞察卡",
  timeline: "時間軸",
  step: "步驟",
  goal: "目標",
  progress: "進度",
  keepMomentum: "保持動力",
  possibleProgressTarget: "可能的進度目標",
  estimatedTimelinePlaceholder: "預估時間軸",

  // Knowledge
  knowledge: "知識",
  bmiMeaning: "BMR 在健康宇宙中的意義",
  definition: "定義",
  definitionText: "BMR（基礎代謝率）是你的身體在完全靜止狀態下維持生命功能所需的最低熱量。",
  limitations: "限制",
  limitationsText: "BMR 不考慮日常活動、運動、壓力或荷爾蒙變化的影響。肌肉量高者 BMR 會偏高。",
  semanticNeighbors: "相關工具",
  semanticNeighborsText: "TDEE、熱量赤字、BMI、蛋白質需求計算機可擴展結果情境。",
  metricFormula: "男性：BMR = 10×體重(kg) + 6.25×身高(cm) - 5×年齡 + 5",
  imperialFormula: "女性：BMR = 10×體重(kg) + 6.25×身高(cm) - 5×年齡 - 161",

  // FAQ
  commonQuestions: "常見問題",

  // Trust
  trust: "信任聲明",
  trustText: "本工具基於 Mifflin-St Jeor 公式，為目前學術界最廣泛採用的 BMR 計算標準。",

  // References
  references: "參考資料",
  referencesText: "Mifflin MD et al. (1990)、WHO 代謝標準、NIH 熱量需求指引",

  // Related Tools
  relatedTools: "相關工具",

  // Journey
  healthJourney: "健康旅程",
  turnBmiIntoJourney: "將 BMR 轉化為旅程",
  startJourney: "開始旅程",

  // Save/Share
  saveUi: "保存",
  saveShareJourney: "保存/分享旅程",
  saveShareNote: "保存你的計算結果和決策路徑",
  saveSharePlaceholder: "輸入旅程名稱",
  shareUi: "分享",

  // Prototype Note
  prototypeLayerNote: "原型層提示",

  // Others
  start: "開始",
  needed: "需要",
  neededWeightNote: "需要體重",
  planIntake: "規劃攝取",
  calories: "熱量",
  dailyNeeds: "每日需求",
  restingEnergy: "靜止能量",
  weightLoss: "體重減輕",
  targetBmiRange: "目標 BMR 範圍",
  bmiHigh: "BMR 高",
  motivationCard: "動力卡",
  flowDemo: "流程示範",
  relatedNextTool: "相關下一步工具",
} as const

export default zh
export type Translations = typeof zh
