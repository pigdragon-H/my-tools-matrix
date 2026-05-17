// ============================================================
// Supabase Client - 伺服器端 Supabase 寫入層
// 使用 Supabase REST API 直接寫入，傳入原生 JSON 物件（非字串）
// 對應 Supabase JSONB 欄位的正確寫法
// ============================================================

import type {
  SupabaseCalculationHistoryInsert,
  SupabaseCalculationHistory,
} from "../shared/supabaseTypes";

// Supabase 連線設定（從環境變數讀取）
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";

/**
 * 低階 Supabase REST API 呼叫
 */
async function supabaseFetch<T>(
  table: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: unknown,
  query?: string
): Promise<T> {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase ${method} ${table} failed: ${res.status} ${errText}`);
  }

  return res.json() as Promise<T>;
}

/**
 * 插入一筆計算歷史到 Supabase calculation_history 表
 *
 * 關鍵：input_params 與 result 傳入原生 JSON 物件（非字串），
 * Supabase 會自動以 JSONB 型別儲存。
 *
 * @param data - 計算歷史資料（欄位名稱為 snake_case，對齊 Supabase）
 * @returns 插入後的記錄（含 id 與 created_at）
 */
export async function insertCalculationHistory(
  data: SupabaseCalculationHistoryInsert
): Promise<SupabaseCalculationHistory | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("[supabaseClient] SUPABASE_URL or SUPABASE_ANON_KEY not set, skipping insert");
    return null;
  }

  try {
    const rows = await supabaseFetch<SupabaseCalculationHistory[]>(
      "calculation_history",
      "POST",
      {
        user_id: data.user_id,
        tool_id: data.tool_id,
        category: data.category,
        input_params: data.input_params, // 原生 JSON 物件 → Supabase JSONB
        result: data.result,             // 原生 JSON 物件 → Supabase JSONB
      }
    );
    return rows[0] ?? null;
  } catch (err) {
    console.error("[supabaseClient] insertCalculationHistory failed:", err);
    return null;
  }
}

/**
 * 查詢特定用戶的計算歷史
 *
 * @param userId - 用戶 ID
 * @param toolId - 可選的工具 ID 過濾
 * @param limit  - 最多回傳筆數（預設 50）
 */
export async function getCalculationHistory(
  userId: number | string,
  toolId?: string,
  limit = 50
): Promise<SupabaseCalculationHistory[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];

  try {
    let query = `user_id=eq.${userId}&order=created_at.desc&limit=${limit}`;
    if (toolId) query += `&tool_id=eq.${toolId}`;

    return await supabaseFetch<SupabaseCalculationHistory[]>(
      "calculation_history",
      "GET",
      undefined,
      query
    );
  } catch (err) {
    console.error("[supabaseClient] getCalculationHistory failed:", err);
    return [];
  }
}
