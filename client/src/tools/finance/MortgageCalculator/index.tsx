'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdSenseWrapper } from '@/components/AdSenseWrapper';
import { AdSlot } from '@/components/business/AdSlot';
import { PremiumGate } from '@/components/business/PremiumGate';

interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principalPayment: number;
}

export default function MortgageCalculator() {
  const { lang, t } = useLanguage();
  const [loanAmount, setLoanAmount] = useState(300000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [downPayment, setDownPayment] = useState(60000);

  const result = useMemo(() => {
    if (!loanAmount || !interestRate || !loanTerm) return null;
    
    const principal = loanAmount;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    const monthlyPayment = 
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;
    
    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      principalPayment: principal,
    };
  }, [loanAmount, interestRate, loanTerm]);

  const homePrice = loanAmount + downPayment;
  const downPaymentPercent = ((downPayment / homePrice) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* ── L1: Hero Section ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold text-white md:text-5xl">
                {lang === 'en' ? 'Mortgage Calculator' : '房貸計算機'}
              </h1>
              <p className="mt-4 text-lg text-blue-100">
                {lang === 'en'
                  ? 'Calculate your monthly mortgage payments and understand your home financing options'
                  : '準確計算您的每月房貸還款額，了解您的購房融資選項'}
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="text-6xl">🏠</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── L2: Quick Guide ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {lang === 'en' ? 'How It Works' : '運作方式'}
        </h2>
        <div className="grid gap-4 md:grid-cols-5">
          {[
            { step: '1', title: lang === 'en' ? 'Home Price' : '房屋價格', desc: lang === 'en' ? 'Enter the total price of the home' : '輸入房屋總價' },
            { step: '2', title: lang === 'en' ? 'Down Payment' : '頭期款', desc: lang === 'en' ? 'Specify your down payment amount' : '指定您的頭期款金額' },
            { step: '3', title: lang === 'en' ? 'Interest Rate' : '利率', desc: lang === 'en' ? 'Enter the annual interest rate' : '輸入年利率' },
            { step: '4', title: lang === 'en' ? 'Loan Term' : '貸款期限', desc: lang === 'en' ? 'Select the loan duration in years' : '選擇貸款期限（年）' },
            { step: '5', title: lang === 'en' ? 'Results' : '結果', desc: lang === 'en' ? 'View your monthly payment' : '查看您的每月還款額' },
          ].map((item) => (
            <div key={item.step} className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                {item.step}
              </div>
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── L3: Calculator Section ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Input Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {lang === 'en' ? 'Mortgage Details' : '房貸詳情'}
            </h2>
            
            <div className="space-y-6">
              {/* Home Price */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {lang === 'en' ? 'Home Price' : '房屋價格'}
                </label>
                <input
                  type="number"
                  value={homePrice}
                  onChange={(e) => setDownPayment(Math.max(0, Number(e.target.value) - loanAmount))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-2 text-sm text-slate-600">
                  {lang === 'en' ? 'Total: $' : '總計：$'}{homePrice.toLocaleString()}
                </p>
              </div>

              {/* Down Payment */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {lang === 'en' ? 'Down Payment' : '頭期款'} ({downPaymentPercent}%)
                </label>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {lang === 'en' ? 'Loan Amount' : '貸款金額'}
                </label>
                <div className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 font-semibold">
                  ${loanAmount.toLocaleString()}
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {lang === 'en' ? 'Annual Interest Rate (%)' : '年利率 (%)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Loan Term */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {lang === 'en' ? 'Loan Term (Years)' : '貸款期限（年）'}
                </label>
                <select
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                >
                  {[5, 10, 15, 20, 25, 30].map((year) => (
                    <option key={year} value={year}>{year} {lang === 'en' ? 'years' : '年'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          {result && (
            <div className="space-y-4">
              {/* Main Result Card */}
              <div className="rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 p-8 shadow-md">
                <h3 className="text-sm font-semibold text-slate-600 mb-2">
                  {lang === 'en' ? 'Monthly Payment' : '每月還款額'}
                </h3>
                <div className="text-5xl font-bold text-blue-600 mb-4">
                  ${result.monthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-sm text-slate-600">
                  {lang === 'en' ? 'Principal & Interest' : '本金與利息'}
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <p className="text-sm text-slate-600 mb-2">{lang === 'en' ? 'Total Interest' : '總利息'}</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${result.totalInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <p className="text-sm text-slate-600 mb-2">{lang === 'en' ? 'Total Payment' : '總還款額'}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${result.totalPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── L5: Knowledge Section ────────────────────────────────────────── */}
      <AdSenseWrapper showAds={true} adFormat="horizontal" />
      
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {lang === 'en' ? 'Understanding Mortgages' : '了解房貸'}
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Definition */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              {lang === 'en' ? 'What is a Mortgage?' : '什麼是房貸？'}
            </h3>
            <p className="text-slate-700">
              {lang === 'en'
                ? 'A mortgage is a loan used to purchase a property. The borrower agrees to repay the loan with interest over a fixed period, typically 15-30 years. The property serves as collateral for the loan.'
                : '房貸是用於購買房產的貸款。借款人同意在固定期間（通常為 15-30 年）內償還貸款及利息。該房產作為貸款的擔保。'}
            </p>
          </div>

          {/* Key Terms */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              {lang === 'en' ? 'Key Mortgage Terms' : '房貸關鍵術語'}
            </h3>
            <ul className="space-y-2 text-slate-700">
              <li><strong>{lang === 'en' ? 'Principal:' : '本金：'}</strong> {lang === 'en' ? 'The original loan amount' : '原始貸款金額'}</li>
              <li><strong>{lang === 'en' ? 'Interest Rate:' : '利率：'}</strong> {lang === 'en' ? 'The cost of borrowing money' : '借款成本'}</li>
              <li><strong>{lang === 'en' ? 'Amortization:' : '攤銷：'}</strong> {lang === 'en' ? 'The process of paying off a loan over time' : '隨著時間推移償還貸款的過程'}</li>
              <li><strong>{lang === 'en' ? 'Down Payment:' : '頭期款：'}</strong> {lang === 'en' ? 'Initial payment toward the home purchase' : '購房的初始付款'}</li>
            </ul>
          </div>

          {/* Calculation Formula */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 md:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              {lang === 'en' ? 'Monthly Payment Formula' : '每月還款額公式'}
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm mb-3">
              M = P × [r(1+r)^n] / [(1+r)^n - 1]
            </div>
            <p className="text-slate-700 text-sm">
              {lang === 'en'
                ? 'Where M = Monthly payment, P = Principal, r = Monthly interest rate, n = Number of payments'
                : '其中 M = 每月還款額，P = 本金，r = 月利率，n = 還款期數'}
            </p>
          </div>
        </div>

        <AdSlot slot="mortgage-knowledge" position="middle" />
      </section>

      {/* ── L6: FAQ Section ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {lang === 'en' ? 'Frequently Asked Questions' : '常見問題'}
        </h2>
        
        <div className="space-y-4">
          {[
            {
              q: lang === 'en' ? 'What is a good down payment percentage?' : '什麼是合理的頭期款百分比？',
              a: lang === 'en'
                ? 'Typically, 20% is considered a good down payment as it helps avoid PMI (Private Mortgage Insurance). However, some loans accept as little as 3-5% down.'
                : '通常，20% 被認為是合理的頭期款，因為它有助於避免 PMI（私人抵押貸款保險）。但是，某些貸款接受低至 3-5% 的頭期款。'
            },
            {
              q: lang === 'en' ? 'What is the difference between fixed and variable rate mortgages?' : '固定利率和浮動利率房貸有什麼區別？',
              a: lang === 'en'
                ? 'Fixed-rate mortgages have the same interest rate throughout the loan term, making payments predictable. Variable-rate mortgages have interest rates that change based on market conditions.'
                : '固定利率房貸在整個貸款期限內保持相同的利率，使付款可預測。浮動利率房貸的利率根據市場條件而變化。'
            },
            {
              q: lang === 'en' ? 'Can I pay off my mortgage early?' : '我可以提前償還房貸嗎？',
              a: lang === 'en'
                ? 'Yes, most mortgages allow early repayment without penalty. Paying extra toward principal can significantly reduce the total interest paid and shorten the loan term.'
                : '是的，大多數房貸允許無罰款的提前償還。向本金支付額外款項可以大幅減少支付的總利息並縮短貸款期限。'
            },
            {
              q: lang === 'en' ? 'What factors affect mortgage approval?' : '哪些因素影響房貸批准？',
              a: lang === 'en'
                ? 'Key factors include credit score, income, debt-to-income ratio, employment history, and the property value. Lenders assess your ability to repay the loan.'
                : '關鍵因素包括信用評分、收入、債務收入比、就業歷史和房產價值。貸方評估您的還款能力。'
            },
          ].map((faq, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-3">{faq.q}</h3>
              <p className="text-slate-700">{faq.a}</p>
            </div>
          ))}
        </div>

        <AdSlot slot="mortgage-faq" position="inline" />
      </section>

      {/* ── L7: Related Tools ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {lang === 'en' ? 'Related Financial Tools' : '相關財務工具'}
        </h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: lang === 'en' ? 'Loan Calculator' : '貸款計算機', desc: lang === 'en' ? 'Calculate any type of loan payment' : '計算任何類型的貸款還款' },
            { name: lang === 'en' ? 'Retirement Calculator' : '退休金計算機', desc: lang === 'en' ? 'Plan your retirement savings' : '規劃您的退休儲蓄' },
            { name: lang === 'en' ? 'Debt Payoff Calculator' : '債務還款計算機', desc: lang === 'en' ? 'Create a debt repayment plan' : '制定債務還款計劃' },
          ].map((tool, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-2">{tool.name}</h3>
              <p className="text-sm text-slate-600">{tool.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── L8: Affiliate Layer ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-6">
            {lang === 'en' ? 'Recommended Products' : '推薦產品'}
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { name: lang === 'en' ? 'Home Inspection Guide' : '房屋檢驗指南', desc: lang === 'en' ? 'Learn what to look for before buying' : '了解購買前要檢查的內容' },
              { name: lang === 'en' ? 'Mortgage Refinancing Guide' : '房貸再融資指南', desc: lang === 'en' ? 'Understand when and how to refinance' : '了解何時以及如何進行再融資' },
              { name: lang === 'en' ? 'Personal Finance Book' : '個人理財書籍', desc: lang === 'en' ? 'Master your financial planning' : '掌握您的財務規劃' },
              { name: lang === 'en' ? 'Real Estate Investment Course' : '房地產投資課程', desc: lang === 'en' ? 'Learn real estate investment strategies' : '學習房地產投資策略' },
            ].map((product, idx) => (
              <div key={idx} className="rounded-lg border border-amber-300 bg-white p-4">
                <h3 className="font-semibold text-slate-900">{product.name}</h3>
                <p className="text-sm text-slate-600 mt-2">{product.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── L9: Premium Gate ────────────────────────────────────────── */}
      <PremiumGate plan="PRO">
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">
              {lang === 'en' ? 'Premium Features' : '高級功能'}
            </h2>
            <ul className="space-y-3 text-purple-900">
              <li>✓ {lang === 'en' ? 'Amortization schedule export' : '攤銷計劃表導出'}</li>
              <li>✓ {lang === 'en' ? 'Multiple scenario comparison' : '多個場景比較'}</li>
              <li>✓ {lang === 'en' ? 'Refinancing analysis' : '再融資分析'}</li>
              <li>✓ {lang === 'en' ? 'Ad-free experience' : '無廣告體驗'}</li>
            </ul>
          </div>
        </section>
      </PremiumGate>

      {/* ── L10: Trust & References ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-12 border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {lang === 'en' ? 'About This Calculator' : '關於本計算機'}
        </h2>
        
        <div className="rounded-xl border border-slate-200 bg-white p-6 mb-6">
          <p className="text-slate-700 mb-4">
            {lang === 'en'
              ? 'This mortgage calculator uses the standard amortization formula to calculate monthly payments. The calculations are based on the principal amount, interest rate, and loan term you provide.'
              : '本房貸計算機使用標準攤銷公式計算每月還款額。計算基於您提供的本金、利率和貸款期限。'}
          </p>
          <p className="text-slate-700">
            {lang === 'en'
              ? 'Please note that actual mortgage payments may vary based on taxes, insurance, HOA fees, and other factors not included in this calculation.'
              : '請注意，實際房貸還款可能因稅費、保險、HOA 費用和本計算中未包含的其他因素而異。'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900 mb-2">
              {lang === 'en' ? 'References' : '參考資料'}
            </h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Federal Reserve</li>
              <li>• HUD (U.S. Department of Housing and Urban Development)</li>
              <li>• Fannie Mae</li>
              <li>• Freddie Mac</li>
            </ul>
          </div>
          
          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900 mb-2">
              {lang === 'en' ? 'Disclaimer' : '免責聲明'}
            </h3>
            <p className="text-sm text-slate-600">
              {lang === 'en'
                ? 'This calculator is for educational purposes only and should not be considered financial advice.'
                : '本計算機僅供教育之用，不應視為財務建議。'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
