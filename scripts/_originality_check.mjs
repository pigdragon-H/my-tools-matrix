#!/usr/bin/env node
// 內部原創性自查：偵測本站知識文章彼此之間的高相似/逐字重複片段。
// 用法: node scripts/_originality_check.mjs
import fs from "fs";
import path from "path";

const ROOT = path.resolve("shared/knowledge");
const MIN_SHARED = 60; // 共同連續片段門檻(字)

function listMd(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listMd(p));
    else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

// 取 body(去 frontmatter)，去除 markdown 符號與空白，正規化做比對
function bodyOf(file) {
  const raw = fs.readFileSync(file, "utf8");
  const m = raw.split(/^---$/m);
  const body = m.length >= 3 ? m.slice(2).join("---") : raw;
  return body;
}
function normalize(s) {
  return s
    .replace(/```[\s\S]*?```/g, " ") // 去 code block(Prompt/架構圖)避免誤判
    .replace(/[#>*`\-\[\]()|/]/g, " ")
    .replace(/\s+/g, "")
    .trim();
}

// 找兩字串的最長共同連續子串(字元級, 滑動視窗近似:用 n-gram 集合交集判斷是否 >= MIN_SHARED)
function longestCommon(a, b) {
  // DP 太貴(字元數千)，改用 n-gram(長度=MIN_SHARED)雜湊：只要有一個 n-gram 完全相同即代表共同片段>=MIN_SHARED
  if (a.length < MIN_SHARED || b.length < MIN_SHARED) return 0;
  const set = new Set();
  for (let i = 0; i + MIN_SHARED <= a.length; i++) set.add(a.slice(i, i + MIN_SHARED));
  for (let i = 0; i + MIN_SHARED <= b.length; i++) {
    if (set.has(b.slice(i, i + MIN_SHARED))) return MIN_SHARED; // 達門檻即回報
  }
  return 0;
}

const files = listMd(ROOT);
const docs = files.map((f) => ({ file: f.replace(ROOT + "/", ""), norm: normalize(bodyOf(f)) }));

console.log(`掃描 ${docs.length} 篇知識文章，門檻=共同連續 ${MIN_SHARED} 字\n`);

let flagged = 0;
for (let i = 0; i < docs.length; i++) {
  for (let j = i + 1; j < docs.length; j++) {
    const hit = longestCommon(docs[i].norm, docs[j].norm);
    if (hit >= MIN_SHARED) {
      flagged++;
      console.log(`⚠️  可能重複片段(>=${MIN_SHARED}字)：`);
      console.log(`    A: ${docs[i].file}`);
      console.log(`    B: ${docs[j].file}\n`);
    }
  }
}

// 樣板開場句檢查：取每篇 body 第一句(前40字)，看是否逐字重複
const openers = {};
for (const d of docs) {
  const op = d.norm.slice(0, 40);
  (openers[op] = openers[op] || []).push(d.file);
}
let dupOpeners = 0;
for (const [op, fs2] of Object.entries(openers)) {
  if (fs2.length > 1) {
    dupOpeners++;
    console.log(`⚠️  樣板開場逐字重複(前40字相同)：${fs2.join(", ")}`);
  }
}

console.log(`\n=== 結果 ===`);
console.log(`高相似片段對數: ${flagged}`);
console.log(`逐字重複開場: ${dupOpeners}`);
if (flagged === 0 && dupOpeners === 0) {
  console.log("✅ 內部查重通過：無 >=60 字共同片段、無逐字重複開場。");
  process.exit(0);
} else {
  console.log("❌ 內部查重未過：請改寫被標記內容。");
  process.exit(1);
}
