// ============================================================================
// CANONICAL 17-LAYER BLOCK · FractionCalculator (E-07)
// ----------------------------------------------------------------------------
// L1  Hero / topical anchor (rounded-[2rem], font-black, radial gradient)
// L2  TL;DR card
// L3  Live calculator card (3-col md:grid-cols-[1fr_auto_1fr])
// L4  Worked example
// L5  Calc steps (numbered)
// L6  Cheat sheet <pre> (bg-slate-950 text-emerald-200 font-mono)
// L7  Knowledge band table (6 bands · operations & complexity)
// L8  Method card
// L9  Common mistakes
// L10 Try-it-now CTA
// L11 4-step workflow (i18n keys: inputStep / operationStep / reduceStep / interpretStep)
// L12 FAQ (8 Q/A)
// L13 Glossary
// L14 Internal links
// L15 References
// L16 Footer note
// L17 Last updated date
// ============================================================================
import { useMemo, useState } from "react";

type Op = "add" | "sub" | "mul" | "div";

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

interface Frac { n: number; d: number; }

function reduce(f: Frac): Frac {
  if (f.d === 0) return { n: NaN, d: 0 };
  const g = gcd(f.n, f.d);
  let n = f.n / g, d = f.d / g;
  if (d < 0) { n = -n; d = -d; }
  return { n, d };
}

function compute(a: Frac, b: Frac, op: Op): Frac {
  switch (op) {
    case "add": return reduce({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
    case "sub": return reduce({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
    case "mul": return reduce({ n: a.n * b.n, d: a.d * b.d });
    case "div": return reduce({ n: a.n * b.d, d: a.d * b.n });
  }
}

function toMixed(f: Frac): string {
  if (f.d === 0 || !Number.isFinite(f.n)) return "—";
  if (f.n === 0) return "0";
  const sign = f.n < 0 ? "−" : "";
  const an = Math.abs(f.n), ad = Math.abs(f.d);
  if (ad === 1) return `${sign}${an}`;
  const whole = Math.floor(an / ad);
  const rem = an % ad;
  if (whole === 0) return `${sign}${rem}/${ad}`;
  if (rem === 0) return `${sign}${whole}`;
  return `${sign}${whole} ${rem}/${ad}`;
}

export default function FractionCalculator() {
  const [a1, setA1] = useState<number>(1);
  const [a2, setA2] = useState<number>(2);
  const [b1, setB1] = useState<number>(1);
  const [b2, setB2] = useState<number>(3);
  const [op, setOp] = useState<Op>("add");

  const fa: Frac = { n: a1, d: a2 };
  const fb: Frac = { n: b1, d: b2 };

  const result = useMemo(() => compute(fa, fb, op), [a1, a2, b1, b2, op]);
  const decimal = result.d === 0 ? NaN : result.n / result.d;

  const opSym: Record<Op, string> = { add: "+", sub: "−", mul: "×", div: "÷" };

  const band = useMemo(() => {
    const ad = Math.abs(fa.d), bd = Math.abs(fb.d);
    const max = Math.max(ad, bd);
    if (max <= 4)   return { name: "Beginner",     hint: "Halves, thirds, quarters — mental math friendly.",       cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
    if (max <= 10)  return { name: "Elementary",   hint: "Up to 1/10 — common in daily measurement.",              cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
    if (max <= 16)  return { name: "Imperial",     hint: "1/16 inch — used in carpentry and machining.",            cls: "bg-yellow-50 text-yellow-800 ring-yellow-200" };
    if (max <= 64)  return { name: "Engineering",  hint: "1/64 inch — fine machining and precision tools.",         cls: "bg-orange-50 text-orange-700 ring-orange-200" };
    if (max <= 100) return { name: "Percentile",   hint: "Hundredths — basis points, statistics.",                  cls: "bg-orange-50 text-orange-700 ring-orange-200" };
    return                  { name: "Scientific",   hint: "Beyond 1/100 — convert to decimal for clarity.",         cls: "bg-rose-50 text-rose-700 ring-rose-200" };
  }, [fa.d, fb.d]);

  return (
    // L1-Hero
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40">
      <section className="bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_60%)]">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <div className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700">Education · E-07</div>
          <h1 className="mb-4 text-5xl font-black tracking-tight text-slate-900 md:text-6xl">Fraction Calculator</h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">Add, subtract, multiply, divide two fractions. Auto-reduce via GCD, output as mixed number, decimal, and percent. Six-band complexity matrix.</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-10 px-6 pb-24">
        {/* L2-TLDR */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">TL;DR</h2>
          <p className="text-slate-700">Type two fractions, pick an operator, and the result appears reduced to lowest terms with mixed-number, decimal, and percent equivalents — useful for cooking, carpentry, and math homework.</p>
        </section>

        {/* L3-Live Calculator */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-6 text-2xl font-black text-slate-900">Live Calculator</h2>

          <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <input type="number" value={a1} onChange={(e) => setA1(Number(e.target.value) || 0)} className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-center font-mono text-2xl font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                  <div className="my-1 h-px w-24 bg-slate-400" />
                  <input type="number" value={a2} onChange={(e) => setA2(Number(e.target.value) || 1)} className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-center font-mono text-2xl font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                </div>

                <select value={op} onChange={(e) => setOp(e.target.value as Op)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-2xl font-bold text-emerald-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                  <option value="add">+</option>
                  <option value="sub">−</option>
                  <option value="mul">×</option>
                  <option value="div">÷</option>
                </select>

                <div className="flex flex-col items-center">
                  <input type="number" value={b1} onChange={(e) => setB1(Number(e.target.value) || 0)} className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-center font-mono text-2xl font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                  <div className="my-1 h-px w-24 bg-slate-400" />
                  <input type="number" value={b2} onChange={(e) => setB2(Number(e.target.value) || 1)} className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-center font-mono text-2xl font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                </div>
              </div>

              <div className="text-sm text-slate-600">
                Expression: <span className="font-mono">{a1}/{a2} {opSym[op]} {b1}/{b2}</span>
              </div>
            </div>

            <div className="hidden items-center justify-center md:flex">
              <div className="text-4xl font-black text-emerald-500">=</div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Reduced fraction</div>
                <div className="mt-1 font-mono text-4xl font-black text-emerald-900">
                  {result.d === 0 ? "÷ by 0" : `${result.n}/${result.d}`}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Mixed number</div>
                <div className="mt-1 font-mono text-2xl font-bold text-slate-900">{toMixed(result)}</div>
              </div>
              <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Decimal · Percent</div>
                <div className="mt-1 font-mono text-lg text-slate-900">
                  {Number.isFinite(decimal) ? `${decimal.toFixed(6).replace(/\.?0+$/, "")}  ·  ${(decimal * 100).toFixed(4).replace(/\.?0+$/, "")}%` : "—"}
                </div>
              </div>
              <div className={`rounded-full px-4 py-2 text-center text-sm font-semibold ring-1 ${band.cls}`}>{band.name} · {band.hint}</div>
            </div>
          </div>
        </section>

        {/* L4-Worked Example */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Worked Example</h2>
          <p className="text-slate-700">Compute <code className="font-mono">1/2 + 1/3</code>. Common denominator is 6 (LCM of 2 and 3). Convert: <code className="font-mono">3/6 + 2/6 = 5/6</code>. GCD(5, 6) = 1 so the result stays at 5/6 ≈ 0.833 ≈ 83.3%.</p>
        </section>

        {/* L5-Calc Steps */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Calculation Steps</h2>
          <ol className="list-decimal space-y-2 pl-6 text-slate-700">
            <li>Read inputs as <code className="font-mono">a/b</code> and <code className="font-mono">c/d</code>.</li>
            <li>Apply operator: add/sub use cross-multiplication <code className="font-mono">(ad ± bc)/bd</code>; mul = <code className="font-mono">ac/bd</code>; div = <code className="font-mono">ad/bc</code>.</li>
            <li>Compute GCD of numerator and denominator via Euclidean algorithm.</li>
            <li>Divide both by GCD to get lowest terms; normalize sign to numerator.</li>
            <li>Derive mixed number, decimal (n÷d), and percent (×100).</li>
          </ol>
        </section>

        {/* L6-Cheat Sheet */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Cheat Sheet</h2>
          <pre className="bg-slate-950 text-emerald-200 font-mono overflow-x-auto rounded-2xl p-6 text-sm leading-relaxed">{`Add / Sub:    a/b ± c/d  =  (ad ± bc) / bd
Multiply:     a/b · c/d  =  ac / bd
Divide:       a/b ÷ c/d  =  ad / bc       (c ≠ 0)
GCD:          gcd(a,b) = gcd(b, a mod b)  (Euclid)
Reduce:       a/b → (a÷g)/(b÷g)            where g = gcd(a,b)
Mixed:        a/b = ⌊a/b⌋ + (a mod b)/b
Decimal:      a/b → numeric a÷b
Percent:      decimal × 100`}</pre>
        </section>

        {/* L7-Band Table */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-2xl font-black text-slate-900">Complexity Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-2 font-semibold">Tier</th>
                  <th className="px-4 py-2 font-semibold">Max Denominator</th>
                  <th className="px-4 py-2 font-semibold">Typical Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr><td className="px-4 py-2 font-semibold">Beginner</td><td className="px-4 py-2">≤ 4</td><td className="px-4 py-2">Halves, thirds, quarters — mental math.</td></tr>
                <tr><td className="px-4 py-2 font-semibold">Elementary</td><td className="px-4 py-2">5 – 10</td><td className="px-4 py-2">Cooking, simple measurement.</td></tr>
                <tr><td className="px-4 py-2 font-semibold">Imperial</td><td className="px-4 py-2">11 – 16</td><td className="px-4 py-2">Inches in carpentry / sewing.</td></tr>
                <tr><td className="px-4 py-2 font-semibold">Engineering</td><td className="px-4 py-2">17 – 64</td><td className="px-4 py-2">Machining, fine tolerances.</td></tr>
                <tr><td className="px-4 py-2 font-semibold">Percentile</td><td className="px-4 py-2">65 – 100</td><td className="px-4 py-2">Statistics, basis points.</td></tr>
                <tr><td className="px-4 py-2 font-semibold">Scientific</td><td className="px-4 py-2">&gt; 100</td><td className="px-4 py-2">Convert to decimal for clarity.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* L8-Method */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Method</h2>
          <p className="text-slate-700">All operations follow the standard arithmetic of rational numbers. Reduction uses Euclid's algorithm — provably the fastest method for integer GCD. Sign is normalized so the denominator is always positive, ensuring a unique canonical form. Division by zero is detected before evaluation and shown as a clear error rather than NaN.</p>
        </section>

        {/* L9-Common Mistakes */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Common Mistakes</h2>
          <ul className="list-disc space-y-2 pl-6 text-slate-700">
            <li>Adding numerators directly without finding a common denominator.</li>
            <li>Forgetting to flip the second fraction when dividing.</li>
            <li>Leaving 12/8 instead of reducing to 3/2 or mixed 1½.</li>
            <li>Negative sign on denominator — should always live on the numerator.</li>
          </ul>
        </section>

        {/* L10-CTA */}
        <section className="rounded-[2rem] bg-emerald-600 p-8 text-center text-white shadow-lg">
          <h2 className="mb-2 text-2xl font-black">Reduce Fractions Now</h2>
          <p className="mb-4 text-emerald-50">Type any two fractions and the auto-reduced result appears instantly.</p>
          <a href="#top" className="inline-block rounded-xl bg-white px-6 py-2.5 font-semibold text-emerald-700 hover:bg-emerald-50">Try Calculator ↑</a>
        </section>

        {/* L11-4-Step Workflow */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-6 text-2xl font-black text-slate-900">4-Step Workflow</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200" data-i18n-key="inputStep">
              <div className="mb-1 text-xs font-bold uppercase text-emerald-700">Step 1 · inputStep</div>
              <div className="font-semibold text-slate-900">Enter Fractions</div>
              <p className="mt-1 text-sm text-slate-600">Type numerators and denominators.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200" data-i18n-key="operationStep">
              <div className="mb-1 text-xs font-bold uppercase text-emerald-700">Step 2 · operationStep</div>
              <div className="font-semibold text-slate-900">Pick Operation</div>
              <p className="mt-1 text-sm text-slate-600">+, −, ×, or ÷.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200" data-i18n-key="reduceStep">
              <div className="mb-1 text-xs font-bold uppercase text-emerald-700">Step 3 · reduceStep</div>
              <div className="font-semibold text-slate-900">Auto-Reduce</div>
              <p className="mt-1 text-sm text-slate-600">GCD divides both parts to lowest terms.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200" data-i18n-key="interpretStep">
              <div className="mb-1 text-xs font-bold uppercase text-emerald-700">Step 4 · interpretStep</div>
              <div className="font-semibold text-slate-900">Interpret Output</div>
              <p className="mt-1 text-sm text-slate-600">Read fraction, mixed, decimal, and %.</p>
            </div>
          </div>
        </section>

        {/* L12-FAQ */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-2xl font-black text-slate-900">FAQ</h2>
          <div className="space-y-4 text-slate-700">
            <div><h3 className="font-semibold text-slate-900">Q: Why do I need a common denominator?</h3><p>You can only add or subtract fractions when their parts are the same size — like adding apples to apples.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: What's GCD?</h3><p>Greatest Common Divisor — the largest integer that divides both numerator and denominator evenly. Dividing by it gives the lowest-terms fraction.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: How do I divide fractions?</h3><p>Multiply by the reciprocal (flip the second fraction): <code className="font-mono">a/b ÷ c/d = a/b × d/c</code>.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: What if the denominator is zero?</h3><p>Division by zero is undefined — the result will display "÷ by 0".</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: Why does the sign always end up on the numerator?</h3><p>Convention — it gives every rational number a unique canonical form, so 1/−2 and −1/2 both render the same.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: Can I enter mixed numbers?</h3><p>Not directly — convert first: <code className="font-mono">2 ½ = 5/2</code>. (Coming in v2.)</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: How precise is the decimal?</h3><p>JavaScript double precision: ~15 significant digits, displayed up to 6 decimals.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: Are improper fractions OK?</h3><p>Yes — 7/2 is fine; the mixed-number column shows 3 ½ alongside.</p></div>
          </div>
        </section>

        {/* L13-Glossary */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Glossary</h2>
          <dl className="space-y-3 text-slate-700">
            <div><dt className="font-semibold text-slate-900">Numerator</dt><dd>Top number — how many parts you have.</dd></div>
            <div><dt className="font-semibold text-slate-900">Denominator</dt><dd>Bottom number — how many equal parts the whole is split into.</dd></div>
            <div><dt className="font-semibold text-slate-900">Proper Fraction</dt><dd>|n| &lt; |d|; value lies strictly between −1 and 1.</dd></div>
            <div><dt className="font-semibold text-slate-900">Improper Fraction</dt><dd>|n| ≥ |d|; can be rewritten as a mixed number.</dd></div>
            <div><dt className="font-semibold text-slate-900">Reciprocal</dt><dd>Swap numerator and denominator: reciprocal of 3/4 is 4/3.</dd></div>
          </dl>
        </section>

        {/* L14-Internal Links */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Related Education Tools</h2>
          <ul className="grid gap-2 text-emerald-700 md:grid-cols-2">
            <li><a href="/tools/education/scientific-calculator" className="hover:underline">→ Scientific Calculator</a></li>
            <li><a href="/tools/education/math-percentage-calculator" className="hover:underline">→ Math Percentage Calculator</a></li>
            <li><a href="/tools/education/grade-calculator" className="hover:underline">→ Grade Calculator</a></li>
            <li><a href="/tools/education/gpa-calculator" className="hover:underline">→ GPA Calculator</a></li>
          </ul>
        </section>

        {/* L15-References */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">References</h2>
          <ul className="list-disc space-y-1 pl-6 text-sm text-slate-600">
            <li>Knuth, D., <em>The Art of Computer Programming, Vol 2: Seminumerical Algorithms</em>, §4.5.</li>
            <li>NCTM, <em>Principles and Standards for School Mathematics</em>, 2000.</li>
            <li>Khan Academy, "Adding and Subtracting Fractions" curriculum module.</li>
            <li>Hardy &amp; Wright, <em>An Introduction to the Theory of Numbers</em>, 6th ed.</li>
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
