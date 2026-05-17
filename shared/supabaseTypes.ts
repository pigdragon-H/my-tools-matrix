// ============================================================
// Supabase Table Types
// 對齊 Supabase PostgreSQL 手動建立的資料表結構
// 這些型別用於 Supabase client 寫入，與 Drizzle MySQL schema 分離
// ============================================================

/**
 * Supabase calculation_history 表的插入型別
 * 對應欄位：id (auto), user_id, tool_id, category,
 *           input_params (JSONB), result (JSONB), created_at (auto)
 */
export interface SupabaseCalculationHistoryInsert {
  /** 用戶 ID（可為 null，未登入用戶也可儲存） */
  user_id: string | number | null;
  /** 工具 ID，例如 "roi-calculator" */
  tool_id: string;
  /** 工具分類，例如 "finance" | "health" */
  category: string;
  /** 用戶輸入參數（Supabase JSONB，傳入原生 JSON 物件，非字串） */
  input_params: Record<string, unknown>;
  /** 計算結果（Supabase JSONB，傳入原生 JSON 物件，非字串） */
  result: Record<string, unknown>;
}

/**
 * Supabase calculation_history 表的查詢回傳型別
 */
export interface SupabaseCalculationHistory extends SupabaseCalculationHistoryInsert {
  id: number;
  created_at: string;
}

/**
 * Supabase users 表的型別
 * 對應欄位：id, email, is_premium, stripe_customer_id, created_at, updated_at
 * 注意：此 users 表為應用層用戶資料，與 Manus OAuth 的 users 表分離
 */
export interface SupabaseUser {
  id: number;
  email: string | null;
  /** 是否為付費用戶 */
  is_premium: boolean;
  /** Stripe 客戶 ID（Stripe 整合後填入） */
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseUserInsert {
  email?: string | null;
  is_premium?: boolean;
  stripe_customer_id?: string | null;
}
