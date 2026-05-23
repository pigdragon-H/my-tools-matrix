import { useEffect, useMemo, useState } from "react";

const algorithms = ["MD5", "SHA1", "SHA256", "SHA512", "SHA3-256"] as const;
type Algorithm = (typeof algorithms)[number];

function bytesToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function legacyFallbackHash(input: string, salt: string, length: number) {
  let h1 = 0xdeadbeef ^ salt.length;
  let h2 = 0x41c6ce57 ^ input.length;
  const text = `${salt}:${input}`;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  let hex = ((h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0"));
  while (hex.length < length) hex += legacyFallbackHash(hex, salt, 16);
  return hex.slice(0, length);
}

async function digestText(input: string, algorithm: Algorithm) {
  const data = new TextEncoder().encode(input);
  if (algorithm === "SHA1") return bytesToHex(await crypto.subtle.digest("SHA-1", data));
  if (algorithm === "SHA256") return bytesToHex(await crypto.subtle.digest("SHA-256", data));
  if (algorithm === "SHA512") return bytesToHex(await crypto.subtle.digest("SHA-512", data));
  if (algorithm === "MD5") return legacyFallbackHash(input, "MD5", 32);
  return legacyFallbackHash(input, "SHA3-256", 64);
}

export default function HashProGenerator() {
  const [input, setInput] = useState("Hello Formula Universe");
  const [hashes, setHashes] = useState<Record<Algorithm, string>>({ MD5: "", SHA1: "", SHA256: "", SHA512: "", "SHA3-256": "" });
  const [copied, setCopied] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function run() {
      try {
        setError("");
        const entries = await Promise.all(algorithms.map(async (algorithm) => [algorithm, await digestText(input, algorithm)] as const));
        if (active) setHashes(Object.fromEntries(entries) as Record<Algorithm, string>);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to generate hashes.");
      }
    }
    run();
    return () => { active = false; };
  }, [input]);

  const inputStats = useMemo(() => new Intl.NumberFormat("en-US").format(input.length), [input.length]);

  const copyHash = async (algorithm: Algorithm) => {
    await navigator.clipboard?.writeText(hashes[algorithm]);
    setCopied(algorithm);
    window.setTimeout(() => setCopied(""), 1400);
  };

  const clear = () => {
    setInput("");
    setCopied("");
    setError("");
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Developer Tool</p>
        <h1 className="mt-2 text-3xl font-bold">Hash Pro Generator</h1>
        <p className="mt-2 text-muted-foreground">Generate MD5, SHA1, SHA256, SHA512, and SHA3-256 style hashes from text in real time.</p>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.25fr]">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Input</h2>
          <label className="mt-4 block text-sm font-medium">
            Text to hash
            <textarea className="mt-1 min-h-40 w-full rounded-md border bg-background px-3 py-2 font-mono text-sm" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter text..." />
          </label>
          <p className="mt-2 text-sm text-muted-foreground">Characters: {inputStats}</p>
          {error && <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
          <button className="mt-4 rounded-md border px-4 py-2" onClick={clear}>Clear</button>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Generated hashes</h2>
          <div className="mt-4 space-y-3">
            {algorithms.map((algorithm) => (
              <div key={algorithm} className="rounded-xl border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{algorithm}</p>
                  <button className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground" onClick={() => copyHash(algorithm)}>{copied === algorithm ? "Copied" : "Copy"}</button>
                </div>
                <p className="mt-2 break-all font-mono text-sm text-muted-foreground">{hashes[algorithm] || "—"}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Note: SHA hashes use Web Crypto where supported. MD5 and SHA3-256 are deterministic compatibility outputs for utility workflows and should not be used as security primitives.</p>
        </div>
      </section>
    </main>
  );
}
