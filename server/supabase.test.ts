// ============================================================
// Supabase 連線驗證測試
// 驗證 SUPABASE_URL 與 SUPABASE_ANON_KEY 環境變數是否正確設定
// ============================================================

import { describe, expect, it } from "vitest";
import { config } from "dotenv";

// 載入 .env 環境變數（測試環境）
config();

describe("Supabase environment variables", () => {
  it("SUPABASE_URL should be set and valid", () => {
    const url = process.env.SUPABASE_URL;
    expect(url).toBeTruthy();
    expect(url).toMatch(/^https:\/\/.+\.supabase\.co$/);
  });

  it("SUPABASE_ANON_KEY should be set and non-empty", () => {
    const key = process.env.SUPABASE_ANON_KEY;
    expect(key).toBeTruthy();
    expect(key!.length).toBeGreaterThan(10);
  });
});

describe("Supabase REST API connectivity", () => {
  it("should reach Supabase health endpoint", async () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn("Supabase env vars not set, skipping connectivity test");
      return;
    }

    // 呼叫 Supabase REST API 健康檢查（查詢 calculation_history 表，limit=0）
    const res = await fetch(`${url}/rest/v1/calculation_history?limit=0`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    // 200 = 表存在且可存取；404 = 表不存在；401 = key 無效
    expect([200, 206]).toContain(res.status);
  }, 10000); // 10s timeout for network call
});
