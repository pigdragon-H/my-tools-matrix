/**
 * B3 — Font health observability tests.
 *
 * Verifies getFontHealth() exposes a queryable snapshot of the CJK font-alias
 * state, so silent degradation (a Windows font failing to map onto its
 * Kaiti/Mingti substitute) becomes observable via /healthz.
 */
import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { ensureCjkFonts, getFontHealth } from "./fontSetup";

function sofficeFontToolsAvailable(): boolean {
  try {
    execFileSync("fc-match", ["sans-serif"], { stdio: "ignore", timeout: 10_000 });
    return true;
  } catch {
    return false;
  }
}

describe("getFontHealth", () => {
  it("returns a well-formed snapshot with the documented shape", () => {
    const h = getFontHealth();
    expect(h).toHaveProperty("status");
    expect(["ok", "degraded", "unknown"]).toContain(h.status);
    expect(typeof h.installed).toBe("boolean");
    expect(typeof h.okCount).toBe("number");
    expect(typeof h.degradedCount).toBe("number");
    expect(typeof h.unknownCount).toBe("number");
    expect(Array.isArray(h.aliases)).toBe(true);
  });

  it("returns a defensive copy (mutating the result must not affect internal state)", () => {
    const a = getFontHealth();
    a.aliases.push({ requested: "X", resolved: "Y", status: "ok" });
    a.okCount = 9999;
    const b = getFontHealth();
    expect(b.okCount).not.toBe(9999);
    // internal aliases length is unaffected by mutating the returned copy
    expect(b.aliases.find((x) => x.requested === "X")).toBeUndefined();
  });

  it("reflects real alias resolution after ensureCjkFonts() when fc tools exist", async () => {
    if (!sofficeFontToolsAvailable()) {
      // eslint-disable-next-line no-console
      console.warn("[fontSetup.test] fontconfig tools not present — skipping live probe assertions.");
      return;
    }
    await ensureCjkFonts();
    const h = getFontHealth();
    expect(h.checkedAt).not.toBeNull();
    // After a probe, every verified family is accounted for in exactly one bucket.
    expect(h.okCount + h.degradedCount + h.unknownCount).toBe(h.aliases.length);
    expect(h.aliases.length).toBeGreaterThan(0);
    // Overall status must be consistent with the counts.
    if (h.degradedCount > 0) expect(h.status).toBe("degraded");
    else if (h.okCount > 0) expect(h.status).toBe("ok");
  });
});
