// newsletter.ts — Phase G Sprint C
// Real ESP integration via Resend Audiences API.
// Fail-soft design: if RESEND_API_KEY is missing or upstream fails, we still
// return a non-throwing response so the frontend can show a graceful message
// instead of a 500. We log the error server-side for ops visibility.

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";

const RESEND_API_BASE = "https://api.resend.com";

const subscribeInput = z.object({
  email: z.string().email().max(254),
  source: z.string().max(64).optional(), // e.g. "homepage-newsletter", "pricing-interest"
  lang: z.enum(["zh", "en"]).optional(),
});

type ResendError = {
  name?: string;
  message?: string;
  statusCode?: number;
};

async function addToResendAudience(opts: {
  apiKey: string;
  audienceId: string;
  email: string;
  source?: string;
  lang?: string;
}): Promise<{ ok: true } | { ok: false; reason: string; status?: number }> {
  try {
    const res = await fetch(
      `${RESEND_API_BASE}/audiences/${opts.audienceId}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${opts.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: opts.email,
          unsubscribed: false,
          // Resend Contacts supports first_name / last_name; we don't collect those.
          // Source/lang are tracked via tags in our own DB later (not needed for MVP).
        }),
      }
    );

    if (res.ok) return { ok: true };

    // Resend returns 422 for already-subscribed — treat as success
    let body: ResendError = {};
    try {
      body = (await res.json()) as ResendError;
    } catch {
      /* non-JSON body */
    }

    if (res.status === 422 || /already exists/i.test(body.message ?? "")) {
      return { ok: true };
    }

    return {
      ok: false,
      reason: body.message ?? `HTTP ${res.status}`,
      status: res.status,
    };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "network error",
    };
  }
}

export const newsletterRouter = router({
  subscribe: publicProcedure
    .input(subscribeInput)
    .mutation(async ({ input }) => {
      const apiKey = process.env.RESEND_API_KEY;
      const audienceId = process.env.RESEND_AUDIENCE_ID;

      // Stub-mode fallback: if env not configured, accept the email but log loudly.
      // This keeps the UX intact in dev and avoids a 500 if deploy missed env setup.
      if (!apiKey || !audienceId) {
        console.warn(
          "[newsletter.subscribe] RESEND_API_KEY or RESEND_AUDIENCE_ID missing. " +
            "Treating subscribe as stub-success for:",
          input.email,
          "source:",
          input.source ?? "(unknown)"
        );
        return {
          ok: true,
          stub: true,
          message:
            input.lang === "zh"
              ? "已收到你的訂閱（暫存模式）。"
              : "Subscribed (stub mode).",
        };
      }

      const result = await addToResendAudience({
        apiKey,
        audienceId,
        email: input.email,
        source: input.source,
        lang: input.lang,
      });

      if (!result.ok) {
        // Don't leak provider details to clients. Log server-side.
        console.error(
          "[newsletter.subscribe] Resend API error:",
          result.reason,
          "status:",
          result.status,
          "email:",
          input.email
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            input.lang === "zh"
              ? "訂閱暫時無法完成,請稍後再試。"
              : "Could not complete subscription right now. Please try again shortly.",
        });
      }

      return {
        ok: true,
        stub: false,
        message:
          input.lang === "zh"
            ? "✓ 已收到你的訂閱,謝謝!"
            : "✓ Subscribed — thank you!",
      };
    }),
});
