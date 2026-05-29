import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT ?? 3000);
const publicDir = path.resolve(__dirname, "public");

app.disable("x-powered-by");

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use(express.static(publicDir, {
  index: false,
  maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
}));

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Formula Universe server listening on port ${port}`);
});
