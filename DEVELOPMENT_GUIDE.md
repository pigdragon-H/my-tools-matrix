# DEVELOPMENT_GUIDE.md — 開發規範與最佳實踐

> 本文件為接手開發工作的 AI 或開發者的操作手冊，涵蓋程式碼規範、元件使用規則與常見陷阱。

---

## 1. 技術堆疊速查

| 層級 | 技術 | 版本 | 說明 |
|------|------|------|------|
| 前端框架 | React | 19 | 使用 hooks 為主 |
| 建置工具 | Vite | 6 | 前端 build 工具 |
| 語言 | TypeScript | 5 | 嚴格模式 |
| 樣式 | Tailwind CSS | 4 | 使用 OKLCH 色彩格式 |
| UI 元件 | shadcn/ui | latest | 從 `@/components/ui/*` 引入 |
| 路由 | wouter | 3 | 輕量前端路由 |
| 後端框架 | Express | 4 | Node.js HTTP 伺服器 |
| API 層 | tRPC | 11 | 端對端型別安全 |
| 資料庫 ORM | Drizzle | latest | Schema-first |
| 資料庫 | MySQL（Railway）+ Supabase（PostgreSQL） | - | 雙資料庫架構 |
| 圖表 | Recharts | latest | 折線圖、長條圖、圓餅圖 |
| 圖示 | lucide-react | latest | 所有圖示來源 |
| 測試 | Vitest | latest | 單元測試 |

---

## 2. 專案目錄結構

```
my-tools-matrix/
├── client/                    # 前端
│   ├── index.html             # HTML 入口（Google Font CDN 在此）
│   ├── public/                # 靜態資源（sitemap.xml、robots.txt、favicon）
│   └── src/
│       ├── App.tsx            # 路由設定
│       ├── main.tsx           # React 入口（Provider 設定）
│       ├── index.css          # 全域樣式與 CSS 變數
│       ├── const.ts           # 全域常數（getLoginUrl 等）
│       ├── _core/hooks/       # 框架核心 hooks（useAuth）
│       ├── components/        # 共用元件
│       │   ├── ui/            # shadcn/ui 元件
│       │   ├── Navbar.tsx     # 導覽列
│       │   ├── DashboardLayout.tsx
│       │   └── ...
│       ├── pages/             # 頁面元件
│       │   ├── Home.tsx       # 首頁
│       │   ├── ToolPage.tsx   # 工具路由分發器（含 lazy import 映射）
│       │   ├── BlogPage.tsx   # 知識庫
│       │   ├── AdminDashboard.tsx
│       │   ├── PrivacyPolicy.tsx
│       │   ├── TermsOfService.tsx
│       │   └── ...
│       ├── tools/             # 工具元件（按分類子目錄）
│       │   ├── finance/       # 財經工具
│       │   ├── health/        # 健康工具
│       │   ├── productivity/  # 職場工具
│       │   └── dev/           # 開發工具
│       ├── hooks/             # 自訂 hooks
│       ├── contexts/          # React contexts
│       └── lib/
│           ├── trpc.ts        # tRPC 客戶端設定
│           └── utils.ts       # 工具函數
├── server/                    # 後端
│   ├── routers.ts             # tRPC 主路由（匯入所有子路由）
│   ├── db.ts                  # MySQL 查詢輔助函數
│   ├── storage.ts             # S3 儲存輔助函數
│   ├── supabaseClient.ts      # Supabase 客戶端
│   ├── routers/               # tRPC 子路由
│   │   ├── tools.ts           # 工具計算結果 API
│   │   ├── blog.ts            # SEO 文章 API（含所有文章元資料）
│   │   └── admin.ts           # 後台統計 API
│   └── _core/                 # ⚠️ 框架核心，禁止修改
│       ├── index.ts           # Express 伺服器入口
│       ├── trpc.ts            # tRPC 設定（publicProcedure、protectedProcedure、adminProcedure）
│       ├── context.ts         # tRPC context（含 ctx.user）
│       ├── oauth.ts           # Manus OAuth 處理
│       ├── llm.ts             # LLM 呼叫輔助函數
│       └── env.ts             # 環境變數型別定義
├── shared/                    # 前後端共用
│   ├── toolsConfig.ts         # 工具設定大腦
│   ├── categoriesConfig.ts    # 分類設定
│   ├── articles/              # SEO 文章 Markdown
│   │   ├── finance/           # 財經文章
│   │   └── health/            # 健康文章
│   └── types.ts               # 共用型別
├── drizzle/                   # 資料庫 Schema
│   └── schema.ts              # MySQL 表結構定義
├── PROJECT_BRIEF.md           # 專案總覽（必讀）
├── DEVELOPMENT_GUIDE.md       # 開發規範（本文件）
├── ARCHITECTURE_SNAPSHOT.md   # 架構快照
├── HANDOVER_CHECKLIST.md      # 交接核對清單
└── todo.md                    # 開發進度追蹤
```

---

## 3. tRPC 使用規範

### 3.1 定義後端 Procedure

在 `server/routers/[feature].ts` 中定義：

```ts
import { z } from "zod";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";

export const featureRouter = router({
  // 公開 API（不需登入）
  getList: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      // 回傳資料
      return { items: [] };
    }),

  // 需要登入的 API
  saveResult: protectedProcedure
    .input(z.object({ toolId: z.string(), result: z.any() }))
    .mutation(async ({ ctx, input }) => {
      // ctx.user 包含登入用戶資訊
      return { success: true };
    }),

  // 僅限管理員的 API
  getStats: adminProcedure
    .query(async ({ ctx }) => {
      return { stats: {} };
    }),
});
```

在 `server/routers.ts` 中匯入：

```ts
import { featureRouter } from "./routers/feature";
export const appRouter = router({
  // ...existing routers
  feature: featureRouter,
});
```

### 3.2 前端呼叫 tRPC

```tsx
import { trpc } from "@/lib/trpc";

// 查詢
const { data, isLoading, error } = trpc.feature.getList.useQuery({ category: "finance" });

// 修改（使用 optimistic update）
const utils = trpc.useUtils();
const mutation = trpc.feature.saveResult.useMutation({
  onMutate: async (newData) => {
    // 樂觀更新：立即更新 UI
    await utils.feature.getList.cancel();
    const prev = utils.feature.getList.getData();
    utils.feature.getList.setData(undefined, (old) => [...(old ?? []), newData]);
    return { prev };
  },
  onError: (err, newData, context) => {
    // 回滾
    utils.feature.getList.setData(undefined, context?.prev);
  },
  onSettled: () => {
    utils.feature.getList.invalidate();
  },
});
```

---

## 4. 工具元件開發規範

每個工具元件必須遵循以下結構：

```tsx
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getToolById } from "shared/toolsConfig";

const TOOL_ID = "my-tool-id";

export default function MyTool() {
  const tool = getToolById(TOOL_ID);
  const [result, setResult] = useState<ResultType | null>(null);

  // 儲存計算結果（不需要登入也可呼叫，但需要登入才會實際儲存）
  const saveResult = trpc.tools.saveResult.useMutation();

  const handleCalculate = () => {
    // 計算邏輯
    const calcResult = { /* ... */ };
    setResult(calcResult);

    // 儲存結果
    saveResult.mutate({
      toolId: TOOL_ID,
      category: tool?.category ?? "finance",
      inputParams: { /* 輸入參數 */ },
      result: calcResult,
    });
  };

  return (
    <div className="container max-w-4xl py-8">
      {/* 工具標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{tool?.name}</h1>
        <p className="text-muted-foreground mt-2">{tool?.description}</p>
      </div>

      {/* 輸入區域 */}
      <Card className="mb-6">
        <CardHeader><CardTitle>輸入參數</CardTitle></CardHeader>
        <CardContent>
          {/* 輸入欄位 */}
        </CardContent>
      </Card>

      {/* 計算按鈕 */}
      <Button onClick={handleCalculate} className="w-full mb-6">
        開始計算
      </Button>

      {/* 結果區域 */}
      {result && (
        <Card className="mb-6">
          <CardHeader><CardTitle>計算結果</CardTitle></CardHeader>
          <CardContent>
            {/* 結果顯示 */}
          </CardContent>
        </Card>
      )}

      {/* SEO 文章連結（必須） */}
      {tool?.seoArticles && tool.seoArticles.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">相關知識文章</h2>
          <div className="grid gap-3">
            {tool.seoArticles.map((article) => (
              <a
                key={article.id}
                href={`/blog/finance/${article.id}`}
                className="block p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="font-medium">{article.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{article.description}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 5. 樣式規範

### 5.1 色彩系統

使用 Tailwind 語義色彩（CSS 變數），**不可硬編碼顏色值**：

| 用途 | 類別 |
|------|------|
| 頁面背景 | `bg-background` |
| 主要文字 | `text-foreground` |
| 次要文字 | `text-muted-foreground` |
| 卡片背景 | `bg-card` |
| 卡片文字 | `text-card-foreground` |
| 主色按鈕 | `bg-primary text-primary-foreground` |
| 邊框 | `border-border` |
| 強調色 | `bg-accent text-accent-foreground` |

### 5.2 深色模式

本專案使用深色主題（`defaultTheme="dark"`），CSS 變數定義在 `client/src/index.css` 的 `.dark {}` 區塊。確保所有新元件使用語義色彩，不使用固定的 `bg-gray-900` 等類別。

### 5.3 響應式設計

採用 mobile-first 方式，使用 Tailwind 斷點：

```
sm: 640px   md: 768px   lg: 1024px   xl: 1280px   2xl: 1536px
```

工具頁面建議最大寬度：`max-w-4xl`（`container` 類別已自動置中）。

---

## 6. 資料庫操作規範

### 6.1 雙資料庫架構說明

本專案使用雙資料庫架構：

| 資料庫 | 用途 | 操作方式 |
|-------|------|---------|
| MySQL（Railway） | 用戶帳號（`users` 表）、Session 管理 | Drizzle ORM（`server/db.ts`） |
| Supabase（PostgreSQL） | 計算歷史記錄（`calculation_history` 表） | Supabase Client（`server/supabaseClient.ts`） |

### 6.2 計算結果儲存

工具計算結果儲存到 Supabase，透過 `server/routers/tools.ts` 的 `saveResult` procedure：

```ts
// 前端呼叫
saveResult.mutate({
  toolId: "roi-calculator",
  category: "finance",
  inputParams: { monthlyAmount: 5000, annualReturn: 7, years: 20 },
  result: { totalValue: 2468000, totalProfit: 1268000 },
});
```

### 6.3 修改 MySQL Schema

1. 修改 `drizzle/schema.ts`
2. 執行 `pnpm db:push`（會自動執行 migration）
3. **注意：** Supabase 的 `calculation_history` 表是手動建立的，`drizzle/schema.ts` 中的定義僅作為 TypeScript 型別參考，**不要對 Supabase 執行 db:push**

---

## 7. 常見錯誤與解決方法

### 7.1 `TypeError: Invalid URL`

**原因：** `VITE_OAUTH_PORTAL_URL` 或 `VITE_APP_ID` 環境變數為空字串。

**解決：** 確認 Railway 已設定這兩個變數，並觸發重新 build（因為是 `VITE_` 前綴的 build-time 變數）。

### 7.2 `[not_found] project not found`

**原因：** `VITE_APP_ID` 填入了錯誤的值（如 `temp-placeholder`）。

**解決：** 將 `VITE_APP_ID` 設為 `EADodHzRgjbhAnDHsqkamq`，然後重新 build。

### 7.3 TypeScript 錯誤：`Property 'key' does not exist on type 'Category'`

**原因：** `categoriesConfig.ts` 的 Category 型別使用 `key` 欄位，不是 `id`。

**解決：** 使用 `category.key` 而非 `category.id`。

### 7.4 TypeScript 錯誤：`Property 'isLoading' does not exist on type`

**原因：** `useAuth()` hook 回傳的是 `loading`，不是 `isLoading`。

**解決：** 使用 `const { user, loading } = useAuth()`。

### 7.5 無限重新渲染（Infinite re-render）

**原因：** 在 render 函數中建立新的物件或陣列作為 tRPC query 的輸入。

**解決：** 使用 `useState` 或 `useMemo` 穩定化引用：

```tsx
// ❌ 錯誤
const { data } = trpc.tools.getByDate.useQuery({ date: new Date() });

// ✅ 正確
const [date] = useState(() => new Date());
const { data } = trpc.tools.getByDate.useQuery({ date });
```

### 7.6 Build 成功但 Railway 顯示舊版本

**原因：** `VITE_` 前綴的環境變數在 build 時靜態嵌入，改了環境變數但沒有重新 build。

**解決：** 在 Railway → Deployments → 點選 Redeploy，或推送新 commit 到 GitHub。

---

## 8. 測試規範

測試檔案存放在 `server/*.test.ts`，使用 Vitest：

```ts
// server/tools.test.ts
import { describe, it, expect } from "vitest";

describe("tools router", () => {
  it("should save calculation result", async () => {
    // 測試邏輯
    expect(true).toBe(true);
  });
});
```

執行測試：

```bash
pnpm test          # 執行所有測試
pnpm test --watch  # 監聽模式
```

**規範：** 每個新的 tRPC procedure 都應有對應的 Vitest 測試。

---

## 9. 部署流程

### 9.1 正常部署（推送 GitHub）

```bash
# 1. 確認 build 零錯誤
pnpm check && pnpm build && pnpm test

# 2. 推送到 GitHub
git add .
git commit -m "feat: 新增 [工具名稱]"
git push origin main

# Railway 會自動偵測 push 並重新部署
```

### 9.2 強制重新 Build（修改 VITE_ 環境變數後）

在 Railway → app service → Deployments → 點選最新部署旁的 **⋯** → **Redeploy**。

或推送空 commit：

```bash
git commit --allow-empty -m "chore: trigger rebuild"
git push origin main
```

### 9.3 緊急回滾

在 Railway → Deployments → 找到上一個正常的部署 → 點選 **Rollback**。

---

## 10. 禁止事項

以下操作**嚴格禁止**，可能導致不可逆的問題：

1. **禁止修改 `server/_core/` 目錄下的任何檔案**（框架核心，修改會破壞 OAuth 和 tRPC）
2. **禁止對 Supabase 執行 `pnpm db:push`**（Supabase 表是手動建立的，push 會覆蓋）
3. **禁止在前端程式碼中直接使用 `fetch` 或 `axios`**（一律使用 tRPC hooks）
4. **禁止在 `client/public/` 或 `client/src/assets/` 存放圖片或媒體檔案**（會導致部署超時）
5. **禁止硬編碼顏色值**（使用 Tailwind 語義色彩）
6. **禁止在 render 函數中建立物件/陣列作為 query 輸入**（會導致無限重新渲染）
