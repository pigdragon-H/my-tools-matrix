import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Calories Burned Calculator',
  subtitle: 'Estimate exercise calories burned using MET values.',
  formula: `Calories burned = MET × 3.5 × body weight(kg) ÷ 200 × minutes. MET is a standard exercise intensity estimate.`,
  fields: [{ key: 'activity', label: 'Exercise type', type: 'select', options: [{ value: '3.5', label: 'Walking' }, { value: '7', label: 'Jogging' }, { value: '8', label: 'Cycling' }, { value: '9.8', label: 'Running' }, { value: '6', label: 'Weights' }, { value: '5.8', label: 'Swimming' }], defaultValue: '7' }, { key: 'weight', label: 'Weight', type: 'number', unit: 'kg', defaultValue: '' }, { key: 'minutes', label: 'Duration', type: 'number', unit: 'min', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const met=Number(values.activity); const kcal=met*3.5*n('weight')/200*n('minutes'); return out(`${fmt(kcal,0)} kcal`, [['Calories burned',`${fmt(kcal,0)} kcal`],['MET value',fmt(met,1)],['Hourly burn rate',`${fmt(kcal/n('minutes')*60,0)} kcal/hour`]]);
  }
};
export default function CaloriesBurnedCalculator() { return <HltToolShell definition={definition} />; }
