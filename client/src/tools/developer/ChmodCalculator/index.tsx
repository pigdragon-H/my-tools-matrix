import { useMemo, useState } from "react";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { useLanguage } from "@/contexts/LanguageContext";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };
const l = (v: LocalText, lang: Lang) => v[lang];

type PermKey = "ownerRead" | "ownerWrite" | "ownerExecute" | "groupRead" | "groupWrite" | "groupExecute" | "otherRead" | "otherWrite" | "otherExecute";

const PERM_LABELS: Record<PermKey, LocalText> = {
  ownerRead: { zh: "擁有者 讀取", en: "Owner Read" },
  ownerWrite: { zh: "擁有者 寫入", en: "Owner Write" },
  ownerExecute: { zh: "擁有者 執行", en: "Owner Execute" },
  groupRead: { zh: "群組 讀取", en: "Group Read" },
  groupWrite: { zh: "群組 寫入", en: "Group Write" },
  groupExecute: { zh: "群組 執行", en: "Group Execute" },
  otherRead: { zh: "其他人 讀取", en: "Others Read" },
  otherWrite: { zh: "其他人 寫入", en: "Others Write" },
  otherExecute: { zh: "其他人 執行", en: "Others Execute" },
};

const PERM_WEIGHTS: Record<PermKey, number> = {
  ownerRead: 400, ownerWrite: 200, ownerExecute: 100,
  groupRead: 40, groupWrite: 20, groupExecute: 10,
  otherRead: 4, otherWrite: 2, otherExecute: 1,
};

const PERM_SYMBOLS: Record<PermKey, string> = {
  ownerRead: "r", ownerWrite: "w", ownerExecute: "x",
  groupRead: "r", groupWrite: "w", groupExecute: "x",
  otherRead: "r", otherWrite: "w", otherExecute: "x",
};

const OWNER_KEYS: PermKey[] = ["ownerRead", "ownerWrite", "ownerExecute"];
const GROUP_KEYS: PermKey[] = ["groupRead", "groupWrite", "groupExecute"];
const OTHER_KEYS: PermKey[] = ["otherRead", "otherWrite", "otherExecute"];

const SPECIAL_PERMS: { key: string; label: LocalText; symbol: string; desc: LocalText }[] = [
  { key: "setuid", label: { zh: "SetUID (4xxx)", en: "SetUID (4xxx)" }, symbol: "s", desc: { zh: "執行時以擁有者身份運行", en: "Run as file owner" } },
  { key: "setgid", label: { zh: "SetGID (2xxx)", en: "SetGID (2xxx)" }, symbol: "s", desc: { zh: "執行時以群組身份運行", en: "Run as file group" } },
  { key: "sticky", label: { zh: "Sticky Bit (1xxx)", en: "Sticky Bit (1xxx)" }, symbol: "t", desc: { zh: "僅擁有者可刪除檔案（/tmp）", en: "Only owner can delete (/tmp)" } },
];

export default function ChmodCalculator() {
  const { lang } = useLanguage();
  const [perms, setPerms] = useState<Record<PermKey, boolean>>({
    ownerRead: true, ownerWrite: true, ownerExecute: false,
    groupRead: true, groupWrite: false, groupExecute: false,
    otherRead: true, otherWrite: false, otherExecute: false,
  });
  const [special, setSpecial] = useState<Record<string, boolean>>({ setuid: false, setgid: false, sticky: false });

  const togglePerm = (key: PermKey) => setPerms(p => ({ ...p, [key]: !p[key] }));
  const toggleSpecial = (key: string) => setSpecial(s => ({ ...s, [key]: !s[key] }));

  const octal = useMemo(() => {
    const ownerVal = OWNER_KEYS.filter(k => perms[k]).reduce((a, k) => a + PERM_WEIGHTS[k], 0) / 100;
    const groupVal = GROUP_KEYS.filter(k => perms[k]).reduce((a, k) => a + PERM_WEIGHTS[k], 0) / 10;
    const otherVal = OTHER_KEYS.filter(k => perms[k]).reduce((a, k) => a + PERM_WEIGHTS[k], 0);
    const base = `${ownerVal}${groupVal}${otherVal}`;
    const specialVal = (special.setuid ? 4 : 0) + (special.setgid ? 2 : 0) + (special.sticky ? 1 : 0);
    return specialVal > 0 ? `${specialVal}${base}` : base;
  }, [perms, special]);

  const symbolic = useMemo(() => {
    const buildStr = (keys: PermKey[], sKey: string | null) => {
      const r = perms[keys[0]] ? "r" : "-";
      const w = perms[keys[1]] ? "w" : "-";
      const xBase = perms[keys[2]];
      const hasSpecial = sKey != null && special[sKey];
      let x: string;
      if (xBase) {
        x = hasSpecial ? (sKey === "sticky" ? "t" : "s") : "x";
      } else {
        x = hasSpecial ? (sKey === "sticky" ? "T" : "S") : "-";
      }
      return `${r}${w}${x}`;
    };
    return `${buildStr(OWNER_KEYS, "setuid")}${buildStr(GROUP_KEYS, "setgid")}${buildStr(OTHER_KEYS, "sticky")}`;
  }, [perms, special]);

  const command = `chmod ${octal} filename`;

  const copied = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(command).then(() => { copied[1](true); setTimeout(() => copied[1](false), 2000); });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* L1-Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-16">
        <div className="absolute inset-0 opacity-20 radial-gradient" style={{ background: "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3), transparent 60%)" }} />
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-black text-white drop-shadow-lg">{l({ zh: "Chmod 權限計算器", en: "Chmod Calculator" }, lang)}</h1>
          <p className="mt-3 text-lg font-black text-violet-100">{l({ zh: "計算 Linux/Unix 檔案權限 chmod 數值，支援符號與數字表示法轉換", en: "Calculate Linux/Unix file permission chmod values — symbolic and numeric notation conversion" }, lang)}</p>
        </div>
      </section>

      {/* L2-TrustIntro */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow-lg backdrop-blur">
          <h2 className="text-xl font-black text-violet-800">{l({ zh: "為什麼需要 Chmod 計算器？", en: "Why a Chmod Calculator?" }, lang)}</h2>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "Linux/Unix 檔案權限系統使用 9 個位元控制讀取、寫入、執行三種操作，分別套用於擁有者、群組與其他人。八進位數字表示法（如 755）雖然簡潔，但需要心算轉換，容易出錯。本工具讓你勾選權限即可自動算出 chmod 指令，消除人為錯誤。所有計算在本地完成。", en: "Linux/Unix file permissions use 9 bits to control read, write, and execute operations for owner, group, and others. Octal notation (e.g., 755) is concise but requires mental conversion and is error-prone. This tool lets you check permissions and auto-generates the chmod command, eliminating human error. All processing happens locally." }, lang)}</p>
        </div>
      </section>

      {/* L3-QuickStartExample */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-violet-100/60 p-6">
          <h3 className="font-black text-violet-700">{l({ zh: "快速上手", en: "Quick Start" }, lang)}</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-4 font-mono text-sm text-gray-700">
              <p className="font-black text-violet-600">{l({ zh: "最常見權限 755", en: "Most common: 755" }, lang)}</p>
              <p className="font-black text-gray-500">rwxr-xr-x — {l({ zh: "擁有者全權限，其他人可讀可執行", en: "Owner full, others read+execute" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 font-mono text-sm text-gray-700">
              <p className="font-black text-purple-600">{l({ zh: "私密檔案 600", en: "Private file: 600" }, lang)}</p>
              <p className="font-black text-gray-500">rw------- — {l({ zh: "僅擁有者可讀寫", en: "Owner read+write only" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* L4-InputGuidance */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-white/70 p-5 shadow">
          <h3 className="font-black text-violet-800">{l({ zh: "輸入說明", en: "Input Guidance" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "勾選權限位元即可即時計算 chmod 八進位數值與符號表示法。支援 SetUID/SetGID/Sticky Bit 特殊權限。所有計算在本地完成。", en: "Check permission bits to instantly calculate chmod octal value and symbolic notation. Supports SetUID/SetGID/Sticky Bit special permissions. All processing happens locally." }, lang)}</p>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="dev-chmod-top" adFormat="horizontal" className="my-2" />

      {/* L5-CalculatorInput */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/90 p-6 shadow-xl">
          <h3 className="mb-4 text-lg font-black text-violet-800">{l({ zh: "權限設定", en: "Permission Settings" }, lang)}</h3>
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { title: l({ zh: "擁有者 (Owner)", en: "Owner" }, lang), keys: OWNER_KEYS, color: "violet", specialKey: "setuid" },
              { title: l({ zh: "群組 (Group)", en: "Group" }, lang), keys: GROUP_KEYS, color: "purple", specialKey: "setgid" },
              { title: l({ zh: "其他人 (Others)", en: "Others" }, lang), keys: OTHER_KEYS, color: "fuchsia", specialKey: "sticky" },
            ].map(group => (
              <div key={group.title} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
                <h4 className={`font-black text-${group.color}-700`}>{group.title}</h4>
                <div className="mt-3 space-y-2">
                  {group.keys.map(key => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={perms[key]} onChange={() => togglePerm(key)}
                        className="h-4 w-4 rounded accent-violet-600" />
                      <span className="text-sm font-black text-gray-700">{l(PERM_LABELS[key], lang)}</span>
                      <span className="ml-auto font-mono text-xs font-black text-gray-400">{PERM_SYMBOLS[key]}</span>
                    </label>
                  ))}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={special[group.specialKey]} onChange={() => toggleSpecial(group.specialKey)}
                        className="h-4 w-4 rounded accent-amber-500" />
                      <span className="text-xs font-black text-amber-700">{SPECIAL_PERMS.find(s => s.key === group.specialKey)?.label[lang] || ""}</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* L6-PrimaryResult */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-slate-950 p-6 text-emerald-200 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black">{l({ zh: "權限結果", en: "Permission Result" }, lang)}</h3>
            <button onClick={handleCopy}
              className={`rounded-xl px-5 py-2 font-black transition ${copied[0] ? "bg-green-400 text-green-900" : "bg-white text-violet-700 hover:bg-violet-100"}`}>
              {copied[0] ? l({ zh: "已複製 ✓", en: "Copied ✓" }, lang) : l({ zh: "複製指令", en: "Copy Command" }, lang)}
            </button>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-slate-800 p-4 text-center">
              <dt className="text-xs font-black text-emerald-400">{l({ zh: "八進位數值", en: "Octal Value" }, lang)}</dt>
              <dd className="mt-2 text-4xl font-black text-emerald-200">{octal}</dd>
              <dd className="mt-1 text-xs font-black text-emerald-400">{l({ zh: "十進位", en: "Decimal" }, lang)}: {parseInt(octal, 8)}</dd>
            </div>
            <div className="rounded-xl bg-slate-800 p-4 text-center">
              <dt className="text-xs font-black text-emerald-400">{l({ zh: "符號表示法", en: "Symbolic Notation" }, lang)}</dt>
              <dd className="mt-2 text-4xl font-black text-emerald-200 font-mono">{symbolic}</dd>
              <dd className="mt-1 text-xs font-black text-emerald-400">{l({ zh: "權限位元數", en: "Permission Bits" }, lang)}: {symbolic.replace(/-/g, "").length}/9</dd>
            </div>
            <div className="rounded-xl bg-slate-800 p-4 text-center">
              <dt className="text-xs font-black text-emerald-400">{l({ zh: "終端指令", en: "Terminal Command" }, lang)}</dt>
              <dd className="mt-2 text-lg font-black text-emerald-200 font-mono">{command}</dd>
            </div>
          </div>
        </div>
      </section>

      {/* L7-ResultIntelligence */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white/80 p-6 shadow">
          <h3 className="font-black text-violet-800">{l({ zh: "結果分析", en: "Result Intelligence" }, lang)}</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-violet-50 p-4">
              <dt className="text-sm font-black text-violet-600">{l({ zh: "安全性等級", en: "Security Level" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-violet-800">
                {parseInt(octal.slice(-1)) <= 5 && parseInt(octal.slice(-2,-1)) <= 5 ? l({ zh: "安全", en: "Secure" }, lang) : l({ zh: "注意", en: "Caution" }, lang)}
              </dd>
            </div>
            <div className="rounded-xl bg-purple-50 p-4">
              <dt className="text-sm font-black text-purple-600">{l({ zh: "目錄適用", en: "Directory Suitability" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-purple-800">
                {parseInt(octal.slice(-1)) % 2 === 1 ? l({ zh: "適合目錄", en: "Suitable" }, lang) : l({ zh: "需加執行", en: "Need +x" }, lang)}
              </dd>
            </div>
            <div className="rounded-xl bg-fuchsia-50 p-4">
              <dt className="text-sm font-black text-fuchsia-600">{l({ zh: "特殊權限", en: "Special Perms" }, lang)}</dt>
              <dd className="mt-1 text-2xl font-black text-fuchsia-800">
                {octal.length > 3 ? l({ zh: "已啟用", en: "Active" }, lang) : l({ zh: "無", en: "None" }, lang)}
              </dd>
            </div>
          </div>
        </div>
      </section>

      <AdSlot slot="dev-chmod-mid1" position="inline" />

      {/* L8-ScenarioComparison */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow-lg">
          <h3 className="font-black text-violet-800">{l({ zh: "情境比較", en: "Scenario Comparison" }, lang)}</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="rounded-xl bg-violet-50 p-4">
              <h4 className="font-black text-violet-700">{l({ zh: "網頁伺服器", en: "Web Server" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "目錄 755 + 檔案 644 是網頁伺服器標準配置，確保伺服器程序可讀取但不允許其他人修改", en: "Directory 755 + file 644 is the web server standard, ensuring server process can read but others can't modify" }, lang)}</p>
              <p className="mt-2 text-xs font-black text-violet-500">{l({ zh: "建議：chmod -R 755 目錄；chmod 644 檔案", en: "Suggested: chmod -R 755 dirs; chmod 644 files" }, lang)}</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-4">
              <h4 className="font-black text-purple-700">{l({ zh: "SSH 金鑰", en: "SSH Keys" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "私密金鑰必須 600（僅擁有者可讀），公鑰 644。OpenSSH 會拒絕權限過寬的金鑰。", en: "Private keys must be 600 (owner read only), public keys 644. OpenSSH rejects keys with overly permissive access." }, lang)}</p>
              <p className="mt-2 text-xs font-black text-purple-500">{l({ zh: "建議：chmod 600 ~/.ssh/id_rsa", en: "Suggested: chmod 600 ~/.ssh/id_rsa" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* L9-EmotionConversionUpper */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-violet-100 to-purple-100 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "從猜測到精確", en: "From Guessing to Precision" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "「755 還是 775？」每次設定權限都要心算驗算——一個位元算錯就是安全漏洞。用計算器勾選權限，即刻得到正確數值，不再靠猜。", en: "'755 or 775?' Every permission change requires mental arithmetic — one wrong bit is a security hole. Check permissions with the calculator and get the correct value instantly, no more guessing." }, lang)}</p>
        </div>
      </section>

      {/* L10-EmotionConversionLower */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-purple-100 to-fuchsia-100 p-6">
          <h3 className="font-black text-purple-800">{l({ zh: "一個數字的代價", en: "The Cost of One Digit" }, lang)}</h3>
          <p className="mt-2 font-black text-gray-600">{l({ zh: "chmod 777 看似方便，卻讓任何人都能修改你的檔案。一個數字的差異，就是「安全」與「任何人都能刪除你的資料」的差異。", en: "chmod 777 seems convenient but lets anyone modify your files. One digit's difference is the gap between 'secure' and 'anyone can delete your data'." }, lang)}</p>
        </div>
      </section>

      {/* L11-DecisionPath */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow">
          <h3 className="font-black text-violet-800">{l({ zh: "決策路徑", en: "Decision Path" }, lang)}</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-black text-white">1</span>
              <p className="font-black text-gray-700">{l({ zh: "公開檔案？→ 644（擁有者讀寫，其他人只讀）", en: "Public file? → 644 (owner read+write, others read-only)" }, lang)}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-black text-white">2</span>
              <p className="font-black text-gray-700">{l({ zh: "可執行腳本？→ 755（加入執行權限）", en: "Executable script? → 755 (add execute permission)" }, lang)}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-sm font-black text-white">3</span>
              <p className="font-black text-gray-700">{l({ zh: "敏感設定檔？→ 600（僅擁有者可讀寫）", en: "Sensitive config? → 600 (owner read+write only)" }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      <AdSenseWrapper showAds={true} adSlot="dev-chmod-mid2" adFormat="horizontal" className="my-2" />

      {/* L12-Knowledge */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-violet-50/80 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "知識庫", en: "Knowledge Base" }, lang)}</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-violet-700">{l({ zh: "權限位元結構", en: "Permission Bit Structure" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "每組權限由 3 個位元組成：讀取(r=4)、寫入(w=2)、執行(x=1)。八進位數值 = 位元和。例如 rwx=4+2+1=7, r-x=4+0+1=5, r--=4+0+0=4。", en: "Each permission group has 3 bits: read(r=4), write(w=2), execute(x=1). Octal value = bit sum. E.g., rwx=4+2+1=7, r-x=4+0+1=5, r--=4+0+0=4." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-purple-700">{l({ zh: "特殊權限位元", en: "Special Permission Bits" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "SetUID(4)：執行時以擁有者身份運行（如 /usr/bin/passwd）。SetGID(2)：執行時以群組身份運行，目錄下新檔案繼承群組。Sticky Bit(1)：僅檔案擁有者可刪除（如 /tmp）。", en: "SetUID(4): Run as file owner (e.g., /usr/bin/passwd). SetGID(2): Run as file group; new files in dir inherit group. Sticky Bit(1): Only file owner can delete (e.g., /tmp)." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-fuchsia-700">{l({ zh: "常見權限組合", en: "Common Permission Combinations" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "755=rwxr-xr-x（可執行程式/目錄）、644=rw-r--r--（一般檔案）、600=rw-------（私密檔案）、700=rwx------（私密目錄/腳本）、777=rwxrwxrwx（不建議，危險）。", en: "755=rwxr-xr-x (executable/dir), 644=rw-r--r-- (regular file), 600=rw------- (private file), 700=rwx------ (private dir/script), 777=rwxrwxrwx (not recommended, dangerous)." }, lang)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-black text-violet-700">{l({ zh: "目錄 vs 檔案差異", en: "Directory vs File Differences" }, lang)}</h4>
              <p className="mt-2 text-sm font-black text-gray-600">{l({ zh: "目錄的執行(x)位元代表「可以進入」而非「可以執行」。目錄的讀取(r)代表「可以列出內容」。沒有 x 位元則即使有 r 也無法存取目錄內檔案。", en: "For directories, execute(x) bit means 'can enter' not 'can execute'. Read(r) means 'can list contents'. Without x bit, even with r, files inside are inaccessible." }, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* L13-FAQ */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[2rem] bg-white/80 p-6 shadow">
          <h3 className="font-black text-violet-800">{l({ zh: "常見問題", en: "FAQ" }, lang)}</h3>
          <div className="mt-4 space-y-4">
            <details className="rounded-xl bg-violet-50 p-4">
              <summary className="cursor-pointer font-black text-violet-700">{l({ zh: "chmod 777 為什麼危險？", en: "Why is chmod 777 dangerous?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "777 表示任何人都能讀取、寫入、執行該檔案。攻擊者可修改內容、植入惡意程式碼或刪除檔案。永遠使用最小必要權限原則。", en: "777 means anyone can read, write, and execute the file. Attackers can modify contents, plant malicious code, or delete files. Always use the principle of least privilege." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-purple-50 p-4">
              <summary className="cursor-pointer font-black text-purple-700">{l({ zh: "什麼時候需要特殊權限？", en: "When do I need special permissions?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "SetUID 用於需要 root 權限執行的程式（如 passwd）。SetGID 用於共用目錄。Sticky Bit 用於臨時目錄。日常使用很少需要特殊權限。", en: "SetUID for programs needing root privileges (like passwd). SetGID for shared directories. Sticky Bit for temp directories. Daily use rarely needs special permissions." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-fuchsia-50 p-4">
              <summary className="cursor-pointer font-black text-fuchsia-700">{l({ zh: "數字和符號哪個好？", en: "Numeric vs Symbolic notation?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "數字表示法簡潔（chmod 755），適合完整設定。符號表示法靈活（chmod u+x），適合部分修改。本工具同時顯示兩種格式。", en: "Numeric notation is concise (chmod 755), good for complete settings. Symbolic notation is flexible (chmod u+x), good for partial changes. This tool shows both formats." }, lang)}</p>
            </details>
            <details className="rounded-xl bg-violet-50 p-4">
              <summary className="cursor-pointer font-black text-violet-700">{l({ zh: "如何遞迴設定目錄權限？", en: "How to set directory permissions recursively?" }, lang)}</summary>
              <p className="mt-2 font-black text-gray-600">{l({ zh: "使用 chmod -R 遞迴設定。建議分開處理：find /path -type d -exec chmod 755 {} \\; 和 find /path -type f -exec chmod 644 {} \\;。", en: "Use chmod -R for recursive setting. Recommended: process separately — find /path -type d -exec chmod 755 {} \\; and find /path -type f -exec chmod 644 {} \\;." }, lang)}</p>
            </details>
          </div>
        </div>
      </section>

      {/* L14-FAQAfterAdSlot */}
      <section className="mx-auto max-w-7xl px-4 py-2">
        <AdSlot slot="dev-chmod-faq" position="inline" />
      </section>

      {/* L15-AffiliateResources */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-violet-50 to-purple-50 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "推薦資源", en: "Recommended Resources" }, lang)}</h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
            <a href="https://man7.org/linux/man-pages/man1/chmod.1.html" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-violet-700">chmod man page</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "Linux chmod 官方手冊", en: "Linux chmod official manual" }, lang)}</p>
            </a>
            <a href="https://wiki.archlinux.org/title/File_permissions_and_attributes" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-purple-700">ArchWiki Permissions</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "檔案權限完整指南", en: "Complete file permissions guide" }, lang)}</p>
            </a>
            <a href="https://chmodcommand.com" target="_blank" rel="noopener"
              className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
              <p className="font-black text-fuchsia-700">chmodcommand.com</p>
              <p className="text-xs font-black text-gray-500">{l({ zh: "線上 chmod 參考", en: "Online chmod reference" }, lang)}</p>
            </a>
          </div>
        </div>
      </section>

      {/* L16-PremiumGate */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <PremiumGate plan="PRO">
          <div className="rounded-[2rem] bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
            <h3 className="font-black text-amber-800">{l({ zh: "進階功能", en: "Premium Features" }, lang)}</h3>
            <p className="mt-2 font-black text-gray-600">{l({ zh: "升級 PRO 解鎖：ACL 存取控制清單產生器、SELinux 上下文設定、遞迴權限批次產生、chmod 歷史記錄、無廣告體驗。", en: "Upgrade to PRO to unlock: ACL access control list generator, SELinux context settings, recursive batch permission generation, chmod history log, ad-free experience." }, lang)}</p>
          </div>
        </PremiumGate>
      </section>

      {/* L17-TrustRelatedReferences */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-[2rem] bg-white/60 p-6">
          <h3 className="font-black text-violet-800">{l({ zh: "參考來源", en: "References" }, lang)}</h3>
          <ul className="mt-3 space-y-2 text-sm font-black text-gray-600">
            <li className="font-black">&bull; POSIX.1-2017. {l({ zh: "檔案系統權限標準規範", en: "File system permissions standard specification" }, lang)}.</li>
            <li className="font-black">&bull; Stevens, W.R. (2013). <em>Advanced Programming in the UNIX Environment</em>, 3rd ed.</li>
            <li className="font-black">&bull; The Linux Documentation Project. {l({ zh: "Linux 權限管理指南", en: "Linux permissions management guide" }, lang)}.</li>
            <li className="font-black">&bull; Nemeth, E. et al. (2018). <em>UNIX and Linux System Administration Handbook</em>, 5th ed.</li>
          </ul>
        </div>
      </section>

      <footer className="py-6 text-center text-xs font-black text-gray-400">
        {l({ zh: "Chmod 權限計算器 © 2026 — 瀏覽器端工具，零資料傳輸", en: "Chmod Calculator © 2026 — Browser-based tool, zero data transmission" }, lang)}
      </footer>
    </div>
  );
}
