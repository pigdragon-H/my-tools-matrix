import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

const plugins = [react(), tailwindcss()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // ── Memory-footprint reductions for Railway hobby builds ──────────────
    // The client graph is large (3500+ modules across 340+ lazy tools). The
    // default Rollup pipeline (sourcemaps + high parallelism + monolithic
    // vendor chunk) pushes the build past the container heap limit and OOMs
    // (exit 134). The settings below trade a little build speed for a much
    // lower peak heap so the deploy succeeds.
    sourcemap: false,
    minify: "esbuild", // esbuild minifier uses far less memory than terser
    reportCompressedSize: false, // skip expensive gzip-size reporting pass
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      // Limit concurrent file operations to keep peak memory bounded.
      maxParallelFileOps: 2,
      output: {
        // Split heavy third-party libs into their own chunks so Rollup does
        // not have to hold one giant module graph in memory at once.
        //
        // IMPORTANT: react, react-dom, scheduler and the JSX runtime MUST stay
        // in ONE chunk. Splitting react-dom from react breaks load order and
        // throws "Cannot set properties of undefined (setting 'Activity')" with
        // React 19. So we group the whole React core together, and only split
        // self-contained heavy libraries that don't share React internals.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          // React core (react + react-dom + scheduler + jsx-runtime) -> one chunk
          if (
            /[\\/]node_modules[\\/](react|react-dom|scheduler|react-is|use-sync-external-store)[\\/]/.test(id) ||
            id.includes("react/jsx-runtime") ||
            id.includes("react/jsx-dev-runtime")
          ) {
            return "vendor-react";
          }
          if (id.includes("pdfmake")) return "vendor-pdfmake";
          if (id.includes("mammoth")) return "vendor-mammoth";
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("react-markdown") || id.includes("remark") || id.includes("streamdown")) return "vendor-markdown";
          // NOTE: do NOT separate @radix-ui — it depends heavily on React
          // internals and is safest bundled with the main vendor chunk.
          return "vendor";
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
