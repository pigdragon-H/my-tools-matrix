import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Calorie Deficit Calculator',
  subtitle: 'Estimate daily calorie deficit needed for a target weight-loss timeline.',
  formula: `Approximation: 1 kg body fat corresponds to about 7,700 kcal. Daily deficit = kg to lose × 7,700 ÷ days.`,
  fields: [{ key: 'tdee', label: 'TDEE', type: 'number', unit: 'kcal/day', defaultValue: '' }, { key: 'current', label: 'Current weight', type: 'number', unit: 'kg', defaultValue: '' }, { key: 'target', label: 'Target weight', type: 'number', unit: 'kg', defaultValue: '' }, { key: 'days', label: 'Timeline', type: 'number', unit: 'days', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const loss=Math.max(0,n('current')-n('target')); const def=loss*7700/n('days'); return out(`${fmt(def,0)} kcal/day deficit`, [['Daily target intake',`${fmt(n('tdee')-def,0)} kcal/day`],['Total deficit',`${fmt(loss*7700,0)} kcal`],['Expected weekly loss',`${fmt(loss/(n('days')/7),2)} kg/week`]]);
  }
};
export default function CalorieDeficitCalculator() { return <HltToolShell definition={definition} />; }
