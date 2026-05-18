import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { toolsRouter } from "./routers/tools";
import { blogRouter } from "./routers/blog";
import { adminRouter } from "./routers/admin";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    // Returns the current user from Supabase JWT context
    me: publicProcedure.query((opts) => opts.ctx.user),
    // Logout is handled client-side via supabase.auth.signOut()
    // This endpoint is kept for compatibility but does nothing server-side
    logout: publicProcedure.mutation(() => {
      return { success: true } as const;
    }),
  }),
  tools: toolsRouter,
  blog: blogRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
