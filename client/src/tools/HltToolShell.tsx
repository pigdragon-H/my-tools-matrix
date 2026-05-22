import React, { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────
export interface HltFieldOption {
  value: string;
  label: string;
}

export interface HltField {
  key: string;
  label: string;
  type: "number" | "select" | "text";
  unit?: string;
  defaultValue: string;
  options?: HltFieldOption[];
}

export interface HltMetric {
  label: string;
  value: string;
}

export interface HltComputeResult {
  summary: string;
  metrics: HltMetric[];
}

export interface HltToolDefinition {
  title: string;
  subtitle: string;
  formula: string;
  fields: HltField[];
  compute: (values: Record<string, string>) => HltComputeResult;
}

// ─── Utility helpers (exported for use in tool files) ─────────────
export function fmt(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function num(values: Record<string, string>, key: string): number {
  const raw = values[key] ?? "";
  const n = Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// ─── Shell Component ──────────────────────────────────────────────
interface Props {
  definition: HltToolDefinition;
}

export default function HltToolShell({ definition }: Props) {
  const { title, subtitle, formula, fields, compute } = definition;

  // Initialize form state from field defaults
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of fields) {
      init[f.key] = f.defaultValue;
    }
    return init;
  });

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  // Compute result
  const result = useMemo(() => {
    try {
      // Check if all number fields have values
      const hasAllInputs = fields
        .filter((f) => f.type === "number")
        .every((f) => values[f.key] !== "" && values[f.key] !== undefined);
      if (!hasAllInputs) return null;
      return compute(values);
    } catch {
      return null;
    }
  }, [values, fields, compute]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{subtitle}</p>
      </div>

      {/* Formula Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200 font-mono">
          {formula}
        </p>
      </div>

      {/* Input Fields */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
              {field.unit && (
                <span className="text-gray-400 ml-1">({field.unit})</span>
              )}
            </label>
            {field.type === "select" && field.options ? (
              <select
                value={values[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === "number" ? "number" : "text"}
                value={values[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>
        ))}
      </div>

      {/* Results */}
      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 space-y-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
              {result.summary}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.metrics.map((m, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-white dark:bg-gray-800 rounded px-3 py-2 border border-gray-100 dark:border-gray-700"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {m.label}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
        This tool is for educational purposes only. Consult a healthcare
        professional for medical advice.
      </p>
    </div>
  );
}
