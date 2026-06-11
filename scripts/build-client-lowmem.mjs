#!/usr/bin/env node
import { mkdirSync, readFileSync, rmSync, writeFileSync, cpSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
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

const viteEnvDefine = {
  "import.meta.env": "{}",
  "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(process.env.VITE_SUPABASE_URL || ""),
  "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ""),
  "import.meta.env.VITE_ANALYTICS_ENDPOINT": JSON.stringify(process.env.VITE_ANALYTICS_ENDPOINT || ""),
  "import.meta.env.VITE_ANALYTICS_WEBSITE_ID": JSON.stringify(process.env.VITE_ANALYTICS_WEBSITE_ID || ""),
};

function walkFiles(dir, predicate, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walkFiles(full, predicate, out);
    else if (predicate(full)) out.push(full);
  }
  return out;
}

function normalizeSlash(v) {
  return v.split(sep).join("/");
}

function resolveGlobBase(importerDir, pattern) {
  const marker = "/**/";
  const i = pattern.indexOf(marker);
  const basePattern = i >= 0 ? pattern.slice(0, i) : dirname(pattern);
  return resolve(importerDir, basePattern);
}

function globKey(importerDir, filePath) {
  let rel = normalizeSlash(relative(importerDir, filePath));
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

function loaderForPath(filePath) {
  if (filePath.endsWith(".tsx")) return "tsx";
  if (filePath.endsWith(".jsx")) return "jsx";
  if (filePath.endsWith(".ts") || filePath.endsWith(".mts") || filePath.endsWith(".cts")) return "ts";
  return "js";
}

function expandImportMetaGlobRawEager(source, importerPath) {
  const importerDir = dirname(importerPath);
  return source.replace(
    /import\.meta\.glob\(\s*(["'])([^"']+\.md)\1\s*,\s*\{\s*query:\s*(["'])\?raw\3\s*,\s*import:\s*(["'])default\4\s*,\s*eager:\s*true\s*,?\s*\}\s*\)/g,
    (_match, _quote, pattern) => {
      const baseDir = resolveGlobBase(importerDir, pattern);
      const files = walkFiles(baseDir, (file) => file.endsWith(".md")).sort();
      const entries = files.map((file) => `${JSON.stringify(globKey(importerDir, file))}: ${JSON.stringify(readFileSync(file, "utf8"))}`);
      return `({${entries.join(",")}})`;
    }
  );
}

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
  define: viteEnvDefine,
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
      name: "vite-import-meta-glob-raw-eager",
      setup(build) {
        build.onLoad({ filter: /\.[cm]?[jt]sx?$/ }, (args) => {
          const source = readFileSync(args.path, "utf8");
          if (!source.includes("import.meta.glob")) return null;
          return {
            contents: expandImportMetaGlobRawEager(source, args.path),
            loader: loaderForPath(args.path),
          };
        });
      },
    },
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
