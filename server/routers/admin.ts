// ============================================================
// Admin Router — tRPC procedures for the admin dashboard.
// All endpoints require admin role.
// ============================================================
import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import { supabaseService } from "../lib/supabaseAdmin";
import { categories } from "../../shared/categoriesConfig";
import { getAllTools } from "../../shared/toolsConfig";

type ToolUsageRow = {
  tool_id: string;
  category: string;
  user_id: string | null;
  created_at: string;
};

/**
 * Try to read calculation history from Supabase; if the table doesn't exist
 * or service-role key isn't set, return an empty array gracefully.
 */
async function fetchUsageRows(limit = 5000): Promise<ToolUsageRow[]> {
  if (!supabaseService) return [];
  try {
    const { data, error } = await supabaseService
      .from("calculation_history")
      .select("tool_id,category,user_id,created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data ?? []) as ToolUsageRow[];
  } catch {
    return [];
  }
}

async function fetchUsersList(limit = 50) {
  if (!supabaseService) return [];
  try {
    const { data, error } = await supabaseService.auth.admin.listUsers({
      page: 1,
      perPage: limit,
    });
    if (error) return [];
    return data.users.map((u) => ({
      id: u.id,
      email: u.email ?? null,
      name: (u.user_metadata as any)?.full_name ?? null,
      role:
        ((u.app_metadata as any)?.role ?? (u.user_metadata as any)?.role ?? "user") as
          | "user"
          | "editor"
          | "admin",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
    }));
  } catch {
    return [];
  }
}

// Total tools/categories from static config (always available)
function getStaticCounts() {
  return {
    totalTools: getAllTools().length,
    totalCategories: categories.length,
  };
}

export const adminRouter = router({
  /**
   * Top-level stats overview.
   */
  stats: adminProcedure.query(async () => {
    const [usage, users] = await Promise.all([
      fetchUsageRows(5000),
      fetchUsersList(1000),
    ]);
    const { totalTools, totalCategories } = getStaticCounts();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const todayUsage = usage.filter((r) => r.created_at >= todayISO).length;
    const totalUsage = usage.length;

    const todayUsers = users.filter(
      (u) => u.createdAt && u.createdAt >= todayISO
    ).length;
    const totalUsers = users.length;

    return {
      totalTools,
      totalCategories,
      totalUsage,
      todayUsage,
      totalUsers,
      todayUsers,
    };
  }),

  /**
   * Tool usage ranking (top N).
   */
  toolRanking: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
    .query(async ({ input }) => {
      const usage = await fetchUsageRows(5000);
      const counts = new Map<string, { toolId: string; category: string; count: number }>();
      for (const row of usage) {
        const key = row.tool_id;
        const existing = counts.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          counts.set(key, {
            toolId: row.tool_id,
            category: row.category,
            count: 1,
          });
        }
      }
      return Array.from(counts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, input.limit);
    }),

  /**
   * Category usage distribution.
   */
  categoryDistribution: adminProcedure.query(async () => {
    const usage = await fetchUsageRows(5000);
    const counts = new Map<string, number>();
    for (const row of usage) {
      counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
    }
    return categories.map((cat) => ({
      key: cat.key,
      name: cat.name,
      nameEn: cat.nameEn,
      count: counts.get(cat.key) ?? 0,
    }));
  }),

  /**
   * Daily trend over last N days.
   */
  dailyTrend: adminProcedure
    .input(z.object({ days: z.number().min(1).max(90).default(30) }))
    .query(async ({ input }) => {
      const usage = await fetchUsageRows(10000);
      const now = new Date();
      const buckets = new Map<string, number>();
      for (let i = input.days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        buckets.set(key, 0);
      }
      for (const row of usage) {
        const key = row.created_at.slice(0, 10);
        if (buckets.has(key)) {
          buckets.set(key, (buckets.get(key) ?? 0) + 1);
        }
      }
      return Array.from(buckets.entries()).map(([date, count]) => ({
        date,
        count,
      }));
    }),

  /**
   * Recent calculations.
   */
  recentCalculations: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
    .query(async ({ input }) => {
      const usage = await fetchUsageRows(input.limit);
      return usage;
    }),

  /**
   * Recent users.
   */
  recentUsers: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
    .query(async ({ input }) => {
      const list = await fetchUsersList(input.limit);
      return list.slice(0, input.limit);
    }),
});
