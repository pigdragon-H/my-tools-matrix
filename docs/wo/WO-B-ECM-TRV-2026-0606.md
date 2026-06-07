# 【工單 WO-B-ECM-TRV-2026-0606】
**發令：Claude品管視窗 + Victor授權**
**日期：2026-06-06**
**執行視窗：新 B 視窗**
**工作路徑：/workspace/my-tools-matrix**

---

## ⚠️ 開工前強制必讀

```bash
cd /workspace/my-tools-matrix
git pull origin main
cat docs/A_PLUS_PRODUCTION_MANUAL.md
cat docs/MUST_READ_BEFORE_START_v2.1.md
cat docs/NEW_B_WINDOW_HANDOFF.md
```

---

## 執行節奏（Victor裁示）

```
✅ 一無反顧直前，不製作首樣，不等Victor品鑑
✅ 每支完成丟HASH即接下一支
✅ Victor隨時主動視覺品鑑，喊停才停
✅ 每完成3支強制回讀A+手冊
✅ scaffold後立刻git status確認乾淨
✅ 推送前git diff --cached確認內容
```

---

## 第1批：E-Commerce（電商）3支

**category：ecommerce**
**路徑：client/src/tools/ecommerce/**
**金樣板：`client/src/tools/finance/MeetingCostCalculator/index.tsx`**
**主題色：自由配色**

| 編號 | slug | 中文名 | English Name |
|---|---|---|---|
| ECM-01 | `amazon-fba-calculator` | 亞馬遜FBA費用計算機 | Amazon FBA Calculator |
| ECM-02 | `dropshipping-profit-calculator` | 代發貨獲利計算機 | Dropshipping Profit Calculator |
| ECM-03 | `etsy-fee-calculator` | Etsy費用計算機 | Etsy Fee Calculator |

### 工具內容規格

**ECM-01 Amazon FBA Calculator**
```
核心計算：
  商品售價 - FBA費用 - 商品成本 - 其他費用 = 淨利潤
  FBA費用參考：依商品尺寸/重量計算
  費用類型：Referral Fee / FBA Fulfillment Fee / Storage Fee
輸入：售價 / 商品成本 / 重量 / 尺寸類別
輸出：淨利潤 / 利潤率 / ROI / 費用明細
```

**ECM-02 Dropshipping Profit Calculator**
```
核心計算：
  售價 - 供應商成本 - 運費 - 平台費 = 毛利
  毛利率 = 毛利 / 售價 × 100%
輸入：售價 / 供應商成本 / 運費 / 廣告費
輸出：毛利 / 毛利率 / 月收入預估（依銷量）
```

**ECM-03 Etsy Fee Calculator**
```
核心計算：
  Etsy費用結構：
  - 刊登費：$0.20/件
  - 交易費：售價×6.5%
  - 支付處理費：3%+$0.25
  - Offsite Ads：12%-15%（視資格）
輸入：售價 / 商品成本 / 運費
輸出：各項費用明細 / 淨收入 / 利潤率
```

---

## 第2批：Travel（旅遊）2支

**category：travel**
**路徑：client/src/tools/travel/**
**金樣板：`client/src/tools/health/MacroCalculator/index.tsx`**
**主題色：自由配色**

| 編號 | slug | 中文名 | English Name |
|---|---|---|---|
| TRV-01 | `flight-carbon-calculator` | 航班碳排放計算機 | Flight Carbon Calculator |
| TRV-02 | `travel-miles-calculator` | 旅行里程計算機 | Travel Miles Calculator |

### 工具內容規格

**TRV-01 Flight Carbon Calculator**
```
核心計算：
  碳排放（kg）= 距離(km) × 艙等係數 × 機型係數
  艙等係數：經濟艙=1.0 / 商務艙=2.0 / 頭等艙=3.0
  平均值：短程150kg / 中程600kg / 長程2500kg
輸入：出發地→目的地 / 艙等 / 單程/來回
輸出：碳排放量(kg) / 等同於開車X公里 / 抵消植樹棵數
```

**TRV-02 Travel Miles Calculator**
```
核心計算：
  里程累積：飛行距離 × 艙等乘數
  兌換價值：里程數 × 平均兌換比率
  常見比率：航空公司里程約$0.01-$0.02/里程
輸入：飛行距離 / 艙等 / 常旅客計畫
輸出：累積里程 / 里程價值（美元） / 可兌換獎勵
```

---

## 推送前防護（每支必做）

```bash
# 1. scaffold後立刻確認
git status
# 只能有自己工具的三件套！

# 2. 推送前確認
git diff --cached
# 逐一確認每個檔案內容

# 3. 確認tracked
git ls-files client/src/tools/<cat>/<Pascal>/index.tsx
# 必須有輸出！
```

---

## 每支回報格式

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ <編號> <slug> 交付完成
HASH：xxxxxxx
Gate 1✓ Gate 2✓ Gate 3✓ Gate 4✓ Gate 5✓ Gate 6✓
Railway：SUCCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 批次完成回報

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏁 E-Commerce + Travel 全數完成，共5支
ECM-01 amazon-fba-calculator      xxxxxxx ✅
ECM-02 dropshipping-profit-calculator xxxxxxx ✅
ECM-03 etsy-fee-calculator        xxxxxxx ✅
TRV-01 flight-carbon-calculator   xxxxxxx ✅
TRV-02 travel-miles-calculator    xxxxxxx ✅
等待Victor視覺品鑑 🙏
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

**版本：v1.0**
**WO編號：WO-B-ECM-TRV-2026-0606**
**總計：5支（E-Commerce 3 + Travel 2）**
**完成後：非語言類30支全數完成，暫停增加新工具**
