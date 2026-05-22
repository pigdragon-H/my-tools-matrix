import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Carb Intake Calculator',
  subtitle: 'Estimate carbohydrate grams from calorie target and activity.',
  formula: `Carbohydrate calories are converted with 4 kcal/g. Suggested ratios: low 25%, general 45%, high activity 55%.`,
  fields: [{ key: 'calories', label: 'Daily calories', type: 'number', unit: 'kcal', defaultValue: '' }, { key: 'activity', label: 'Activity style', type: 'select', options: [{ value: '0.25', label: 'Low carb' }, { value: '0.45', label: 'General' }, { value: '0.55', label: 'High activity' }], defaultValue: '0.45' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const ratio=Number(values.activity); return out(`${fmt(n('calories')*ratio/4,0)} g/day`, [['Selected carb target',`${fmt(n('calories')*ratio/4,0)} g`],['Low carb comparison',`${fmt(n('calories')*.25/4,0)} g`],['High carb comparison',`${fmt(n('calories')*.55/4,0)} g`]]);
  }
};
export default function CarbIntakeCalculator() { return <HltToolShell definition={definition} />; }
