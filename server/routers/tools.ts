// ============================================================
// Tools Router - 工具相關 tRPC 程序
//
// 資料持久化策略（雙軌制）：
//   主軌：Supabase REST API（原生 JSONB，對齊手動建立的表結構）
//   備軌：Drizzle MySQL/TiDB（Manus 平台內建 DB，graceful fallback）
//
// Supabase calculation_history 欄位對齊：
//   user_id      → ctx.user?.id（可為 null）
//   tool_id      → input.toolId
//   category     → input.category
//   input_params → input.inputParams（原生 JSON 物件 → JSONB）
//   result       → input.result（原生 JSON 物件 → JSONB）
//   created_at   → Supabase 自動填入
// ============================================================

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { calculationHistory } from "../../drizzle/schema";
import { getAllTools, getToolById, getToolsByCategory } from "../../shared/toolsConfig";
import { insertCalculationHistory, getCalculationHistory } from "../supabaseClient";

export const toolsRouter = router({
  // 取得所有工具列表
  list: publicProcedure.query(() => {
    return getAllTools();
  }),

  // 依分類取得工具列表
  listByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }) => {
      return getToolsByCategory(input.category);
    }),

  // 取得單一工具設定
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const tool = getToolById(input.id);
      if (!tool) throw new Error(`Tool not found: ${input.id}`);
      return tool;
    }),

  /**
   * 儲存計算結果（雙軌制）
   *
   * 主軌：Supabase REST API
   *   - input_params / result 傳入原生 JSON 物件（非字串）
   *   - Supabase 以 JSONB 型別儲存，支援 JSON 查詢
   *
   * 備軌：Drizzle MySQL（Manus 平台內建 DB）
   *   - input_params / result 序列化為 JSON 字串（MySQL text 欄位）
   *   - 主軌失敗時自動切換
   */
  saveResult: publicProcedure
    .input(
      z.object({
        toolId: z.string().max(64),
        category: z.string().max(64).default("finance"),
        inputParams: z.record(z.string(), z.unknown()),
        result: z.record(z.string(), z.unknown()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // ── 主軌：Supabase REST API ──────────────────────────────
      const supabaseResult = await insertCalculationHistory({
        user_id: ctx.user?.id ?? null,
        tool_id: input.toolId,
        category: input.category,
        input_params: input.inputParams, // 原生 JSON 物件 → Supabase JSONB
        result: input.result,            // 原生 JSON 物件 → Supabase JSONB
      });

      if (supabaseResult) {
        return { success: true, saved: true, source: "supabase" as const };
      }

      // ── 備軌：Drizzle MySQL（Manus 平台內建 DB）──────────────
      const db = await getDb();
      if (!db) {
        console.log("[tools.saveResult] Both Supabase and MySQL unavailable, skipping persist:", {
          toolId: input.toolId,
          category: input.category,
          timestamp: new Date().toISOString(),
        });
        return { success: true, saved: false, source: "none" as const };
      }

      try {
        await db.insert(calculationHistory).values({
          userId: ctx.user?.id ?? null,
          toolId: input.toolId,
          category: input.category,
          inputParams: JSON.stringify(input.inputParams), // MySQL text 欄位
          result: JSON.stringify(input.result),
        });
        return { success: true, saved: true, source: "mysql" as const };
      } catch (err) {
        console.error("[tools.saveResult] MySQL fallback also failed:", err);
        return { success: true, saved: false, source: "none" as const };
      }
    }),

  /**
   * 取得用戶計算歷史（優先從 Supabase 查詢）
   * 需要登入（protectedProcedure）
   */
  getHistory: protectedProcedure
    .input(z.object({ toolId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      // 優先從 Supabase 查詢
      const supabaseRows = await getCalculationHistory(ctx.user.id, input.toolId);
      if (supabaseRows.length > 0) {
        return supabaseRows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          toolId: row.tool_id,
          category: row.category,
          inputParams: row.input_params, // 已是 JSON 物件（Supabase JSONB）
          result: row.result,            // 已是 JSON 物件（Supabase JSONB）
          createdAt: new Date(row.created_at),
        }));
      }

      // 備軌：Drizzle MySQL
      const db = await getDb();
      if (!db) return [];

      const { eq, and, desc } = await import("drizzle-orm");
      const conditions = [eq(calculationHistory.userId, ctx.user.id)];
      if (input.toolId) {
        conditions.push(eq(calculationHistory.toolId, input.toolId));
      }

      const rows = await db
        .select()
        .from(calculationHistory)
        .where(and(...conditions))
        .orderBy(desc(calculationHistory.createdAt))
        .limit(50);

      return rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        toolId: row.toolId,
        category: row.category,
        inputParams: JSON.parse(row.inputParams) as Record<string, unknown>,
        result: JSON.parse(row.result) as Record<string, unknown>,
        createdAt: row.createdAt,
      }));
    }),
});
