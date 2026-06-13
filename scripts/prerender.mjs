import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist/public");
const templatePath = path.resolve(distDir, "index.html");

const routes = [
  "/",
  "/blog",
  "/tools",
  "/tools/finance",
  "/tools/health",
  "/tools/developer",
  "/tools/productivity",
  "/tools/ai",
  "/tools/education",
  "/tools/science",
  "/tools/travel",
  "/tools/ecommerce",
  "/tools/legal",
  "/tools/design",
  "/tools/language",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/knowledge",
  "/blueprints",
  "/opportunities",
];

async function prerender() {
  const template = fs.readFileSync(templatePath, "utf-8");

  const ssrEntryPath = path.resolve(__dirname, "../dist/server/ssr-entry.js");
  if (!fs.existsSync(ssrEntryPath)) {
    console.error("❌ ssr-entry.js 不存在於 dist/server/");
    process.exit(1);
  }

  const { render } = await import(ssrEntryPath);

  for (const route of routes) {
    const html = render(route);
    const fullHtml = template.replace(
      '<div id="root"></div>',
      `<div id="root">${html}</div>`
    );

    const outDir =
      route === "/"
        ? distDir
        : path.resolve(distDir, route.replace(/^\//, ""));

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.resolve(outDir, "index.html"), fullHtml);
    console.log(`✅ prerendered: ${route}`);
  }

  console.log("\n🎉 Prerender 完成！");
}

prerender().catch((e) => {
  console.error("❌ Prerender 失敗:", e);
  process.exit(1);
});
