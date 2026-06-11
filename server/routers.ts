/* === SAFE ZONE START === */
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { adminRouter } from "./routers/admin";
import { settingsRouter } from "./routers/settings";
import { articlesRouter } from "./routers/articles";
import { newsletterRouter } from "./routers/newsletter";

export const appRouter = router({
  ping: publicProcedure.query(() => ({ ok: true, ts: Date.now() })),
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: protectedProcedure.mutation(() => ({ success: true } as const)),
  }),
  admin: adminRouter,
  settings: settingsRouter,
  articles: articlesRouter,
  newsletter: newsletterRouter,
});

export type AppRouter = typeof appRouter;
/* === SAFE ZONE END === */
