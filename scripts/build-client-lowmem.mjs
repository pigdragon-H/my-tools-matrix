#!/usr/bin/env node
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { compile, optimize } from "@tailwindcss/node";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "dist/public");
const assetsDir = join(outDir, "assets");

function collectMarkdownFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const absolutePath = join(dir, entry);
    const stat = statSync(absolutePath);
    if (stat.isDirectory()) {
      files.push(...collectMarkdownFiles(absolutePath));
    } else if (entry.endsWith(".md")) {
      files.push(absolutePath);
    }
  }
  return files.sort();
}

function moduleKeyFromAbsolutePath(absolutePath, laneDir) {
  const normalized = absolutePath.split("\\").join("/");
  const marker = `/shared/${laneDir}/`;
  const index = normalized.indexOf(marker);
  const relative = index >= 0 ? normalized.slice(index + 1) : normalized;
  return `../../../${relative}`;
}

function rawMarkdownGlobObject(laneDir) {
  const dir = join(root, "shared", laneDir);
  const entries = collectMarkdownFiles(dir).map((absolutePath) => {
    const key = moduleKeyFromAbsolutePath(absolutePath, laneDir);
    const raw = readFileSync(absolutePath, "utf8");
    return `${JSON.stringify(key)}: ${JSON.stringify(raw)}`;
  });
  return `({${entries.join(",")}})`;
}

const markdownGlobReplacements = new Map([
  ["../../../shared/articles/**/*.md", rawMarkdownGlobObject("articles")],
  ["../../../shared/blueprints/**/*.md", rawMarkdownGlobObject("blueprints")],
  ["../../../shared/opportunities/**/*.md", rawMarkdownGlobObject("opportunities")],
  ["../../../shared/knowledge/**/*.md", rawMarkdownGlobObject("knowledge")],
]);

function replaceViteRawMarkdownGlobs(source) {
  return source.replace(
    /import\.meta\.glob\(\s*(["'])(\.\.\/\.\.\/\.\.\/shared\/(?:articles|blueprints|opportunities|knowledge)\/\*\*\/\*\.md)\1\s*,\s*\{\s*query:\s*["']\?raw["']\s*,\s*import:\s*["']default["']\s*,\s*eager:\s*true\s*,?\s*\}\s*\)/g,
    (_match, _quote, globPattern) => markdownGlobReplacements.get(globPattern) ?? "({})"
  );
}

function viteEnvDefineValue(name) {
  const value = process.env[name];
  return value === undefined ? "undefined" : JSON.stringify(value);
}

function contentHash(contents) {
  return createHash("sha256").update(contents).digest("hex").slice(0, 8);
}

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
const cssFileName = `index-${contentHash(optimizedCss)}.css`;
writeFileSync(join(assetsDir, cssFileName), optimizedCss);

await esbuild({
  entryPoints: [join(root, "client/src/main.tsx")],
  bundle: true,
  splitting: true,
  format: "esm",
  outdir: assetsDir,
  entryNames: "index-[hash]",
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
  define: {
    "import.meta.env.VITE_SUPABASE_URL": viteEnvDefineValue("VITE_SUPABASE_URL"),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": viteEnvDefineValue("VITE_SUPABASE_ANON_KEY"),
    "import.meta.env.VITE_ANALYTICS_ENDPOINT": viteEnvDefineValue("VITE_ANALYTICS_ENDPOINT"),
    "import.meta.env.VITE_ANALYTICS_WEBSITE_ID": viteEnvDefineValue("VITE_ANALYTICS_WEBSITE_ID"),
  },
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
      name: "vite-raw-markdown-glob",
      setup(build) {
        build.onLoad({ filter: /client\/src\/lib\/(staticArticles|laneContent)\.ts$/ }, (args) => ({
          contents: replaceViteRawMarkdownGlobs(readFileSync(args.path, "utf8")),
          loader: "ts",
        }));
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

const entryFileName = readdirSync(assetsDir).find((fileName) => /^index-[A-Za-z0-9_-]+\.js$/.test(fileName));
if (!entryFileName) {
  throw new Error("Unable to locate hashed client entry in build output");
}

const html = readFileSync(join(root, "client/index.html"), "utf8")
  .replace(
    /<script[^>]+src="\/src\/main\.tsx"[^>]*><\/script>/,
    `<link rel="stylesheet" href="/assets/${cssFileName}">\n    <script type="module" src="/assets/${entryFileName}"></script>`
  )
  .replace(/<script[^>]+src="\/assets\/index(?:-[A-Za-z0-9_-]+)?\.js"[^>]*><\/script>/, `<script type="module" src="/assets/${entryFileName}"></script>`);
writeFileSync(join(outDir, "index.html"), html);

console.log(`✓ low-memory client build complete: ${outDir}`);
