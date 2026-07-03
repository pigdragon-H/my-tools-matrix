#!/usr/bin/env node
// ============================================================
// validate-ai-three-axes — AI 三主軸 P0 量產前驗證器
// ============================================================
// Checks: topic registry, frontmatter closed-loop fields, relation slugs,
// CTA/content type consistency, opportunity escalation state, H1/H2 structure.
// ============================================================
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LANES = [
  { laneId: 'blueprints', dir: 'shared/blueprints', contentType: 'blueprint', minH2: 5 },
  { laneId: 'knowledge', dir: 'shared/knowledge', contentType: 'knowledge', minH2: 8 },
  { laneId: 'opportunities', dir: 'shared/opportunities', contentType: 'opportunity', minH2: 4 },
];
const VALID_STATUS = new Set(['draft', 'seed', 'active', 'validated', 'deprecated']);
const VALID_CTA = new Set(['blueprint_checklist', 'knowledge_next_question', 'opportunity_tracking', 'premium_template', 'newsletter']);
const VALID_L4_STATUS = new Set(['watch', 'caution', 'knowledge', 'blueprint-pending', 'blueprint-ready']);
const DERIVES_BLUEPRINT_CANDIDATE = new Set(['blueprint-pending', 'blueprint-ready']);
const EXPECTED_CTA = {
  blueprint: 'blueprint_checklist',
  knowledge: 'knowledge_next_question',
  opportunity: 'opportunity_tracking',
};

function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((ent) => {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) return walk(p);
    return ent.isFile() && ent.name.endsWith('.md') ? [p] : [];
  });
}

function splitFrontmatter(text) {
  const m = text.replace(/^\uFEFF/, '').match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { metaText: '', body: text };
  return { metaText: m[1], body: text.slice(m[0].length) };
}

function splitTopLevel(s, sep = ',') {
  const res = [];
  let depth = 0;
  let quote = null;
  let cur = '';
  for (const ch of s) {
    if (quote) {
      if (ch === quote) quote = null;
      cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
    } else if (ch === '{' || ch === '[') {
      depth++;
      cur += ch;
    } else if (ch === '}' || ch === ']') {
      depth--;
      cur += ch;
    } else if (ch === sep && depth === 0) {
      res.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) res.push(cur);
  return res;
}

function stripQuotes(s) {
  return s.trim().replace(/^["']|["']$/g, '');
}

function parseValue(raw) {
  const val = raw.trim();
  if (val.startsWith('[') && val.endsWith(']')) {
    const inner = val.slice(1, -1).trim();
    if (!inner) return [];
    return splitTopLevel(inner).map(stripQuotes);
  }
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val.startsWith('{') && val.endsWith('}')) return val;
  return stripQuotes(val);
}

function parseMeta(metaText) {
  const out = {};
  for (const line of metaText.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!value) continue;
    out[key] = parseValue(value);
  }
  return out;
}

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v) return [v];
  return [];
}

function loadTopicIds() {
  const file = path.join(ROOT, 'shared/aiTopics.ts');
  const text = fs.readFileSync(file, 'utf8');
  return new Set([...text.matchAll(/topicId:\s*"([^"]+)"/g)].map((m) => m[1]));
}

function loadTaskCardTopicIds() {
  const file = path.join(ROOT, 'docs/task-cards/registry.json');
  if (!fs.existsSync(file)) return null; // registry 不存在時回傳 null，區分「沒有登記表」與「有登記表但這篇沒登記」
  const registry = JSON.parse(fs.readFileSync(file, 'utf8'));
  return new Set((registry.cards || []).map((c) => c.topicId));
}

const errors = [];
const warnings = [];
const topicIds = loadTopicIds();
const taskCardTopicIds = loadTaskCardTopicIds();
const slugByLane = new Map();
const records = [];

for (const lane of LANES) {
  const files = walk(lane.dir);
  const slugs = new Set();
  for (const file of files) {
    const slug = path.basename(file, '.md');
    slugs.add(slug);
    const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const { metaText, body } = splitFrontmatter(text);
    const meta = parseMeta(metaText);
    records.push({ lane, file, slug, meta, body });
  }
  slugByLane.set(lane.laneId, slugs);
}

// 跨賽道 topicId 對照表：同一個 topicId 出現在 opportunities/knowledge/blueprints
// 不同賽道的檔案裡，代表這是同一條「主題線」沿著金字塔往上晉升的血緣證據
// （見 shared/opportunities/ai-niche-tool-site-opportunity.md 與
//  shared/blueprints/ai-niche-tool-site-blueprint.md 共用 T-AI-BP-0001 的既有實例）。
const topicIdBySlugLane = new Map();
for (const rec of records) {
  topicIdBySlugLane.set(`${rec.lane.laneId}:${rec.slug}`, rec.meta.topicId);
}

// 量產手冊第四章 L3 紅線關鍵字：出現不代表自動退件，但必須觸發審核警報，
// 提醒撰寫者這個主題是否已經越界成創業藍圖，不該留在知識庫當一般方法論文章。
const L3_REDLINE_KEYWORDS = [
  '收入模式', '獲利', 'MVP', '估值', '護城河', '商業模式', '創業',
  '顧問服務', '代營運', '定價', '變現', '客群', '產品路線', '公司建立',
  'SaaS 指南', 'affiliate 攻略',
];

// 量產手冊第五章明列的模板式開場，會讓大量文章讀起來像同一個人寫的，
// 是「去機械化、使用人類流暢筆法」這條風格要求最容易踩到的坑。
// 原本只套用在知識庫賽道，這次擴大到機會情報與創業藍圖，理由是這條風格要求
// 本來就不是知識庫獨有，是全站寫作的共同標準。
const CLICHE_OPENINGS = [
  '在當今快速發展的數位時代', '隨著人工智慧的快速發展', '本文將深入探討',
];

// OPPORTUNITY_INTELLIGENCE_PIPELINE.md 第10.7節黑名單：公開發布的機會情報
// 不得出現內部協作工具/團隊代號，這是已經拍板的剛性規範，這裡是把它從「寫在
// 文件裡」變成「程式碼真的擋」，不是新決策。
const INTERNAL_TOOL_NAMES = ['Manus', 'SuperNinja'];

// OPPORTUNITY_INTELLIGENCE_PIPELINE.md 第九節：加密貨幣/投機性金融商品排除，
// 理想上應該在蒐集階段就過濾掉，這裡是收尾的防線（defense in depth），
// 用來抓萬一漏網、已經寫進正式文章的狀況。
const CRYPTO_KEYWORDS = [
  '加密貨幣', '比特幣', 'Bitcoin', '以太坊', 'NFT', '空氣幣', '跟單交易', '交易訊號',
];

function checkClicheOpening(file, body) {
  const openingText = body.slice(0, 300);
  const hits = CLICHE_OPENINGS.filter((c) => openingText.includes(c));
  if (hits.length > 0) {
    err(file, `opening uses a templated cliché phrase: ${hits.join('、')} — rewrite to open on the reader's actual decision point (量產手冊 §5，全站適用)`);
  }
}

function err(file, msg) { errors.push(`${file}: ${msg}`); }
function warn(file, msg) { warnings.push(`${file}: ${msg}`); }

for (const rec of records) {
  const { lane, file, slug, meta, body } = rec;
  for (const key of ['id', 'title', 'description', 'publishedAt', 'contentType', 'topicId', 'operatingStatus', 'ctaType']) {
    if (meta[key] === undefined || meta[key] === '') err(file, `missing required frontmatter '${key}'`);
  }
  if (meta.id && meta.id !== slug) warn(file, `id '${meta.id}' differs from slug '${slug}'`);
  if (meta.contentType !== lane.contentType) err(file, `contentType must be '${lane.contentType}', got '${meta.contentType}'`);
  if (meta.topicId && !topicIds.has(meta.topicId)) err(file, `topicId '${meta.topicId}' not found in shared/aiTopics.ts`);
  if (meta.topicId && taskCardTopicIds && !taskCardTopicIds.has(meta.topicId)) {
    warn(file, `topicId '${meta.topicId}' has no matching entry in docs/task-cards/registry.json; this is debt-tracking only (${records.length} pre-existing articles predate the registry), not yet a hard gate — see 05-knowledge.md §十`);
  }
  if (meta.operatingStatus && !VALID_STATUS.has(meta.operatingStatus)) err(file, `invalid operatingStatus '${meta.operatingStatus}'`);
  if (meta.ctaType && !VALID_CTA.has(meta.ctaType)) err(file, `invalid ctaType '${meta.ctaType}'`);
  if (meta.ctaType && meta.ctaType !== EXPECTED_CTA[lane.contentType]) warn(file, `ctaType '${meta.ctaType}' differs from default '${EXPECTED_CTA[lane.contentType]}'`);
  if (asArray(meta.signal).length === 0) err(file, `signal must contain at least one item`);
  if (asArray(meta.output).length === 0) err(file, `output must contain at least one item`);

  const h1Count = (body.match(/^#\s+/gm) || []).length;
  const h2Count = (body.match(/^##\s+/gm) || []).length;
  if (h1Count > 1) err(file, `body has duplicate H1 headings (${h1Count})`);
  if (h2Count < lane.minH2) err(file, `body has too few H2 headings (${h2Count}); minimum is ${lane.minH2}`);

  const relBlueprints = asArray(meta.relatedBlueprints);
  const relKnowledge = asArray(meta.relatedKnowledge);
  const relOpportunities = asArray(meta.relatedOpportunities);
  for (const s of relBlueprints) if (!slugByLane.get('blueprints').has(s)) err(file, `relatedBlueprints slug not found: ${s}`);
  for (const s of relKnowledge) if (!slugByLane.get('knowledge').has(s)) err(file, `relatedKnowledge slug not found: ${s}`);
  for (const s of relOpportunities) if (!slugByLane.get('opportunities').has(s)) err(file, `relatedOpportunities slug not found: ${s}`);

  const relationCount = relBlueprints.length + relKnowledge.length + relOpportunities.length;
  if (relationCount === 0) err(file, `must have at least one cross-axis relation`);
  if (lane.laneId === 'blueprints' && relKnowledge.length + relOpportunities.length === 0) err(file, `blueprint must link to knowledge or opportunity`);
  if (lane.laneId === 'knowledge' && relBlueprints.length + relOpportunities.length === 0) err(file, `knowledge must link to blueprint or opportunity`);
  if (lane.laneId === 'opportunities') {
    if (!meta.domain || typeof meta.domain !== 'string' || !meta.domain.trim()) {
      err(file, `opportunity must define domain (non-empty string)`);
    }
    if (!VALID_L4_STATUS.has(meta.l4Status)) {
      err(file, `opportunity l4Status must be one of ${[...VALID_L4_STATUS].join('/')}; got "${meta.l4Status}"`);
    }
    const rating = Number(meta.fuRating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      err(file, `opportunity fuRating must be an integer 1-5; got "${meta.fuRating}"`);
    }
    if (meta.blueprintCandidate === undefined) err(file, `opportunity must define blueprintCandidate`);
    if (
      meta.blueprintCandidate !== undefined &&
      VALID_L4_STATUS.has(meta.l4Status) &&
      meta.blueprintCandidate !== DERIVES_BLUEPRINT_CANDIDATE.has(meta.l4Status)
    ) {
      warn(file, `blueprintCandidate (${meta.blueprintCandidate}) does not match value derived from l4Status "${meta.l4Status}"; run deriveBlueprintCandidate() and reconcile`);
    }
    if (relKnowledge.length === 0) err(file, `opportunity must link to at least one knowledge item`);

    // 金字塔第一段血緣：l4Status 已晉升到 knowledge 以上，代表這條情報線宣稱
    // 已經有對應的知識庫文章存在（必要條件），此時應該用 topicId 對齊來讓這個
    // 宣稱在資料層級可被追溯，而不是只寫在 relatedKnowledge 裡當一般性連結。
    // 注意：這條規則不反過來要求「每條機會情報都要有知識庫文章」——多數情報卡
    // 本該停在 watch，下層是上層的必要條件，不是充分條件，這裡只檢查「宣稱已晉升」
    // 的那些卡片，血緣是否真的對得上。
    const PROMOTED_L4 = new Set(['knowledge', 'blueprint-pending', 'blueprint-ready']);
    if (PROMOTED_L4.has(meta.l4Status) && relKnowledge.length > 0 && meta.topicId) {
      const threaded = relKnowledge.some((s) => topicIdBySlugLane.get(`knowledge:${s}`) === meta.topicId);
      if (!threaded) {
        warn(file, `l4Status is "${meta.l4Status}" (promoted past watch) but none of relatedKnowledge [${relKnowledge.join(', ')}] share this card's topicId (${meta.topicId}); if this is the same topic thread graduating into a knowledge article, align the topicId — otherwise this is just a related-content link, not a pyramid lineage link`);
      }
    }
    if (meta.blueprintCandidate === true && relBlueprints.length === 0) warn(file, `blueprintCandidate=true but no relatedBlueprints; ensure validationNotes explains the gap`);

    // 黑名單詞彙（OPPORTUNITY_INTELLIGENCE_PIPELINE.md §10.7）：這是既定規範，
    // 這裡是把它從文件變成程式碼真的擋，不是新決策。
    const hitInternal = INTERNAL_TOOL_NAMES.filter((kw) => body.includes(kw));
    if (hitInternal.length > 0) {
      err(file, `opportunity article must not name internal collaboration tools: ${hitInternal.join('、')} — replace with generic "AI agent" per OPPORTUNITY_INTELLIGENCE_PIPELINE.md §10.7`);
    }

    // 加密貨幣/投機性金融商品排除（同文件第九節）：理想上該在蒐集階段就濾掉，
    // 這裡是收尾防線，抓漏網之魚，降級為警告，因為可能是合理引用（如評測反詐騙案例）。
    const hitCrypto = CRYPTO_KEYWORDS.filter((kw) => body.includes(kw));
    if (hitCrypto.length > 0) {
      warn(file, `opportunity article mentions crypto/speculative-trading terms: ${hitCrypto.join('、')} — confirm this wasn't supposed to be excluded at collection time per OPPORTUNITY_INTELLIGENCE_PIPELINE.md §9`);
    }

    // 去機械化：這條風格要求不是知識庫獨有，機會情報同樣適用。
    checkClicheOpening(file, body);

    // AI視角區塊：Victor 2026-07-03 裁定，機會情報是決策備忘，但要在情報本體
    // 下方加一段 300-500 字的 AI 短評（產業/世代意義、效率提升、對使用者的幫助、
    // 未來展望），讓乏味的情報有活性，也讓頁面內容量足以撐起 AdSense。
    // 更關鍵的是：這段短評必須包含一個訪客真的看得到、點得下去的知識庫連結，
    // 這才是「觸發連結訊號」——relatedKnowledge 只是 frontmatter 裡的隱形欄位，
    // 訪客看不到，不構成這條規則要的東西。
    const aiPerspectiveMatch = body.match(/##\s*.*AI視角/);
    if (!aiPerspectiveMatch) {
      err(file, `opportunity article must include an "AI視角" commentary section (300-500 chars, ending with a visible link to a related knowledge article) per Victor's 2026-07-03 decision`);
    } else {
      const startIdx = body.indexOf(aiPerspectiveMatch[0]);
      const afterHeading = body.slice(startIdx + aiPerspectiveMatch[0].length);
      const nextH2Idx = afterHeading.search(/^##\s/m);
      const section = nextH2Idx === -1 ? afterHeading : afterHeading.slice(0, nextH2Idx);
      // 字數只算敘述文字，排除連結語法本身，避免連結長度灌水湊字數。
      const charCount = section.replace(/\s/g, '').replace(/\[[^\]]*\]\([^)]*\)/g, '').length;
      if (charCount < 300 || charCount > 500) {
        err(file, `AI視角 section is ${charCount} chars (excluding link markup); must be 300-500 chars per Victor's 2026-07-03 decision`);
      }
      const linkMatch = section.match(/\[[^\]]+\]\(\/knowledge\/([^)]+)\)/);
      if (!linkMatch) {
        err(file, `AI視角 section must contain a visible markdown link to a knowledge article, e.g. [標題](/knowledge/slug) — this is the reader-facing trigger-link signal, not the invisible relatedKnowledge frontmatter field`);
      } else if (!relKnowledge.includes(linkMatch[1])) {
        warn(file, `AI視角 visible link points to /knowledge/${linkMatch[1]} but that slug isn't in this article's relatedKnowledge frontmatter [${relKnowledge.join(', ')}]; keep the visible link and the frontmatter relation in sync`);
      }
    }
  }
  if (lane.laneId === 'knowledge') {
    // 對應 docs/AI知識庫量產必讀手冊（Victor 2026-07-02 提供之主權威文件）第五、七章，
    // 並取代 docs/qc-manuals/05-knowledge.md 原引用的舊萃取版本。
    const charCount = body.replace(/\s/g, '').length;
    if (charCount < 3000) {
      err(file, `knowledge article body under 3000 chars (${charCount}); hard gate per 量產手冊 §7`);
    }

    // 標點不寫死：已知同批文章曾混用「讀完後。先問自己」（句號）與
    // 「讀完後，先問自己」（逗號）兩種寫法，偵測時只認兩個詞相鄰出現，不綁死中間標點。
    const selfQuestionRegex = /讀完後.{0,2}先問自己/g;
    const selfQuestionHits = (body.match(selfQuestionRegex) || []).length;
    if (selfQuestionHits !== 1) {
      err(file, `knowledge article must contain exactly one "❓ 讀完後，先問自己這幾個問題" section (found ${selfQuestionHits}); hard gate per 量產手冊 §5/§7`);
    } else {
      const headingIdx = body.search(selfQuestionRegex);
      const closingMatch = body.slice(headingIdx).match(/^##\s*結語/m);
      const section = closingMatch
        ? body.slice(headingIdx, headingIdx + closingMatch.index)
        : body.slice(headingIdx);
      const boldQuestions = section.match(/\*\*[^*]+？\*\*/g) || [];
      if (boldQuestions.length !== 3) {
        err(file, `self-question section must contain exactly 3 bold questions (found ${boldQuestions.length}); per 量產手冊 §5 "每題應是粗體問題"`);
      }
      const guidedHits = (section.match(/引導思路/g) || []).length;
      if (guidedHits < boldQuestions.length) {
        err(file, `each self-question must carry a "引導思路" guiding sentence (found ${guidedHits} for ${boldQuestions.length} questions); per 量產手冊 §5`);
      }
      if (!closingMatch) {
        warn(file, `self-question section should be immediately followed by a "結語" closing section`);
      }
    }

    if (!/^\s*\|/m.test(body)) err(file, `knowledge article must include at least one table (量產手冊 §5 結構要求)`);
    if (!/[┌┐└┘├┤┬┴┼─│▶►→↓↑]/.test(body)) err(file, `knowledge article must include a box-drawing structure diagram (量產手冊 §5 結構要求)`);

    // L3 紅線：出現這些詞不代表自動退件，但必須觸發審核警報（量產手冊 §4）。
    const hitKeywords = L3_REDLINE_KEYWORDS.filter((kw) => body.includes(kw));
    if (hitKeywords.length > 0) {
      warn(file, `L3 red-line keywords detected: ${hitKeywords.join('、')} — confirm this is still L1/L2 concept/methodology content, not a disguised business blueprint (量產手冊 §4)`);
    }

    // 去機械化：模板式開場是「同質化」最常見的來源（量產手冊 §5）。
    checkClicheOpening(file, body);

    // 金字塔血緣：若這篇知識文章連到某個創業藍圖，理想狀況是兩者共用同一個
    // topicId（同一條主題線的兩個晉升階段），沒有共用 topicId 只代表「內容相關」，
    // 不代表「同一條血緣」，兩者語意不同，只降級為提醒，不擋 build。
    if (relBlueprints.length > 0 && meta.topicId) {
      const threaded = relBlueprints.some((s) => topicIdBySlugLane.get(`blueprints:${s}`) === meta.topicId);
      if (!threaded) {
        warn(file, `linked to blueprint(s) [${relBlueprints.join(', ')}] but none share this article's topicId (${meta.topicId}); if this knowledge article is meant to be the same topic thread graduating into a blueprint, align the topicId — otherwise this is just a related-content link, not a pyramid lineage link`);
      }
    }
  }
  if (lane.laneId === 'blueprints') {
    // 對應 Victor 2026-07-03 裁定：創業藍圖是金字塔最稀缺的頂點，訪客點進來要有
    // 紮實收穫，湊不到 3000 字本身就是提案不完整的訊號，字數門檻比照知識庫，
    // 不採用「藍圖天生較短」的寬鬆假設（該假設已被 Victor 明確否決）。
    const charCount = body.replace(/\s/g, '').length;
    if (charCount < 3000) {
      err(file, `blueprint body under 3000 chars (${charCount}); blueprints are the pyramid's scarce peak tier and must be substantial — hard gate per Victor's 2026-07-03 decision`);
    }

    // 創業自問區塊：故意用跟知識庫不同的標題文字（「動手之前」而非「讀完後」），
    // 讓兩者在視覺與語意上區分開——知識庫詰問是引發反思，這裡是逼讀者面對
    // 「真的要做嗎」的決策點，量產手冊的格式規則（3題、每題粗體+引導思路）沿用，
    // 但定位不同，不是同一個區塊改個名字而已。
    const selfQuestionRegex = /動手之前.{0,2}先問自己/g;
    const selfQuestionHits = (body.match(selfQuestionRegex) || []).length;
    if (selfQuestionHits !== 1) {
      err(file, `blueprint must contain exactly one "🚀 動手之前，先問自己這幾個問題" section (found ${selfQuestionHits}); hard gate per Victor's 2026-07-03 decision`);
    } else {
      const headingIdx = body.search(selfQuestionRegex);
      const closingMatch = body.slice(headingIdx).match(/^##\s*(結語|下一步)/m);
      const section = closingMatch
        ? body.slice(headingIdx, headingIdx + closingMatch.index)
        : body.slice(headingIdx);
      const boldQuestions = section.match(/\*\*[^*]+？\*\*/g) || [];
      if (boldQuestions.length !== 3) {
        err(file, `blueprint self-question section must contain exactly 3 bold questions (found ${boldQuestions.length})`);
      }
      const guidedHits = (section.match(/引導思路/g) || []).length;
      if (guidedHits < boldQuestions.length) {
        err(file, `each blueprint self-question must carry a "引導思路" guiding sentence (found ${guidedHits} for ${boldQuestions.length} questions)`);
      }
    }

    // 讀者聯絡欄位：Victor 2026-07-03 裁定，創業藍圖要留一個小欄位邀請讀者
    // 回饋意見，這是未來「藍圖使用數據回饋成新機會情報」閉環的第一步雛形
    // （目前只是靜態文字+信箱，不是互動元件，互動式意見收集列為產品待辦）。
    if (!body.includes('pigragonh@gmail.com')) {
      err(file, `blueprint must include the reader-contact invite line (PiGragon H · pigragonh@gmail.com) per Victor's 2026-07-03 decision`);
    }

    // 去機械化：這條風格要求全站適用，創業藍圖也不例外。
    checkClicheOpening(file, body);

    // Victor 審查關卡：這是「上架要經過我審查」這句話真正被程式碼擋住的地方——
    // 不是寫在文件裡靠自覺，是 adsEnabled=true（等於要正式上架變現）卻沒有
    // victorReviewed=true 時直接擋下，逼流程停在這裡等人工核可，不能繞過去。
    if (meta.adsEnabled === true && meta.victorReviewed !== true) {
      err(file, `blueprint has adsEnabled=true (going live/monetized) but victorReviewed is not true; blueprints require Victor's explicit review before publish per Victor's 2026-07-03 decision — set adsEnabled:false until reviewed, or victorReviewed:true after Victor signs off`);
    }
  }
}

console.log(`AI three-axis validation checked ${records.length} files.`);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings) console.log(`- ${w}`);
}
if (errors.length) {
  console.error(`\nErrors (${errors.length}):`);
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log('AI three-axis validation passed.');
