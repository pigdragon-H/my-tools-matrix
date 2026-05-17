// ============================================================
// saveCalculationResult - 通用計算結果持久化函數
// 非同步將計算數據寫入後端資料庫（Supabase calculation_history 表）
// 採用 fire-and-forget 模式，失敗不影響 UI 渲染
//
// Supabase 表結構對齊：
//   id            → 自動生成
//   user_id       → 由後端從 ctx.user 注入
//   tool_id       → payload.toolId
//   category      → payload.category
//   input_params  → payload.inputParams (JSONB)
//   result        → payload.result (JSONB)
//   created_at    → 自動生成
// ============================================================

export interface CalculationPayload {
  /** 工具 ID，例如 "roi-calculator" */
  toolId: string;
  /** 工具分類，對應 Supabase category 欄位，例如 "finance" | "health" */
  category: string;
  /** 用戶輸入參數，對應 Supabase input_params JSONB 欄位 */
  inputParams: Record<string, unknown>;
  /** 計算結果，對應 Supabase result JSONB 欄位 */
  result: Record<string, unknown>;
}

/**
 * 非同步儲存計算結果到 Supabase calculation_history 表
 * 採用 fire-and-forget 模式，失敗不影響用戶體驗
 *
 * @param payload - 計算數據（toolId, category, inputParams, result）
 * @param mutate  - tRPC mutation 函數（tools.saveResult.mutateAsync）
 */
export async function saveCalculationResult(
  payload: CalculationPayload,
  mutate: (input: CalculationPayload) => Promise<unknown>
): Promise<void> {
  try {
    await mutate(payload);
  } catch (error) {
    // Graceful degradation: log to console, don't throw
    // 不影響用戶使用工具，僅記錄錯誤
    console.warn("[saveCalculationResult] Failed to save to Supabase, falling back to localStorage:", error);

    // LocalStorage fallback（離線或 DB 不可用時的備援）
    try {
      const key = `calc_history_${payload.toolId}`;
      const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as CalculationPayload[];
      existing.unshift({
        ...payload,
        // @ts-expect-error - adding timestamp for local storage fallback
        _savedAt: new Date().toISOString(),
        _source: "localStorage_fallback",
      });
      // 最多保留最近 10 筆（避免 localStorage 爆滿）
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 10)));
    } catch {
      // Silent fail if localStorage is also unavailable
    }
  }
}
