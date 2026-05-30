import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

/**
 * Root tRPC router — currently minimal.
 * Sub-routers (admin, articles, settings) will be added in later phases.
 */
export const appRouter = router({
  /** Health-check endpoint, anyone can call. */
  ping: publicProcedure.query(() => ({ ok: true, ts: Date.now() })),

  auth: router({
    /** Returns the current Supabase user (or null). */
    me: publicProcedure.query(({ ctx }) => ctx.user),
    /** Stub — actual signOut is client-side via supabase.auth.signOut(). */
    logout: protectedProcedure.mutation(() => ({ success: true } as const)),
  }),
});

export type AppRouter = typeof appRouter;
