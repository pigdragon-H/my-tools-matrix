// ============================================================
// Admin Router - 後台管理 tRPC 程序（需 admin 角色）
// ============================================================

import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { calculationHistory, users } from "../../drizzle/schema";

// Supabase 統計查詢（使用 REST API）
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";

async function supabaseFetch<T>(table: string, query: string): Promise<T | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export const adminRouter = router({
  /**
   * 工具使用統計總覽
   * 回傳：總計算次數、今日次數、活躍用戶數、最熱門工具
   */
  stats: adminProcedure.query(async () => {
    // 嘗試從 Supabase 取得統計
    const allRows = await supabaseFetch<Array<{ tool_id: string; category: string; user_id: number | null; created_at: string }>>(
      "calculation_history",
      "select=tool_id,category,user_id,created_at&order=created_at.desc&limit=10000"
    );

    if (allRows && allRows.length >= 0) {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const totalCount = allRows.length;
      const todayCount = allRows.filter(r => new Date(r.created_at) >= todayStart).length;
      const uniqueUsers = new Set(allRows.filter(r => r.user_id != null).map(r => r.user_id)).size;

      // 工具使用次數排行
      const toolCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};
      for (const row of allRows) {
        toolCounts[row.tool_id] = (toolCounts[row.tool_id] ?? 0) + 1;
        categoryCounts[row.category] = (categoryCounts[row.category] ?? 0) + 1;
      }

      const toolRanking = Object.entries(toolCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([toolId, count]) => ({ toolId, count }));

      const categoryBreakdown = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([category, count]) => ({ category, count }));

      // 最近 30 天每日趨勢
      const dailyTrend: Record<string, number> = {};
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      for (const row of allRows) {
        const d = new Date(row.created_at);
        if (d >= thirtyDaysAgo) {
          const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
          dailyTrend[key] = (dailyTrend[key] ?? 0) + 1;
        }
      }
      const trendData = Object.entries(dailyTrend)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count }));

      return {
        source: "supabase" as const,
        totalCount,
        todayCount,
        uniqueUsers,
        toolRanking,
        categoryBreakdown,
        trendData,
      };
    }

    // 備軌：MySQL
    const db = await getDb();
    if (!db) {
      return {
        source: "none" as const,
        totalCount: 0,
        todayCount: 0,
        uniqueUsers: 0,
        toolRanking: [],
        categoryBreakdown: [],
        trendData: [],
      };
    }

    const { sql, count, gte } = await import("drizzle-orm");
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalResult] = await db.select({ value: count() }).from(calculationHistory);
    const [todayResult] = await db
      .select({ value: count() })
      .from(calculationHistory)
      .where(gte(calculationHistory.createdAt, todayStart));

    const toolRows = await db
      .select({
        toolId: calculationHistory.toolId,
        count: count(),
      })
      .from(calculationHistory)
      .groupBy(calculationHistory.toolId)
      .orderBy(sql`count(*) desc`)
      .limit(20);

    const categoryRows = await db
      .select({
        category: calculationHistory.category,
        count: count(),
      })
      .from(calculationHistory)
      .groupBy(calculationHistory.category)
      .orderBy(sql`count(*) desc`);

    return {
      source: "mysql" as const,
      totalCount: totalResult?.value ?? 0,
      todayCount: todayResult?.value ?? 0,
      uniqueUsers: 0,
      toolRanking: toolRows.map(r => ({ toolId: r.toolId, count: Number(r.count) })),
      categoryBreakdown: categoryRows.map(r => ({ category: r.category, count: Number(r.count) })),
      trendData: [],
    };
  }),

  /**
   * 用戶列表（最近活躍）
   */
  users: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const { desc } = await import("drizzle-orm");
      const rows = await db
        .select()
        .from(users)
        .orderBy(desc(users.lastSignedIn))
        .limit(input.limit);

      return rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        isPremium: r.isPremium,
        createdAt: r.createdAt,
        lastSignedIn: r.lastSignedIn,
      }));
    }),

  /**
   * 最近計算記錄（跨用戶）
   */
  recentCalculations: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(30) }))
    .query(async ({ input }) => {
      // 優先 Supabase
      const rows = await supabaseFetch<Array<{
        id: number;
        tool_id: string;
        category: string;
        user_id: number | null;
        created_at: string;
      }>>(
        "calculation_history",
        `select=id,tool_id,category,user_id,created_at&order=created_at.desc&limit=${input.limit}`
      );

      if (rows) {
        return rows.map(r => ({
          id: r.id,
          toolId: r.tool_id,
          category: r.category,
          userId: r.user_id,
          createdAt: new Date(r.created_at),
        }));
      }

      // 備軌 MySQL
      const db = await getDb();
      if (!db) return [];

      const { desc } = await import("drizzle-orm");
      const dbRows = await db
        .select({
          id: calculationHistory.id,
          toolId: calculationHistory.toolId,
          category: calculationHistory.category,
          userId: calculationHistory.userId,
          createdAt: calculationHistory.createdAt,
        })
        .from(calculationHistory)
        .orderBy(desc(calculationHistory.createdAt))
        .limit(input.limit);

      return dbRows;
    }),
});
