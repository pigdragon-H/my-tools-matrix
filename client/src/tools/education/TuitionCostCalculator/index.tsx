// ============================================================================
// CANONICAL 17-LAYER BLOCK · TuitionCostCalculator (E-05)
// ----------------------------------------------------------------------------
// L1  Hero / topical anchor (rounded-[2rem], font-black, radial gradient)
// L2  TL;DR card
// L3  Live calculator card (3-col md:grid-cols-[1fr_auto_1fr])
// L4  Worked example
// L5  Calc steps (numbered)
// L6  Cheat sheet <pre> (bg-slate-950 text-emerald-200 font-mono)
// L7  Knowledge band table (6 bands)
// L8  Method card
// L9  Common mistakes
// L10 Try-it-now CTA
// L11 4-step workflow (i18n keys: tuitionStep / livingStep / loanStep / totalStep)
// L12 FAQ (8 Q/A)
// L13 Glossary
// L14 Internal links
// L15 References
// L16 Footer note
// L17 Last updated date
// ============================================================================
import { useMemo, useState } from "react";

type Tier = "community" | "instate" | "outstate" | "private" | "ivy" | "international";

const TIER_PRESETS: Record<Tier, { tuition: number; living: number; label: string }> = {
  community:     { tuition:  4_000, living:  9_000, label: "Community College" },
  instate:       { tuition: 11_000, living: 13_000, label: "In-State Public" },
  outstate:      { tuition: 28_000, living: 14_000, label: "Out-of-State Public" },
  private:       { tuition: 42_000, living: 16_000, label: "Private University" },
  ivy:           { tuition: 60_000, living: 20_000, label: "Ivy / Elite Private" },
  international: { tuition: 35_000, living: 18_000, label: "International Student" },
};

function fmtUSD(n: number): string {
  if (!isFinite(n)) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

// monthly amortization payment for principal P, annual rate r%, term in years t
function monthlyPayment(P: number, rPct: number, years: number): number {
  if (P <= 0 || years <= 0) return 0;
  const r = rPct / 100 / 12;
  const n = years * 12;
  if (r === 0) return P / n;
  return (P * r) / (1 - Math.pow(1 + r, -n));
}

export default function TuitionCostCalculator() {
  const [tier, setTier] = useState<Tier>("instate");
  const [tuition, setTuition] = useState<number>(11_000);
  const [living, setLiving] = useState<number>(13_000);
  const [years, setYears] = useState<number>(4);
  const [aid, setAid] = useState<number>(2_000); // annual scholarships/grants
  const [loanRate, setLoanRate] = useState<number>(6.5);
  const [loanYears, setLoanYears] = useState<number>(10);

  function applyTier(t: Tier) {
    setTier(t);
    setTuition(TIER_PRESETS[t].tuition);
    setLiving(TIER_PRESETS[t].living);
  }

  const result = useMemo(() => {
    // L5-Calc · sticker price - aid = net cost per year
    const netPerYear = Math.max(0, tuition + living - aid);
    const totalCost = netPerYear * years;
    const monthly = monthlyPayment(totalCost, loanRate, loanYears);
    const totalRepay = monthly * loanYears * 12;
    const totalInterest = totalRepay - totalCost;
    return { netPerYear, totalCost, monthly, totalRepay, totalInterest };
  }, [tuition, living, aid, years, loanRate, loanYears]);

  const band = useMemo(() => {
    const c = result.totalCost;
    if (c < 30_000)  return { name: "Community Tier",  hint: "≈ $5–25K total. Lowest debt risk.",                  cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
    if (c < 80_000)  return { name: "In-State Public", hint: "≈ $30–80K total. Manageable on entry-level salary.", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
    if (c < 140_000) return { name: "Out-of-State",    hint: "≈ $80–140K. Plan for $1k+/mo loans.",                cls: "bg-yellow-50 text-yellow-800 ring-yellow-200" };
    if (c < 220_000) return { name: "Private",         hint: "≈ $140–220K. Strong aid required.",                  cls: "bg-orange-50 text-orange-700 ring-orange-200" };
    if (c < 320_000) return { name: "Ivy / Elite",     hint: "≈ $220–320K sticker. Need-blind aid usually high.",  cls: "bg-rose-50 text-rose-700 ring-rose-200" };
    return                  { name: "International",   hint: "≥ $320K. Confirm visa work limits before borrowing.",cls: "bg-rose-50 text-rose-700 ring-rose-200" };
  }, [result.totalCost]);

  return (
    // L1-Hero
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40">
      <section className="bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_60%)]">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <div className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700">Education · E-05</div>
          <h1 className="mb-4 text-5xl font-black tracking-tight text-slate-900 md:text-6xl">Tuition Cost Calculator</h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">Project 4-year college cost, subtract aid, then convert to a real monthly student-loan payment. Six school tiers from community to Ivy.</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-10 px-6 pb-24">
        {/* L2-TLDR */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">TL;DR</h2>
          <p className="text-slate-700">Total cost = (tuition + living − aid) × years. A $100k debt at 6.5% for 10 years = $1,135/month. Compare any school against your expected starting salary — debt should stay under one year of post-tax income.</p>
        </section>

        {/* L3-Live Calculator */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-6 text-2xl font-black text-slate-900">Live Calculator</h2>

          <div className="mb-6 flex flex-wrap gap-2">
            {(Object.keys(TIER_PRESETS) as Tier[]).map((t) => (
              <button
                key={t}
                onClick={() => applyTier(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ring-1 transition ${tier === t ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50"}`}
              >
                {TIER_PRESETS[t].label}
              </button>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr]">
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">Annual tuition (USD)</span>
                <input type="number" value={tuition} onChange={(e) => setTuition(Number(e.target.value) || 0)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">Annual living cost (USD)</span>
                <input type="number" value={living} onChange={(e) => setLiving(Number(e.target.value) || 0)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">Annual aid / scholarship</span>
                <input type="number" value={aid} onChange={(e) => setAid(Number(e.target.value) || 0)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">Program length (years)</span>
                <input type="number" min={1} max={8} value={years} onChange={(e) => setYears(Number(e.target.value) || 1)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-slate-700">Loan APR (%)</span>
                  <input type="number" step="0.1" value={loanRate} onChange={(e) => setLoanRate(Number(e.target.value) || 0)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-slate-700">Loan term (yrs)</span>
                  <input type="number" min={1} max={30} value={loanYears} onChange={(e) => setLoanYears(Number(e.target.value) || 1)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                </label>
              </div>
            </div>

            <div className="hidden items-center justify-center md:flex">
              <div className="text-4xl font-black text-emerald-500">→</div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Net cost / year</div>
                <div className="mt-1 text-3xl font-black text-emerald-900">{fmtUSD(result.netPerYear)}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Total {years}-year cost</div>
                <div className="mt-1 text-4xl font-black text-slate-900">{fmtUSD(result.totalCost)}</div>
              </div>
              <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Monthly loan payment</div>
                <div className="mt-1 text-2xl font-black text-slate-900">{fmtUSD(result.monthly)}</div>
                <div className="mt-1 text-xs text-slate-500">Total interest: {fmtUSD(result.totalInterest)}</div>
              </div>
              <div className={`rounded-full px-4 py-2 text-center text-sm font-semibold ring-1 ${band.cls}`}>{band.name} · {band.hint}</div>
            </div>
          </div>
        </section>

        {/* L4-Worked Example */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Worked Example</h2>
          <p className="text-slate-700">In-state public, $11k tuition + $13k living = $24k/yr. Subtract $2k aid → $22k net. Over 4 years that's $88k. Borrow at 6.5% for 10 years → about <strong>$999/month</strong> with $32k interest paid on top.</p>
        </section>

        {/* L5-Calc Steps */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Calculation Steps</h2>
          <ol className="list-decimal space-y-2 pl-6 text-slate-700">
            <li>Pick a school tier or enter custom tuition + living costs.</li>
            <li>Subtract annual aid (grants, scholarships, work-study).</li>
            <li>Multiply by program length to get sticker total.</li>
            <li>Apply amortization formula <code className="font-mono">M = P·r / (1 − (1+r)^−n)</code> using monthly rate <code className="font-mono">r = APR/12</code>.</li>
            <li>Total interest = monthly × term-months − principal.</li>
          </ol>
        </section>

        {/* L6-Cheat Sheet */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Cheat Sheet</h2>
          <pre className="bg-slate-950 text-emerald-200 font-mono overflow-x-auto rounded-2xl p-6 text-sm leading-relaxed">{`net_per_year   = tuition + living − aid
total_cost     = net_per_year × years
monthly_loan   = P · r / (1 − (1+r)^−n)
                 where r = APR/1200, n = term_years × 12
total_interest = monthly × n − P
debt_ratio     = total_cost / starting_salary  (target ≤ 1.0)`}</pre>
        </section>

        {/* L7-Band Table */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-2xl font-black text-slate-900">School Tier Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-2 font-semibold">Tier</th>
                  <th className="px-4 py-2 font-semibold">Tuition / yr</th>
                  <th className="px-4 py-2 font-semibold">Living / yr</th>
                  <th className="px-4 py-2 font-semibold">4-yr sticker</th>
                  <th className="px-4 py-2 font-semibold">Typical aid impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr><td className="px-4 py-2 font-semibold">Community College</td><td className="px-4 py-2">$4,000</td><td className="px-4 py-2">$9,000</td><td className="px-4 py-2">$52,000</td><td className="px-4 py-2">Pell up to $7.4k can erase tuition.</td></tr>
                <tr><td className="px-4 py-2 font-semibold">In-State Public</td><td className="px-4 py-2">$11,000</td><td className="px-4 py-2">$13,000</td><td className="px-4 py-2">$96,000</td><td className="px-4 py-2">State grants 10–30%.</td></tr>
                <tr><td className="px-4 py-2 font-semibold">Out-of-State Public</td><td className="px-4 py-2">$28,000</td><td className="px-4 py-2">$14,000</td><td className="px-4 py-2">$168,000</td><td className="px-4 py-2">Limited aid; merit only.</td></tr>
                <tr><td className="px-4 py-2 font-semibold">Private</td><td className="px-4 py-2">$42,000</td><td className="px-4 py-2">$16,000</td><td className="px-4 py-2">$232,000</td><td className="px-4 py-2">Generous endowment aid 30–60%.</td></tr>
                <tr><td className="px-4 py-2 font-semibold">Ivy / Elite</td><td className="px-4 py-2">$60,000</td><td className="px-4 py-2">$20,000</td><td className="px-4 py-2">$320,000</td><td className="px-4 py-2">Need-blind; family &lt;$85k often free.</td></tr>
                <tr><td className="px-4 py-2 font-semibold">International</td><td className="px-4 py-2">$35,000</td><td className="px-4 py-2">$18,000</td><td className="px-4 py-2">$212,000</td><td className="px-4 py-2">Federal aid not eligible; private only.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* L8-Method */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Method</h2>
          <p className="text-slate-700">We use the standard fixed-rate amortization formula identical to federal Direct Loan calculators. Interest accrues monthly on the unpaid balance, and equal payments are derived so that the loan is fully repaid at term-end. Tuition projections assume flat costs (no inflation); for a more conservative estimate, multiply each year by a 5% escalator.</p>
        </section>

        {/* L9-Common Mistakes */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Common Mistakes</h2>
          <ul className="list-disc space-y-2 pl-6 text-slate-700">
            <li>Comparing sticker prices instead of net price after aid — Ivy net can beat in-state.</li>
            <li>Forgetting interest capitalization on unsubsidized loans during enrollment.</li>
            <li>Using parents' income for federal aid past age 24 (independent student rules).</li>
            <li>Ignoring opportunity cost: a 5-year program adds another year of lost wages.</li>
          </ul>
        </section>

        {/* L10-CTA */}
        <section className="rounded-[2rem] bg-emerald-600 p-8 text-center text-white shadow-lg">
          <h2 className="mb-2 text-2xl font-black">Get Your Net Price Now</h2>
          <p className="mb-4 text-emerald-50">Pick a tier above, enter aid, and see the real monthly loan payment in seconds.</p>
          <a href="#top" className="inline-block rounded-xl bg-white px-6 py-2.5 font-semibold text-emerald-700 hover:bg-emerald-50">Try Calculator ↑</a>
        </section>

        {/* L11-4-Step Workflow */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-6 text-2xl font-black text-slate-900">4-Step Workflow</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200" data-i18n-key="tuitionStep">
              <div className="mb-1 text-xs font-bold uppercase text-emerald-700">Step 1 · tuitionStep</div>
              <div className="font-semibold text-slate-900">Enter Tuition</div>
              <p className="mt-1 text-sm text-slate-600">Use a tier preset or type your real bill.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200" data-i18n-key="livingStep">
              <div className="mb-1 text-xs font-bold uppercase text-emerald-700">Step 2 · livingStep</div>
              <div className="font-semibold text-slate-900">Add Living Cost</div>
              <p className="mt-1 text-sm text-slate-600">Room + board + transport + books.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200" data-i18n-key="loanStep">
              <div className="mb-1 text-xs font-bold uppercase text-emerald-700">Step 3 · loanStep</div>
              <div className="font-semibold text-slate-900">Set Loan Terms</div>
              <p className="mt-1 text-sm text-slate-600">APR and repayment years drive the monthly figure.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200" data-i18n-key="totalStep">
              <div className="mb-1 text-xs font-bold uppercase text-emerald-700">Step 4 · totalStep</div>
              <div className="font-semibold text-slate-900">Read Total Cost</div>
              <p className="mt-1 text-sm text-slate-600">Compare net price + interest vs your expected salary.</p>
            </div>
          </div>
        </section>

        {/* L12-FAQ */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-2xl font-black text-slate-900">FAQ</h2>
          <div className="space-y-4 text-slate-700">
            <div><h3 className="font-semibold text-slate-900">Q: What loan APR should I assume?</h3><p>Federal Direct Subsidized for undergrads is ~6.5% (2024-25). Private loans range 4–14% depending on credit.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: Should I include the cost of meals at home over breaks?</h3><p>The "living" field assumes on-campus 9 months; add separately for summer if you don't work.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: How is monthly payment computed?</h3><p>Standard fixed-rate amortization: <code className="font-mono">M = Pr/(1−(1+r)^−n)</code>, monthly compounding.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: Does the calculator inflate tuition year-over-year?</h3><p>No — flat costs by default. For inflation, increase each year manually by 4–6%.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: What's a safe debt-to-salary ratio?</h3><p>Keep total borrowing under one year of expected starting salary (1.0×). Above 1.5× is high stress.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: Does federal aid count as "aid"?</h3><p>Yes — combine Pell grants, state grants, scholarships, work-study, and tuition waivers in the aid field.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: How accurate are the tier presets?</h3><p>2024-25 College Board averages; your school may differ ±20%. Always check the official net price calculator.</p></div>
            <div><h3 className="font-semibold text-slate-900">Q: Is this advice financial counseling?</h3><p>No — this is a planning tool only. Consult a financial-aid officer for binding decisions.</p></div>
          </div>
        </section>

        {/* L13-Glossary */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Glossary</h2>
          <dl className="space-y-3 text-slate-700">
            <div><dt className="font-semibold text-slate-900">Sticker Price</dt><dd>Published cost before any discounts.</dd></div>
            <div><dt className="font-semibold text-slate-900">Net Price</dt><dd>Sticker minus grants/scholarships (not loans).</dd></div>
            <div><dt className="font-semibold text-slate-900">Amortization</dt><dd>Equal-payment schedule that fully repays principal + interest.</dd></div>
            <div><dt className="font-semibold text-slate-900">APR</dt><dd>Annual Percentage Rate — yearly interest cost.</dd></div>
            <div><dt className="font-semibold text-slate-900">Pell Grant</dt><dd>Federal need-based grant up to $7,395 (2024-25); does not require repayment.</dd></div>
          </dl>
        </section>

        {/* L14-Internal Links */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">Related Education Tools</h2>
          <ul className="grid gap-2 text-emerald-700 md:grid-cols-2">
            <li><a href="/tools/education/gpa-calculator" className="hover:underline">→ GPA Calculator</a></li>
            <li><a href="/tools/education/grade-calculator" className="hover:underline">→ Grade Calculator</a></li>
            <li><a href="/tools/education/study-time-calculator" className="hover:underline">→ Study Time Calculator</a></li>
            <li><a href="/tools/education/math-percentage-calculator" className="hover:underline">→ Math Percentage Calculator</a></li>
          </ul>
        </section>

        {/* L15-References */}
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-2xl font-black text-slate-900">References</h2>
          <ul className="list-disc space-y-1 pl-6 text-sm text-slate-600">
            <li>College Board, <em>Trends in College Pricing 2024</em>.</li>
            <li>U.S. Department of Education, <em>Direct Loan Interest Rates</em>, 2024-25.</li>
            <li>Federal Student Aid, <em>Pell Grant Maximum Award</em>, 2024-25.</li>
            <li>NerdWallet Loan Amortization Methodology, 2024.</li>
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
