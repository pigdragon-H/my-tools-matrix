// 本地展示站 — SPA fallback 支援,給黃金校正視覺 QC 用
import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

const ROOT = path.resolve("dist/public");
const PORT = Number(process.env.PORT || 5174);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".webp": "image/webp",
  ".ico":  "image/x-icon",
  ".woff2":"font/woff2",
  ".txt":  "text/plain; charset=utf-8",
  ".xml":  "application/xml; charset=utf-8",
};

http.createServer((req, res) => {
  const u = url.parse(req.url || "/");
  let p = decodeURIComponent(u.pathname || "/");
  if (p.endsWith("/")) p += "index.html";
  let abs = path.join(ROOT, p);
  if (!abs.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.stat(abs, (err, st) => {
    if (err || !st.isFile()) {
      // SPA fallback
      abs = path.join(ROOT, "index.html");
    }
    fs.readFile(abs, (e, buf) => {
      if (e) { res.writeHead(500); return res.end(String(e)); }
      const ext = path.extname(abs).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(buf);
    });
  });
}).listen(PORT, "0.0.0.0", () => {
  console.log(`[preview] http://localhost:${PORT}/`);
});
