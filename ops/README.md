# Tool Matrix · 量產作業手冊（Operations Handbook）

> **目的**：讓任何 AI Agent 或人類工程師按本手冊操作，產出的工具皆能達到 BMI / BMR 黃金模版的水準，避免再次出現「殭屍工具卡」（沒指導、沒解讀、沒下一步）的災難。
>
> **適用對象**：SuperNinja、Claude Code、Cursor Agent、人類工程師。
>
> **建立背景**：站方曾累積近 300 個由 AI 自主設計的工具，因缺乏使用指導與結果解讀，全部不堪用而砍掉重來。本手冊是重來的最高契約。

---

## 文件清單與閱讀順序

| 序 | 檔案 | 用途 | 何時讀 |
|---|---|---|---|
| 1 | [`SOP-tool-production.md`](./SOP-tool-production.md) | 標準作業程序：從接到工具命題到部署上線的 9 個階段 | **每次開工前必讀** |
| 2 | [`QC-checklist.md`](./QC-checklist.md) | 品質檢驗書：上線前 60 條自檢項 + 3 道閘門 | **產出後上線前必跑** |
| 3 | [`templates/tool-spec.template.md`](./templates/tool-spec.template.md) | 工具規格單（每個工具開工的第一份文件） | SOP Phase 1 |
| 4 | [`templates/copy-blueprint.template.md`](./templates/copy-blueprint.template.md) | 文案藍圖（顧問語氣、結果解讀、行動指引） | SOP Phase 2 |
| 5 | [`templates/tool-skeleton.tsx`](./templates/tool-skeleton.tsx) | 程式碼骨架（直接複製改寫，已對齊 15-layer 結構） | SOP Phase 4 |
| 6 | [`examples/`](./examples/) | 已通過 QC 的範例（BMI / BMR） | 隨時參考 |

---

## 黃金法則（Golden Rules）

凡違反任何一條，QC 必定不過：

1. **No tool without guidance.** 不能只給計算機，必須有「使用指導」與「結果解讀」。這是 300 個殭屍工具滅亡的核心教訓。
2. **15-Layer Anatomy 必須齊全。** 任何工具都必須完整實作 SOP §3 的 15 個區塊（Layer 1-15），缺一不上線。
3. **Bilingual lockstep.** 中英雙語的 key 必須完全對應，不准單邊新增 key 而另一邊缺。
4. **One source of truth for copy.** 所有面向使用者的文字一律寫在 `locales/zh.ts` 與 `locales/en.ts`，不准散落在 JSX 中（範例之外）。
5. **YMYL 工具必帶 Trust Note + References.** 健康、財經、法律類工具必須揭露限制與引用權威來源（WHO、CDC、NIH、衛福部、央行、財政部、勞動部等）。
6. **Result Card 必須回答三件事：** 是什麼狀態、為什麼重要、下一步該做什麼。三缺一退件。
7. **Decision Path 必須具體不能裝飾。** 「下一步工具」不能寫「相關工具」這種空話，必須是具名工具 + 一句點出該工具能解決什麼問題。
8. **No fake stats / fake badges.** 不准在工具裡寫「90+ tools」「4.9 star」這種未驗證數字。
9. **Affiliate / Premium 區塊獨立可關。** 變現層必須能透過 props / feature flag 完全隱藏，不影響核心工具功能。
10. **Build must pass + visual smoke test must pass.** TypeScript build 不能新增 error；新工具的 light/dark/mobile 三張截圖必須人眼通過。

---

## 一行決策樹

```
要做新工具？
  ├─ 是 → 開 tool-spec.template.md → 走 SOP → 跑 QC → 上線
  └─ 否 → 你不該在這個檔案裡
```

---

## 版本

- v1.0 — 2026-05-30 — Phase G 結束後第一版，以 BMI / BMR 為基準。
- 後續修改原則：每當有 5 個新工具上線，回頭更新本手冊收斂出新通用法則。
