import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
    // Several suites (docxToPdf, fontSetup) touch shared, process-global system
    // state: they install a fontconfig alias and run `fc-cache`. Running them in
    // parallel pools causes a race where the alias is mid-rewrite while another
    // suite probes it. Force a single, sequential worker so the font
    // environment is deterministic across the whole run.
    fileParallelism: false,
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true },
    },
  },
});
