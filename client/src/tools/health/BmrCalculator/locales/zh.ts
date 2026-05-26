const zh = {
  // Hero
  badge: "健康 · 生物指標 · Gold Tool",
  title: "BMR 計算機 · 基礎代謝率完整評估",
  subtitle: "BMR 基礎代謝率計算機",
  intro: "精確計算你的基礎代謝率（BMR），了解身體在靜止狀態下每日消耗的熱量。使用 Mifflin-St Jeor 公式（最準確的現代方法），結合性別、年齡、身高與體重，提供個人化的代謝評估與健康建議。",
  cta: "開始計算",

  // Quick Guide
  quickGuideBadge: "快速指南",
  quickGuideTitle: "3 步驟計算你的 BMR",
  step1: "輸入基本資訊：性別、年齡、身高、體重",
  step2: "系統自動計算基礎代謝率（kcal/天）",
  step3: "查看分類、解讀、建議與相關工具",

  // Examples
  examplesBadge: "真實範例",
  examplesTitle: "不同人群的 BMR 差異",
  example1Title: "25 歲女性",
  example1Desc: "身高 165cm、體重 60kg → BMR = 1,400 kcal/天",
  example2Title: "35 歲男性",
  example2Desc: "身高 180cm、體重 80kg → BMR = 1,800 kcal/天",
  example3Title: "50 歲女性",
  example3Desc: "身高 160cm、體重 65kg → BMR = 1,300 kcal/天",

  // Calculator
  calculatorBadge: "計算機",
  calculatorTitle: "計算你的 BMR",
  gender: "性別",
  male: "男性",
  female: "女性",
  age: "年齡",
  height: "身高",
  weight: "體重",
  calculate: "計算 BMR",
  cm: "cm",
  kg: "kg",

  // Result
  resultBadge: "結果",
  yourBMR: "你的 BMR",
  kcalPerDay: "kcal/天",
  category: "分類",

  // Categories
  lowMetabolism: "代謝偏低",
  lowMetabolismRange: "< 1200 kcal（女）/ < 1400 kcal（男）",
  lowMetabolismMeaning: "基礎代謝率低於標準範圍，可能與肌肉量不足、年齡增長或特殊生理狀況有關。",
  lowMetabolismRisks: "可能原因：肌肉量不足、長期節食、甲狀腺功能低下或代謝適應。",
  lowMetabolismActions: "建議增加阻力訓練以增加肌肉量，確保充足蛋白質攝取，避免極端節食。",

  normalLowMetabolism: "偏低正常",
  normalLowMetabolismRange: "1200-1500 kcal",
  normalLowMetabolismMeaning: "基礎代謝率在偏低但正常的範圍內，通常見於體型較小或肌肉量較少的人群。",
  normalLowMetabolismRisks: "通常無特殊風險，但需要注意飲食與運動的平衡。",
  normalLowMetabolismActions: "維持均衡飲食，每週進行 3-4 次運動，定期追蹤體重與體組成。",

  normalMetabolism: "正常範圍",
  normalMetabolismRange: "1500-2000 kcal",
  normalMetabolismMeaning: "基礎代謝率在健康正常範圍內，表示身體代謝效率良好。",
  normalMetabolismRisks: "代謝正常，無特殊風險。",
  normalMetabolismActions: "維持現況，每 3 個月追蹤一次，結合 TDEE 計算進行體重管理。",

  highMetabolism: "較高代謝",
  highMetabolismRange: "> 2000 kcal",
  highMetabolismMeaning: "基礎代謝率較高，通常與較高的肌肉量或年輕年齡有關。",
  highMetabolismRisks: "代謝良好，需要注意維持肌肉量與營養攝取。",
  highMetabolismActions: "確保充足的蛋白質與熱量攝取，維持規律運動習慣，定期監測健康指標。",

  // Result Intelligence
  resultIntelligenceBadge: "結果解讀",
  resultIntelligenceTitle: "你的 BMR 代表什麼？",
  resultIntelligenceDesc: "基礎代謝率（BMR）是你的身體在完全靜止狀態下每天消耗的熱量。這個數字受到年齡、性別、身高、體重與肌肉量的影響。",

  // Decision Layer
  decisionLayerBadge: "下一步建議",
  decisionLayerTitle: "根據你的 BMR，下一步是什麼？",
  nextStep1: "計算 TDEE（每日總消耗熱量）= BMR × 活動係數",
  nextStep2: "根據目標設定熱量攝取（減重、維持或增肌）",
  nextStep3: "定期重新計算（每 3 個月一次）",

  // Human Advisory
  humanAdvisoryBadge: "專家建議",
  humanAdvisoryTitle: "針對不同 BMR 區間的具體建議",
  advisory1Title: "代謝偏低（< 1200/1400 kcal）",
  advisory1Desc: "可能肌肉量不足，建議增加阻力訓練。避免過度節食，確保充足蛋白質與微量營養素。",
  advisory2Title: "正常範圍（1500-2000 kcal）",
  advisory2Desc: "維持現況，每 3 個月追蹤一次。結合 TDEE 計算進行體重管理。",
  advisory3Title: "較高代謝（> 2000 kcal）",
  advisory3Desc: "代謝良好，注意維持肌肉量。確保充足的蛋白質與熱量攝取。",

  // Formula
  formulaBadge: "公式",
  formulaTitle: "BMR 計算公式（Mifflin-St Jeor）",
  formulaMale: "男性：BMR = 10×體重(kg) + 6.25×身高(cm) - 5×年齡 + 5",
  formulaFemale: "女性：BMR = 10×體重(kg) + 6.25×身高(cm) - 5×年齡 - 161",
  formulaVariables: "變數說明：體重（kg）、身高（cm）、年齡（歲）",
  formulaNote: "Mifflin-St Jeor 公式是目前最準確的 BMR 計算方法，已被廣泛應用於臨床與研究領域。",

  // Knowledge
  knowledgeBadge: "知識",
  knowledgeTitle: "關於基礎代謝率（BMR）",
  knowledgeDefinition: "基礎代謝率（Basal Metabolic Rate, BMR）是指人體在完全靜止、禁食狀態下，維持基本生理功能（如心跳、呼吸、體溫調節）所消耗的熱量。",
  knowledgeLimitations: "限制：BMR 無法考慮體組成差異（同體重但肌肉量不同的人 BMR 會不同）；生病、壓力、荷爾蒙變化都會影響實際代謝；孕婦、哺乳期婦女、特殊疾病患者不適用。",

  // Trust
  trustBadge: "信任聲明",
  trustTitle: "數據來源與免責聲明",
  trustSource: "公式基於 Mifflin-St Jeor（1990）研究，已被美國營養與飲食學會（AND）認可。",
  trustDisclaimer: "本工具提供教育參考，不能替代專業醫療或營養建議。如有健康疑慮，請諮詢合格醫療專業人員。",

  // FAQ
  faqBadge: "常見問題",
  faqTitle: "關於 BMR 的常見問題",
  faq1Q: "BMR 和 TDEE 有什麼差異？",
  faq1A: "BMR 是靜止狀態下的代謝，TDEE 是加入活動量後的總消耗。TDEE = BMR × 活動係數。",
  faq2Q: "BMR 會隨年齡下降嗎？",
  faq2A: "是的。每增加 10 歲，BMR 大約下降 2-8%，主要因為肌肉量隨年齡減少。",
  faq3Q: "節食會降低 BMR 嗎？",
  faq3A: "長期極端節食會導致代謝適應，BMR 可能下降 10-25%。這是身體的保護機制。",
  faq4Q: "肌肉訓練能提升 BMR 嗎？",
  faq4A: "是的。每增加 1 kg 肌肉，BMR 約增加 6-10 kcal/天。阻力訓練是提升 BMR 的有效方法。",
  faq5Q: "BMR 計算需要多久更新一次？",
  faq5A: "建議每 3 個月重新計算一次，特別是在體重、肌肉量或年齡有變化時。",

  // Related Tools
  relatedToolsBadge: "相關工具",
  relatedToolsTitle: "延伸探索",
  relatedTool1: "TDEE 計算機",
  relatedTool2: "熱量赤字計算機",
  relatedTool3: "BMI 計算機",
  relatedTool4: "蛋白質需求計算機",

  // Affiliate
  affiliateBadge: "推薦商品",
  affiliateTitle: "配合 BMR 計算的健康相關商品",
  affiliateItem1: "智能體重秤",
  affiliateItem2: "體脂計",
  affiliateItem3: "蛋白質補充品",
  affiliateItem4: "健身計畫書",
  affiliateDisclaimer: "* 聯盟連結，購買後我們可能獲得佣金",

  // References
  referencesBadge: "參考資料",
  referencesTitle: "延伸閱讀",
  reference1: "Mifflin-St Jeor 公式原始研究（1990）",
  reference2: "美國營養與飲食學會（AND）代謝評估指南",
  reference3: "肌肉量與代謝的關係研究",
  reference4: "代謝適應與節食的科學證據",
} as const

export default zh
export type Translations = typeof zh
