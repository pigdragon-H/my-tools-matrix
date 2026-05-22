import { useMemo, useState } from "react";

type Output = { main: string; detail: string; formula: string; error: string };

const formatNumber = (value: number, digits = 2) => Number.isFinite(value) ? value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits }) : "0.00";
const parseNumber = (value: string) => Number(value.replace(/,/g, ""));
const formatInput = (value: string) => {
  const cleaned = value.replace(/,/g, "").replace(/[^0-9.\-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return cleaned;
  const parts = cleaned.split(".");
  const intPart = parts[0] === "" || parts[0] === "-" ? parts[0] : Number(parts[0]).toLocaleString("en-US");
  return parts.length > 1 ? `${intPart}.${parts.slice(1).join("")}` : intPart;
};

export default function LoanCalculator() {
  const [a,setA]=useState("100,000");
  const [b,setB]=useState("8");
  const [c,setC]=useState("10");
  const [d,setD]=useState("12");
  const [showFormula,setShowFormula]=useState(false);
  const [copied,setCopied]=useState(false);

  const result=useMemo<Output>(()=>{
    try{
      const x=parseNumber(a), y=parseNumber(b), z=parseNumber(c), w=parseNumber(d);
      if([x,y,z,w].some(v=>Number.isNaN(v))) throw new Error("請輸入有效數字。");
      if(z < 0 || w < 0) throw new Error("期間與頻率不可為負數。");
      const rate=y/100;
      let main=0, detail="", formula="";
      const toolSlug: string = "loan-calculator";
      switch(toolSlug){
        case "cagr-calculator": main=(Math.pow(y>0?y/x:1,1/Math.max(z,1))-1)*100; detail=`起始值 ${formatNumber(x)}，結束值 ${formatNumber(y)}，${formatNumber(z,0)} 年 CAGR = ${formatNumber(main)}%`; formula="CAGR = (Ending / Beginning)^(1 / Years) - 1"; break;
        case "compound-interest-calculator": main=x*Math.pow(1+rate/Math.max(w,1),Math.max(w,1)*z); detail=`最終金額 ${formatNumber(main)}，總利息 ${formatNumber(main-x)}`; formula="FV = P × (1 + r / n)^(n × t)"; break;
        case "dividend-yield-calculator": main=x/y*100; detail=`年股息 ${formatNumber(x)} / 股價 ${formatNumber(y)} = 殖利率 ${formatNumber(main)}%`; formula="Dividend Yield = Annual Dividend / Stock Price"; break;
        case "stock-return-calculator": main=((y-x)*z+w)/(x*z)*100; detail=`總報酬 ${formatNumber((y-x)*z+w)}，報酬率 ${formatNumber(main)}%`; formula="Return = (Sell - Buy) × Shares + Dividends, divided by Cost"; break;
        case "dollar-cost-averaging-calculator": { const months=z*12, monthly=x, r=rate/12; main=r===0?monthly*months:monthly*(Math.pow(1+r,months)-1)/r; detail=`投入 ${formatNumber(monthly)} / 月，${formatNumber(z,0)} 年後約 ${formatNumber(main)}`; formula="FV of annuity = PMT × ((1+r)^n - 1) / r"; break; }
        case "fire-calculator": { const target=x*25, yearly=x*y/Math.max(100-y,1); main=Math.log((target*rate/yearly)+1)/Math.log(1+rate); detail=`4%法則目標 ${formatNumber(target)}，估計 ${formatNumber(main)} 年達成`; formula="FIRE Number = Annual Expense × 25; years solved by compound savings"; break; }
        case "retirement-savings-calculator": { const years=Math.max(z-y,0), monthly=w, r=rate/12; main=x*Math.pow(1+rate,years)+(r===0?monthly*years*12:monthly*(Math.pow(1+r,years*12)-1)/r); detail=`退休時總資產約 ${formatNumber(main)}`; formula="FV = Current × (1+r)^t + monthly annuity FV"; break; }
        case "withdrawal-rate-calculator": main=x/y; detail=`可維持約 ${formatNumber(main)} 年；提領率 ${(y/x*100).toFixed(2)}%`; formula="Years = Portfolio / Annual Withdrawal"; break;
        case "coast-fire-calculator": main=x/Math.pow(1+rate,Math.max(z-y,1)); detail=`現在需有 Coast FIRE 金額約 ${formatNumber(main)}`; formula="PV = Target / (1+r)^years"; break;
        case "pension-calculator": main=x*y*z/100/12; detail=`估計月退休金 ${formatNumber(main)}`; formula="Monthly Pension = Salary × Service Years × Replacement Rate / 12"; break;
        case "loan-calculator": case "personal-loan-calculator": case "emi-calculator": case "mortgage-calculator": case "mortgage-amortization-calculator": { const n=z*12, r=rate/12; main=r===0?x/n:x*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1); detail=`月付 ${formatNumber(main)}，總利息 ${formatNumber(main*n-x)}`; formula="Payment = P × r(1+r)^n / ((1+r)^n - 1)"; break; }
        case "debt-payoff-calculator": main=x/Math.max(y,1); detail=`以每月 ${formatNumber(y)} 還款，約 ${formatNumber(main)} 個月清償；雪崩法優先高利率，雪球法優先小餘額`; formula="Months = Debt / Monthly Payment (simple estimate)"; break;
        case "interest-rate-calculator": main=Math.pow((x+y)/x,1/Math.max(z,1))-1; detail=`實際年利率約 ${formatNumber(main*100)}%`; formula="Rate = (Final / Principal)^(1 / Years) - 1"; break;
        case "refinance-calculator": main=(x-y)*z*12-w; detail=`估計總節省 ${formatNumber(main)}，損益平衡約 ${formatNumber(w/Math.max(x-y,1))} 個月`; formula="Savings = (Old Payment - New Payment) × Months - Fees"; break;
        case "down-payment-calculator": main=x*y/100; detail=`頭期款 ${formatNumber(main)}，貸款金額 ${formatNumber(x-main)}`; formula="Down Payment = Home Price × Down Payment %"; break;
        case "affordability-calculator": main=(x/12*0.28-y)*12*z; detail=`可負擔房價粗估 ${formatNumber(main+w)}，前端比率 28%，含頭期款`; formula="Affordable Price ≈ available annual housing payment × years + down payment"; break;
        case "pip-value-calculator": main=x*y*0.0001; detail=`每點價值約 ${formatNumber(main,4)}，估計盈虧 ${formatNumber(main*z,2)}`; formula="Pip Value = Lot Size × Lots × Pip Size"; break;
        case "forex-profit-calculator": main=(y-x)*z*100000; detail=`外匯交易盈虧約 ${formatNumber(main)}`; formula="Profit = (Exit - Entry) × Lots × Contract Size"; break;
        case "currency-converter-pro": case "exchange-rate-calculator": main=x*y*(1-z/100); detail=`換算後約 ${formatNumber(main)}，已扣除 ${formatNumber(z)}% 手續費`; formula="Converted = Amount × Rate × (1 - Fee%)"; break;
        case "cross-rate-calculator": main=x/y; detail=`交叉匯率約 ${formatNumber(main,6)}，與市場報價 ${formatNumber(z,6)} 差異 ${formatNumber((main-z)/Math.max(z,0.000001)*100)}%`; formula="Cross Rate = Quote A / Quote B"; break;
        default: main=x*(1+rate*z); detail=`估算結果 ${formatNumber(main)}`; formula="Result = Input × (1 + rate × period)";
      }
      return { main: formatNumber(main), detail, formula, error:"" };
    }catch(error){ return { main:"", detail:"", formula:"", error:error instanceof Error?error.message:"計算失敗，請檢查輸入。"};}
  },[a,b,c,d]);

  const copyResult=async()=>{ if(!result.main) return; await navigator.clipboard.writeText(`Loan Calculator
${result.detail}
Formula: ${result.formula}`); setCopied(true); window.setTimeout(()=>setCopied(false),1500); };
  const clearAll=()=>{ setA(""); setB(""); setC(""); setD(""); setCopied(false); };
  const inputClass="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
  const onChange=(setter:(v:string)=>void)=>(event:React.ChangeEvent<HTMLInputElement>)=>{ setter(formatInput(event.target.value)); setCopied(false); };

  return <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
    <section className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"><p className="text-sm font-semibold text-blue-600">FIN · LOA</p><h1 className="text-3xl font-bold text-slate-950 dark:text-white">Loan Calculator</h1><p className="mt-2 text-slate-600 dark:text-slate-300">貸款計算器：貸款金額/利率/期數 → 月付金額。</p></section>
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"><h2 className="text-lg font-bold">輸入區</h2><label className="mt-4 block text-sm font-semibold">數值 A</label><input className={inputClass} value={a} onChange={onChange(setA)} inputMode="decimal"/><label className="mt-4 block text-sm font-semibold">數值 B / 利率或價格</label><input className={inputClass} value={b} onChange={onChange(setB)} inputMode="decimal"/><label className="mt-4 block text-sm font-semibold">數值 C / 年數或數量</label><input className={inputClass} value={c} onChange={onChange(setC)} inputMode="decimal"/><label className="mt-4 block text-sm font-semibold">數值 D / 頻率、費用或補充值</label><input className={inputClass} value={d} onChange={onChange(setD)} inputMode="decimal"/><div className="mt-5 flex gap-3"><button onClick={copyResult} disabled={!result.main} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">{copied?"已複製":"一鍵複製結果"}</button><button onClick={clearAll} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">清除</button></div></div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"><h2 className="text-lg font-bold">計算結果區</h2>{result.error?<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{result.error}</div>:<><div className="mt-4 rounded-xl bg-blue-50 p-5 dark:bg-blue-950/30"><p className="text-sm text-slate-600 dark:text-slate-300">主要數字</p><p className="mt-2 text-3xl font-bold text-blue-700 dark:text-blue-200">{result.main}</p></div><p className="mt-4 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{result.detail}</p><button onClick={()=>setShowFormula(!showFormula)} className="mt-5 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold dark:bg-slate-800">{showFormula?"收合公式說明":"展開公式說明"}</button>{showFormula&&<div className="mt-3 rounded-xl border bg-slate-50 p-4 font-mono text-sm dark:border-slate-800 dark:bg-slate-900">{result.formula}</div>}</>}</div>
    </section>
  </div>;
}
