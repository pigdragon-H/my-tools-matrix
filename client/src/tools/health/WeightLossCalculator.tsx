import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Weight Loss Calculator',
  subtitle: 'Plan a calorie deficit and projected target date.',
  formula: `Weight loss energy estimate uses 7,700 kcal per kg. Daily deficit = weight change × 7,700 ÷ days.`,
  fields: [{ key: 'current', label: 'Current weight', type: 'number', unit: 'kg', defaultValue: '' }, { key: 'target', label: 'Target weight', type: 'number', unit: 'kg', defaultValue: '' }, { key: 'days', label: 'Timeline', type: 'number', unit: 'days', defaultValue: '' }, { key: 'tdee', label: 'TDEE', type: 'number', unit: 'kcal/day', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const loss=Math.max(0,n('current')-n('target')); const def=loss*7700/n('days'); return out(`${fmt(def,0)} kcal/day deficit`, [['Suggested intake',`${fmt(n('tdee')-def,0)} kcal/day`],['Weight to lose',`${fmt(loss,1)} kg`],['Weekly pace',`${fmt(loss/(n('days')/7),2)} kg/week`]]);
  }
};
export default function WeightLossCalculator() { return <HltToolShell definition={definition} />; }
