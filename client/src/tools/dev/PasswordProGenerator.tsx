import { useMemo, useState } from "react";

const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lower = "abcdefghijklmnopqrstuvwxyz";
const digits = "0123456789";
const symbols = "!@#$%^&*()-_=+[]{};:,.?/";
const similar = new Set("0OolI1|`");

function randomIndex(max: number) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % max;
}

function makePassword(length: number, pools: string[], excludeSimilar: boolean) {
  const normalizedPools = pools.map((pool) => excludeSimilar ? Array.from(pool).filter((c) => !similar.has(c)).join("") : pool).filter(Boolean);
  const all = normalizedPools.join("");
  if (!all) return "";
  const chars: string[] = [];
  normalizedPools.forEach((pool) => chars.push(pool[randomIndex(pool.length)]));
  while (chars.length < length) chars.push(all[randomIndex(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, length).join("");
}

function scorePassword(password: string) {
  let score = 0;
  if (password.length >= 12) score += 25;
  if (password.length >= 20) score += 20;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[a-z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  return Math.min(100, score);
}

export default function PasswordProGenerator() {
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(5);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState("");

  const error = useMemo(() => {
    if (length < 8 || length > 128) return "Password length must be between 8 and 128 characters.";
    if (count < 1 || count > 20) return "Batch size must be between 1 and 20 passwords.";
    if (!useUpper && !useLower && !useDigits && !useSymbols) return "Select at least one character set.";
    return "";
  }, [length, count, useUpper, useLower, useDigits, useSymbols]);

  const strength = passwords[0] ? scorePassword(passwords[0]) : 0;
  const strengthLabel = strength >= 80 ? "Strong" : strength >= 55 ? "Medium" : strength > 0 ? "Weak" : "Not generated";

  const generate = () => {
    if (error) return;
    const pools = [useUpper ? upper : "", useLower ? lower : "", useDigits ? digits : "", useSymbols ? symbols : ""].filter(Boolean);
    setPasswords(Array.from({ length: count }, () => makePassword(length, pools, excludeSimilar)));
    setCopied("");
  };

  const copy = async (password: string) => {
    await navigator.clipboard?.writeText(password);
    setCopied(password);
    window.setTimeout(() => setCopied(""), 1400);
  };

  const clear = () => {
    setPasswords([]);
    setCopied("");
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Developer Tool</p>
        <h1 className="mt-2 text-3xl font-bold">Password Pro Generator</h1>
        <p className="mt-2 text-muted-foreground">Generate strong passwords with custom length, character sets, similar-character exclusion, and batch output.</p>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Options</h2>
          <label className="mt-4 block text-sm font-medium">Length: {length}
            <input className="mt-2 w-full" type="range" min="8" max="128" value={length} onChange={(e) => setLength(Number(e.target.value))} />
          </label>
          <label className="mt-4 block text-sm font-medium">Batch count: {count}
            <input className="mt-2 w-full" type="range" min="1" max="20" value={count} onChange={(e) => setCount(Number(e.target.value))} />
          </label>
          <div className="mt-4 grid gap-3 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} /> Uppercase A-Z</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} /> Lowercase a-z</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={useDigits} onChange={(e) => setUseDigits(e.target.checked)} /> Numbers 0-9</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} /> Special symbols</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={excludeSimilar} onChange={(e) => setExcludeSimilar(e.target.checked)} /> Exclude similar characters (0,O,l,1,etc.)</label>
          </div>
          {error && <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50" disabled={!!error} onClick={generate}>Generate</button>
            <button className="rounded-md border px-4 py-2" onClick={clear}>Clear</button>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Generated passwords</h2>
          <div className="mt-4 rounded-xl bg-muted p-4">
            <div className="flex justify-between text-sm"><span>Strength</span><span>{strengthLabel}</span></div>
            <div className="mt-2 h-3 rounded-full bg-background"><div className="h-3 rounded-full bg-primary" style={{ width: `${strength}%` }} /></div>
          </div>
          <div className="mt-4 space-y-3">
            {passwords.length ? passwords.map((password, index) => (
              <div key={`${password}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border bg-background p-3">
                <code className="break-all text-sm">{password}</code>
                <button className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground" onClick={() => copy(password)}>{copied === password ? "Copied" : "Copy"}</button>
              </div>
            )) : <p className="text-muted-foreground">Choose options and generate up to 20 passwords.</p>}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Use unique passwords for every account and store them in a trusted password manager.</p>
        </div>
      </section>
    </main>
  );
}
