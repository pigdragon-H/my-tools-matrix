# Formula Universe — ID Allocation Rules v1.0

**Author:** GPT (Architecture Brain)  
**Validator:** Claude (Universe Auditor)  
**Owner:** Victor (PiGragon-H)  
**Version:** 1.0.0  
**Created:** 2026-05-22  

---

## 1. 核心原則

> **Tool ID 是靈魂，URL 只是外衣。**

- ID 一旦分配，**永遠不可更改**
- URL 可以更改，分類可以遷移，但 ID 不變
- 所有工具必須先取得 ID，才能建立頁面

---

## 2. 現階段 ID 格式（簡化版 v1）

目前使用簡化格式，待宇宙規模擴大後升級：

```
UV-000XXX

例如：
FIN-000001   財經類第1個工具
HLT-000018   健康類第18個工具
DEV-000034   開發類第34個工具
```

| 部分 | 說明 |
|---|---|
| UV | Universe Key（2-3字母）|
| 000XXX | 全域流水號（6位數，永不重用）|

---

## 3. 未來完整格式（v2，500+ 工具後啟用）

```
UV-GX-SY-TL-000XXX

例如：
FIN-INV-RET-CAGR-000182
```

| 部分 | 說明 |
|---|---|
| UV | Universe（FIN, HLT, DEV...）|
| GX | Galaxy（功能領域）|
| SY | System（知識群）|
| TL | Tool slug（縮寫）|
| 000XXX | 全域流水號 |

---

## 4. 申請 ID 的正確流程

```
步驟 1：Manus 或 Sninja 發現新工具
        ↓
步驟 2：查詢 tool-registry.json 確認 slug 不重複
        ↓
步驟 3：向 GPT 申請分類（Universe/Galaxy）
        ↓
步驟 4：GPT 分配 Canonical ID
        ↓
步驟 5：Claude 驗證無碰撞
        ↓
步驟 6：寫入 tool-registry.json
        ↓
步驟 7：Sninja 建立頁面
        ↓
步驟 8：Victor 驗證上線
```

---

## 5. Slug 命名規則

```
格式：全小寫 + 連字號（kebab-case）
長度：3-50 個字元
語言：英文

✅ 正確範例：
compound-interest-calculator
bmi-calculator
css-unit-converter
jwt-decoder

❌ 錯誤範例：
CompoundInterest          （大寫）
compound_interest         （底線）
calc1                     （無意義縮寫）
複利計算器                 （中文）
compound-interest-calculator-tool-v2  （過長）
```

---

## 6. 禁止事項（所有 AI 必須遵守）

| 禁止行為 | 原因 |
|---|---|
| 自行命名 Canonical ID | ID 必須由 GPT 統一分配 |
| 使用 URL path 作為 ID | URL 會變，ID 不可變 |
| 重複使用已刪除的 ID | 會造成歷史混淆 |
| 跳過 Registry 直接建頁 | 無法追蹤，無法治理 |
| 修改已登記的 ID | 永遠不可更改 |
| 自行決定 Universe 分類 | 分類由 GPT 統一決定 |

---

## 7. 碰撞檢測規則（Claude 執行）

每次新增工具前，Claude 必須確認：

```
1. slug 在 tool-registry.json 中不存在
2. canonical_id 在 tool-registry.json 中不存在
3. 同一 website_key 下沒有相同 slug
4. ID 格式符合規範
```

如發現碰撞：**立即停止，回報 Victor，不得繼續執行**

---

## 8. 分類遷移策略

當工具需要移動到不同分類時：

```
✅ 允許：
- 更改 website_key（分類顯示位置）
- 更改 website_path（URL）
- 新增 redirect_from（舊 URL 重導向）

❌ 禁止：
- 更改 canonical_id
- 更改 slug（除非有充分理由並記錄）
```

---

## 9. 當前流水號狀態

```
最後分配號碼：000055
下一個可用號碼：000056
```

**每次新增工具後必須更新 tool-registry.json 的 next_serial 欄位**

---

## 10. 特殊情況處理

### 跨分類工具
同一工具出現在多個分類（例如 timezone-converter 同時在 dev 和 travel），
處理方式：
- 主要登記一次（主 canonical_id）
- 次要顯示用不同 serial 但標注 `parent_id`

### 廢棄工具
```json
{
  "status": "deprecated",
  "deprecated": true,
  "redirect_from": ["/tools/old/path"]
}
```
ID 保留但永不重用。

---

## 11. Registry 更新責任

| 動作 | 責任人 |
|---|---|
| 申請新 ID | GPT |
| 驗證無碰撞 | Claude |
| 更新 registry | Claude / Victor |
| 建立頁面 | Sninja |
| 最終確認 | Victor |
