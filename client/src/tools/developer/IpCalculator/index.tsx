// D-15 IP Calculator (IPv4 CIDR) — JsonFormatter gold template (17 layers)
// Palette: teal / cyan · Domain: IPv4 + CIDR
// References:
// - RFC 791  (IPv4)
// - RFC 4632 (CIDR)
// - RFC 1918 (Private)
// - RFC 5735 / 6890 (Special-use)
// - RFC 3927 (link-local 169.254/16)
// All math browser-side. No network calls.

import { useMemo, useState } from "react";
import { Network } from "lucide-react";

type ParseOk = { ok: true; ip: number; prefix: number };
type ParseErr = { ok: false; err: string };
function parseCidr(input: string): ParseOk | ParseErr {
  const t = input.trim();
  if (!t) return { ok: false, err: "empty input" };
  const [ipStr, prefStr] = t.split("/");
  const parts = ipStr.split(".");
  if (parts.length !== 4) return { ok: false, err: "invalid IPv4 (need 4 octets)" };
  let ip = 0;
  for (let i = 0; i < 4; i++) {
    if (!/^\d+$/.test(parts[i])) return { ok: false, err: `octet ${i + 1} not a number` };
    const n = parseInt(parts[i], 10);
    if (n < 0 || n > 255) return { ok: false, err: `octet ${i + 1} out of 0–255` };
    ip = (ip * 256) + n;
  }
  let prefix = 32;
  if (prefStr !== undefined) {
    if (!/^\d+$/.test(prefStr)) return { ok: false, err: "prefix not a number" };
    prefix = parseInt(prefStr, 10);
    if (prefix < 0 || prefix > 32) return { ok: false, err: "prefix out of 0–32" };
  }
  return { ok: true, ip: ip >>> 0, prefix };
}

const toIp = (n: number): string => [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(".");
const toBin = (n: number): string => {
  const s = (n >>> 0).toString(2).padStart(32, "0");
  return `${s.slice(0, 8)}.${s.slice(8, 16)}.${s.slice(16, 24)}.${s.slice(24, 32)}`;
};

type Calc = {
  netmask: number; wildcard: number;
  network: number; broadcast: number;
  first: number; last: number;
  total: number; usable: number;
  prefix: number; ip: number;
  classLetter: string; isPrivate: boolean; isLoopback: boolean; isLinkLocal: boolean;
  isMulticast: boolean; isReserved: boolean;
};

function calc(ip: number, prefix: number): Calc {
  const netmask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const wildcard = (~netmask) >>> 0;
  const network = (ip & netmask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const total = prefix === 32 ? 1 : prefix === 31 ? 2 : Math.pow(2, 32 - prefix);
  const usable = prefix >= 31 ? total : total - 2;
  const first = prefix >= 31 ? network : (network + 1) >>> 0;
  const last  = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0;
  const oct1 = (ip >>> 24) & 0xff;
  let classLetter = "E";
  if (oct1 < 128) classLetter = "A";
  else if (oct1 < 192) classLetter = "B";
  else if (oct1 < 224) classLetter = "C";
  else if (oct1 < 240) classLetter = "D"; // multicast
  // RFC 1918 private
  const isPrivate =
    (oct1 === 10) ||
    (oct1 === 172 && (((ip >>> 16) & 0xff) >= 16) && (((ip >>> 16) & 0xff) <= 31)) ||
    (oct1 === 192 && (((ip >>> 16) & 0xff) === 168));
  const isLoopback = oct1 === 127;
  const isLinkLocal = oct1 === 169 && (((ip >>> 16) & 0xff) === 254); // RFC 3927
  const isMulticast = oct1 >= 224 && oct1 < 240;
  const isReserved = oct1 >= 240; // class E
  return {
    netmask, wildcard, network, broadcast, first, last,
    total, usable, prefix, ip,
    classLetter, isPrivate, isLoopback, isLinkLocal, isMulticast, isReserved,
  };
}

// 6-band readout by /N
function bandOf(prefix: number, isPrivate: boolean): { tone: string; emoji: string; label: string } {
  if (prefix >= 31) return { tone: "rose",   emoji: "🔴", label: "單機/點對點(/31, /32)" };
  if (prefix >= 24) return { tone: "orange", emoji: "🟠", label: "小型子網(/24–/30)" };
  if (prefix >= 20) return { tone: "amber",  emoji: "🟡", label: "中型子網(/20–/23)" };
  if (prefix >= 16) return { tone: "lime",   emoji: "🟢", label: "大型子網(/16–/19)" };
  if (prefix >= 8)  return { tone: "teal",   emoji: "🔵", label: "超網/Class A 區段(/8–/15)" };
  return { tone: "violet", emoji: "🟣", label: isPrivate ? "極大私網" : "公網級超大段" };
}

const SAMPLES = [
  { label: "Home /24", v: "192.168.1.0/24" },
  { label: "Small /28", v: "10.0.0.0/28" },
  { label: "Class B /16", v: "172.16.0.0/16" },
  { label: "Class A /8", v: "10.0.0.0/8" },
  { label: "P2P /30", v: "203.0.113.0/30" },
  { label: "Loopback", v: "127.0.0.1/8" },
];

export default function IpCalculator() {
  const [input, setInput] = useState("192.168.1.0/24");
  const parsed = useMemo(() => parseCidr(input), [input]);
  const c = useMemo<Calc | null>(() => parsed.ok ? calc(parsed.ip, parsed.prefix) : null, [parsed]);
  const band = c ? bandOf(c.prefix, c.isPrivate) : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#ccfbf1_0%,_#ffffff_55%,_#cffafe_100%)] py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* L1 hero */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold tracking-widest uppercase">
            <Network className="w-4 h-4" /> Developer · D-15
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">IP Calculator</h1>
          <p className="text-slate-600 text-lg font-medium">IPv4 + CIDR · 子網計算 / 二進位視圖 / 主機數 · 不上傳</p>
        </header>

        {/* L2 input */}
        <section className="rounded-[2rem] bg-white shadow-xl border border-teal-100 p-8 space-y-5">
          <label className="block text-xs font-black uppercase tracking-widest text-teal-700">CIDR 表示式</label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="192.168.1.0/24"
            className="w-full rounded-2xl border-2 border-teal-200 focus:border-teal-500 outline-none px-5 py-4 text-2xl font-mono font-black text-slate-900 bg-teal-50/40"
          />
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map(s => (
              <button key={s.label} onClick={() => setInput(s.v)}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-teal-100 hover:bg-teal-200 text-teal-800 transition">
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* L3 status / band */}
        {c && band ? (
          <section className={`rounded-[2rem] bg-${band.tone}-50 border-2 border-${band.tone}-200 p-8 grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center`}>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Subnet band</div>
              <div className={`text-3xl font-black text-${band.tone}-700`}>{band.emoji} {band.label}</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-slate-200" />
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">可用主機數</div>
              <div className="text-3xl font-black text-slate-900 font-mono">{c.usable.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1 font-mono">total {c.total.toLocaleString()} addrs · prefix /{c.prefix}</div>
            </div>
          </section>
        ) : !parsed.ok ? (
          <section className="rounded-[2rem] bg-rose-50 border-2 border-rose-200 p-8">
            <div className="text-xs font-black uppercase tracking-widest text-rose-700 mb-2">Parse error</div>
            <div className="text-xl font-black text-rose-900 font-mono">{parsed.err}</div>
          </section>
        ) : null}

        {/* L4 core fields */}
        {c && (
          <section className="rounded-[2rem] bg-white shadow-xl border border-teal-100 p-8 space-y-4">
            <h2 className="text-2xl font-black text-slate-900">子網欄位</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-3">Field</th>
                    <th className="py-3 px-3">Decimal</th>
                    <th className="py-3 px-3">Binary</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["IP address",     c.ip],
                    ["Network",        c.network],
                    ["Broadcast",      c.broadcast],
                    ["First host",     c.first],
                    ["Last host",      c.last],
                    ["Subnet mask",    c.netmask],
                    ["Wildcard mask",  c.wildcard],
                  ].map(([name, v]) => (
                    <tr key={name as string} className="border-b border-slate-100 hover:bg-teal-50/40">
                      <td className="py-3 px-3 font-bold text-slate-900">{name}</td>
                      <td className="py-3 px-3 font-mono font-black text-teal-700">{toIp(v as number)}</td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-600">{toBin(v as number)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* L5 classification */}
        {c && (
          <section className="rounded-[2rem] bg-white shadow-xl border border-teal-100 p-8 space-y-4">
            <h2 className="text-2xl font-black text-slate-900">位址分類</h2>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4">
                <div className="font-black text-teal-700">傳統 Class</div>
                <div className="text-slate-700 font-mono">Class {c.classLetter} (oct1 = {(c.ip >>> 24) & 0xff})</div>
              </div>
              <div className={`rounded-2xl border p-4 ${c.isPrivate ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
                <div className={`font-black ${c.isPrivate ? "text-amber-700" : "text-emerald-700"}`}>RFC 1918 Private</div>
                <div className="text-slate-700">{c.isPrivate ? "✓ 私有位址(內網)" : "× 公有位址(可路由)"}</div>
              </div>
              <div className={`rounded-2xl border p-4 ${c.isLoopback ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200"}`}>
                <div className={`font-black ${c.isLoopback ? "text-rose-700" : "text-slate-700"}`}>Loopback (127/8)</div>
                <div className="text-slate-700">{c.isLoopback ? "✓ 本機回路" : "× 非 loopback"}</div>
              </div>
              <div className={`rounded-2xl border p-4 ${c.isLinkLocal ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-200"}`}>
                <div className={`font-black ${c.isLinkLocal ? "text-orange-700" : "text-slate-700"}`}>Link-local (RFC 3927)</div>
                <div className="text-slate-700">{c.isLinkLocal ? "✓ 169.254/16" : "× 非 link-local"}</div>
              </div>
              <div className={`rounded-2xl border p-4 ${c.isMulticast ? "bg-violet-50 border-violet-200" : "bg-slate-50 border-slate-200"}`}>
                <div className={`font-black ${c.isMulticast ? "text-violet-700" : "text-slate-700"}`}>Multicast (Class D)</div>
                <div className="text-slate-700">{c.isMulticast ? "✓ 224.0.0.0/4" : "× 非 multicast"}</div>
              </div>
              <div className={`rounded-2xl border p-4 ${c.isReserved ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200"}`}>
                <div className={`font-black ${c.isReserved ? "text-rose-700" : "text-slate-700"}`}>Reserved (Class E)</div>
                <div className="text-slate-700">{c.isReserved ? "✓ 240.0.0.0/4 保留" : "× 非保留"}</div>
              </div>
            </div>
          </section>
        )}

        {/* L6 range visualization */}
        {c && (
          <section className="rounded-[2rem] bg-white shadow-xl border border-teal-100 p-8 space-y-4">
            <h2 className="text-2xl font-black text-slate-900">位址範圍</h2>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 font-mono text-sm space-y-1.5">
              <div><span className="text-slate-500 inline-block w-32">Range start:</span> <span className="font-black text-teal-700">{toIp(c.network)}</span></div>
              <div><span className="text-slate-500 inline-block w-32">First host:</span>  <span className="font-black text-emerald-700">{toIp(c.first)}</span></div>
              <div><span className="text-slate-500 inline-block w-32">Your IP:</span>     <span className="font-black text-cyan-700">{toIp(c.ip)}</span></div>
              <div><span className="text-slate-500 inline-block w-32">Last host:</span>   <span className="font-black text-emerald-700">{toIp(c.last)}</span></div>
              <div><span className="text-slate-500 inline-block w-32">Range end:</span>   <span className="font-black text-teal-700">{toIp(c.broadcast)}</span></div>
            </div>
          </section>
        )}

        {/* L7 6-band legend */}
        <section className="rounded-[2rem] bg-white shadow-xl border border-teal-100 p-8 space-y-4">
          <h2 className="text-2xl font-black text-slate-900">六階子網讀數</h2>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4"><div className="font-black text-rose-700">🔴 /31, /32</div><div className="text-slate-700">點對點 / 單機</div></div>
            <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4"><div className="font-black text-orange-700">🟠 /24–/30</div><div className="text-slate-700">小型子網(家用 / 部門)</div></div>
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4"><div className="font-black text-amber-700">🟡 /20–/23</div><div className="text-slate-700">中型子網</div></div>
            <div className="rounded-2xl bg-lime-50 border border-lime-200 p-4"><div className="font-black text-lime-700">🟢 /16–/19</div><div className="text-slate-700">大型子網(校園 / 企業)</div></div>
            <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4"><div className="font-black text-teal-700">🔵 /8–/15</div><div className="text-slate-700">超網 / Class A 區段</div></div>
            <div className="rounded-2xl bg-violet-50 border border-violet-200 p-4"><div className="font-black text-violet-700">🟣 /0–/7</div><div className="text-slate-700">公網級超大段</div></div>
          </div>
        </section>

        {/* L8 references */}
        <section className="rounded-[2rem] bg-slate-50 border-2 border-slate-200 p-8 space-y-3">
          <h2 className="text-2xl font-black text-slate-900">標準依據</h2>
          <ul className="space-y-1 text-sm text-slate-700">
            <li>• <b>RFC 791</b> — Internet Protocol (IPv4)</li>
            <li>• <b>RFC 4632</b> — Classless Inter-Domain Routing (CIDR)</li>
            <li>• <b>RFC 1918</b> — Private address allocation (10/8, 172.16/12, 192.168/16)</li>
            <li>• <b>RFC 3927</b> — Link-local 169.254/16</li>
            <li>• <b>RFC 5735 / 6890</b> — Special-use IPv4 registry</li>
            <li>• <b>RFC 3021</b> — /31 prefix on point-to-point links</li>
            <li>• 此工具於瀏覽器內計算,不上傳 IP</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
