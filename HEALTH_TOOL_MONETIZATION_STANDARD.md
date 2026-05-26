# 🏥 健康工具商業化標準化準則 v1.0

**適用範圍**: 所有健康工具計算機（BMI、BMR、TDEE、CalorieDeficit 等）  
**維護者**: PiGragon-H  
**最後更新**: 2026-05-26  
**強制執行**: ✅ 所有 AI 和 SUPER NINJA 必須遵守

---

## 📋 必須包含的三大商業化組件

### 1️⃣ getBrowserLang - 自動語言檢測

**目的**: 自動偵測用戶瀏覽器語言，優化用戶體驗

**實現代碼**（複製即用）:
```typescript
const getBrowserLang = (): "zh" | "en" => {
  const locale =
    (typeof navigator !== "undefined"
    && navigator.language) || "zh"
  return locale.startsWith("zh") ? "zh" : "en"
}
```

**使用方式**:
```typescript
const [lang, setLang] = useState<"zh" | "en">(getBrowserLang());
```

**檢查方式**:
```bash
grep -n "getBrowserLang" client/src/tools/health/{ToolName}/index.tsx
# 應該返回 2-3 行結果
```

---

### 2️⃣ AdSenseWrapper - 廣告包裝

**目的**: 包裝整個主內容以支持 Google AdSense 廣告投放

**實現代碼**（複製即用）:
```typescript
import { AdSenseWrapper } from "@/components/AdSenseWrapper";

export default function YourTool() {
  // ... 組件邏輯 ...
  
  return (
    <AdSenseWrapper>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 md:py-12">
        {/* 所有內容都在這裡 */}
      </main>
    </AdSenseWrapper>
  );
}
```

**檢查方式**:
```bash
grep -n "AdSenseWrapper" client/src/tools/health/{ToolName}/index.tsx
# 應該返回 3 行：import、開始標籤、結束標籤
```

**位置規則**:
- 第 1 行: `import { AdSenseWrapper } from "@/components/AdSenseWrapper";`
- 第 N 行: `<AdSenseWrapper>` （main 標籤之前）
- 最後: `</AdSenseWrapper>` （main 標籤之後）

---

### 3️⃣ Affiliate 推薦商品區塊

**目的**: 在信任與參考資源區塊中推薦相關健康產品，獲取聯盟佣金

**位置**: 在「信任 · 相關工具 · 參考資源」section 內

**實現代碼模板**（根據工具類型自訂）:

#### BMI 工具的 Affiliate 區塊
```typescript
<div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
    {lang === "zh" ? "推薦商品" : "Recommended"}
  </p>
  <h3 className="mt-2 text-lg font-black">
    {lang === "zh" ? "配合 BMI 使用的健康工具" : "Health tools to use with BMI"}
  </h3>
  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
    {[
      {zh: "智能體重計", en: "Smart Scale", href: "#affiliate-scale"},
      {zh: "健身追蹤器", en: "Fitness Tracker", href: "#affiliate-tracker"},
      {zh: "營養補充品", en: "Supplements", href: "#affiliate-supplements"},
      {zh: "健康書籍", en: "Health Books", href: "#affiliate-books"}
    ].map((item) => (
      <a key={item.href} href={item.href} 
         className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100">
        {lang === "zh" ? item.zh : item.en}
      </a>
    ))}
  </div>
  <p className="mt-3 text-xs text-amber-700">
    {lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金" : "* Affiliate links. We may earn a commission."}
  </p>
</div>
```

#### CalorieDeficit 工具的 Affiliate 區塊（推薦商品示例）
```typescript
<div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
    {lang === "zh" ? "推薦商品" : "Recommended"}
  </p>
  <h3 className="mt-2 text-lg font-black">
    {lang === "zh" ? "配合熱量計算使用的營養工具" : "Nutrition tools to use with calorie planning"}
  </h3>
  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
    {[
      {zh: "食物秤", en: "Food Scale", href: "#affiliate-scale"},
      {zh: "營養補充品", en: "Supplements", href: "#affiliate-supplements"},
      {zh: "健身手環", en: "Fitness Band", href: "#affiliate-band"},
      {zh: "營養指南", en: "Nutrition Guide", href: "#affiliate-guide"}
    ].map((item) => (
      <a key={item.href} href={item.href} 
         className="rounded-xl border border-amber-200 bg-white p-3 text-center text-sm font-black text-amber-900 transition hover:bg-amber-100">
        {lang === "zh" ? item.zh : item.en}
      </a>
    ))}
  </div>
  <p className="mt-3 text-xs text-amber-700">
    {lang === "zh" ? "* 聯盟連結，購買後我們可能獲得佣金" : "* Affiliate links. We may earn a commission."}
  </p>
</div>
```

**檢查方式**:
```bash
grep -n "affiliate" client/src/tools/health/{ToolName}/index.tsx
# 應該返回多行結果，包含 href="#affiliate-*"
```

**Affiliate 連結命名規則**:
- `#affiliate-scale` - 體重計/食物秤
- `#affiliate-tracker` - 健身追蹤器
- `#affiliate-band` - 健身手環
- `#affiliate-supplements` - 營養補充品
- `#affiliate-books` - 健康書籍
- `#affiliate-guide` - 營養指南

---

## ✅ 完整檢查清單

每個健康工具必須通過以下檢查：

```bash
# 1. 檢查 getBrowserLang
grep -n "getBrowserLang" client/src/tools/health/{ToolName}/index.tsx
# ✅ 應該返回 2-3 行

# 2. 檢查 AdSenseWrapper
grep -n "AdSenseWrapper" client/src/tools/health/{ToolName}/index.tsx
# ✅ 應該返回 3 行

# 3. 檢查 Affiliate
grep -n "affiliate" client/src/tools/health/{ToolName}/index.tsx
# ✅ 應該返回 4+ 行

# 4. 完整檢查（一行命令）
grep -n "AdSenseWrapper\|affiliate\|getBrowserLang" \
  client/src/tools/health/{ToolName}/index.tsx
# ✅ 應該返回 8+ 行
```

---

## 📂 資料夾結構標準

所有健康工具必須遵循此結構：

```
client/src/tools/health/{ToolName}/
├── index.tsx (主組件，包含所有商業化代碼)
└── locales/
    ├── zh.ts (中文翻譯)
    └── en.ts (英文翻譯)
```

**不允許的結構**:
- ❌ `{ToolName}.tsx` （單文件，已棄用）
- ❌ 缺少 locales 文件夾
- ❌ 缺少 index.tsx

---

## 🚀 Self Review 流程

在提交 PR 前，執行此流程：

### Step 1: 檢查資料夾結構
```bash
find client/src/tools/health/{ToolName} -type f | sort
# 應該返回 3 個文件
```

### Step 2: 檢查商業化代碼
```bash
grep -n "AdSenseWrapper\|affiliate\|getBrowserLang" \
  client/src/tools/health/{ToolName}/index.tsx
# 應該返回 8+ 行
```

### Step 3: 檢查路由配置
```bash
grep -n "{ToolName}" client/src/pages/ToolPage.tsx
# 應該返回 1 行，格式為：
# "health/{tool-name}": lazy(() => import("@/tools/health/{ToolName}")),
```

### Step 4: 檢查多語言
```bash
wc -l client/src/tools/health/{ToolName}/locales/*.ts
# 兩個文件應該行數相近
```

---

## 🔄 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0 | 2026-05-26 | 初始版本，包含 getBrowserLang、AdSenseWrapper、Affiliate 三大組件 |

---

## 📞 需要幫助？

- **AI 開發者**: 遵循此文檔中的所有代碼模板
- **SUPER NINJA**: 如果遇到特殊情況，可以修改此文檔並更新版本號
- **所有人**: 在 PR 中引用此文檔的版本號

---

**強制執行日期**: 2026-05-26  
**下次審查**: 2026-06-26
