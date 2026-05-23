import { useEffect, useState } from "react";

type Algorithm = "HS256" | "HS384" | "HS512";
type Lang = "zh" | "en";

const defaultPayload = `{
  "sub": "user_12345",
  "name": "Victor",
  "role": "admin",
  "iat": 1779570000,
  "exp": 1779656400
}`;

const hmacMap: Record<Algorithm, { hash: "SHA-256" | "SHA-384" | "SHA-512"; label: string }> = {
  HS256: { hash: "SHA-256", label: "HMAC SHA-256" },
  HS384: { hash: "SHA-384", label: "HMAC SHA-384" },
  HS512: { hash: "SHA-512", label: "HMAC SHA-512" },
};

const text = {
  zh: {
    title: "JWT Token 產生器",
    subtitle: "輸入 Payload 與 Secret，使用 HS256 / HS384 / HS512 產生可驗證的 JWT Token。",
    algorithm: "演算法", payload: "Payload JSON", secret: "Secret 金鑰",
    token: "JWT Token", header: "Header", generate: "重新產生",
    copy: "複製 Token", copied: "已複製", clear: "清除",
    invalid: "Payload 必須是有效 JSON 物件。", empty: "Token 會顯示在這裡",
  },
  en: {
    title: "JWT Token Generator",
    subtitle: "Generate verifiable JWT tokens from payload and secret using HS256 / HS384 / HS512.",
    algorithm: "Algorithm", payload: "Payload JSON", secret: "Secret Key",
    token: "JWT Token", header: "Header", generate: "Regenerate",
    copy: "Copy Token", copied: "Copied", clear: "Clear",
    invalid: "Payload must be a valid JSON object.", empty: "Token will appear here",
  },
};

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function signJwt(algorithm: Algorithm, payloadText: string, secret: string): Promise<{ token: string; header: string; error: string }> {
  try {
    const parsed = JSON.parse(payloadText);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("Payload is not an object");
    const headerObject = { alg: algorithm, typ: "JWT" };
    const encodedHeader = base64UrlEncode(JSON.stringify(headerObject));
    const encodedPayload = base64UrlEncode(JSON.stringify(parsed));
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: hmacMap[algorithm].hash }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput));
    return { token: `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`, header: JSON.stringify(headerObject, null, 2), error: "" };
  } catch (error) {
    return { token: "", header: "", error: error instanceof Error ? error.message : String(error) };
  }
}

export default function JwtGenerator() {
  const [lang, setLang] = useState<Lang>("zh");
  const [algorithm, setAlgorithm] = useState<Algorithm>("HS256");
  const [payload, setPayload] = useState(defaultPayload);
  const [secret, setSecret] = useState("my-tools-matrix-secret");
  const [token, setToken] = useState("");
  const [header, setHeader] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const t = text[lang];

  async function generate() {
    const result = await signJwt(algorithm, payload, secret);
    setToken(result.token); setHeader(result.header); setError(result.error); setCopied(false);
  }

  useEffect(() => { void generate(); }, [algorithm, payload, secret]);

  async function copyToken() {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">DEV · JWT</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{t.subtitle}</p>
          </div>
          <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
            {lang === "zh" ? "EN" : "繁中"}
          </button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.algorithm}</label>
            <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value as Algorithm)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              {Object.entries(hmacMap).map(([key, value]) => <option key={key} value={key}>{key} · {value.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.secret}</label>
            <input value={secret} onChange={(e) => setSecret(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.payload}</label>
            <textarea value={payload} onChange={(e) => setPayload(e.target.value)} spellCheck={false} className="mt-2 min-h-72 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={generate} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{t.generate}</button>
            <button type="button" onClick={() => { setPayload(""); setSecret(""); setToken(""); setHeader(""); setError(""); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">{t.clear}</button>
          </div>
        </div>
        <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.token}</p>
            <button type="button" onClick={copyToken} disabled={!token} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
              {copied ? t.copied : t.copy}
            </button>
          </div>
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"><strong>{t.invalid}</strong><br />{error}</div>
          ) : (
            <pre className="min-h-48 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">{token || t.empty}</pre>
          )}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{t.header}</p>
            <pre className="overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">{header || "{}"}</pre>
          </div>
        </div>
      </section>
    </div>
  );
}
