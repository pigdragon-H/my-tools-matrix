import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      socket: { remoteAddress: "127.0.0.1" },
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("tools.list", () => {
  it("returns all tools from config", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const tools = await caller.tools.list();
    expect(tools.length).toBeGreaterThan(0);
    expect(tools[0]).toHaveProperty("id");
    expect(tools[0]).toHaveProperty("name");
    expect(tools[0]).toHaveProperty("isPremium");
  });
});

describe("tools.getById", () => {
  it("returns roi-calculator config", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const tool = await caller.tools.getById({ id: "roi-calculator" });
    expect(tool.id).toBe("roi-calculator");
    expect(tool.seoArticles.length).toBeGreaterThan(0);
  });

  it("throws error for unknown tool id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.tools.getById({ id: "nonexistent-tool" })).rejects.toThrow();
  });
});

describe("tools.saveResult", () => {
  it("gracefully handles missing DB", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tools.saveResult({
      toolId: "roi-calculator",
      inputParams: { monthlyAmount: 5000, annualReturn: 7, years: 10 },
      result: { totalInvested: 600000, finalValue: 869000 },
    });
    // Should succeed or gracefully degrade
    expect(result).toHaveProperty("success");
  });
});
