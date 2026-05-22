import { useEffect, useState } from "react";

type Output = { value: string; error: string };

function rotateLeft(value: number, shift: number): number {
  return (value << shift) | (value >>> (32 - shift));
}

function addUnsigned(a: number, b: number): number {
  return (a + b) >>> 0;
}

function md5(input: string): string {
  const utf8 = unescape(encodeURIComponent(input));
  const words: number[] = [];
  const length = utf8.length;

  for (let i = 0; i < length; i += 1) {
    words[i >> 2] = words[i >> 2] || 0;
    words[i >> 2] |= utf8.charCodeAt(i) << ((i % 4) * 8);
  }

  words[length >> 2] = words[length >> 2] || 0;
  words[length >> 2] |= 0x80 << ((length % 4) * 8);
  words[(((length + 8) >> 6) << 4) + 14] = length * 8;

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const k = Array.from({ length: 64 }, (_, index) => Math.floor(Math.abs(Math.sin(index + 1)) * 2 ** 32) >>> 0);

  for (let i = 0; i < words.length; i += 16) {
    const originalA = a;
    const originalB = b;
    const originalC = c;
    const originalD = d;

    for (let j = 0; j < 64; j += 1) {
      let f = 0;
      let g = 0;

      if (j < 16) {
        f = (b & c) | (~b & d);
        g = j;
      } else if (j < 32) {
        f = (d & b) | (~d & c);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = b ^ c ^ d;
        g = (3 * j + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * j) % 16;
      }

      const temp = d;
      d = c;
      c = b;
      const sum = addUnsigned(addUnsigned(a, f), addUnsigned(k[j], words[i + g] || 0));
      b = addUnsigned(b, rotateLeft(sum, s[j]));
      a = temp;
    }

    a = addUnsigned(a, originalA);
    b = addUnsigned(b, originalB);
    c = addUnsigned(c, originalC);
    d = addUnsigned(d, originalD);
  }

  return [a, b, c, d]
    .map((word) => Array.from({ length: 4 }, (_, index) => ((word >> (index * 8)) & 0xff).toString(16).padStart(2, "0")).join(""))
    .join("");
}

async function digest(algorithm: AlgorithmIdentifier, input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default function HashGenerator() {
  const [input, setInput] = useState("Hello Matrix");
  const [result, setResult] = useState<Output>({ value: "", error: "" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function generateHashes() {
      try {
        if (!input) {
          setResult({ value: "", error: "" });
          return;
        }

        if (!crypto?.subtle) {
          throw new Error("目前瀏覽器不支援 Web Crypto API，無法產生 SHA 雜湊。");
        }

        const [sha1, sha256, sha512] = await Promise.all([
          digest("SHA-1", input),
          digest("SHA-256", input),
          digest("SHA-512", input),
        ]);

        if (!cancelled) {
          setResult({
            value: `MD5: ${md5(input)}\nSHA-1: ${sha1}\nSHA-256: ${sha256}\nSHA-512: ${sha512}`,
            error: "",
          });
        }
      } catch (error) {
        if (!cancelled) {
          setResult({ value: "", error: error instanceof Error ? error.message : "處理失敗，請檢查輸入內容。" });
        }
      }
    }

    generateHashes();
    return () => {
      cancelled = true;
    };
  }, [input]);

  const copyResult = async () => {
    if (!result.value) return;
    await navigator.clipboard.writeText(result.value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const clearAll = () => {
    setInput("");
    setCopied(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Hash Generator</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Hash生成器：輸入文字並即時生成 MD5、SHA-1、SHA-256 與 SHA-512 雜湊值。</p>
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <button type="button" onClick={copyResult} disabled={!result.value} className="ml-auto rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{copied ? "已複製" : "複製結果"}</button>
        <button type="button" onClick={clearAll} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-200 dark:hover:bg-red-950/40">清除</button>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">輸入</label>
          <textarea value={input} onChange={(event) => { setInput(event.target.value); setCopied(false); }} className="mt-3 min-h-96 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">輸出</p>
          {result.error ? <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{result.error}</div> : <pre className="mt-3 min-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">{result.value || "結果會顯示在這裡"}</pre>}
        </div>
      </section>
    </div>
  );
}
