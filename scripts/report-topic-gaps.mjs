// ============================================================
// report-topic-gaps.mjs — 讀取 shared/aiTopics.ts 的 relations 欄位，
// 主動列出哪些 topic 還缺哪一軸的內容。
//
// 這支工具補上 aiTopics.ts 原本設計要有、但一直沒人真的做出來的
// 「主動缺口偵測」功能——之前這份登記表只有「登記存在與否」被驗證
// 腳本強制檢查，relations 裡的空陣列雖然代表缺口，但沒有任何工具
// 主動讀取並報告，只能靠人工打開檔案自己看。
//
// 用法：node scripts/report-topic-gaps.mjs
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const text = fs.readFileSync(path.join(ROOT, 'shared/aiTopics.ts'), 'utf8');

// 用大括號配對，把 AI_TOPICS 陣列裡每一個 topic 物件的原始文字區塊切出來，
// 比單純逐行 regex 更不容易因為欄位順序或格式微調而漏抓。
function splitTopicBlocks(src) {
  const startIdx = src.indexOf('export const AI_TOPICS');
  const body = src.slice(startIdx);
  const blocks = [];
  let depth = 0;
  let blockStart = -1;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '{') {
      if (depth === 0) blockStart = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && blockStart !== -1) {
        blocks.push(body.slice(blockStart, i + 1));
        blockStart = -1;
      }
    }
  }
  // 第一個抓到的區塊是最外層陣列本身包住的東西太大，改用更精準策略：
  // 直接抓每個 "topicId:" 開頭到下一個 "topicId:" 之間的區塊。
  return body
    .split(/(?=\n {2}\{\n {4}topicId:)/)
    .filter((b) => b.includes('topicId:'));
}

function extractField(block, fieldPattern) {
  const m = block.match(fieldPattern);
  return m ? m[1] : null;
}

function extractArray(block, key) {
  const re = new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`);
  const m = block.match(re);
  if (!m) return null;
  const inner = m[1].trim();
  if (!inner) return [];
  return inner.split(',').map((s) => s.replace(/["']/g, '').trim()).filter(Boolean);
}

const blocks = splitTopicBlocks(text);
const gaps = [];

for (const block of blocks) {
  const topicId = extractField(block, /topicId:\s*"([^"]+)"/);
  if (!topicId) continue;
  const nameZh = extractField(block, /name:\s*\{\s*zh:\s*"([^"]+)"/);

  const relationsMatch = block.match(/relations:\s*\{([\s\S]*?)\n {4}\},/);
  const relationsBlock = relationsMatch ? relationsMatch[1] : '';
  const blueprints = extractArray(relationsBlock, 'blueprints') ?? [];
  const knowledge = extractArray(relationsBlock, 'knowledge') ?? [];
  const opportunities = extractArray(relationsBlock, 'opportunities') ?? [];

  const missing = [];
  if (blueprints.length === 0) missing.push('blueprints');
  if (knowledge.length === 0) missing.push('knowledge');
  if (opportunities.length === 0) missing.push('opportunities');

  if (missing.length > 0) {
    gaps.push({ topicId, nameZh: nameZh || '(未命名)', missing });
  }
}

console.log(`已登記 topic 總數：${blocks.length}`);
console.log(`有缺口的 topic 數：${gaps.length}\n`);

if (gaps.length === 0) {
  console.log('目前所有已登記 topic 三軸皆已覆蓋，無缺口。');
} else {
  console.log('缺口清單：');
  for (const g of gaps) {
    console.log(`- [${g.topicId}] ${g.nameZh} — 缺：${g.missing.join('、')}`);
  }
}
