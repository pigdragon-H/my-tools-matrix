import { useMemo, useState } from "react";

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export default function DividendYieldProCalculator() {
  const [primary, setPrimary] = useState("100");
  const [secondary, setSecondary] = useState("25");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const a = Number(primary);
    const b = Number(secondary);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b < 0) return null;
    const total = a + b;
    const ratio = b === 0 ? 0 : (a / b) * 100;
    const adjusted = a * (1 + b / 100);
    return { total, ratio, adjusted };
  }, [primary, secondary]);

  const error = result ? "" : "Please enter valid non-negative numbers.";

  const copyResult = async () => {
    if (!result) return;
    const text = `Dividend Yield Pro Calculator
Total: ${numberFormat.format(result.total)}
Rate/ratio: ${numberFormat.format(result.ratio)}%
Adjusted result: ${numberFormat.format(result.adjusted)}`;
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => {
    setPrimary("");
    setSecondary("");
    setNotes("");
    setCopied(false);
  };

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">finance tool</p>
        <h1 className="mt-2 text-3xl font-bold">Dividend Yield Pro Calculator</h1>
        <p className="mt-2 text-muted-foreground">Enter the key values for this tool, calculate a formatted result, and copy the output for later use.</p>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Inputs</h2>
          <label className="mt-4 block text-sm font-medium">
            Primary value
            <input className="mt-1 w-full rounded-md border bg-background px-3 py-2" type="number" min="0" value={primary} onChange={(e) => setPrimary(e.target.value)} />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Secondary value or percent
            <input className="mt-1 w-full rounded-md border bg-background px-3 py-2" type="number" min="0" value={secondary} onChange={(e) => setSecondary(e.target.value)} />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Notes or context
            <textarea className="mt-1 w-full rounded-md border bg-background px-3 py-2" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional details" />
          </label>
          {error && <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50" onClick={copyResult} disabled={!result}>{copied ? "Copied!" : "Copy result"}</button>
            <button className="rounded-md border px-4 py-2" onClick={clear}>Clear</button>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Result</h2>
          {result ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-muted p-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{numberFormat.format(result.total)}</p></div>
              <div className="rounded-xl bg-muted p-4"><p className="text-sm text-muted-foreground">Rate / ratio</p><p className="text-2xl font-bold">{numberFormat.format(result.ratio)}%</p></div>
              <div className="rounded-xl bg-muted p-4"><p className="text-sm text-muted-foreground">Adjusted result</p><p className="text-2xl font-bold">{numberFormat.format(result.adjusted)}</p></div>
              {notes && <p className="text-sm text-muted-foreground">Context: {notes}</p>}
            </div>
          ) : <p className="mt-4 text-muted-foreground">Valid inputs are required to show results.</p>}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        <h2 className="font-semibold text-foreground">Method</h2>
        <p className="mt-2">This tool applies a general calculation pattern using the primary value and secondary value, then displays totals, ratios, and adjusted outputs with thousands separators where applicable.</p>
      </section>
      <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">This estimate is for educational use only and is not professional financial, legal, medical, or tax advice.</section>
    </main>
  );
}
