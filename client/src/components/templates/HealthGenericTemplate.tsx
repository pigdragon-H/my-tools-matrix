/**
 * Health Generic Template
 * 
 * 通用健康計算工具模版
 * 適用於簡單的健康計算工具（如年齡計算、理想體重等）
 * 
 * 特點：
 * - 2-4 個輸入字段
 * - 單一計算公式
 * - 清晰的結果展示
 * - 下一步指引
 * - 完整的國際化支持
 * - 全局語言同步
 */

import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdSenseWrapper } from "@/components/AdSenseWrapper";
import { AdSlot } from "@/components/business/AdSlot";
import { PremiumGate } from "@/components/business/PremiumGate";
import { ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

type Lang = "zh" | "en";
type LocalText = { zh: string; en: string };

interface HealthGenericTemplateProps {
  title: LocalText;
  description: LocalText;
  inputs: InputField[];
  calculate: (values: Record<string, number>) => CalculationResult;
  resultDisplay: (result: CalculationResult, lang: Lang) => React.ReactNode;
  nextTools?: NextTool[];
  disclaimer?: LocalText;
}

interface InputField {
  id: string;
  label: LocalText;
  placeholder: LocalText;
  type: "number" | "select";
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: LocalText }[];
  unit?: LocalText;
  help?: LocalText;
}

interface CalculationResult {
  value: number;
  unit: string;
  category?: string;
  details?: LocalText;
  warning?: LocalText;
  nextSteps?: LocalText[];
}

interface NextTool {
  name: LocalText;
  href: string;
  icon?: React.ReactNode;
}

const l = (value: LocalText, lang: Lang) => value[lang];

export function HealthGenericTemplate({
  title,
  description,
  inputs,
  calculate,
  resultDisplay,
  nextTools = [],
  disclaimer,
}: HealthGenericTemplateProps) {
  const { lang, setLang } = useLanguage();
  const [formValues, setFormValues] = useState<Record<string, number | string>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  const isFormValid = useMemo(() => {
    return inputs.every(input => {
      const value = formValues[input.id];
      return value !== undefined && value !== "" && value !== null;
    });
  }, [formValues, inputs]);

  const handleInputChange = (id: string, value: string | number) => {
    setFormValues(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCalculate = () => {
    if (!isFormValid) return;

    const numericValues: Record<string, number> = {};
    inputs.forEach(input => {
      const value = formValues[input.id];
      numericValues[input.id] = typeof value === "string" ? parseFloat(value) : value;
    });

    try {
      const calculationResult = calculate(numericValues);
      setResult(calculationResult);
      setHasCalculated(true);
    } catch (error) {
      console.error("Calculation error:", error);
      setResult(null);
    }
  };

  const handleReset = () => {
    setFormValues({});
    setResult(null);
    setHasCalculated(false);
  };

  return (
    <AdSenseWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        {/* Header */}
        <div className="border-b border-border bg-white dark:bg-slate-900 shadow-sm">
          <div className="container py-8 md:py-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                  {l(title, lang)}
                </h1>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                  {l(description, lang)}
                </p>
              </div>
              <div className="inline-flex rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setLang("zh")}
                  className={`rounded-full px-3 py-1 text-sm font-black transition-colors ${
                    lang === "zh"
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  🌐 繁中
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`rounded-full px-3 py-1 text-sm font-black transition-colors ${
                    lang === "en"
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  🌐 EN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-12 md:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Form Section */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-border bg-white p-8 shadow-sm dark:bg-slate-900">
                <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
                  {lang === "zh" ? "輸入數據" : "Enter Data"}
                </h2>

                <div className="space-y-5">
                  {inputs.map(input => (
                    <div key={input.id}>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {l(input.label, lang)}
                        {input.unit && (
                          <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">
                            ({l(input.unit, lang)})
                          </span>
                        )}
                      </label>

                      {input.type === "number" && (
                        <input
                          type="number"
                          value={formValues[input.id] ?? ""}
                          onChange={e => handleInputChange(input.id, e.target.value)}
                          placeholder={l(input.placeholder, lang)}
                          min={input.min}
                          max={input.max}
                          step={input.step ?? 0.1}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={l(input.label, lang)}
                        />
                      )}

                      {input.type === "select" && input.options && (
                        <select
                          value={formValues[input.id] ?? ""}
                          onChange={e => handleInputChange(input.id, e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={l(input.label, lang)}
                        >
                          <option value="">{l(input.placeholder, lang)}</option>
                          {input.options.map(option => (
                            <option key={option.value} value={option.value}>
                              {l(option.label, lang)}
                            </option>
                          ))}
                        </select>
                      )}

                      {input.help && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {l(input.help, lang)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCalculate}
                    disabled={!isFormValid}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {lang === "zh" ? "計算" : "Calculate"}
                  </button>
                  {hasCalculated && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {lang === "zh" ? "重置" : "Reset"}
                    </button>
                  )}
                </div>
              </div>

              {/* Ad Slot */}
              <div className="mt-6">
                <AdSlot position="sidebar" />
              </div>
            </div>

            {/* Result Section */}
            <div className="lg:col-span-2">
              {!hasCalculated ? (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 p-12 text-center">
                  <div className="text-slate-400 dark:text-slate-500 mb-4">
                    <AlertCircle className="h-12 w-12 mx-auto opacity-50" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {lang === "zh" ? "輸入數據並點擊計算以查看結果" : "Enter data and click Calculate to see results"}
                  </p>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  {/* Main Result Card */}
                  <div className="rounded-2xl border border-border bg-white p-8 shadow-sm dark:bg-slate-900">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                          {lang === "zh" ? "計算結果" : "Result"}
                        </p>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                            {result.value.toFixed(1)}
                          </span>
                          <span className="text-xl font-semibold text-slate-600 dark:text-slate-400">
                            {result.unit}
                          </span>
                        </div>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>

                    {result.category && (
                      <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          {result.category}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Custom Result Display */}
                  <div className="rounded-2xl border border-border bg-white p-8 shadow-sm dark:bg-slate-900">
                    {resultDisplay(result, lang)}
                  </div>

                  {/* Warning */}
                  {result.warning && (
                    <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6">
                      <div className="flex gap-4">
                        <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                            {lang === "zh" ? "重要提示" : "Important Notice"}
                          </h3>
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            {l(result.warning, lang)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  {result.nextSteps && result.nextSteps.length > 0 && (
                    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm dark:bg-slate-900">
                      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
                        {lang === "zh" ? "下一步建議" : "Next Steps"}
                      </h3>
                      <ul className="space-y-3">
                        {result.nextSteps.map((step, index) => (
                          <li key={index} className="flex gap-3 text-slate-700 dark:text-slate-300">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {index + 1}
                            </span>
                            <span>{l(step, lang)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Related Tools */}
                  {nextTools.length > 0 && (
                    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm dark:bg-slate-900">
                      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
                        {lang === "zh" ? "相關工具" : "Related Tools"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {nextTools.map(tool => (
                          <a
                            key={tool.href}
                            href={tool.href}
                            className="group flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 transition-colors hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {l(tool.name, lang)}
                            </span>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-12 text-center">
                  <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                  <p className="text-red-700 dark:text-red-300">
                    {lang === "zh" ? "計算出錯，請檢查輸入數據" : "Calculation error. Please check your input."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          {disclaimer && (
            <div className="mt-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold">⚠️ {lang === "zh" ? "免責聲明" : "Disclaimer"}：</span>{" "}
                {l(disclaimer, lang)}
              </p>
            </div>
          )}
        </div>

        {/* Premium Gate */}
        <PremiumGate />

        {/* Ad Slot */}
        <div className="container py-8">
          <AdSlot position="bottom" />
        </div>
      </div>
    </AdSenseWrapper>
  );
}

export default HealthGenericTemplate;
