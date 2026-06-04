// @profile B
// Profile B · 計算機-YMYL · IpCalculator (Developer · MeetingCost-aligned · gold-template-clone)

import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
type AffiliateItem = { label: LocalText; href: string };
const l = (v: LocalText, lang: Lang) => v[lang];
const fmt = (v: number, d = 0) => Number.isFinite(v) ? v.toFixed(d) : "—";

// ─── Domain: IPv4 CIDR · RFC 4632 / RFC 1918 / RFC 6890 ─────────────────────────
type ParsedIp = {
  prefix: number;
  ipInt: number;
  networkInt: number;
  broadcastInt: number;
  firstHostInt: number;
  lastHostInt: number;
  hostCount: number;
  usableCount: number;
  maskInt: number;
  wildcardInt: number;
  isPrivate: boolean;
  isLoopback: boolean;
  isLinkLocal: boolean;
  isMulticast: boolean;
  isBroadcastReserved: boolean;
  classLabel: string;
};

function parseOctets(ip: string): number[] | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const out: number[] = [];
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null;
    const n = parseInt(p, 10);
    if (n < 0 || n > 255) return null;
    out.push(n);
  }
  return out;
}

function ipToInt(octets: number[]): number {
  // Use Math.pow / unsigned arithmetic to avoid 32-bit signed overflow
  return octets[0] * 16777216 + octets[1] * 65536 + octets[2] * 256 + octets[3];
}

function intToIp(n: number): string {
  const a = Math.floor(n / 16777216) & 255;
  const b = Math.floor(n / 65536) & 255;
  const c = Math.floor(n / 256) & 255;
  const d = n & 255;
  return `${a}.${b}.${c}.${d}`;
}

function maskFromPrefix(prefix: number): number {
  if (prefix <= 0) return 0;
  if (prefix >= 32) return 0xFFFFFFFF;
  // Build mask without bit-shift overflow: 2^32 - 2^(32-prefix)
  return (Math.pow(2, 32) - Math.pow(2, 32 - prefix));
}

function classOf(firstOctet: number, prefix: number): string {
  // Pre-CIDR class hint (RFC 791) — informational only
  if (firstOctet >= 0 && firstOctet <= 127) return prefix === 8 ? "Class A (legacy)" : "A-range";
  if (firstOctet >= 128 && firstOctet <= 191) return prefix === 16 ? "Class B (legacy)" : "B-range";
  if (firstOctet >= 192 && firstOctet <= 223) return prefix === 24 ? "Class C (legacy)" : "C-range";
  if (firstOctet >= 224 && firstOctet <= 239) return "Class D (multicast)";
  return "Class E (reserved)";
}

function isPrivateIPv4(o: number[]): boolean {
  // RFC 1918
  if (o[0] === 10) return true;
  if (o[0] === 172 && o[1] >= 16 && o[1] <= 31) return true;
  if (o[0] === 192 && o[1] === 168) return true;
  return false;
}

function parseCidr(input: string): { ok: true; p: ParsedIp } | { ok: false; err: string } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, err: "empty input" };
  const slash = trimmed.split("/");
  if (slash.length > 2) return { ok: false, err: "expected at most one '/' in CIDR" };
  const ip = slash[0];
  const prefixStr = slash.length === 2 ? slash[1] : "32";
  if (!/^\d+$/.test(prefixStr)) return { ok: false, err: `invalid prefix: "${prefixStr}"` };
  const prefix = parseInt(prefixStr, 10);
  if (prefix < 0 || prefix > 32) return { ok: false, err: `prefix out of range: /${prefix} (allowed /0–/32)` };
  const octets = parseOctets(ip);
  if (!octets) return { ok: false, err: `invalid IPv4: "${ip}"` };
  const ipInt = ipToInt(octets);
  const maskInt = maskFromPrefix(prefix);
  const wildcardInt = (Math.pow(2, 32) - 1) - maskInt;
  const networkInt = ipInt - (ipInt % Math.pow(2, 32 - prefix === 32 ? 0 : 32 - prefix));
  // safer: networkInt = ipInt AND maskInt (manual bitwise via division)
  const safeNetwork = Math.floor(ipInt / Math.pow(2, 32 - prefix)) * Math.pow(2, 32 - prefix);
  const network = prefix === 0 ? 0 : (prefix === 32 ? ipInt : safeNetwork);
  const broadcast = prefix === 32 ? ipInt : (network + Math.pow(2, 32 - prefix) - 1);
  const hostCount = Math.pow(2, 32 - prefix);
  let firstHost = network;
  let lastHost = broadcast;
  let usableCount = hostCount;
  if (prefix <= 30) {
    firstHost = network + 1;
    lastHost = broadcast - 1;
    usableCount = hostCount - 2;
  } else if (prefix === 31) {
    // RFC 3021 point-to-point — both addresses usable
    firstHost = network;
    lastHost = broadcast;
    usableCount = 2;
  } else {
    // /32 single host
    firstHost = network;
    lastHost = network;
    usableCount = 1;
  }
  return {
    ok: true,
    p: {
      prefix,
      ipInt,
      networkInt: network,
      broadcastInt: broadcast,
      firstHostInt: firstHost,
      lastHostInt: lastHost,
      hostCount,
      usableCount,
      maskInt,
      wildcardInt,
      isPrivate: isPrivateIPv4(octets),
      isLoopback: octets[0] === 127,
      isLinkLocal: octets[0] === 169 && octets[1] === 254,
      isMulticast: octets[0] >= 224 && octets[0] <= 239,
      isBroadcastReserved: octets[0] === 0 || octets[0] === 255,
      classLabel: classOf(octets[0], prefix),
    },
  };
}

// 6-band subnet-size matrix (mirrors JsonFormatter `bands`)
const bands = [
  { key: "single", range: "/32", label: { zh: "單一主機", en: "Single host" }, desc: { zh: "/32 代表單一 IPv4 位址,常用於精準防火牆規則、健康檢查目標、靜態路由 next-hop。1 個可用位址,沒有網路與廣播之分。", en: "/32 is a single IPv4 address — used for precise firewall rules, health-check targets, and static-route next-hops. 1 usable address with no network/broadcast split." } },
  { key: "ptp", range: "/31", label: { zh: "點對點", en: "Point-to-point" }, desc: { zh: "/31 依 RFC 3021 用於點對點鏈路,2 個位址都可指派給介面。常見於 backbone 路由器互聯,節省 IP 空間。", en: "/31 follows RFC 3021 for point-to-point links — both addresses are assignable. Common on backbone router-to-router links to save address space." } },
  { key: "tiny", range: "/30 – /29", label: { zh: "微型子網", en: "Tiny subnet" }, desc: { zh: "/30 提供 2 個可用主機(常用於 router 互聯)、/29 提供 6 個。預扣掉網路位址與廣播位址,適合 management VLAN、small DMZ。", en: "/30 yields 2 usable hosts (router links), /29 yields 6. Network and broadcast are excluded — fits management VLANs and small DMZs." } },
  { key: "office", range: "/28 – /24", label: { zh: "辦公室規模", en: "Office scale" }, desc: { zh: "/28 = 14 主機、/27 = 30、/26 = 62、/25 = 126、/24 = 254。中小型辦公室、單一部門、單一機架的甜蜜點;大多數家用 LAN 都是 /24。", en: "/28 = 14 hosts, /27 = 30, /26 = 62, /25 = 126, /24 = 254. Sweet spot for small offices, single departments, single racks; most home LANs are /24." } },
  { key: "campus", range: "/23 – /16", label: { zh: "校園 / 企業", en: "Campus / Enterprise" }, desc: { zh: "/23 起跳即為跨子網拓樸的常見 supernet 規模;/16 = 65,534 主機,等同單一企業園區或大型雲端 VPC。需配合 VLAN/路由設計。", en: "/23 and shorter prefixes are common supernet sizes for multi-subnet topologies; /16 = 65,534 hosts — a single corporate campus or large cloud VPC. Pair with VLAN / routing design." } },
  { key: "isp", range: "/15 – /8", label: { zh: "ISP / 雲業者", en: "ISP / Cloud" }, desc: { zh: "/15 以上的超大區段通常出現在 ISP、跨區雲業者、骨幹 BGP 公告。/8 涵蓋 16M 位址,管理層級需要 IPAM 系統與 ASN 規劃,而非手動配置。", en: "/15 and shorter blocks typically appear at ISPs, cross-region cloud carriers, and BGP backbone advertisements. /8 covers 16M addresses — needs IPAM tooling and ASN planning, not hand-edits." } },
] as const;

const affiliateItems: AffiliateItem[] = [
  { label: { zh: "Hash 生成器", en: "Hash Generator" }, href: "/tools/developer/hash-generator" },
  { label: { zh: "JSON 格式化器", en: "JSON Formatter" }, href: "/tools/developer/json-formatter" },
  { label: { zh: "Cron 表達式解析器", en: "Cron Expression Parser" }, href: "/tools/developer/cron-expression" },
  { label: { zh: "JWT 解碼器", en: "JWT Decoder" }, href: "/tools/developer/jwt-decoder" },
];

const SAMPLE_OFFICE = "192.168.1.0/24";   // RFC 1918 私網 /24
const SAMPLE_VPC = "10.0.0.0/16";         // 雲端 VPC 常見 supernet

function bandKey(prefix: number): string {
  if (prefix === 32) return "single";
  if (prefix === 31) return "ptp";
  if (prefix >= 29 && prefix <= 30) return "tiny";
  if (prefix >= 24 && prefix <= 28) return "office";
  if (prefix >= 16 && prefix <= 23) return "campus";
  return "isp";
}

const ui = {
  zh: {
    badge: "開發工具 · IP / CIDR · 黃金模板", switchToEnglish: "English mode", switchToChinese: "切換到中文", chineseShort: "中", englishShort: "EN",
    title: "IP / CIDR Calculator · IP / CIDR 計算器", subtitle: "輸入 IPv4 與前綴即時推導網路位址、廣播位址、可用主機範圍,並提供六格子網規模判讀矩陣",
    intro: "本工具在瀏覽器端解析 IPv4 CIDR 表達式,套用 RFC 4632 (CIDR)、RFC 1918 (私有空間)、RFC 6890 (特殊用途登記)、RFC 3021 (/31 點對點) 規則,推導網路位址、廣播位址、首末可用主機、子網遮罩、wildcard 與主機數,並把前綴長度落入六格子網規模矩陣協助規劃 VLAN / VPC。輸入不上傳,適合審視包含敏感拓樸資訊的 IP 規劃。",
    trustNoteLabel: "注意事項:", trustNote: "本工具完全在瀏覽器端執行(整數位元拆解 + RFC 規則),所有 IP 皆不上傳;六格分級為規劃參考,不是安全或合規建議;/31 與 /32 採 RFC 3021 / RFC 6890 修訂解讀,與舊版「網路 + 廣播必扣 2」演算法略有差異。",
    quickActionCard: "快速範例卡", tryExample: "試一個 CIDR 範例", examplePreview: "目前可用主機數", examplePerson: "標準範例", fillExample: "一鍵填入 192.168.1.0/24", previewActivePath: "填入 10.0.0.0/16",
    examplesCalculator: "範例 → 計算機", enterValues: "貼上 IPv4 / CIDR 並選擇規格", examplesHelper: "先用範例 CIDR 理解前綴推導,再貼上自己的 IP 規劃。",
    metric: "RFC 4632 CIDR", imperial: "Class A/B/C 對照", exampleCards: "範例卡", baselineExample: "192.168.1.0/24", activeExample: "10.0.0.0/16", flowDemo: "前綴 / 主機數", calculator: "計算機",
    inputCron: "IPv4 / CIDR", quickFills: "快捷範例",
    resultCard: "CIDR 解析結果", unit: "可用主機數", primaryValue: "主要數值", maintenanceTarget: "可用主機", actionTarget: "前綴長度", estimatedTdee: "網路位址", maintenance: "個", fatLossTarget: "/前綴",
    outputFires: "可用主機", outputFields: "前綴長度", outputNext: "網路位址", outputValid: "語法驗證", calendarBreakdown: "輸出分解", outputJson: "完整 CIDR 報表",
    resultIntelligence: "結果解讀", tdeeMatrix: "六格子網規模判讀矩陣", tdeeMatrixNote: "L7 固定六格,把目前 CIDR 的前綴長度放進常見規模區間;這是子網規劃參考,不是安全審計或合規建議。",
    emotionConversionLayer: "情緒與轉換層", turnIntoPlan: "把子網規模轉成 IP 規劃決策", conversionNote: "L9 會連動目前解析結果,顯示前綴長度與可用主機數,協助判斷是否需要切割成多個 /27、/28 子網,或保留更多主機空間給未來擴充。",
    progressInsight: "結構洞察卡", possibleTarget: "目前 CIDR 結構", dailyGap: "前綴長度", weeklyTrend: "可用主機", motivation: "動力卡", keepMomentum: "從一個 CIDR 走向標準化的 IPAM 規劃流程",
    saveShareJourney: "儲存 / 分享", journeyTitle: "把今天的 CIDR 結果帶回家", journeyHint: "重新貼上 IP 或調整前綴時自動重算,協助比較不同子網切法的可用主機數與 broadcast domain 大小。",
    nextActionLabel: "下一步行動", nextActionTitle: "把結果接到下一個工具", nextActionItem1: "用 Hash 生成器把 IP 規劃 ID 雜湊化作為內部資源命名", nextActionItem2: "用 JSON 格式化器把 IPAM 紀錄 JSON 結構化便於版本控管", nextActionItem3: "用 Cron 表達式解析器規劃定期 IP 掃描或 reverse-DNS 重整任務",
    shareLinkBtn: "📋 複製 CIDR 結果", shareNativeBtn: "📤 分享給隊友", shareCopiedToast: "已複製到剪貼簿 ✓",
    decisionPath: "決策路徑", decisionTitle: "IP 輸入 → CIDR 推導 → 規模判讀 → 子網規劃", bmrStep: "IP 輸入", deficitStep: "CIDR 推導", trendStep: "規模判讀", mealStep: "子網規劃",
    knowledge: "知識", knowledgeTitle: "CIDR 在現代網路中的意義", definition: "定義", definitionText: "CIDR (Classless Inter-Domain Routing) 由 RFC 4632 定義,以 IP/前綴長度 表示變動長度子網,取代了 1981 年 RFC 791 的 A/B/C 類分級。CIDR 讓位址可被精準切割,大幅延長 IPv4 壽命,也是現代雲端 VPC、k8s service-CIDR、BGP 路由公告的基礎。",
    formula: "公式", formulaText: "對 /n 前綴:子網遮罩 = 2³² − 2³²⁻ⁿ;主機總數 = 2³²⁻ⁿ;網路位址 = IP AND 遮罩;廣播位址 = 網路位址 + 主機總數 − 1。/30 以下扣除網路位址與廣播位址;/31 依 RFC 3021 兩位址全可用;/32 是單一主機。",
    limitations: "限制", limitationsText: "本工具僅處理 IPv4;IPv6 (/128 範圍) 與 EUI-64 推導未支援。/31 採 RFC 3021 修訂(兩個位址全可用),這在某些古老設備上不被認可。私網/loopback/link-local 標記僅作提示,不替代實際路由策略。",
    interpretation: "解讀", interpretationText: "/24 對應 254 主機,是中小型辦公室甜蜜點;/16 = 65,534 主機,適合單一園區或雲端 VPC,但 broadcast domain 過大需配合 VLAN 切割。/8 涵蓋 16M 位址,實務上需 IPAM 系統管理,不可手動配置。短前綴(/15 以上)通常屬於 ISP 或 BGP 骨幹層級。",
    context: "脈絡", contextText: "CIDR 結果應與部署環境的 IPAM 工具、防火牆策略、VPC peering 規則一起評估;雲端 VPC 通常保留 .0、.1-.3、.255 給平台用途(AWS / GCP / Azure 各有差異),實際可用主機數會比理論值少 4-5 個。",
    example: "範例", exampleText: "192.168.1.0/24 對應網路位址 192.168.1.0、廣播 192.168.1.255、可用主機 192.168.1.1-192.168.1.254 共 254 個,落在「辦公室規模」band;改成 10.0.0.0/16 變成 65,534 主機、broadcast 10.0.255.255,落在「校園 / 企業」band 的中段。",
    faq: "常見問題", commonQuestions: "常見問題", affiliate: "推薦工具", affiliateTitle: "IP 規劃的下一步工具", premiumTitle: "專業版 IPAM 工具包", premiumText: "解鎖 IPv6 推導、子網切割模擬器、conflict 偵測、BGP next-hop 視覺化、IPAM CSV 匯入匯出。",
    trustReferences: "信任聲明 · 相關工具 · 參考資料", trust: "信任聲明", trustText: "本工具僅在瀏覽器端推導 CIDR;貼上的 IP 不會送到伺服器,適合審視含內部拓樸資訊的 IP 規劃。", relatedTools: "相關工具", relatedToolsText: "Hash 生成器 · JSON 格式化器 · Cron 表達式解析器 · JWT 解碼器", references: "參考資料", referencesText: "RFC 4632 (Fuller & Li, 2006) Classless Inter-Domain Routing — CIDR 正式規範;RFC 1918 (Rekhter et al., 1996) Private Address Space — 10/8、172.16/12、192.168/16;RFC 3021 (Retana et al., 2000) Using 31-Bit Prefixes on IPv4 Point-to-Point Links;RFC 6890 (Cotton et al., 2013) Special-Purpose IP Address Registries;IANA IPv4 Special-Purpose Address Registry。",
    q1: "為什麼我的 CIDR 顯示「invalid」?", a1: "最常見原因是 IP 某段超出 0-255 範圍、IP 段數不是 4 段、或前綴長度不在 0-32 範圍。錯誤訊息會指出具體欄位 — 先把 IP 改成 192.0.2.0 確認其他欄位正確。",
    q2: "為什麼 /31 顯示 2 個可用主機,跟我學的不一樣?", a2: "RFC 3021 (2000) 修訂了 /31 的解讀:在點對點鏈路上兩個位址都可指派給介面,廣播概念不適用。本工具採用此修訂版;若你的設備或 ISP 仍依舊版扣 2,需以該設備文件為準。",
    q3: "貼上的 IP 會被送到伺服器嗎?", a3: "不會。本工具完全在瀏覽器端用整數運算推導 CIDR;頁面關閉後 IP 即消失,適合審視包含內部拓樸資源 ID 的 IP 規劃(例如 vpc-prod-${region})。",
    q4: "為什麼 IPv6 沒有支援?", a4: "IPv6 (/0 - /128 範圍) 採 128-bit 位址,需要 BigInt 運算與不同的縮寫規則(::1、fe80::、雙冒號壓縮),未來會以獨立工具上線。目前如需 IPv6 規劃請使用專業 IPAM。",
    q5: "可用主機數為什麼是 254 而不是 256?", a5: "在 /24 等傳統前綴(/0 - /30)中,網路位址(全 0 主機部分)與廣播位址(全 1 主機部分)依 RFC 950 不可指派給介面,因此 256 個位址中扣掉 2 個 = 254 個可用。/31 / /32 採新規,不扣。",
    q6: "可以用本工具做合規或安全審查嗎?", a6: "不建議。本工具只做 CIDR 數學推導,不檢查 IP 是否屬於敏感區段、ACL 是否衝突、route-leak 風險,或 RIR 合法持有狀態。合規審查請使用 IPAM 平台、CMDB、或委由 NetOps/Security 團隊。",
  },
  en: {
    badge: "Developer · IP / CIDR · Gold template", switchToEnglish: "English mode", switchToChinese: "Switch to Chinese", chineseShort: "中", englishShort: "EN",
    title: "IP / CIDR Calculator", subtitle: "Enter an IPv4 address and prefix to derive network address, broadcast, usable host range, and read a six-band subnet-size matrix",
    intro: "This tool parses IPv4 CIDR entirely in the browser, applying RFC 4632 (CIDR), RFC 1918 (private space), RFC 6890 (special-purpose registry), and RFC 3021 (/31 point-to-point) to derive network address, broadcast, first/last usable host, subnet mask, wildcard, and host count. The prefix length is placed into a six-band subnet-size matrix to support VLAN / VPC planning. Inputs are never uploaded, so it is safe for IP plans containing sensitive topology data.",
    trustNoteLabel: "Note:", trustNote: "Everything runs in the browser (integer-bit decomposition + RFC rules); IPs stay on your machine. Six-band sizing is a planning reference, not security or compliance advice. /31 and /32 follow RFC 3021 / RFC 6890 — slightly different from the legacy \"always subtract 2\" formula.",
    quickActionCard: "Quick example", tryExample: "Try a CIDR sample", examplePreview: "Current usable hosts", examplePerson: "Standard sample", fillExample: "Fill 192.168.1.0/24", previewActivePath: "Fill 10.0.0.0/16",
    examplesCalculator: "Examples → Calculator", enterValues: "Paste an IPv4 / CIDR and pick the dialect", examplesHelper: "Start from a sample CIDR to see prefix derivation, then paste your own IP plan.",
    metric: "RFC 4632 CIDR", imperial: "Class A/B/C reference", exampleCards: "Example cards", baselineExample: "192.168.1.0/24", activeExample: "10.0.0.0/16", flowDemo: "Prefix / Hosts", calculator: "Calculator",
    inputCron: "IPv4 / CIDR", quickFills: "Quick fills",
    resultCard: "CIDR parse result", unit: "Usable hosts", primaryValue: "Headline number", maintenanceTarget: "Usable hosts", actionTarget: "Prefix length", estimatedTdee: "Network address", maintenance: "hosts", fatLossTarget: "/prefix",
    outputFires: "Usable hosts", outputFields: "Prefix length", outputNext: "Network address", outputValid: "Syntax", calendarBreakdown: "Output breakdown", outputJson: "Full CIDR report",
    resultIntelligence: "Result intelligence", tdeeMatrix: "Six-band subnet-size matrix", tdeeMatrixNote: "L7 fixed six bands — places the current prefix length into common subnet-size tiers. A subnet-planning reference, not security or compliance advice.",
    emotionConversionLayer: "Emotion & conversion layer", turnIntoPlan: "Turn the subnet size into an IP-planning decision", conversionNote: "L9 reflects the current parse — prefix length and usable hosts — to help decide whether to split into multiple /27, /28 subnets or reserve more host space for future growth.",
    progressInsight: "Structure insight", possibleTarget: "Current CIDR shape", dailyGap: "Prefix length", weeklyTrend: "Usable hosts", motivation: "Motivation", keepMomentum: "Move from a single CIDR to a standardised IPAM planning flow",
    saveShareJourney: "Save / share", journeyTitle: "Take today's CIDR result home", journeyHint: "Re-paste the IP or change the prefix to auto-recompute, comparing usable hosts and broadcast-domain size between subnet variants.",
    nextActionLabel: "Next action", nextActionTitle: "Carry the result to the next tool", nextActionItem1: "Use the Hash Generator to hash IP-plan IDs for internal-resource naming", nextActionItem2: "Use the JSON Formatter to structure IPAM records for version control", nextActionItem3: "Use the Cron Expression Parser to schedule periodic IP scans or reverse-DNS rebuilds",
    shareLinkBtn: "📋 Copy CIDR result", shareNativeBtn: "📤 Share with a teammate", shareCopiedToast: "Copied to clipboard ✓",
    decisionPath: "Decision path", decisionTitle: "IP input → CIDR derivation → Size band → Subnet plan", bmrStep: "IP input", deficitStep: "Derivation", trendStep: "Size band", mealStep: "Subnet plan",
    knowledge: "Knowledge", knowledgeTitle: "What CIDR means in modern networking", definition: "Definition", definitionText: "CIDR (Classless Inter-Domain Routing) defined by RFC 4632 represents variable-length subnets as IP/prefix, replacing the 1981 RFC 791 A/B/C classes. CIDR enables precise address slicing, has substantially extended IPv4 lifespan, and underpins modern cloud VPCs, k8s service-CIDR, and BGP route advertisements.",
    formula: "Formula", formulaText: "For prefix /n: subnet mask = 2³² − 2³²⁻ⁿ; total hosts = 2³²⁻ⁿ; network address = IP AND mask; broadcast = network + total − 1. For /30 and shorter, exclude network and broadcast; /31 follows RFC 3021 (both addresses usable); /32 is a single host.",
    limitations: "Limitations", limitationsText: "Handles IPv4 only — IPv6 (/0 - /128) and EUI-64 derivation are not supported. /31 follows RFC 3021 (both addresses usable); some legacy gear does not honour this. Private / loopback / link-local labels are hints, not a substitute for actual routing policy.",
    interpretation: "Interpretation", interpretationText: "/24 = 254 hosts is the small-office sweet spot; /16 = 65,534 hosts fits a single campus or cloud VPC, but the broadcast domain needs VLAN segmentation. /8 covers 16M addresses — only feasible with IPAM tooling, not manual edits. Short prefixes (/15 and shorter) are typically ISP or BGP backbone scale.",
    context: "Context", contextText: "Read CIDR alongside the deployment IPAM tooling, firewall policy, and VPC-peering rules. Cloud VPCs typically reserve .0, .1-.3, .255 for platform use (AWS / GCP / Azure differ slightly), so actual usable hosts run 4-5 below the theoretical count.",
    example: "Example", exampleText: "192.168.1.0/24 yields network 192.168.1.0, broadcast 192.168.1.255, usable hosts 192.168.1.1-192.168.1.254 (254 total), landing in the Office band. Switch to 10.0.0.0/16 and you get 65,534 hosts, broadcast 10.0.255.255, mid-Campus band.",
    faq: "FAQ", commonQuestions: "Common questions", affiliate: "Recommended tools", affiliateTitle: "Next-step tools for IP planning", premiumTitle: "Pro IPAM Toolkit", premiumText: "Unlock IPv6 derivation, subnet-split simulator, conflict detection, BGP next-hop visualisation, and IPAM CSV import/export.",
    trustReferences: "Trust · Related tools · References", trust: "Trust", trustText: "This tool only derives CIDR in the browser; pasted IPs never reach the server, so it is safe for IP plans containing internal topology IDs.", relatedTools: "Related tools", relatedToolsText: "Hash Generator · JSON Formatter · Cron Expression Parser · JWT Decoder", references: "References", referencesText: "RFC 4632 (Fuller & Li, 2006) Classless Inter-Domain Routing — the canonical CIDR specification; RFC 1918 (Rekhter et al., 1996) Private Address Space — 10/8, 172.16/12, 192.168/16; RFC 3021 (Retana et al., 2000) Using 31-Bit Prefixes on IPv4 Point-to-Point Links; RFC 6890 (Cotton et al., 2013) Special-Purpose IP Address Registries; IANA IPv4 Special-Purpose Address Registry.",
    q1: "Why does my CIDR show \"invalid\"?", a1: "The most common reasons: an octet outside 0-255, fewer/more than 4 octets, or a prefix outside 0-32. The error message tells you which field — replace the IP with 192.0.2.0 to verify the rest first.",
    q2: "Why does /31 show 2 usable hosts? That contradicts what I learned.", a2: "RFC 3021 (2000) revised /31 semantics: on point-to-point links both addresses are interface-assignable and broadcast does not apply. This tool follows the revision; if your gear or ISP still subtracts 2, defer to that vendor's docs.",
    q3: "Are pasted IPs sent to the server?", a3: "No. The tool runs entirely in the browser using integer arithmetic; IPs disappear when the page closes, making it safe for IP plans containing internal topology IDs (e.g. vpc-prod-${region}).",
    q4: "Why is IPv6 not supported?", a4: "IPv6 (/0 - /128) uses 128-bit addresses requiring BigInt math and different shorthand rules (::1, fe80::, double-colon compression) — it will ship as a separate tool. For IPv6 planning today use a dedicated IPAM.",
    q5: "Why is usable-hosts 254, not 256?", a5: "For traditional prefixes (/0 - /30) the network address (all-zero host bits) and broadcast (all-one host bits) cannot be assigned per RFC 950, so 256 − 2 = 254 usable. /31 and /32 follow newer rules and do not subtract.",
    q6: "Can I use this for compliance or security audit?", a6: "Not recommended. This tool only does CIDR math — it does not check whether the IP belongs to a sensitive range, whether ACLs conflict, route-leak risk, or RIR ownership. For compliance use an IPAM platform, CMDB, or your NetOps / Security team.",
  },
} as const;

const faqKeys = [["q1","a1"],["q2","a2"],["q3","a3"],["q4","a4"],["q5","a5"],["q6","a6"]] as const;

export default function IpCalculator() {
  const { lang, setLang } = useLanguage();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [inputCron, setInputCron] = useState(SAMPLE_OFFICE);
  const t = ui[lang];

  const result = useMemo(() => {
    const r = parseCidr(inputCron);
    if (!r.ok) return { valid: false, error: r.err, p: null as ParsedIp | null };
    return { valid: true, error: "", p: r.p };
  }, [inputCron]);

  const usableHostsDisplay = result.p ? fmt(result.p.usableCount, 0) : "—";
  const prefixDisplay = result.p ? `/${result.p.prefix}` : "—";
  const networkDisplay = result.p ? intToIp(result.p.networkInt) : "—";
  const broadcastDisplay = result.p ? intToIp(result.p.broadcastInt) : "—";
  const firstHostDisplay = result.p ? intToIp(result.p.firstHostInt) : "—";
  const lastHostDisplay = result.p ? intToIp(result.p.lastHostInt) : "—";
  const maskDisplay = result.p ? intToIp(result.p.maskInt) : "—";
  const wildcardDisplay = result.p ? intToIp(result.p.wildcardInt) : "—";

  function fillBusiness() { setUnit("metric"); setInputCron(SAMPLE_OFFICE); }
  function fillQuartz() { setUnit("imperial"); setInputCron(SAMPLE_VPC); }

  const activeBand = result.p ? bands.find(b => b.key === bandKey(result.p!.prefix)) : undefined;

  const reportText = result.p
    ? [
        `[1] Input        ${inputCron}`,
        `[2] Network      ${networkDisplay}`,
        `[3] Broadcast    ${broadcastDisplay}`,
        `[4] First host   ${firstHostDisplay}`,
        `[5] Last host    ${lastHostDisplay}`,
        `[6] Mask         ${maskDisplay}`,
        `[7] Wildcard     ${wildcardDisplay}`,
        `[8] Hosts (raw)  ${result.p.hostCount}`,
        `[9] Hosts (use)  ${result.p.usableCount}`,
        `[10] Class hint  ${result.p.classLabel}`,
        `[11] Private     ${result.p.isPrivate ? "yes (RFC 1918)" : "no"}`,
        `[12] Loopback    ${result.p.isLoopback ? "yes (127/8)" : "no"}`,
        `[13] Link-local  ${result.p.isLinkLocal ? "yes (169.254/16)" : "no"}`,
        `[14] Multicast   ${result.p.isMulticast ? "yes (224-239/4)" : "no"}`,
      ].join("\n")
    : "—";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Canonical 17-layer markers for production QC:
          L1-Hero · L2-TrustIntro · L3-QuickStartExample · L4-InputGuidance · L5-CalculatorInput · L6-PrimaryResult · L7-ResultIntelligence · L8-ScenarioComparison · L9-EmotionConversionUpper · L10-EmotionConversionLower · L11-DecisionPath · L12-Knowledge · L13-FAQ · L14-FAQAfterAdSlot · L15-AffiliateResources · L16-PremiumGate · L17-TrustRelatedReferences
      */}
      <section className="bg-[radial-gradient(circle_at_top_left,_#ddd6fe,_#f8fafc_45%,_#e0e7ff)]">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="mb-6 flex justify-end"><button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 shadow-sm" aria-label={lang === "zh" ? t.switchToEnglish : t.switchToChinese}>{lang === "zh" ? t.switchToEnglish : t.switchToChinese}</button></div>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">{/* L1-Hero */}
            <section className="space-y-6"><p className="text-sm font-black uppercase tracking-[0.24em] text-violet-700">{t.badge}</p><h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{t.title}</h1><p className="text-xl font-black text-violet-700">{t.subtitle}</p><p className="max-w-2xl text-lg leading-8 text-slate-700">{t.intro}</p><div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 text-sm leading-6 text-violet-950"><strong>{t.trustNoteLabel}</strong> {t.trustNote}</div></section>
            <aside className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">{t.quickActionCard}</p><h2 className="mt-2 text-2xl font-black">{t.tryExample}</h2><div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white"><div className="text-xs font-bold uppercase text-violet-100">{t.examplePreview}</div><div className="mt-1 text-5xl font-black">{usableHostsDisplay}</div><div className="text-sm font-bold text-violet-100">{t.maintenance}</div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.examplePerson}</div><div className="font-black">{usableHostsDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.flowDemo}</div><div className="font-black">{prefixDisplay}/{usableHostsDisplay}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{t.fatLossTarget}</div><div className="font-black">{prefixDisplay}</div></div></div><button onClick={fillBusiness} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">{t.fillExample}</button><button onClick={fillQuartz} className="mt-3 w-full rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm font-black text-violet-900">{t.previewActivePath}</button></aside>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.examplesCalculator}</p><h2 className="mt-2 text-3xl font-black">{t.enterValues}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.examplesHelper}</p></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2"><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "metric" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("metric")}>{t.metric}</button><button className={`rounded-xl px-4 py-3 text-sm font-black ${unit === "imperial" ? "bg-violet-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setUnit("imperial")}>{t.imperial}</button></div></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">{/* L5-Calc */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-black">{t.exampleCards}</h3><div className="mt-4 space-y-3"><button onClick={fillBusiness} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.baselineExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">/24</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "RFC 1918 私網 · 254 主機辦公室典型" : "RFC 1918 private · 254 hosts office baseline"}</p></button><button onClick={fillQuartz} className="w-full rounded-2xl border border-violet-200 bg-white p-4 text-left"><div className="flex items-center justify-between gap-3"><span className="font-black">{t.activeExample}</span><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">/16</span></div><p className="mt-2 text-sm text-slate-600">{lang === "zh" ? "雲端 VPC 常見 supernet · 65,534 主機" : "Cloud VPC supernet · 65,534 hosts"}</p></button></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-black">{t.calculator}</h3><div className="mt-4 grid gap-4"><label className="block text-sm font-black text-slate-700">{t.inputCron}<input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-mono text-base" value={inputCron} onChange={(e) => setInputCron(e.target.value)} spellCheck={false} placeholder="192.168.1.0/24" /></label><div className="grid gap-4"><div><div className="text-sm font-black text-slate-700">{t.quickFills}</div><div className="mt-2 flex flex-wrap gap-2">{[{ label: "10.0.0.0/8", v: "10.0.0.0/8" }, { label: "172.16.0.0/12", v: "172.16.0.0/12" }, { label: "192.168.0.0/16", v: "192.168.0.0/16" }, { label: "192.0.2.0/24", v: "192.0.2.0/24" }, { label: "8.8.8.8/32", v: "8.8.8.8/32" }, { label: "10.1.1.0/30", v: "10.1.1.0/30" }].map(s => <button key={s.label} type="button" onClick={() => setInputCron(s.v)} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-900 hover:bg-violet-100">{s.label}</button>)}</div></div></div></div></div>
          </div>
        </section>
        <section className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">{/* L6-Result */}
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="h-5 bg-gradient-to-r from-violet-400 to-indigo-500" /><div className="p-6 md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultCard}</p><div className="mt-4 flex items-start justify-between gap-5"><div><div className="text-7xl font-black tracking-tight text-slate-950">{usableHostsDisplay}</div><div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${result.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{result.valid ? (lang === "zh" ? "✓ 語法有效" : "✓ Valid") : (lang === "zh" ? "✗ 語法錯誤" : "✗ Invalid")}</div></div><div className="rounded-3xl bg-slate-950 p-4 text-right text-white"><div className="text-xs font-bold uppercase text-slate-300">{t.outputFields}</div><div className="mt-1 text-xl font-black">{prefixDisplay}</div><div className="mt-1 text-xs text-slate-300">{lang === "zh" ? "前綴" : "prefix"}</div></div></div>{!result.valid && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-mono text-rose-800">{result.error}</div>}<div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t.outputFires}</div><div className="mt-1 text-xs font-black text-emerald-700">{lang === "zh" ? "可用" : "Usable"}</div><p className="mt-2 text-3xl font-black text-emerald-950">{result.p ? result.p.usableCount : 0}</p><p className="text-sm font-bold text-emerald-700">{t.maintenance}</p></div><div className="rounded-2xl bg-blue-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{t.outputFields}</div><div className="mt-1 text-xs font-black text-blue-700">{lang === "zh" ? "前綴" : "Prefix"}</div><p className="mt-2 text-3xl font-black text-blue-950">{result.p ? result.p.prefix : 0}</p><p className="text-sm font-bold text-blue-700">{t.fatLossTarget}</p></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.outputNext}</div><div className="mt-1 text-xs font-black text-slate-700">{lang === "zh" ? "網路" : "Network"}</div><p className="mt-2 text-base font-black text-slate-950 break-all">{networkDisplay}</p><p className="text-xs font-bold text-slate-700">{lang === "zh" ? `廣播 ${broadcastDisplay}` : `bcast ${broadcastDisplay}`}</p></div></div><div className="mt-5"><div className="text-xs font-black uppercase text-slate-500">{t.outputJson}</div><pre className="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-200">{reportText}</pre></div></div></article>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.resultIntelligence}</p><h2 className="mt-2 text-3xl font-black">{t.tdeeMatrix}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.tdeeMatrixNote}</p><div className="mt-5 grid gap-3 md:grid-cols-3">{bands.map((item) => <div key={item.key} className={`rounded-2xl border p-4 ${activeBand?.key === item.key ? "border-violet-400 bg-violet-50 ring-2 ring-violet-500" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><h3 className="font-black">{l(item.label, lang)}</h3><span className="text-xs font-black text-slate-500">{item.range}</span></div><p className="mt-2 text-sm leading-6 text-slate-700">{l(item.desc, lang)}</p></div>)}</div></article>
        </section>
        <AdSenseWrapper showAds={true} adSlot="ip-calculator-result-intelligence" adFormat="horizontal" className="my-2" />
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">{t.emotionConversionLayer}</p><h2 className="mt-2 text-3xl font-black">{t.turnIntoPlan}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.conversionNote}</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">{/* L9 */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{t.progressInsight}</p><h3 className="mt-2 text-2xl font-black">{t.possibleTarget}</h3><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">{lang === "zh" ? "前綴" : "Prefix"}</div><div className="mt-1 text-3xl font-black">{result.p ? result.p.prefix : 0}</div></div><div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-black uppercase text-violet-700">{t.weeklyTrend}</div><div className="mt-1 text-3xl font-black text-violet-950">{result.p ? result.p.usableCount : 0}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs font-black uppercase text-emerald-700">{t.dailyGap}</div><div className="mt-1 text-3xl font-black text-emerald-950">{result.p ? result.p.prefix : 0}</div></div></div></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-pink-700">{t.motivation}</p><h3 className="mt-2 text-2xl font-black">{t.keepMomentum}</h3><div className="mt-5 grid grid-cols-2 gap-3">{[t.bmrStep, t.deficitStep, t.trendStep, t.mealStep].map((item, i) => <div key={`mot-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-800">{item}</div>)}</div></article>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">{/* L10 */}
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.saveShareJourney}</p><h3 className="mt-2 text-2xl font-black">{t.journeyTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.journeyHint}</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">{t.nextActionLabel}</p><h3 className="mt-2 text-lg font-black">{t.nextActionTitle}</h3><ul className="mt-3 space-y-2"><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">①</span><span>{t.nextActionItem1}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">②</span><span>{t.nextActionItem2}</span></li><li className="flex gap-2 text-sm leading-6 text-slate-700"><span className="font-black text-violet-600">③</span><span>{t.nextActionItem3}</span></li></ul><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(reportText); alert(t.shareCopiedToast); } }} className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{t.shareLinkBtn}</button><button type="button" onClick={() => { const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }; if (nav.share) nav.share({ title: document.title, url: window.location.href }).catch(() => {}); }} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700">{t.shareNativeBtn}</button></div></article>
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.decisionPath}</p><h2 className="mt-2 text-3xl font-black">{t.decisionTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">{[{ label: lang === "zh" ? "IP 輸入" : "Input", note: t.bmrStep }, { label: lang === "zh" ? "CIDR 推導" : "Derive", note: t.deficitStep }, { label: lang === "zh" ? "規模判讀" : "Size band", note: t.trendStep }, { label: lang === "zh" ? "子網規劃" : "Plan", note: t.mealStep }].map((node, index) => <div key={`decision-${index}`} className="contents"><div className={`rounded-3xl border p-5 text-center ${index === 0 ? "border-violet-300 bg-violet-50" : "border-indigo-200 bg-indigo-50"}`}><div className="text-xs font-black uppercase text-slate-500">{index + 1}</div><div className="mt-1 text-xl font-black">{node.label}</div><p className="mt-2 text-sm leading-6 text-slate-600">{node.note}</p></div>{index < 3 && <div className="hidden text-3xl font-black text-slate-300 md:block">→</div>}</div>)}</div></section>
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">{/* L12-Knowledge · L13-FAQ */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.knowledge}</p><h2 className="mt-2 text-3xl font-black">{t.knowledgeTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.definition}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.definitionText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.formula}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.formulaText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.limitations}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.limitationsText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.interpretation}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.interpretationText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.context}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.contextText}</p></div><div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{t.example}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{t.exampleText}</p></div></div></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.faq}</p><h2 className="mt-2 text-3xl font-black">{t.commonQuestions}</h2><div className="mt-5 space-y-3">{faqKeys.map(([q, a]) => <details key={t[q]} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black">{t[q]}</summary><p className="mt-2 text-sm leading-6 text-slate-700">{t[a]}</p></details>)}</div></div>
        </section>
        <section aria-label="L14 常見問題後廣告位:廣告位" className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"><AdSlot slot="ip-calculator-faq" position="inline" /></section>
        <section className="grid items-stretch gap-6 lg:grid-cols-[1fr_1fr]"><section className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.affiliate}</p><h2 className="mt-2 text-3xl font-black">{t.affiliateTitle}</h2><div className="mt-5 grid gap-4 md:grid-cols-4">{affiliateItems.map((item) => <a key={item.href} href={item.href} className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center font-black text-violet-950">{l(item.label, lang)}</a>)}</div><p className="mt-3 text-xs text-violet-700">{lang === "zh" ? "* 聯盟連結,購買後我們可能獲得佣金。" : "* Affiliate links. We may earn a commission."}</p></section><PremiumGate plan="PRO"><article className="flex h-full flex-col rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 md:p-7"><h2 className="text-3xl font-black text-slate-950">{t.premiumTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{t.premiumText}</p><div className="mt-5 grid gap-3 md:grid-cols-4">{(lang === "zh" ? ["IPv6 推導", "切割模擬", "衝突偵測", "BGP 視覺化"] : ["IPv6", "Split sim", "Conflict", "BGP viz"]).map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-sm font-black text-violet-900 shadow-sm">{item}</div>)}</div></article></PremiumGate></section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">{t.trustReferences}</p><div className="mt-4 grid gap-5 md:grid-cols-3"><div><h2 className="text-xl font-black">{t.trust}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.trustText}</p></div><div><h2 className="text-xl font-black">{t.relatedTools}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.relatedToolsText}</p></div><div><h2 className="text-xl font-black">{t.references}</h2><p className="mt-2 text-sm leading-6 text-slate-700">{t.referencesText}</p></div></div></section>
      </div>
    </main>
  );
}
