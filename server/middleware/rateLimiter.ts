// ============================================================
// IP-Based Rate Limiter Middleware
// 基於記憶體的 IP 速率限制，防止惡意刷流量
// 生產環境建議改用 Redis 實現分散式速率限制
// ============================================================

import type { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store: IP -> { count, resetAt }
const ipStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  ipStore.forEach((entry, ip) => {
    if (entry.resetAt < now) {
      ipStore.delete(ip);
    }
  });
}, 5 * 60 * 1000);

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

/**
 * Creates a rate limiter middleware
 * @param maxRequests - Max requests per window
 * @param windowMs - Time window in milliseconds (default: 60s)
 */
export function createRateLimiter(maxRequests: number, windowMs = 60_000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const now = Date.now();
    const key = `${ip}:${req.path}`;

    const entry = ipStore.get(key);

    if (!entry || entry.resetAt < now) {
      // New window
      ipStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", 0);
      return res.status(429).json({
        error: "Too Many Requests",
        message: `請求過於頻繁，請 ${retryAfter} 秒後再試。`,
        retryAfter,
      });
    }

    entry.count++;
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", maxRequests - entry.count);
    return next();
  };
}

// Default rate limiter: 60 requests per minute
export const defaultRateLimiter = createRateLimiter(60);

// Strict rate limiter for tool calculations: 30 requests per minute
export const toolRateLimiter = createRateLimiter(30);
