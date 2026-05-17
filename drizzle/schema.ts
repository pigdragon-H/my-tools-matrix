import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * ============================================================
 * Schema 說明
 * ============================================================
 * 此 schema 對齊 Supabase PostgreSQL 手動建立的資料表結構。
 * 欄位名稱採用 snake_case，與 Supabase 欄位完全一致。
 * 注意：Supabase 已手動建表，此 schema 主要作為 TypeScript
 * 型別定義使用，請勿執行 db:push 覆蓋 Supabase 資料表。
 * ============================================================
 */

/**
 * users 表 - 對齊 Supabase users 結構
 * Supabase 欄位：id, email, is_premium, stripe_customer_id, created_at, updated_at
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** 是否為付費用戶（對齊 Supabase is_premium 欄位） */
  isPremium: boolean("is_premium").default(false).notNull(),
  /** Stripe 客戶 ID（對齊 Supabase stripe_customer_id 欄位） */
  stripeCustomerId: varchar("stripe_customer_id", { length: 128 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * calculation_history 表 - 對齊 Supabase calculation_history 結構
 * Supabase 欄位：id, user_id, tool_id, category, input_params (JSONB), result (JSONB), created_at
 *
 * 注意：Supabase 使用 JSONB 型別，此處用 text 模擬（MySQL 不支援 JSONB）。
 * 實際寫入 Supabase 時，input_params 與 result 為原生 JSON 物件（非字串）。
 */
export const calculationHistory = mysqlTable("calculation_history", {
  id: int("id").autoincrement().primaryKey(),
  /** 對應 Supabase user_id 欄位 */
  userId: int("user_id"),
  /** 對應 Supabase tool_id 欄位，例如 "roi-calculator" */
  toolId: varchar("tool_id", { length: 64 }).notNull(),
  /** 對應 Supabase category 欄位，例如 "finance" */
  category: varchar("category", { length: 64 }).notNull().default("finance"),
  /** 對應 Supabase input_params JSONB 欄位（此處序列化為 JSON 字串） */
  inputParams: text("input_params").notNull(),
  /** 對應 Supabase result JSONB 欄位（此處序列化為 JSON 字串） */
  result: text("result").notNull(),
  /** 對應 Supabase created_at 欄位 */
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CalculationHistory = typeof calculationHistory.$inferSelect;
export type InsertCalculationHistory = typeof calculationHistory.$inferInsert;

/**
 * ============================================================
 * Supabase 對齊備忘錄
 * ============================================================
 * calculation_history:
 *   - id              → int / uuid (Supabase)
 *   - user_id         → int / uuid (Supabase, nullable)
 *   - tool_id         → varchar(64)
 *   - category        → varchar(64)
 *   - input_params    → JSONB (Supabase) / text JSON string (此 schema)
 *   - result          → JSONB (Supabase) / text JSON string (此 schema)
 *   - created_at      → timestamp
 *
 * users:
 *   - id              → int / uuid (Supabase)
 *   - email           → varchar(320)
 *   - is_premium      → boolean, default false
 *   - stripe_customer_id → varchar(128), nullable
 *   - created_at      → timestamp
 *   - updated_at      → timestamp
 * ============================================================
 */
