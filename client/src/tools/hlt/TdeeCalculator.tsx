import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'TDEE Calculator',
  subtitle: 'Calculate total daily energy expenditure from BMR and activity level.',
  formula: `TDEE = BMR × activity factor. Common factors range from 1.2 sedentary to 1.9 extremely active.`,
  fields: [{ key: 'bmr', label: 'BMR', type: 'number', unit: 'kcal', defaultValue: '' }, { key: 'activity', label: 'Activity level', type: 'select', options: [{ value: '1.2', label: 'Sedentary' }, { value: '1.375', label: 'Light' }, { value: '1.55', label: 'Moderate' }, { value: '1.725', label: 'Very active' }, { value: '1.9', label: 'Athlete' }], defaultValue: '1.55' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const t=n('bmr')*Number(values.activity); return out(`${fmt(t,0)} kcal/day`, [['TDEE',`${fmt(t,0)} kcal/day`],['Weight loss target',`${fmt(t-500,0)} kcal/day`],['Weight gain target',`${fmt(t+300,0)} kcal/day`]]);
  }
};
export default function TdeeCalculator() { return <HltToolShell definition={definition} />; }
