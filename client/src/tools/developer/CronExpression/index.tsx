// D-14 Cron Expression Parser — JsonFormatter gold template (17 layers)
// Palette: indigo / violet · Domain: POSIX crontab(5) + Quartz 6/7-field
// References: POSIX crontab(5), Quartz Scheduler docs, RFC for cron is informal
// All evaluation happens browser-side. No network. No telemetry.

import { useMemo, useState } from "react";
import { Clock } from "lucide-react";

// ─── Field ranges (POSIX 5-field + Quartz second/year extensions) ──────────────
type Field = { name: string; min: number; max: number; aliases?: Record<string, number> };
const FIELDS_5: Field[] = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "day-of-month", min: 1, max: 31 },
  { name: "month", min: 1, max: 12, aliases: { JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12 } },
  { name: "day-of-week", min: 0, max: 6, aliases: { SUN:0,MON:1,TUE:2,WED:3,THU:4,FRI:5,SAT:6 } },
];
const FIELD_SECOND: Field = { name: "second", min: 0, max: 59 };
const FIELD_YEAR: Field = { name: "year", min: 1970, max: 2099 };

const NAMED: Record<string, string> = {
  "@yearly": "0 0 1 1 *", "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *", "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *", "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

// Parse a single field token like "*/5", "1-10", "MON-FRI", "1,3,5"
function parseField(tok: string, f: Field): Set<number> | null {
  const out = new Set<number>();
  const norm = (s: string): number | null => {
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    const a = f.aliases?.[s.toUpperCase()];
    return a ?? null;
  };
  for (const part of tok.split(",")) {
    let step = 1; let body = part;
    const sl = part.split("/");
    if (sl.length === 2) { step = parseInt(sl[1], 10); body = sl[0]; if (!Number.isFinite(step) || step < 1) return null; }
    let lo = f.min, hi = f.max;
    if (body === "*" || body === "?") { /* full range */ }
    else if (body.includes("-")) {
      const [a, b] = body.split("-"); const an = norm(a), bn = norm(b);
      if (an === null || bn === null) return null; lo = an; hi = bn;
    } else {
      const n = norm(body); if (n === null) return null; lo = n; hi = n;
    }
    if (lo < f.min || hi > f.max || lo > hi) return null;
    for (let i = lo; i <= hi; i += step) out.add(i);
  }
  return out.size ? out : null;
}

type Parsed = { fields: Field[]; sets: Set<number>[]; raw: string[] };
function parseCron(input: string): { ok: true; p: Parsed } | { ok: false; err: string } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, err: "empty expression" };
  const expanded = NAMED[trimmed.toLowerCase()] ?? trimmed;
  const toks = expanded.split(/\s+/);
  let fields: Field[];
  if (toks.length === 5) fields = FIELDS_5;
  else if (toks.length === 6) fields = [FIELD_SECOND, ...FIELDS_5];
  else if (toks.length === 7) fields = [FIELD_SECOND, ...FIELDS_5, FIELD_YEAR];
  else return { ok: false, err: `expected 5, 6, or 7 fields, got ${toks.length}` };
  const sets: Set<number>[] = [];
  for (let i = 0; i < toks.length; i++) {
    const s = parseField(toks[i], fields[i]);
    if (!s) return { ok: false, err: `invalid ${fields[i].name}: "${toks[i]}"` };
    sets.push(s);
  }
  return { ok: true, p: { fields, sets, raw: toks } };
}

// Compute next N fire times by stepping minute-by-minute from now (cap 366 days)
function nextFires(p: Parsed, count = 5): Date[] {
  const hasSecond = p.fields[0].name === "second";
  const fIdx = (n: string) => p.fields.findIndex(f => f.name === n);
  const sIdx = fIdx("second"), miIdx = fIdx("minute"), hIdx = fIdx("hour");
  const dIdx = fIdx("day-of-month"), moIdx = fIdx("month"), dowIdx = fIdx("day-of-week"), yIdx = fIdx("year");
  const out: Date[] = [];
  const start = new Date(); start.setMilliseconds(0);
  if (!hasSecond) start.setSeconds(0);
  start.setSeconds(start.getSeconds() + (hasSecond ? 1 : 60));
  const cap = Date.now() + 366 * 24 * 3600 * 1000;
  let cur = new Date(start);
  const stepMs = hasSecond ? 1000 : 60 * 1000;
  while (cur.getTime() < cap && out.length < count) {
    const sec = cur.getSeconds(), mi = cur.getMinutes(), h = cur.getHours();
    const d = cur.getDate(), mo = cur.getMonth() + 1, dow = cur.getDay(), y = cur.getFullYear();
    let ok = true;
    if (hasSecond && !p.sets[sIdx].has(sec)) ok = false;
    if (ok && !p.sets[miIdx].has(mi)) ok = false;
    if (ok && !p.sets[hIdx].has(h)) ok = false;
    if (ok && !p.sets[dIdx].has(d)) ok = false;
    if (ok && !p.sets[moIdx].has(mo)) ok = false;
    if (ok && !p.sets[dowIdx].has(dow)) ok = false;
    if (ok && yIdx >= 0 && !p.sets[yIdx].has(y)) ok = false;
    if (ok) out.push(new Date(cur));
    cur = new Date(cur.getTime() + stepMs);
  }
  return out;
}

// 6-band frequency readout based on density of fires per day
function bandOf(p: Parsed): { band: string; tone: string; label: string; emoji: string } {
  const hasSecond = p.fields[0].name === "second";
  const sec = hasSecond ? p.sets[0].size : 1;
  const mi = p.sets[hasSecond ? 1 : 0].size;
  const h = p.sets[hasSecond ? 2 : 1].size;
  const d = p.sets[hasSecond ? 3 : 2].size;
  const mo = p.sets[hasSecond ? 4 : 3].size;
  const dow = p.sets[hasSecond ? 5 : 4].size;
  const perDay = sec * mi * h * Math.min(d, dow * 4);
  if (perDay >= 86400) return { band: "every-second-spam", tone: "rose", label: "每秒級頻率(極高負載)", emoji: "🔴" };
  if (perDay >= 1440) return { band: "every-minute", tone: "orange", label: "每分鐘級(高頻)", emoji: "🟠" };
  if (perDay >= 24) return { band: "hourly", tone: "amber", label: "每小時級(中頻)", emoji: "🟡" };
  if (perDay >= 1) return { band: "daily", tone: "lime", label: "每日級(常規)", emoji: "🟢" };
  if (perDay >= 1/7) return { band: "weekly", tone: "teal", label: "每週級(低頻)", emoji: "🔵" };
  return { band: "rare", tone: "violet", label: "罕見/年度級", emoji: "🟣" };
}

const fmt = (d: Date) => d.toLocaleString("sv-SE", { hour12: false });
const fmtDelta = (d: Date) => {
  const ms = d.getTime() - Date.now();
  if (ms < 0) return "已過";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}秒後`;
  if (s < 3600) return `${Math.floor(s / 60)}分鐘後`;
  if (s < 86400) return `${Math.floor(s / 3600)}小時後`;
  return `${Math.floor(s / 86400)}天後`;
};

const SAMPLES = [
  { label: "@hourly",          v: "@hourly" },
  { label: "每天 03:30",       v: "30 3 * * *" },
  { label: "週一至週五 09 點", v: "0 9 * * MON-FRI" },
  { label: "每 15 分鐘",       v: "*/15 * * * *" },
  { label: "每月 1 號 00:00",  v: "0 0 1 * *" },
  { label: "Quartz 每秒",       v: "* * * * * ?" },
];

export default function CronExpression() {
  const [expr, setExpr] = useState("0 9 * * MON-FRI");
  const parsed = useMemo(() => parseCron(expr), [expr]);
  const fires = useMemo(() => parsed.ok ? nextFires(parsed.p, 5) : [], [parsed]);
  const band = useMemo(() => parsed.ok ? bandOf(parsed.p) : null, [parsed]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#ede9fe_0%,_#ffffff_55%,_#eef2ff_100%)] py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* L1 hero */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold tracking-widest uppercase">
            <Clock className="w-4 h-4" /> Developer · D-14
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Cron Expression Parser</h1>
          <p className="text-slate-600 text-lg font-medium">瀏覽器內解析 5/6/7 欄位 cron · 列出未來 5 次觸發 · 不上傳</p>
        </header>

        {/* L2 input card */}
        <section className="rounded-[2rem] bg-white shadow-xl border border-violet-100 p-8 space-y-5">
          <label className="block text-xs font-black uppercase tracking-widest text-violet-700">Cron 表達式</label>
          <input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="0 9 * * MON-FRI"
            className="w-full rounded-2xl border-2 border-violet-200 focus:border-violet-500 outline-none px-5 py-4 text-2xl font-mono font-black text-slate-900 bg-violet-50/40"
          />
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map(s => (
              <button key={s.label} onClick={() => setExpr(s.v)}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-violet-100 hover:bg-violet-200 text-violet-800 transition">
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* L3 status / band */}
        {parsed.ok && band ? (
          <section className={`rounded-[2rem] bg-${band.tone}-50 border-2 border-${band.tone}-200 p-8 grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center`}>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Frequency band</div>
              <div className={`text-3xl font-black text-${band.tone}-700`}>{band.emoji} {band.label}</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-slate-200" />
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">下一次觸發</div>
              <div className="text-2xl font-black text-slate-900 font-mono">{fires[0] ? fmt(fires[0]) : "—"}</div>
              <div className={`text-sm font-bold text-${band.tone}-700 mt-1`}>{fires[0] ? fmtDelta(fires[0]) : ""}</div>
            </div>
          </section>
        ) : (
          <section className="rounded-[2rem] bg-rose-50 border-2 border-rose-200 p-8">
            <div className="text-xs font-black uppercase tracking-widest text-rose-700 mb-2">Parse error</div>
            <div className="text-xl font-black text-rose-900 font-mono">{!parsed.ok ? parsed.err : ""}</div>
          </section>
        )}

        {/* L4 field decomposition */}
        {parsed.ok && (
          <section className="rounded-[2rem] bg-white shadow-xl border border-violet-100 p-8 space-y-4">
            <h2 className="text-2xl font-black text-slate-900">欄位分解</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-3">Field</th>
                    <th className="py-3 px-3">Token</th>
                    <th className="py-3 px-3">Range</th>
                    <th className="py-3 px-3">Matches</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.p.fields.map((f, i) => {
                    const set = parsed.p.sets[i];
                    const arr = Array.from(set).sort((a, b) => a - b);
                    const display = arr.length > 12 ? `${arr.slice(0, 6).join(", ")} … ${arr.slice(-3).join(", ")}` : arr.join(", ");
                    return (
                      <tr key={f.name} className="border-b border-slate-100 hover:bg-violet-50/40">
                        <td className="py-3 px-3 font-bold text-slate-900">{f.name}</td>
                        <td className="py-3 px-3 font-mono font-black text-violet-700">{parsed.p.raw[i]}</td>
                        <td className="py-3 px-3 font-mono text-slate-500">{f.min}–{f.max}</td>
                        <td className="py-3 px-3 font-mono text-slate-700">{display} <span className="text-xs text-slate-400">({set.size})</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* L5 next fires */}
        {parsed.ok && (
          <section className="rounded-[2rem] bg-white shadow-xl border border-violet-100 p-8 space-y-4">
            <h2 className="text-2xl font-black text-slate-900">未來 5 次觸發</h2>
            {fires.length === 0 ? (
              <p className="text-slate-500">未來 366 天內無觸發</p>
            ) : (
              <ol className="space-y-2">
                {fires.map((d, i) => (
                  <li key={i} className="flex items-center justify-between rounded-2xl bg-violet-50/40 border border-violet-100 px-5 py-3">
                    <span className="font-mono font-black text-slate-900">{fmt(d)}</span>
                    <span className="text-sm font-bold text-violet-700">{fmtDelta(d)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}

        {/* L6 6-band legend */}
        <section className="rounded-[2rem] bg-white shadow-xl border border-violet-100 p-8 space-y-4">
          <h2 className="text-2xl font-black text-slate-900">六階頻率讀數</h2>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4"><div className="font-black text-rose-700">🔴 every-second-spam</div><div className="text-slate-700">每秒觸發 · 極高負載</div></div>
            <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4"><div className="font-black text-orange-700">🟠 every-minute</div><div className="text-slate-700">每分鐘觸發 · 高頻</div></div>
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4"><div className="font-black text-amber-700">🟡 hourly</div><div className="text-slate-700">每小時觸發 · 中頻</div></div>
            <div className="rounded-2xl bg-lime-50 border border-lime-200 p-4"><div className="font-black text-lime-700">🟢 daily</div><div className="text-slate-700">每日觸發 · 常規</div></div>
            <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4"><div className="font-black text-teal-700">🔵 weekly</div><div className="text-slate-700">每週觸發 · 低頻</div></div>
            <div className="rounded-2xl bg-violet-50 border border-violet-200 p-4"><div className="font-black text-violet-700">🟣 rare</div><div className="text-slate-700">月度/年度級 · 罕見</div></div>
          </div>
        </section>

        {/* L7 syntax reference */}
        <section className="rounded-[2rem] bg-white shadow-xl border border-violet-100 p-8 space-y-3">
          <h2 className="text-2xl font-black text-slate-900">語法速查</h2>
          <ul className="space-y-2 text-sm text-slate-700 font-mono">
            <li><b className="text-violet-700">*</b> 任意值 · <b className="text-violet-700">?</b> 不指定(Quartz)</li>
            <li><b className="text-violet-700">a-b</b> 範圍 · <b className="text-violet-700">a,b,c</b> 列舉 · <b className="text-violet-700">*/n</b> 步進</li>
            <li>5 欄位:minute hour day-of-month month day-of-week</li>
            <li>6 欄位:second + 上述 5 欄位 (Quartz)</li>
            <li>7 欄位:second + 5 欄位 + year (Quartz)</li>
            <li>命名式:@yearly @monthly @weekly @daily @hourly</li>
          </ul>
        </section>

        {/* L8 references */}
        <section className="rounded-[2rem] bg-slate-50 border-2 border-slate-200 p-8 space-y-3">
          <h2 className="text-2xl font-black text-slate-900">標準依據</h2>
          <ul className="space-y-1 text-sm text-slate-700">
            <li>• POSIX <code className="font-mono text-violet-700">crontab(5)</code> — 5 欄位語法基礎</li>
            <li>• Quartz Scheduler — 6/7 欄位擴充(秒、年)</li>
            <li>• Vixie cron / cronie — 命名式 <code className="font-mono">@daily</code> 等</li>
            <li>• 此工具於瀏覽器內計算,不上傳表達式</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
