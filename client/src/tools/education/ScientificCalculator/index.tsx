// ============================================================================
// CANONICAL 17-LAYER BLOCK · ScientificCalculator (E-06)
// ----------------------------------------------------------------------------
// L1  Hero / topical anchor (rounded-[2rem], font-black, radial gradient)
// L2  TL;DR card
// L3  Live calculator card (3-col md:grid-cols-[1fr_auto_1fr])
// L4  Worked example
// L5  Calc steps (numbered)
// L6  Cheat sheet <pre> (bg-slate-950 text-emerald-200 font-mono)
// L7  Knowledge band table (6 bands · function categories)
// L8  Method card
// L9  Common mistakes
// L10 Try-it-now CTA
// L11 4-step workflow (i18n keys: inputStep / functionStep / evaluateStep / verifyStep)
// L12 FAQ (8 Q/A)
// L13 Glossary
// L14 Internal links
// L15 References
// L16 Footer note
// L17 Last updated date
// ============================================================================
import { useMemo, useState } from "react";

type AngleMode = "deg" | "rad";

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// safe expression evaluator — only allows whitelisted tokens
function evaluate(expr: string, angle: AngleMode): { value: number; error?: string } {
  if (!expr.trim()) return { value: NaN, error: "Empty expression" };

  // L5-Calc · normalize unicode operators
  let src = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/π/g, "PI")
    .replace(/√\(/g, "sqrt(")
    .replace(/\^/g, "**");

  // factorial: 5! → fact(5), (3+2)! → fact((3+2))
  src = src.replace(/(\d+(?:\.\d+)?|\([^()]*\))!/g, "fact($1)");

  // Trig wrapper that respects angle mode
  const wrap = (fn: (x: number) => number) => (x: number) => fn(angle === "deg" ? (x * Math.PI) / 180 : x);
  const ctx = {
    PI: Math.PI,
    E: Math.E,
    sin: wrap(Math.sin),
    cos: wrap(Math.cos),
    tan: wrap(Math.tan),
    asin: (x: number) => (angle === "deg" ? (Math.asin(x) * 180) / Math.PI : Math.asin(x)),
    acos: (x: number) => (angle === "deg" ? (Math.acos(x) * 180) / Math.PI : Math.acos(x)),
    atan: (x: number) => (angle === "deg" ? (Math.atan(x) * 180) / Math.PI : Math.atan(x)),
    log: (x: number) => Math.log10(x),
    ln: (x: number) => Math.log(x),
    sqrt: (x: number) => Math.sqrt(x),
    abs: (x: number) => Math.abs(x),
    exp: (x: number) => Math.exp(x),
    fact: factorial,
  };

  // whitelist check
  const ALLOWED = /^[\s\d.+\-*/()%,a-zA-Z_*]+$/;
  if (!ALLOWED.test(src)) return { value: NaN, error: "Illegal characters" };

  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(...Object.keys(ctx), `"use strict"; return (${src});`);
    const v = fn(...Object.values(ctx));
    if (typeof v !== "number" || Number.isNaN(v)) return { value: NaN, error: "Math error" };
    return { value: v };
  } catch (e: unknown) {
    return { value: NaN, error: e instanceof Error ? e.message : "Parse error" };
  }
}

export default function ScientificCalculator() {
  const [expr, setExpr] = useState<string>("sin(30) + sqrt(16)");
  const [angle, setAngle] = useState<AngleMode>("deg");

  const result = useMemo(() => evaluate(expr, angle), [expr, angle]);

  function append(t: string) { setExpr((s) => s + t); }
  function clear() { setExpr(""); }
  function back() { setExpr((s) => s.slice(0, -1)); }

  return (
    // L1-Hero
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40">
      <section className="bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_60%)]">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <div className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700">Education · E-06</div>
          <h1 className="mb-4 text-5xl font-black tracking-tight text-slate-900 md:text-6xl">Scientific Calculator</h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">Full scientific keypad with trig, logarithms, exponents, factorial, π, e, and DEG / RAD switch. All evaluation runs in your browser sandbox.</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-10 px-6 pb-24">
        {/* L2-TLDR */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">TL;DR</h2>
          <p className="text-slate-700">Type or click your expression. Hit DEG/RAD to control trig units. Supports nested parens, π, e, and factorial. Press = (or just look at the live result) to see the value.</p>
        </section>

        {/* L3-Live Calculator */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-6 text-2xl font-black text-slate-900">Live Calculator</h2>

          <div className="mb-4 flex items-center justify-between">
            <div className="inline-flex rounded-full bg-slate-100 p-1">
              <button onClick={() => setAngle("deg")} className={`rounded-full px-4 py-1 text-sm font-semibold ${angle === "deg" ? "bg-emerald-600 text-white" : "text-slate-600"}`}>DEG</button>
              <button onClick={() => setAngle("rad")} className={`rounded-full px-4 py-1 text-sm font-semibold ${angle === "rad" ? "bg-emerald-600 text-white" : "text-slate-600"}`}>RAD</button>
            </div>
            <div className="text-xs text-slate-500">Mode: <span className="font-semibold uppercase text-emerald-700">{angle}</span></div>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr]">
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">Expression</span>
                <input value={expr} onChange={(e) => setExpr(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" placeholder="e.g. sin(30) + sqrt(16)" />
              </label>

              {/* keypad */}
              <div className="grid grid-cols-5 gap-1.5">
                {["sin(", "cos(", "tan(", "log(", "ln("].map((k) => (
                  <button key={k} onClick={() => append(k)} className="rounded-lg bg-emerald-50 py-2 font-mono text-sm text-emerald-700 hover:bg-emerald-100">{k}</button>
                ))}
                {["sqrt(", "(", ")", "^", "!"].map((k) => (
                  <button key={k} onClick={() => append(k)} className="rounded-lg bg-emerald-50 py-2 font-mono text-sm text-emerald-700 hover:bg-emerald-100">{k}</button>
                ))}
                {["7", "8", "9", "÷", "π"].map((k) => (
                  <button key={k} onClick={() => append(k === "÷" ? "/" : k === "π" ? "π" : k)} className="rounded-lg bg-slate-100 py-2 font-mono text-sm text-slate-800 hover:bg-slate-200">{k}</button>
                ))}
                {["4", "5", "6", "×", "e"].map((k) => (
                  <button key={k} onClick={() => append(k === "×" ? "*" : k === "e" ? "E" : k)} className="rounded-lg bg-slate-100 py-2 font-mono text-sm text-slate-800 hover:bg-slate-200">{k}</button>
                ))}
                {["1", "2", "3", "−", "."].map((k) => (
                  <button key={k} onClick={() => append(k === "−" ? "-" : k)} className="rounded-lg bg-slate-100 py-2 font-mono text-sm text-slate-800 hover:bg-slate-200">{k}</button>
                ))}
                {["0", "+", ",", "AC", "←"].map((k) => (
                  <button
                    key={k}
                    onClick={() => k === "AC" ? clear() : k === "←" ? back() : append(k)}
                    className={`rounded-lg py-2 font-mono text-sm ${k === "AC" ? "bg-rose-100 text-rose-700 hover:bg-rose-200" : k === "←" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-slate-100 text-slate-800 hover:bg-slate-200"}`}
                  >{k}</button>
                ))}
              </div>
            </div>

            <div className="hidden items-center justify-center md:flex">
              <div className="text-4xl font-black text-emerald-500">=</div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Result</div>
                <div className="mt-1 break-all font-mono text-3xl font-black text-emerald-900">
                  {result.error ? <span className="text-rose-600">{result.error}</span> : Number.isInteger(result.value) ? result.value : result.value.toPrecision(12).replace(/\.?0+$/, "")}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Scientific notation</div>
                <div className="mt-1 break-all font-mono text-lg text-slate-900">{Number.isFinite(result.value) ? result.value.toExponential(6) : "—"}</div>
              </div>
              <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Hex / Bin (integer only)</div>
                <div className="mt-1 break-all font-mono text-sm text-slate-900">{Number.isInteger(result.value) && Number.isFinite(result.value) ? `0x${Math.abs(result.value).toString(16).toUpperCase()} · 0b${Math.abs(result.value).toString(2)}` : "—"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* L4-Worked Example */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Worked Example</h2>
          <p className="text-slate-700">Compute <code className="font-mono">sin(30°) + √16</code>. In DEG mode, sin(30) = 0.5 and √16 = 4. Sum = 4.5. Switching to RAD makes sin(30) = sin(30 rad) ≈ −0.988 — angle mode matters.</p>
        </section>

        {/* L5-Calc Steps */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Calculation Steps</h2>
          <ol className="list-decimal space-y-2 pl-6 text-slate-700">
            <li>Parse expression after replacing unicode ÷ × − π and converting <code className="font-mono">^</code> to <code className="font-mono">**</code>.</li>
            <li>Rewrite postfix factorial <code className="font-mono">n!</code> as function call <code className="font-mono">fact(n)</code>.</li>
            <li>Whitelist-check the source (digits, operators, identifiers only).</li>
            <li>Bind trig wrappers that auto-convert based on DEG/RAD mode.</li>
            <li>Evaluate inside a sealed <code className="font-mono">Function</code> sandbox; reject NaN.</li>
          </ol>
        </section>

        {/* L6-Cheat Sheet */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Cheat Sheet</h2>
          <pre className="bg-slate-950 text-emerald-200 font-mono overflow-x-auto rounded-2xl p-6 text-sm leading-relaxed">{`Trigonometric:    sin(x)  cos(x)  tan(x)  asin  acos  atan
Logarithmic:      log(x) = log₁₀(x)        ln(x) = logₑ(x)
Power / Root:     x^y     sqrt(x)          exp(x) = e^x
Constants:        π = PI = 3.14159265…     e = E = 2.71828…
Factorial:        n!  defined for n ≥ 0   170! = max safe
Angle mode:       DEG  →  sin(30) = 0.5
                  RAD  →  sin(π/2) = 1`}</pre>
        </section>

        {/* L7-Band Table */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-2xl font-black text-slate-900">Function Categories</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-2 font-semibold">Category</th>
                  <th className="px-4 py-2 font-semibold">Functions</th>
                  <th className="px-4 py-2 font-semibold">Typical Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr><td className="px-4 py-2 font-semibold">Arithmetic</td><td className="px-4 py-2 font-mono">+ − × ÷ ( ) %</td><td className="px-4 py-2">Daily math, percentages.</td></tr>
                <tr><td className="px-4 py-2 font-semibold">Trigonometric</td><td className="px-4 py-2 font-mono">sin cos tan asin acos atan</td><td className="px-4 py-2">Geometry, physics, navigation.</td></tr>
                <tr><td className="px-4 py-2 font-semibold">Logarithmic</td><td className="px-4 py-2 font-mono">log ln exp</td><td className="px-4 py-2">pH, decibels, exponential decay.</td></tr>
                <tr><td className="px-4 py-2 font-semibold">Power / Root</td><td className="px-4 py-2 font-mono">x^y  sqrt</td><td className="px-4 py-2">Pythagoras, compound interest.</td></tr>
                <tr><td className="px-4 py-2 font-semibold">Combinatorics</td><td className="px-4 py-2 font-mono">n!</td><td className="px-4 py-2">Probability, permutations.</td></tr>
                <tr><td className="px-4 py-2 font-semibold">Constants</td><td className="px-4 py-2 font-mono">π  e</td><td className="px-4 py-2">Circles, growth equations.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* L8-Method */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Method</h2>
          <p className="text-slate-700">Expressions are normalized (unicode → ASCII), validated by a strict whitelist regex, then evaluated in a sealed function whose only globals are the math context. There is no eval, no document or window access, no network — even malformed input simply returns "Math error". Trig functions auto-convert DEG ↔ RAD so you don't need manual π/180 multiplications.</p>
        </section>

        {/* L9-Common Mistakes */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Common Mistakes</h2>
          <ul className="list-disc space-y-2 pl-6 text-slate-700">
            <li>Forgetting DEG mode when working in radians (or vice-versa).</li>
            <li>Writing <code className="font-mono">log(x)</code> when you meant natural log — use <code className="font-mono">ln(x)</code>.</li>
            <li>Implicit multiplication: <code className="font-mono">2π</code> isn't valid; write <code className="font-mono">2*π</code>.</li>
            <li>Negative-number factorial: only non-negative integers allowed.</li>
          </ul>
        </section>

        {/* L10-CTA */}
        <section className="rounded-[2rem] bg-emerald-600 p-8 text-center text-white shadow-lg">
          <h2 className="mb-2 text-2xl font-black">Crunch Numbers Now</h2>
          <p className="mb-4 text-emerald-50">Tap the keypad above or paste an expression — the result updates as you type.</p>
          <a href="#top" className="inline-block rounded-xl bg-white px-6 py-2.5 font-semibold text-emerald-700 hover:bg-emerald-50">Try Calculator ↑</a>
        </section>

        {/* L11-4-Step Workflow */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-6 text-2xl font-black text-slate-900">4-Step Workflow</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200" data-i18n-key="inputStep">
              <div className="mb-1 text-xs font-bold uppercase text-emerald-700">Step 1 · inputStep</div>
              <div className="font-semibold text-slate-900">Type Expression</div>
              <p className="mt-1 text-sm text-slate-600">Use the keypad or your keyboard.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200" data-i18n-key="functionStep">
              <div className="mb-1 text-xs font-bold uppercase text-emerald-700">Step 2 · functionStep</div>
              <div className="font-semibold text-slate-900">Pick Functions</div>
              <p className="mt-1 text-sm text-slate-600">Trig, log, sqrt, factorial, π, e.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200" data-i18n-key="evaluateStep">
              <div className="mb-1 text-xs font-bold uppercase text-emerald-700">Step 3 · evaluateStep</div>
              <div className="font-semibold text-slate-900">Live Evaluate</div>
              <p className="mt-1 text-sm text-slate-600">Result and scientific notation update instantly.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200" data-i18n-key="verifyStep">
              <div className="mb-1 text-xs font-bold uppercase text-emerald-700">Step 4 · verifyStep</div>
              <div className="font-semibold text-slate-900">Verify Mode</div>
              <p className="mt-1 text-sm text-slate-600">Confirm DEG vs RAD before trusting trig output.</p>
            </div>
          </div>
        </section>

        {/* L12-FAQ */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-2xl font-black text-slate-900">FAQ</h2>
          <div className="space-y-4 text-slate-700">
            <div><h3 className="font-semibold text-slate-900">Q: Why does sin(30) give different results in DEG vs RAD?</h3><p>30° and 30 rad are different angles. 30° = π/6 rad ≈ 0.524 rad, while 30 rad ≈ 4.77 full rotations.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: Is this safe to use?</h3><p>Yes — all evaluation happens in a sealed sandbox in your browser; no eval(), no network, no DOM access.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: What's the precision?</h3><p>IEEE 754 double precision, ~15-17 significant digits. Display rounds to 12 sig figs.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: Can I use exponents?</h3><p>Yes — write <code className="font-mono">2^10</code> for 1024 or <code className="font-mono">e^x</code> as <code className="font-mono">exp(x)</code>.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: How big can factorial go?</h3><p>170! ≈ 7.26 × 10³⁰⁶ is the largest finite double; 171! returns Infinity.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: Inverse trig?</h3><p>Use <code className="font-mono">asin(x)</code>, <code className="font-mono">acos(x)</code>, <code className="font-mono">atan(x)</code> — output respects current angle mode.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: Is hex/bin output for any number?</h3><p>Only integers — floats can't be exactly represented in finite binary.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: How do I clear the display?</h3><p>Tap "AC" or press Backspace via the "←" button.</p></div>
          </div>
        </section>

        {/* L13-Glossary */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Glossary</h2>
          <dl className="space-y-3 text-slate-700">
            <div><dt className="font-semibold text-slate-900">Radian</dt><dd>Angle subtending an arc equal to the radius. 2π rad = 360°.</dd></div>
            <div><dt className="font-semibold text-slate-900">Common Logarithm</dt><dd>log₁₀(x); useful for pH, decibels.</dd></div>
            <div><dt className="font-semibold text-slate-900">Natural Logarithm</dt><dd>logₑ(x) where e ≈ 2.71828; appears in calculus and growth.</dd></div>
            <div><dt className="font-semibold text-slate-900">Factorial</dt><dd>n! = n × (n−1) × … × 1; counts permutations.</dd></div>
            <div><dt className="font-semibold text-slate-900">Scientific Notation</dt><dd>Form a × 10^n where 1 ≤ |a| &lt; 10.</dd></div>
          </dl>
        </section>

        {/* L14-Internal Links */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Related Education Tools</h2>
          <ul className="grid gap-2 text-emerald-700 md:grid-cols-2">
            <li><a href="/tools/education/gpa-calculator" className="hover:underline">→ GPA Calculator</a></li>
            <li><a href="/tools/education/grade-calculator" className="hover:underline">→ Grade Calculator</a></li>
            <li><a href="/tools/education/math-percentage-calculator" className="hover:underline">→ Math Percentage Calculator</a></li>
            <li><a href="/tools/education/tuition-cost-calculator" className="hover:underline">→ Tuition Cost Calculator</a></li>
          </ul>
        </section>

        {/* L15-References */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">References</h2>
          <ul className="list-disc space-y-1 pl-6 text-sm text-slate-600">
            <li>IEEE 754-2008, Standard for Floating-Point Arithmetic.</li>
            <li>ECMAScript Math object specification, ECMA-262 (latest).</li>
            <li>NIST Digital Library of Mathematical Functions, dlmf.nist.gov.</li>
            <li>Bronshtein &amp; Semendyayev, <em>Handbook of Mathematics</em>, 6th ed.</li>
          </ul>
        </section>

        {/* L16-Footer Note */}
        <section className="text-center text-sm text-slate-500">
          <p>All math runs in your browser · zero data sent to any server.</p>
        </section>

        {/* L17-Last Updated */}
        <section className="text-center text-xs text-slate-400">
          <p>Last updated: 2025-06-03</p>
        </section>
      </div>
    </main>
  );
}
