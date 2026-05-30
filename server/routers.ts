import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { adminRouter } from "./routers/admin";

/**
 * Root tRPC router.
 * Sub-routers: admin (Phase C+), articles (Phase E), settings (Phase D).
 */
export const appRouter = router({
  /** Health-check endpoint, anyone can call. */
  ping: publicProcedure.query(() => ({ ok: true, ts: Date.now() })),

  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: protectedProcedure.mutation(() => ({ success: true } as const)),
  }),

  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
