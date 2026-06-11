#!/usr/bin/env node
import { mkdirSync, readFileSync, rmSync, writeFileSync, cpSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { compile, optimize } from "@tailwindcss/node";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "dist/public");
const assetsDir = join(outDir, "assets");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(assetsDir, { recursive: true });

cpSync(join(root, "client/public"), outDir, { recursive: true });

const cssInputPath = join(root, "client/src/index.css");
const cssInput = readFileSync(cssInputPath, "utf8");
const compiler = await compile(cssInput, {
  base: root,
  from: cssInputPath,
  onDependency() {},
});
const css = compiler.build([
  join(root, "client/index.html"),
  join(root, "client/src/**/*.{ts,tsx,js,jsx}"),
  join(root, "shared/**/*.{ts,tsx,js,jsx}"),
]);
const optimizedCss = optimize(css, { minify: false }).code;
writeFileSync(join(assetsDir, "index.css"), optimizedCss);

await esbuild({
  entryPoints: [join(root, "client/src/main.tsx")],
  bundle: true,
  splitting: true,
  format: "esm",
  outdir: assetsDir,
  entryNames: "index",
  chunkNames: "chunks/[name]-[hash]",
  assetNames: "assets/[name]-[hash]",
  platform: "browser",
  target: ["es2020"],
  jsx: "automatic",
  sourcemap: false,
  minify: false,
  legalComments: "none",
  logLevel: "info",
  mainFields: ["browser", "module", "main"],
  conditions: ["browser", "import", "default"],
  loader: {
    ".png": "file",
    ".jpg": "file",
    ".jpeg": "file",
    ".gif": "file",
    ".svg": "file",
    ".webp": "file",
    ".woff": "file",
    ".woff2": "file",
    ".ttf": "file",
    ".otf": "file",
  },
  alias: {
    "@": join(root, "client/src"),
    "@shared": join(root, "shared"),
    "@assets": join(root, "attached_assets"),
  },
  plugins: [
    {
      name: "ignore-source-css",
      setup(build) {
        build.onResolve({ filter: /^\.\/index\.css$/ }, () => ({ path: "ignore-source-css", namespace: "ignore-source-css" }));
        build.onLoad({ filter: /.*/, namespace: "ignore-source-css" }, () => ({ contents: "", loader: "js" }));
      },
    },
  ],
});

const html = readFileSync(join(root, "client/index.html"), "utf8")
  .replace(/<script[^>]+src="\/src\/main\.tsx"[^>]*><\/script>/, '<link rel="stylesheet" href="/assets/index.css">\n    <script type="module" src="/assets/index.js"></script>')
  .replace(/<script[^>]+src="\/assets\/index\.js"[^>]*><\/script>/, '<script type="module" src="/assets/index.js"></script>');
writeFileSync(join(outDir, "index.html"), html);

console.log(`✓ low-memory client build complete: ${outDir}`);
